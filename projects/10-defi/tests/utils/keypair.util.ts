import { Keypair } from '@solana/web3.js';
import { FileUtil } from './file.util';

export class KeypairUtil {
  private constructor() {}

  public static readKeypairFromFile(filePath: string): Keypair {
    const fileContent = FileUtil.readFile(filePath);
    const intArray = JSON.parse(fileContent) as unknown as number[];
    const uint8Array = Uint8Array.from(intArray);
    return Keypair.fromSecretKey(uint8Array);
  }
}
