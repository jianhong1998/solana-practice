import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  PING_PROGRAM_ADDRESS,
  PING_PROGRAM_DATA_ADDRESS,
} from '../../constants';

export class PingUtil {
  constructor(private readonly connection: Connection) {}

  public async test(payerKeypair: Keypair) {
    const transaction = new Transaction();
    const programId = new PublicKey(PING_PROGRAM_ADDRESS);
    const programDataId = new PublicKey(PING_PROGRAM_DATA_ADDRESS);

    const instruction = new TransactionInstruction({
      keys: [
        {
          isSigner: false,
          isWritable: true,
          pubkey: programDataId,
        },
      ],
      programId,
      data: Buffer.from(JSON.stringify({ key: 'value' })),
    });

    transaction.add(instruction);
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payerKeypair],
    );

    console.log(
      `Transaction for Ping Program is created: https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    );
  }
}
