'use client';

import { NextPage } from 'next';
import { ReactNode, useEffect, useState } from 'react';
import WalletWrapper from '@/app/components/wallet-wrapper';
import { useWalletList } from '@/hooks/use-wallet-list';
import { getAppMode } from './action';
import { AppMode } from '@/enums';

type WalletLayoutProps = {
  children: ReactNode;
};

const WalletLayout: NextPage<WalletLayoutProps> = ({ children }) => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.DEV);
  const wallets = useWalletList();

  useEffect(() => {
    getAppMode().then((appModeString) => {
      switch (appModeString) {
        case 'test':
          setAppMode(AppMode.TEST);
          break;
        case 'prod':
          setAppMode(AppMode.PROD);
          break;
        case 'dev':
        default:
          setAppMode(AppMode.DEV);
          break;
      }
    });
  }, []);

  return (
    <WalletWrapper appMode={appMode} wallets={wallets} autoConnect>
      {children}
    </WalletWrapper>
  );
};

export default WalletLayout;
