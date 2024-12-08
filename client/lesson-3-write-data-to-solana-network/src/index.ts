import { Keypair, PublicKey, SendTransactionError } from '@solana/web3.js';
import { config } from 'dotenv';
import { KeypairService } from './keypairs/keypair-service';
import { TransactionService } from './transaction/transaction';
import { SolanaLocalConnection } from './connection/solana-local-connection';

config();

const main = async () => {
  const recipientPublicKeyString = process.env.RECIPIENT_PUBLIC_KEY;
  const recipientPublicKey = new PublicKey(recipientPublicKeyString ?? '');

  const senderKeypair = KeypairService.getKeypairFromEnv('SENDER_SECRET_KEY');

  try {
    console.log('Start Transaction...');

    const transactionResult = await TransactionService.transfer({
      recipientPublicKey,
      senderPublicKey: senderKeypair.publicKey,
      signerKeypairs: [senderKeypair],
      solAmount: 0.5,
    });

    console.log({ transactionResult });

    console.log('Transaction Completed.');
  } catch (error) {
    if (error instanceof SendTransactionError) {
      if (
        !error.message.includes(
          'Attempt to debit an account but found no record of a prior credit'
        )
      ) {
        console.log(error.message);
        return;
      }

      /**
       * CASE: account does not have balance for paying transaction fees.
       */

      const account = senderKeypair.publicKey.toBase58();

      console.log(
        `Account ${account} does not have enough SOL. Request airdrop now.`
      );

      await TransactionService.requestAirDrop(senderKeypair.publicKey, 1, 0.9);

      console.log('Airdrop success. Please retry the transaction now.');

      return;
    }

    if (error instanceof Error) {
      console.log(error.message);
    }

    console.log(error);
  }
};

const requestAirDrop = async () => {
  const envVal = process.env.AIRDROP_PUBLIC_KEY ?? '';
  const publicKey = new PublicKey(envVal);
  const connection = SolanaLocalConnection.getConnection();

  await TransactionService.requestAirDrop(publicKey, 500, 10, connection);

  console.log(`Airdrop to ${publicKey.toBase58()} successfully`);
};

// main();
requestAirDrop();
