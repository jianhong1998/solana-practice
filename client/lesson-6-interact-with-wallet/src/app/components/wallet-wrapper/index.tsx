'use client';

import { AppMode } from '@/enums';
import { SolanaHostUtil } from '@/utils';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { FC, ReactNode, useMemo } from 'react';

type WalletWrapperProps = {
  appMode: AppMode;
  children: ReactNode;
};

const WalletWrapper: FC<WalletWrapperProps> = ({ appMode, children }) => {
  const solanaEndpoint = SolanaHostUtil.getSolanaEndpoint(appMode);
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={solanaEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletWrapper;
