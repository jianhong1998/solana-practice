import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
  Keypair,
  VersionedTransaction,
  TransactionMessage,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Stablecoin } from '../target/types/stablecoin';
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';
import { BN } from 'bn.js';
import testId from './fixtures/test.json';
import { airdropIfRequired } from '@solana-developers/helpers';

const SOL_PRICE_FEED_ID =
  '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d';

describe('stablecoin', () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace['stablecoin'] as Program<Stablecoin>;

  // Test User - public key = J7C9EZFejJEphz4BT35dBqs4PeeTuCxXGzGMgpATBTBo
  const testUserKeypair = Keypair.fromSecretKey(
    Uint8Array.from(testId as number[])
  );

  anchor.setProvider(provider);

  const pythSolanaReceiver = new PythSolanaReceiver({
    connection,
    wallet,
  });
  const solUsdPriceFeedAccount = pythSolanaReceiver.getPriceFeedAccountAddress(
    0,
    SOL_PRICE_FEED_ID
  );

  const [testCollateralAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('collateral'), testUserKeypair.publicKey.toBuffer()],
    program.programId
  );

  beforeAll(async () => {
    await airdropIfRequired(
      connection,
      testUserKeypair.publicKey,
      10 * LAMPORTS_PER_SOL,
      10 * LAMPORTS_PER_SOL
    );
  }, 30_000);

  it.only('should be initialized', async () => {
    const transactionId = await program.methods
      .initConfig()
      .accounts({
        signer: wallet.publicKey,
      })
      .signers([wallet.payer])
      .rpc({
        commitment: 'confirmed',
      });

    console.log({ id: 'Init', transactionId });
  });

  it.only('should be able to deposit collateral and mint USDC ', async () => {
    const amountCollateral = 2 * LAMPORTS_PER_SOL;
    const amountToMint = 1 * LAMPORTS_PER_SOL;

    const instruction = await program.methods
      .depositCollateralAndMintToken(
        new BN(amountCollateral),
        new BN(amountToMint)
      )
      .accounts({
        priceUpdateAccount: solUsdPriceFeedAccount,
        depositor: testUserKeypair.publicKey,
      })
      .signers([testUserKeypair])
      .instruction();

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    const transactionMessage = new TransactionMessage({
      instructions: [instruction],
      payerKey: testUserKeypair.publicKey,
      recentBlockhash: blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(transactionMessage);
    transaction.sign([testUserKeypair]);

    const transactionId = await connection.sendTransaction(transaction);
    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature: transactionId,
    });

    console.log({ id: 'Deposit', transactionId });

    const collateralAccount = await program.account.collateral.fetch(
      testCollateralAccount
    );

    const solBalance = collateralAccount.lamportBalance
      .div(new BN(LAMPORTS_PER_SOL))
      .toNumber();

    const amountMinted = collateralAccount.amountMinted.toNumber();

    console.log({ collateralAccount, solBalance, amountMinted });
  });

  it.only('should be able to redeem collateral and burn USDC', async () => {
    const amountCollateral = 0.5 * LAMPORTS_PER_SOL;
    const amountToBurn = 0.25 * LAMPORTS_PER_SOL;

    const transactionId = await program.methods
      .redeemCollateralAndBurnToken(
        new BN(amountCollateral),
        new BN(amountToBurn)
      )
      .accounts({
        priceUpdate: solUsdPriceFeedAccount,
      })
      .rpc({
        commitment: 'confirmed',
      });

    console.log({ id: 'Withdraw', transactionId });
  });

  it('should be able to update config', async () => {
    const transactionId = await program.methods.updateConfig(new BN(100)).rpc({
      commitment: 'confirmed',
    });

    console.log({ id: 'Update config', transactionId });
  });

  it('should be able to liquidate', async () => {
    const amountToBurn = 500_000_000;

    const transactionId = await program.methods
      .liquidate(new BN(amountToBurn))
      .accounts({
        priceUpdate: solUsdPriceFeedAccount,
        collateralAccount: testCollateralAccount,
      })
      .rpc({
        commitment: 'confirmed',
      });

    console.log({ id: 'Liquidate', transactionId });
  });

  it('should be able to update config again', async () => {
    const transactionId = await program.methods.updateConfig(new BN(1)).rpc({
      commitment: 'confirmed',
    });

    console.log({ id: 'Update config', transactionId });
  });
});
