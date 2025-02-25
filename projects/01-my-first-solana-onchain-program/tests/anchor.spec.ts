import * as anchor from '@coral-xyz/anchor';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
} from '@solana/web3.js';
import BN from 'bn.js';
import IDL from '../target/idl/favorites.json';
import { Favorites } from '../target/types/favorites';
import signerKeyString from './fixtures/wallets/signer.json';

describe('Test', () => {
  let program: anchor.Program<Favorites>;
  let userKeypair: Keypair;

  beforeAll(() => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    program = anchor.workspace['favorites'] as anchor.Program<Favorites>;

    userKeypair = Keypair.fromSecretKey(
      Uint8Array.from(signerKeyString as number[])
    );
  });

  it('should be able to execute', async () => {
    const instruction = await program.methods
      .setFavouritesKim(new BN(1), 'Blue', ['coding'])
      .accounts({
        user: userKeypair.publicKey,
      })
      .signers([userKeypair])
      .instruction();

    const connection = new Connection(clusterApiUrl('devnet'));
    const blockhashObj = await connection.getLatestBlockhash();

    const transaction = new Transaction({
      blockhash: blockhashObj.blockhash,
      lastValidBlockHeight: blockhashObj.lastValidBlockHeight,
    }).add(instruction);

    const transactionId = await connection.sendTransaction(transaction, [
      userKeypair,
    ]);

    // const transactionId = await program.methods
    //   .setFavouritesKim(new BN(1), 'blue', ['coding'])
    //   .accounts({ user: userKeypair.publicKey })
    //   .signers([userKeypair])
    //   .rpc();

    console.log({ transactionId });
  });
});
