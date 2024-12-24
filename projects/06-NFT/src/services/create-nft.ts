import { join } from 'path';
import {
  ConnectionInstanceType,
  ConnectionUtil,
} from '../utils/connection.util';
import { UserUtil } from '../utils/user.util';
import { UmiInstanceUtil } from '../utils/umi-instance.util';
import {
  generateSigner,
  percentAmount,
  PublicKey,
} from '@metaplex-foundation/umi';
import {
  createNft,
  fetchDigitalAsset,
} from '@metaplex-foundation/mpl-token-metadata';
import { getExplorerLink } from '@solana-developers/helpers';
import { INSTANCE_TYPE, KEYPAIR_FILE_PATH } from '../config/constants';

/**
 * @param collectionAddress Collection public key in Umi PublicKey format
 */
export const createNewNft = async (collectionAddress: PublicKey) => {
  const LOG_KEY = '[Create NFT]';

  const connection = ConnectionUtil.getConnection(INSTANCE_TYPE);
  const userKeypair = await UserUtil.loadAndPrepareUser({
    connection,
    keypairFilePath: KEYPAIR_FILE_PATH,
    minAccountBalance: 5,
  });

  const { umi } = UmiInstanceUtil.createUmiInstance(INSTANCE_TYPE, userKeypair);

  console.log(`${LOG_KEY} Creating NFT...`);

  const mint = generateSigner(umi);
  const transaction = createNft(umi, {
    mint,
    name: 'My first NFT',
    uri: 'http://solana-content.jianhong.link/test-nft-collection/nft-token-metadata.json',
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
      key: collectionAddress,
      verified: false,
    },
  });

  await transaction.sendAndConfirm(umi);

  const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

  console.log(
    `${LOG_KEY} Created NFT address: ${getExplorerLink(
      'address',
      createdNft.mint.publicKey,
      INSTANCE_TYPE
    )}`
  );

  return createdNft;
};
