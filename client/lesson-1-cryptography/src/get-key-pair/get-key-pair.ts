import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { Keypair } from "@solana/web3.js";

export class KeypairService {
  private constructor() {}

  public static generateKeypair() {
    const keypair = Keypair.generate();
    return keypair;
  }

  public static getKeypairFromEnv() {
    const keypair = getKeypairFromEnvironment("SECRET_KEY");
    return keypair;
  }
}
