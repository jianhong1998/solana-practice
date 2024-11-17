import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
} from '@solana/web3.js';
import { SolanaDevConnection } from '../connection/solana-dev-connection';
import { createMint } from '@solana/spl-token';
import { getExplorerLink } from '@solana-developers/helpers';
// import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';

export class TokenMintService {
    public connection: Connection;

    /**
     * A demo program ID
     */
    public TOKEN_META_PROGRAM_PUBLIC_KEY: PublicKey;

    private static instance: TokenMintService;

    private constructor(connection: Connection) {
        this.connection = connection;
        this.TOKEN_META_PROGRAM_PUBLIC_KEY = new PublicKey(
            'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
        );
    }

    public static async createTokenMint(
        keypair: Keypair,
        tokenDecimal: number
    ) {
        const instance = this.getInstance();

        const tokenMint = await createMint(
            instance.connection,
            keypair, // This is payer
            keypair.publicKey, // This is the mint authority
            null,
            tokenDecimal
        );

        const url = this.getTokenMintUrl(tokenMint);

        // NOTE: currently not working
        // const { transactionUrl } = await this.createTokenMeta(keypair);

        return {
            tokenMint,
            url,
            // setupMetadataTransactionUrl: transactionUrl,
        };
    }

    public static getTokenMintUrl(address: PublicKey) {
        return getExplorerLink('address', address.toString(), 'devnet');
    }

    // NOTE: currently not working
    // private static async createTokenMeta(tokenMintAccountKeypair: Keypair) {
    //     const { TOKEN_META_PROGRAM_PUBLIC_KEY, connection } =
    //         this.getInstance();

    //     // Need to check the actual type
    //     const metadataData = {
    //         name: 'Solana Training Token - JH',
    //         symbol: 'TRAINING-JH',
    //         // Arweave / IPFS / Pinata etc link using metaplex standard for off-chain data
    //         uri: 'https://arweave.net/1234',
    //         sellerFeeBasisPoints: 0,
    //         creators: null,
    //         collection: null,
    //         uses: null,
    //     };

    //     // Find a valid program address
    //     const metadataPDAAndBump = PublicKey.findProgramAddressSync(
    //         [
    //             Buffer.from('metadata'),
    //             TOKEN_META_PROGRAM_PUBLIC_KEY.toBuffer(),
    //             tokenMintAccountKeypair.publicKey.toBuffer(),
    //         ],
    //         TOKEN_META_PROGRAM_PUBLIC_KEY
    //     );

    //     console.log({ metadataPDAAndBump });

    //     const pda = metadataPDAAndBump[0];

    //     // BUG: createCreateMetadataAccountV3Instruction() function is missing from the package. Other people also facing the same issue on the package (https://github.com/metaplex-foundation/mpl-token-metadata/issues/123)
    //     const createMetadataAccontInstruction =
    //         createCreateMetadataAccountV3Instruction(
    //             {
    //                 metadata: pda,
    //                 mint: tokenMintAccountKeypair,
    //                 mintAuthority: tokenMintAccountKeypair.publicKey,
    //                 payer: tokenMintAccountKeypair.publicKey,
    //                 updateAuthority: tokenMintAccountKeypair.publicKey,
    //             },
    //             {
    //                 createMetadataAccountArgsV3: {
    //                     collectionDetails: null,
    //                     data: metadataData,
    //                     isMutable: true,
    //                 },
    //             }
    //         );

    //     const transaction = new Transaction();
    //     transaction.add(createMetadataAccontInstruction);

    //     const transactionSignature = await sendAndConfirmTransaction(
    //         connection,
    //         transaction,
    //         // Signer
    //         [tokenMintAccountKeypair]
    //     );

    //     const transactionUrl = getExplorerLink(
    //         'transaction',
    //         transactionSignature,
    //         'devnet'
    //     );

    //     return { transactionUrl };
    // }

    private static getInstance() {
        if (!this.instance)
            this.instance = new TokenMintService(
                SolanaDevConnection.getConnection()
            );

        return this.instance;
    }
}
