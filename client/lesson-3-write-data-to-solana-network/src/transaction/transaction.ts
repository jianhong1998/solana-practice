import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { SolanaDevConnection } from '../connection/solana-dev-connection';
import { airdropIfRequired } from '@solana-developers/helpers';

export class TransactionService {
  public connection: Connection;
  private static instance: TransactionService;

  private constructor() {
    this.connection = SolanaDevConnection.getConnection();
  }

  private static getConnection() {
    if (!this.instance) {
      this.instance = new TransactionService();
    }

    return this.instance.connection;
  }

  public static async transfer(params: {
    senderPublicKey: PublicKey;
    recipientPublicKey: PublicKey;
    solAmount: number;
    signerKeypairs: Signer[];
  }): Promise<string> {
    const { recipientPublicKey, senderPublicKey, solAmount, signerKeypairs } =
      params;

    const transaction = new Transaction();

    const sendSolInstruction = SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: recipientPublicKey,
      lamports: LAMPORTS_PER_SOL * solAmount,
    });

    transaction.add(sendSolInstruction);

    const signature = await sendAndConfirmTransaction(
      this.getConnection(),
      transaction,
      signerKeypairs
    );

    return signature;
  }

  public static async requestAirDrop(
    publicKey: PublicKey,
    requiredSol: number,
    minimumSol: number,
    connection?: Connection
  ) {
    await airdropIfRequired(
      connection ?? this.getConnection(),
      publicKey,
      requiredSol * LAMPORTS_PER_SOL,
      minimumSol * LAMPORTS_PER_SOL
    );
  }
}
