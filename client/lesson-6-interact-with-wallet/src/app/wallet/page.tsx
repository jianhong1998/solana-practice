'use client';

import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

import { NextPage } from 'next';
import { redirect } from 'next/navigation';
import PrimaryButton from '../components/common/buttons/primary-button';

const WalletPage: NextPage = () => {
  return (
    <>
      <div>
        <WalletModalProvider>
          <WalletMultiButton />
        </WalletModalProvider>
      </div>
      <div>
        <PrimaryButton onClick={() => redirect('/wallet/airdrop')}>
          Request Airdrop
        </PrimaryButton>
      </div>
      <div>
        <PrimaryButton onClick={() => redirect('/wallet/transfer')}>
          Transfer SOL
        </PrimaryButton>
      </div>
    </>
  );
};

export default WalletPage;
