import { join } from 'path';
import { INSTANCE_TYPE, KEYPAIR_FILE_PATH } from '../config/constants';
import { ConnectionUtil } from '../utils/connection.util';
import { UserUtil } from '../utils/user.util';
import { UmiInstanceUtil } from '../utils/umi-instance.util';
import { PublicKey } from '@metaplex-foundation/umi';
import {
  findMetadataPda,
  verifyCollectionV1,
} from '@metaplex-foundation/mpl-token-metadata';
import { getExplorerLink } from '@solana-developers/helpers';

type IVerifyNftParams = {
  tokenAddress: PublicKey;
  collectionAddress: PublicKey;
};

/**
 * @param params.tokenAddress Token address in Umi PublicKey format
 * @param params.collectionAddress Collection addresss in Umi PublicKey format
 */
export const verifyNft = async (params: IVerifyNftParams): Promise<void> => {
  const LOG_KEY = '[Verify NFT]';
  const { collectionAddress, tokenAddress } = params;

  const connection = ConnectionUtil.getConnection(INSTANCE_TYPE);
  const userKeypair = await UserUtil.loadAndPrepareUser({
    connection,
    keypairFilePath: KEYPAIR_FILE_PATH,
    minAccountBalance: 5,
  });

  const { umi } = UmiInstanceUtil.createUmiInstance(INSTANCE_TYPE, userKeypair);

  console.log(`${LOG_KEY} Verifying NFT...`);

  const transaction = verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: tokenAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity,
  });

  await transaction.sendAndConfirm(umi);

  const explorerUrl = getExplorerLink('address', tokenAddress, INSTANCE_TYPE);

  console.log(
    `${LOG_KEY} ✅ NFT verified: NFT (${tokenAddress}) is verifed as member of collection (${collectionAddress})! See Explorer at ${explorerUrl}`
  );
};
