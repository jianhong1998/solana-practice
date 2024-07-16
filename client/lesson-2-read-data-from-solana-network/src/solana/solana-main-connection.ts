import {
    Connection,
    clusterApiUrl,
    PublicKey,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { SolanaDevConnection } from './solana-dev-connection';

export class SolanaMainConnection {
    public connection: Connection;
    private static instance: SolanaDevConnection;

    private constructor() {
        // Using 'devnet' to connect DevNet
        this.connection = new Connection(clusterApiUrl('mainnet-beta'));
    }

    public static getConnection(): Connection {
        if (!this.instance) {
            this.instance = new SolanaMainConnection();
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
