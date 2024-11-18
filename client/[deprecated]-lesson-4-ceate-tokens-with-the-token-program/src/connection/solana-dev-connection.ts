import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

export class SolanaDevConnection {
  public connection: Connection;
  private static instance: SolanaDevConnection;

  private constructor() {
    // Using 'devnet' to connect DevNet
    this.connection = new Connection(clusterApiUrl("devnet"));
  }

  public static getConnection(): Connection {
    if (!this.instance) {
      this.instance = new SolanaDevConnection();
    }

    return this.instance.connection;
  }

  public static async readFromNetwork(address: string) {
    const connection = this.getConnection();
    const addressPublicKey = new PublicKey(address);
    const balanceInLamports = await connection.getBalance(addressPublicKey);
    const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;

    return {
      balance: {
        sol: balanceInSol,
        lamports: balanceInLamports,
      },
    };
  }
}
