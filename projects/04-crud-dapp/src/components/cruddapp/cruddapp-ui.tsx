'use client';

import { PublicKey } from '@solana/web3.js';
import { useMemo, useState } from 'react';
import {
  useCruddappProgram,
  useCruddappProgramAccount,
} from './cruddapp-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

export function CruddappCreate() {
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const { createEntry } = useCruddappProgram();
  const { publicKey } = useWallet();

  const checkIsFormValid = () => {
    return Boolean(title.trim().length) && Boolean(message.trim().length);
  };

  const handleSubmit = async () => {
    if (!publicKey || !checkIsFormValid()) return;

    await createEntry.mutateAsync({
      title,
      message,
      owner: publicKey,
    });
  };

  if (!publicKey) return <p>Connect Your Wallet.</p>;

  return (
    <div className='card flex items-center gap-2'>
      <input
        type='text'
        value={title}
        name='title'
        id='title-input'
        placeholder='Title'
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        className='input input-bordered w-full max-w-xs'
      />
      <textarea
        value={message}
        name='message'
        id='message-input'
        placeholder='Message'
        onChange={(e) => {
          setMessage(e.target.value);
        }}
        className='textarea textarea-bordered w-full max-w-xs'
      />
      <button
        className='btn btn-secondary btn-xs lg:btn-md'
        onClick={handleSubmit}
        disabled={createEntry.isPending || !checkIsFormValid()}
      >
        Create
      </button>
    </div>
  );
}

export function CruddappList() {
  const { accounts, getProgramAccount } = useCruddappProgram();

  if (getProgramAccount.isLoading) {
    return <span className='loading loading-spinner loading-lg'></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className='alert alert-info flex justify-center'>
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className='loading loading-spinner loading-lg'></span>
      ) : accounts.data?.length ? (
        <div className='grid md:grid-cols-2 gap-4'>
          {accounts.data?.map((account) => (
            <CruddappCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className='text-center'>
          <h2 className={'text-2xl'}>No Journal Entry</h2>
          No journal entry record found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function CruddappCard({ account }: { account: PublicKey }) {
  const [newMessage, setNewMessage] = useState<string>('');

  const { accountQuery, deleteEntry, updateEntry } = useCruddappProgramAccount({
    account,
  });
  const { publicKey } = useWallet();

  const title = accountQuery.data?.title;

  const isFormValid = useMemo(() => {
    return Boolean(title?.trim().length) && Boolean(newMessage.trim().length);
  }, [title, newMessage]);

  // const checkIsFormValid = () => {
  //   console.log({
  //     titleLength: Boolean(title?.trim().length),
  //     messageLength: Boolean(newMessage.trim().length),
  //   });

  //   return Boolean(title?.trim().length) && Boolean(newMessage.trim().length);
  // };

  const handleDelete = async () => {
    const title = accountQuery.data?.title;

    if (!publicKey) {
      toast.error(`Wallet is not connected.`);
      return;
    }
    if (!title) {
      toast.error(`Invalid title: ${title}`);
      return;
    }

    await deleteEntry.mutateAsync({
      title,
    });
  };

  const handleUpdate = async () => {
    const title = accountQuery.data?.title;

    if (!publicKey) {
      toast.error(`Wallet is not connected.`);
      return;
    }
    if (!isFormValid) {
      toast.error(`Form data is invalid.`);
      return;
    }
    if (!title) {
      toast.error(`Invalid title: ${title}`);
      return;
    }

    await updateEntry.mutateAsync({
      title,
      message: newMessage,
    });
  };

  if (!publicKey) return <p>Connect Your Wallet.</p>;

  if (accountQuery.isLoading) {
    return <span className='loading loading-spinner loading-lg'></span>;
  }

  return (
    <div className='card card-bordered border-base-300 border-4 text-neutral-content'>
      <div className='card-body items-center text-center'>
        <div className='space-y-6'>
          <h2
            className='card-title justify-center text-3xl cursor-pointer'
            onClick={async () => await accountQuery.refetch()}
          >
            {accountQuery.data?.title}
          </h2>
          <p>{accountQuery.data?.message}</p>
          <div className='card-actions justify-around'>
            <div className='w-full'>
              <textarea
                name='message'
                id='message-input'
                placeholder='Your new message'
                onChange={(e) => setNewMessage(e.target.value)}
              ></textarea>
            </div>
            <div className='justify-around'>
              <button
                className='btn btn-secondary btn-xs lg:btn-md'
                onClick={handleUpdate}
                disabled={
                  !isFormValid || !Boolean(publicKey) || updateEntry.isPending
                }
              >
                Update
              </button>
              <button
                onClick={handleDelete}
                className='btn btn-secondary btn-xs lg:btn-md'
                disabled={!Boolean(publicKey)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
