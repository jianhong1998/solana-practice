'use client';

import PrimaryButton from '@/app/components/common/buttons/primary-button';
import { TransactionUtil } from '@/utils/transaction.util';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { getRecipientPublicKey, getTransactionExplorerUrl } from './action';
import { redirect } from 'next/navigation';

const TRANSFER_AMOUNT = 0.0001;

const TransferPage: NextPage = () => {
  const [recipientPublicKey, setRecipientPublicKey] =
    useState<PublicKey | null>(null);

  const [solBalance, setSolBalance] = useState(0);

  const { connection } = useConnection();
  const { sendTransaction, publicKey: senderPublicKey } = useWallet();

  const updateWalletBalance = useCallback(async () => {
    if (!connection || !senderPublicKey) return;

    const accountInfo = await connection.getAccountInfo(senderPublicKey);

    if (!accountInfo) {
      setSolBalance(0);
      alert('No account found.');
      return;
    }

    const balance = accountInfo.lamports / LAMPORTS_PER_SOL;
    setSolBalance(balance);
  }, [senderPublicKey, connection]);

  const handleTransfer = useCallback(async () => {
    if (!senderPublicKey) throw new Error('Invalid sender public key.');
    if (!recipientPublicKey) throw new Error('Invalid recipient public key');

    const amountInSol = TRANSFER_AMOUNT;
    const transactionUtil = new TransactionUtil(connection);

    try {
      const signature = await transactionUtil.transferSol({
        amountInSol,
        publicKeys: {
          recipient: recipientPublicKey,
          sender: senderPublicKey,
        },
        sendTransactionFn: sendTransaction,
      });
      const explorerUrl = await getTransactionExplorerUrl(signature);

      alert(`Transaction is done`);
      console.log(`Transfer transaction is done, verify on ${explorerUrl}`);

      await updateWalletBalance();

      return signature;
    } catch (error) {
      console.log(error);
      return null;
    }
  }, [
    senderPublicKey,
    recipientPublicKey,
    connection,
    sendTransaction,
    updateWalletBalance,
  ]);

  // Init
  useEffect(() => {
    getRecipientPublicKey()
      .then((publicKeyString) => {
        setRecipientPublicKey(new PublicKey(publicKeyString));
      })
      .then(() => {
        updateWalletBalance();
      })
      .catch((error) => {
        console.error(error);
      });
  }, [updateWalletBalance, connection]);

  return (
    <>
      <div>
        <h1>Public Key: {senderPublicKey?.toBase58() ?? '-'}</h1>
        <h2>Balance: {solBalance} SOL</h2>
      </div>
      <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0 0 0' }}>
        <PrimaryButton onClick={() => redirect('/wallet')}>
          Back to Wallet
        </PrimaryButton>
        <PrimaryButton onClick={handleTransfer}>Transfer</PrimaryButton>
      </div>
    </>
  );
};

export default TransferPage;
