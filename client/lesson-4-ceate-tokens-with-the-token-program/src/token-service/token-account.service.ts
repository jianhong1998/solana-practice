import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SolanaDevConnection } from '../connection/solana-dev-connection';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { getExplorerLink } from '@solana-developers/helpers';

export class TokenAccountService {
    public connection: Connection;

    private static instance: TokenAccountService;

    private constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * @param payer (Optional) The payer for creating the account. If not specify, then the payer will be set to the account address provided by default.
     */
    public static async getOrCreateTokenAccount(params: {
        accountAddress: PublicKey;
        mintAccount: PublicKey;
        payerKeypair: Keypair;
    }) {
        const { accountAddress, mintAccount, payerKeypair: payer } = params;
        const { connection } = this.getInstance();

        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mintAccount,
            accountAddress
        );

        const accountUrl = await this.getTokenAccountUrl(tokenAccount.address);

        return {
            tokenAccount,
            accountUrl,
        };
    }

    public static async getTokenAccountUrl(address: PublicKey) {
        return getExplorerLink('address', address.toBase58(), 'devnet');
    }

    private static getInstance() {
        if (!this.instance)
            this.instance = new TokenAccountService(
                SolanaDevConnection.getConnection()
            );

        return this.instance;
    }
}
