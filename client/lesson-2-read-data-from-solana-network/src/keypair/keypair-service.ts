import { Keypair } from "@solana/web3.js";

export class KeypairUtil {
  private constructor() {}

  public static generateKeypair() {
    return Keypair.generate();
  }
}
