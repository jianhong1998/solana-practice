import { mintTo } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { SolanaDevConnection } from "../connection/solana-dev-connection";
import { getExplorerLink } from "@solana-developers/helpers";

export class MintTokenService {
  public readonly MINOR_UNIT_PER_MAJOR_UNITS: number;

  public static instance: MintTokenService;

  private constructor() {
    this.MINOR_UNIT_PER_MAJOR_UNITS = Math.pow(10, 2);
  }

  public static async mintToken(params: {
    userKeypair: Keypair;
    tokenMintAccount: PublicKey;
    recipientTokenAccountAddress: PublicKey;
    amount: number;
  }) {
    const {
      recipientTokenAccountAddress: recipientTokenAccount,
      tokenMintAccount,
      userKeypair,
      amount,
    } = params;

    const transactionSignature = await mintTo(
      SolanaDevConnection.getConnection(),
      userKeypair,
      tokenMintAccount,
      recipientTokenAccount,
      userKeypair,
      amount * this.getInstance().MINOR_UNIT_PER_MAJOR_UNITS,
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

  public static getAmountUnit(): number {
    return this.getInstance().MINOR_UNIT_PER_MAJOR_UNITS;
  }

  private static getInstance() {
    if (!this.instance) this.instance = new MintTokenService();
    return this.instance;
  }
}
