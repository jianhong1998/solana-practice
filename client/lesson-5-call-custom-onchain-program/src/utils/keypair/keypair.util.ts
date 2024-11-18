import { Keypair } from '@solana/web3.js';

export class KeypairUtil {
  private constructor() {}

  public static getKeypair(privateKey: string) {
    if (privateKey.split(',').length !== 64) {
      throw new Error(`Invalid private key: ${privateKey}`);
    }

    let formattedPrivateKey: string = privateKey;

    if (!formattedPrivateKey.startsWith('['))
      formattedPrivateKey = `[${formattedPrivateKey}`;
    if (!formattedPrivateKey.endsWith(']'))
      formattedPrivateKey = `${formattedPrivateKey}]`;

    const privateKeyNumArray = JSON.parse(formattedPrivateKey) as number[];

    const uintArray = new Uint8Array(privateKeyNumArray);

    return Keypair.fromSecretKey(uintArray);
  }

  public static generateNewKeypair(): Keypair {
    return Keypair.generate();
  }
}
