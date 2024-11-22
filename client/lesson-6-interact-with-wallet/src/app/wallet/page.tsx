'use client';

import WalletWrapper from '../components/wallet-wrapper';
import { AppMode } from '@/enums';
import { useWallet } from '@solana/wallet-adapter-react';
import { NextPage } from 'next';

const WalletPage: NextPage = () => {
  const appMode = AppMode.DEV;

  const wallet = useWallet();

  console.log(wallet);

  return (
    <WalletWrapper appMode={appMode}>
      <h1>Wallet Page</h1>
    </WalletWrapper>
  );
};

export default WalletPage;
