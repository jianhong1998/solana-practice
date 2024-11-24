'use client';

import { AppMode } from '@/enums';
import { SolanaHostUtil } from '@/utils';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { FC, ReactNode } from 'react';
import { Adapter } from '@solana/wallet-adapter-base';

type WalletWrapperProps = {
  appMode: AppMode;
  children: ReactNode;
  wallets: Adapter[];
  autoConnect?: boolean;
};

const WalletWrapper: FC<WalletWrapperProps> = ({
  appMode,
  children,
  wallets,
  autoConnect,
}) => {
  const solanaEndpoint = SolanaHostUtil.getSolanaEndpoint(appMode);

  return (
    <ConnectionProvider endpoint={solanaEndpoint}>
      <WalletProvider wallets={wallets} autoConnect={autoConnect ?? false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletWrapper;
