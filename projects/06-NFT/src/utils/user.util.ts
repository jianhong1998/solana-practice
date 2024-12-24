import {
  airdropIfRequired,
  getKeypairFromFile,
} from '@solana-developers/helpers';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import { PathLike } from 'fs';

export class UserUtil {
  private constructor() {}

  public static async loadKeypairFromFile(
    filePath: PathLike
  ): Promise<Keypair> {
    return await getKeypairFromFile(filePath.toString());
  }

  public static async requestAirdrop(params: {
    connection: Connection;
    publicKey: PublicKey;
    airdropSolAmount: number;
    minSolAmount: number;
  }): Promise<number> {
    const { airdropSolAmount, connection, minSolAmount, publicKey } = params;

    const minLamportAmount = minSolAmount * LAMPORTS_PER_SOL;
    const airdropLamportAmount = airdropSolAmount * LAMPORTS_PER_SOL;

    const currentAccountBalance = await this.getAccountBalance(
      connection,
      publicKey
    );

    console.log(`Current Balance: ${currentAccountBalance.sol} SOL`);

    let newAccountBalance: number | undefined;

    if (currentAccountBalance.sol < minLamportAmount) {
      newAccountBalance = await airdropIfRequired(
        connection,
        publicKey,
        airdropLamportAmount,
        minLamportAmount
      );

      console.log(
        `Airdrop to "${publicKey}".\n Current balance: ${
          newAccountBalance / LAMPORTS_PER_SOL
        } SOL.`
      );
    }

    return newAccountBalance ?? currentAccountBalance.sol;
  }

  public static async getAccountBalance(
    connection: Connection,
    publicKey: PublicKey
  ): Promise<{ sol: number; lamports: number }> {
    const lamports = await connection.getBalance(publicKey);

    return {
      lamports,
      sol: lamports / LAMPORTS_PER_SOL,
    };
  }

  public static async loadAndPrepareUser(params: {
    connection: Connection;
    keypairFilePath: PathLike;
    minAccountBalance: number;
  }): Promise<Keypair> {
    const { connection, keypairFilePath, minAccountBalance } = params;

    const userKeypair = await this.loadKeypairFromFile(keypairFilePath);

    await this.requestAirdrop({
      connection,
      publicKey: userKeypair.publicKey,
      airdropSolAmount: minAccountBalance,
      minSolAmount: minAccountBalance,
    });

    return userKeypair;
  }
}
