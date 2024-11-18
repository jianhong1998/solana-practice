import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { SolanaDevConnection } from "../connection/solana-dev-connection";
import { Account, transfer } from "@solana/spl-token";
import { MintTokenService } from "./mint-token.service";
import { getExplorerLink } from "@solana-developers/helpers";

export class TokenTransferService {
  public connection: Connection;

  private static instance: TokenTransferService;

  private constructor(connection: Connection) {
    this.connection = connection;
  }

  public static async transferToken(params: {
    senderKeypair: Keypair;
    senderTokenAccountAddress: PublicKey;
    recipientTokenAccountAddress: PublicKey;
    tokenMintAccount: Keypair;
    tokenAmount: number;
  }) {
    const {
      recipientTokenAccountAddress,
      senderTokenAccountAddress,
      tokenMintAccount,
      senderKeypair,
      tokenAmount,
    } = params;

    const transactionSignature = await transfer(
      this.getInstance().connection,
      tokenMintAccount, // Payer
      senderTokenAccountAddress, // Source
      recipientTokenAccountAddress, // Destination
      senderKeypair, // Owner
      tokenAmount * MintTokenService.getAmountUnit(),
    );

    const transactionUrl = getExplorerLink(
      "transaction",
      transactionSignature,
      "devnet",
    );

    return {
      transactionSignature,
      transactionUrl,
    };
  }

  private static getInstance() {
    if (!this.instance)
      this.instance = new TokenTransferService(
        SolanaDevConnection.getConnection(),
      );

    return this.instance;
  }
}
