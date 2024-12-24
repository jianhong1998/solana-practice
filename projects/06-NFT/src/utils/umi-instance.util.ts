import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { ConnectionInstanceType, ConnectionUtil } from './connection.util';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { Keypair } from '@solana/web3.js';
import { keypairIdentity } from '@metaplex-foundation/umi';

export class UmiInstanceUtil {
  private constructor() {}

  public static createUmiInstance(
    instanceType: ConnectionInstanceType,
    userKeypair: Keypair
  ) {
    const connection = ConnectionUtil.getConnection(instanceType);

    const umi = createUmi(connection.rpcEndpoint);
    umi.use(mplTokenMetadata());

    const umiUserKeypair = umi.eddsa.createKeypairFromSecretKey(
      userKeypair.secretKey
    );
    umi.use(keypairIdentity(umiUserKeypair));

    console.log(
      `Umi ${
        umiUserKeypair.publicKey
      } is setup for user (${userKeypair.publicKey.toBase58()})`
    );

    return {
      umi,
      umiUserKeypair,
    };
  }
}
