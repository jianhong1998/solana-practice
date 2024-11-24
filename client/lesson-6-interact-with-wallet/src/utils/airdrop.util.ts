import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export class AirdropUtil {
  constructor(
    private readonly connection: Connection,
    private readonly publicKey: PublicKey
  ) {}

  public async requestAirdrop(solAmount: number): Promise<void> {
    const transactionSignature = await this.connection.requestAirdrop(
      this.publicKey,
      solAmount * LAMPORTS_PER_SOL
    );
    const latestBlockchainHash = await this.connection.getLatestBlockhash();

    await this.connection.confirmTransaction({
      signature: transactionSignature,
      blockhash: latestBlockchainHash.blockhash,
      lastValidBlockHeight: latestBlockchainHash.lastValidBlockHeight,
    });
  }
}
