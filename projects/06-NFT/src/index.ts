import { createCollection } from './services/create-collection';
import { createNewNft } from './services/create-nft';
import { verifyNft } from './services/verify-nft';

const main = async () => {
  const collection = await createCollection();
  const token = await createNewNft(collection.publicKey);

  await verifyNft({
    collectionAddress: collection.publicKey,
    tokenAddress: token.publicKey,
  });
};

main();
