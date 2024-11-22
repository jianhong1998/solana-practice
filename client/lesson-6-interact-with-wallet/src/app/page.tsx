import { AppMode } from '@/enums';
import { SolanaHostUtil } from '@/utils';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { NextPage } from 'next';
import { useMemo } from 'react';

const HomePage: NextPage = () => {
  const appMode = AppMode.DEV;
  const solanaEndpoint = SolanaHostUtil.getSolanaEndpoint(appMode);
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={solanaEndpoint}>
      <WalletProvider wallets={wallets}>
        <h1>Wah</h1>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default HomePage;
