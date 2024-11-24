'use client';

import '@solana/wallet-adapter-react-ui/styles.css';

import PrimaryButton from '@/app/components/common/buttons/primary-button';
import { AirdropUtil } from '@/utils';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const AirdropPage: NextPage = () => {
  const [solBalance, setSolBalance] = useState<number>(0);

  const { connection } = useConnection();
  const { publicKey, connect } = useWallet();

  const handleRequestAirdrop = async () => {
    if (!connection || !publicKey) {
      alert('No connection');
      return;
    }

    const airdropUtil = new AirdropUtil(connection, publicKey);
    await airdropUtil.requestAirdrop(1);
  };

  const handleConnect = useCallback(async () => {
    await connect();

    if (!publicKey) {
      console.error(`[ HandleConnect ]: Public Key is ${publicKey}`);
      return;
    }

    connection.onAccountChange(publicKey, (updatedAccountInfo) => {
      setSolBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
    });
  }, [publicKey, connection, connect]);

  const getWalletBalance = useCallback(async () => {
    if (!connection || !publicKey) return;

    const accountInfo = await connection.getAccountInfo(publicKey);

    if (!accountInfo) {
      setSolBalance(0);
      alert('No account found.');
      return;
    }

    const balance = accountInfo.lamports / LAMPORTS_PER_SOL;
    setSolBalance(balance);
  }, [publicKey, connection]);

  useEffect(() => {
    const connectToSolanaNetwork = async () => {
      if (connection && publicKey) return;

      await handleConnect();
    };

    connectToSolanaNetwork().then(() => {
      getWalletBalance();
    });
  }, [publicKey, connection, handleConnect, getWalletBalance]);

  return (
    <>
      <div>
        <WalletModalProvider>
          <WalletMultiButton />
        </WalletModalProvider>
      </div>
      <div style={{ margin: '1rem 0 0 0' }}>
        <div>
          <h1 style={{ color: 'blue', fontSize: '2rem', fontWeight: 700 }}>
            {solBalance} SOL
          </h1>
          <p>
            Public Key: <span>{publicKey?.toBase58() ?? '-'}</span>
          </p>
        </div>
        <div>
          <PrimaryButton onClick={handleRequestAirdrop}>
            Request Airdrop
          </PrimaryButton>
        </div>
      </div>
    </>
  );
};

export default AirdropPage;
