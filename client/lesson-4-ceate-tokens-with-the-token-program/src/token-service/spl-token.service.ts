import {
    Connection,
    Keypair,
    PublicKey,
    Signer,
    SystemProgram,
    Transaction,
} from '@solana/web3.js';
import {
    createInitializeMintInstruction,
    createMint,
    getMinimumBalanceForRentExemptMint,
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { SolanaDevConnection } from '../connection/solana-dev-connection';

export class SplTokenService {
    private connection: Connection;
    private mintAuthority: PublicKey;
    private freezeAuthority: PublicKey;
    private decimal: number;

    constructor(
        mintAuthorityPublicKey: string,
        freezeAuthorityPublicKey: string,
        decimal: number
    ) {
        this.connection = SolanaDevConnection.getConnection();
        this.mintAuthority = new PublicKey(mintAuthorityPublicKey);
        this.freezeAuthority = new PublicKey(freezeAuthorityPublicKey);
        this.decimal = decimal;
    }

    public async createTokenMintTransaction(params: {
        payer: PublicKey;
        decimals: number;
        accountKeypair: Keypair;
    }) {
        const { accountKeypair, decimals, payer } = params;

        const lamports = await getMinimumBalanceForRentExemptMint(
            this.connection
        );
        const programId = TOKEN_PROGRAM_ID;

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: payer,
                lamports,
                newAccountPubkey: accountKeypair.publicKey,
                programId,
                space: MINT_SIZE,
            }),
            createInitializeMintInstruction(
                accountKeypair.publicKey,
                decimals,
                payer,
                payer,
                programId
            )
        );

        return transaction;
    }

    public async createTokenMint(params: { payer: Signer }) {
        const { payer } = params;

        /*
            Under the hood, the createMint function is simply creating a transaction that contains two instructions:
            1. Create a new account
            2. Initialize a new mint
        */

        const tokenMint = await createMint(
            // Connection
            this.connection,
            // Payter - The public key of the payer for the transaction
            payer,
            // Mint Authority - The account that is authorized to do the actual minting of tokens from the token mint.
            this.mintAuthority,
            // Freeze Authority - An account authorized to freeze the tokens in a token account. If freezing is not a desired attribute, the parameter can be set to null
            this.freezeAuthority,
            // Decimal - specifies the desired decimal precision of the token
            this.decimal
        );

        return tokenMint;
    }
}
