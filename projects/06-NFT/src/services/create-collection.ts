import {
  createNft,
  fetchDigitalAsset,
} from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount } from '@metaplex-foundation/umi';
import { getExplorerLink } from '@solana-developers/helpers';
import { join } from 'path';
import { ConnectionUtil } from '../utils/connection.util';
import { UserUtil } from '../utils/user.util';
import { UmiInstanceUtil } from '../utils/umi-instance.util';
import { KEYPAIR_FILE_PATH } from '../config/constants';

export const createCollection = async () => {
  /* ============================================================
   * Data preparing
   ============================================================ */

  const connection = ConnectionUtil.getConnection('devnet');
  const userKeypair = await UserUtil.loadAndPrepareUser({
    connection,
    keypairFilePath: KEYPAIR_FILE_PATH,
    minAccountBalance: 5,
  });

  console.log(`[Collection] User loaded: ${userKeypair.publicKey.toBase58()}`);

  /* ============================================================
   * Setup Umi instance for user
   ============================================================ */

  const { umi } = UmiInstanceUtil.createUmiInstance('devnet', userKeypair);

  /* ============================================================
   * Create collection
   ============================================================ */

  const collectionMint = generateSigner(umi);
  const transaction = createNft(umi, {
    mint: collectionMint,
    name: 'My new collection',
    symbol: 'MNC',
    uri: 'https://solana-content.jianhong.link',
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
  });
  await transaction.sendAndConfirm(umi);

  const createdCollectionNft = await fetchDigitalAsset(
    umi,
    collectionMint.publicKey
  );

  console.log(
    `[Collection] Created Collection: ${getExplorerLink(
      'address',
      createdCollectionNft.mint.publicKey,
      'devnet'
    )}`
  );

  return createdCollectionNft;
};
