import * as anchor from '@coral-xyz/anchor';
import { BN, type Program } from '@coral-xyz/anchor';
import {
  confirmTransaction,
  createAccountsMintsAndTokenAccounts,
  makeKeypairs,
} from '@solana-developers/helpers';
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

import { SwapProgram } from '../target/types/swap_program';
import { getRandomBigNumber } from './util/number';
import { assert } from 'chai';

const SECONDS = 1000;
const ANCHOR_SLOW_TEST_THRESHOLD = 40 * SECONDS;
const TOKEN_PROGRAM: typeof TOKEN_2022_PROGRAM_ID | typeof TOKEN_PROGRAM_ID =
  TOKEN_2022_PROGRAM_ID;

describe('swap-program', () => {
  // Use the cluster and the keypair from Anchor.toml
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // See https://github.com/coral-xyz/anchor/issues/3122
  const user = (provider.wallet as anchor.Wallet).payer;
  const payer = user;

  const connection = provider.connection;
  const program = anchor.workspace.SwapProgram as Program<SwapProgram>;

  const accounts: Record<string, PublicKey> = {
    tokenProgram: TOKEN_PROGRAM,
  };

  const amounts = {
    offered: {
      tokenA: new BN(1_000_000),
    },
    wanted: {
      tokenB: new BN(1_000_000),
    },
  };

  let [aliceKeypair, bobKeypair, tokenMintA, tokenMintB] = makeKeypairs(4);

  before(async () => {
    const usersMintsAndTokenAccounts =
      await createAccountsMintsAndTokenAccounts(
        [
          // 1,000,000,000 of Token A
          // 0 of Token B
          [1_000_000_000, 0],
          // 0 of Token A
          // 1,000,000,000 of Token B
          [0, 1_000_000_000],
        ],
        1 * LAMPORTS_PER_SOL,
        connection,
        payer
      );

    const { users, mints, tokenAccounts } = usersMintsAndTokenAccounts;

    aliceKeypair = users[0];
    bobKeypair = users[1];

    tokenMintA = mints[0];
    tokenMintB = mints[1];

    const [aliceTokenAccountA, aliceTokenAccountB] = tokenAccounts[0];
    const [bobTokenAccountA, bobTokenAccountB] = tokenAccounts[1];

    accounts.maker = aliceKeypair.publicKey;
    accounts.taker = bobKeypair.publicKey;

    accounts.tokenMintA = tokenMintA.publicKey;
    accounts.tokenMintB = tokenMintB.publicKey;

    accounts.makerTokenAccountA = aliceTokenAccountA;
    accounts.takerTokenAccountA = bobTokenAccountA;

    accounts.makerTokenAccountB = aliceTokenAccountB;
    accounts.takerTokenAccountB = bobTokenAccountB;
  });

  it('should put the tokens Alice offers into the vault when Alice makes an offer', async () => {
    const offerId = getRandomBigNumber();

    const [offerPublicKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('offer'),
        accounts.maker.toBuffer(),
        offerId.toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );

    const vaultPublicKey = getAssociatedTokenAddressSync(
      accounts.tokenMintA,
      offerPublicKey,
      true,
      TOKEN_PROGRAM
    );

    accounts.offer = offerPublicKey;
    accounts.vault = vaultPublicKey;

    const transactionSignature = await program.methods
      .makeOffer(offerId, amounts.offered.tokenA, amounts.wanted.tokenB)
      .accounts({ ...accounts })
      .signers([aliceKeypair])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

    const vaultBalanceResponse = await connection.getTokenAccountBalance(
      vaultPublicKey
    );
    const vaultBalance = new BN(vaultBalanceResponse.value.amount);

    // Verify if vault balance equal to offered token A amount
    assert(vaultBalance.eq(amounts.offered.tokenA));

    const offerAccount = await program.account.offer.fetch(offerPublicKey);

    assert(offerAccount.maker.equals(aliceKeypair.publicKey));
    assert(offerAccount.tokenMintA.equals(accounts.tokenMintA));
    assert(offerAccount.tokenMintB.equals(accounts.tokenMintB));
    assert(offerAccount.tokenBWantedAmount.eq(amounts.wanted.tokenB));
  }).slow(ANCHOR_SLOW_TEST_THRESHOLD);

  it("should put the tokens from the vault into Bob's account, and gives Alice Bob's tokens, when Bob takes an offer", async () => {
    const transactionSignature = await program.methods
      .takeOffer()
      .accounts({ ...accounts })
      .signers([bobKeypair])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

    const bobTokenAccountBalanceAfterResponse =
      await connection.getTokenAccountBalance(accounts.takerTokenAccountA);
    const bobTokenAccountBalanceAfter = new BN(
      bobTokenAccountBalanceAfterResponse.value.amount
    );
    assert(bobTokenAccountBalanceAfter.eq(amounts.offered.tokenA));

    const aliceTokenAccountBalanceAfterResponse =
      await connection.getTokenAccountBalance(accounts.makerTokenAccountB);
    const aliceTokenAccountBalanceAfter = new BN(
      aliceTokenAccountBalanceAfterResponse.value.amount
    );

    assert(aliceTokenAccountBalanceAfter.eq(amounts.wanted.tokenB));
  }).slow(ANCHOR_SLOW_TEST_THRESHOLD);

  it('checks accounts', async () => {
    let res = await connection.getAccountInfo(aliceKeypair.publicKey);
    const aliceBalance = res.lamports / LAMPORTS_PER_SOL;
    const totalSpend = 1 - aliceBalance;

    console.log({ aliceBalance, totalSpend });
  });
});
