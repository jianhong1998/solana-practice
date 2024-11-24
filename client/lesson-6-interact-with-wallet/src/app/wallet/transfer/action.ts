'use server';

import { getExplorerLink } from '@solana-developers/helpers';
import { Cluster } from '@solana/web3.js';

export const getRecipientPublicKey = async () => {
  const recipientPublicKeyString = process.env.RECIPIENT_PUBLIC_KEY ?? '';
  return recipientPublicKeyString;
};

export const getTransactionExplorerUrl = async (
  signature: string
): Promise<string> => {
  const appMode = process.env.APP_MODE;
  let cluster: Cluster;

  switch (appMode) {
    case 'prod':
      cluster = 'mainnet-beta';
      break;
    case 'test':
      cluster = 'testnet';
      break;
    case 'dev':
    default:
      cluster = 'devnet';
      break;
  }

  return getExplorerLink('transaction', signature, cluster);
};
