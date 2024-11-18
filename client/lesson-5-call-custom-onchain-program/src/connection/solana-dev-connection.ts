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
    const devnetApiUrl = clusterApiUrl("devnet");

    this.connection = new Connection(devnetApiUrl);
  }

  public static getConnection(): Connection {
    return this.getInstance().connection;
  }

  public static async readFromNetwork(address: string) {
    const connection = this.getConnection();
    const addressPublicKey = new PublicKey(address);

    const balanceInLamports = await connection.getBalance(addressPublicKey);
    const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;

    return {
      address,
      publicKey: addressPublicKey,
      balance: {
        sol: balanceInSol,
        lamports: balanceInLamports,
      },
    };
  }

  private static getInstance() {
    if (!this.instance) this.instance = new SolanaDevConnection();

    return this.instance;
  }
}
