'use client';

import { PublicKey } from '@solana/web3.js';
import { useEffect, useMemo, useState } from 'react';
import {
  useTokenvestingProgram,
  useVestingProgramAccount,
} from './tokenvesting-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

export function VestingCreate() {
  const [company, setCompany] = useState('');
  const [mintPublicKeyString, setMintPublicKeyString] = useState('');

  const { createVestingAccount } = useTokenvestingProgram();
  const { publicKey } = useWallet();

  const isFormValid =
    company.trim().length > 0 && mintPublicKeyString.trim().length > 0;

  const handleSubmit = () => {
    if (!publicKey) {
      toast.error('Wallet is not connected');
      return;
    }

    if (!isFormValid) {
      toast.error('Invalid form value');
      return;
    }

    createVestingAccount.mutateAsync({
      companyName: company,
      mintPublicKeyString,
    });
  };

  useEffect(() => {
    if (!createVestingAccount.isSuccess) return;

    setCompany('');
    setMintPublicKeyString('');
  }, [createVestingAccount.isSuccess]);

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <div className='card gap-5'>
      <h1>Create New Vesting Account</h1>
      <input
        type='text'
        name='company-name'
        id='company-name-input'
        placeholder='Company Name'
        className='input input-bordered w-full max-w-xs'
        value={company}
        onChange={(e) => setCompany(e.currentTarget.value)}
      />
      <input
        type='text'
        name='mint-public-key'
        id='mint-public-key-input'
        placeholder='Mint Public Key'
        className='input input-bordered w-full max-w-xs'
        value={mintPublicKeyString}
        onChange={(e) => setMintPublicKeyString(e.currentTarget.value)}
      />
      <button
        className='btn btn-xs lg:btn-md btn-primary'
        onClick={handleSubmit}
        disabled={createVestingAccount.isPending || !isFormValid}
      >
        {createVestingAccount.isPending ? 'Creating...' : 'Create Account'}
      </button>
    </div>
  );
}

export function VestingList() {
  const { vestingAccounts, getProgramAccount } = useTokenvestingProgram();

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
      {vestingAccounts.isLoading ? (
        <span className='loading loading-spinner loading-lg'></span>
      ) : vestingAccounts.data?.length ? (
        <div className='grid md:grid-cols-2 gap-4'>
          {vestingAccounts.data?.map((account) => (
            <VestingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className='text-center'>
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function VestingCard({ account }: { account: PublicKey }) {
  const { vestingAccountQuery, createEmployeeVestingAccount } =
    useVestingProgramAccount({
      vestingAccountPublicKey: account,
    });

  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [cliffTime, setCliffTime] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [beneficiaryPublicKeyString, setBeneficiaryPublicKeyString] =
    useState<string>('');

  const companyName = useMemo<string>(
    () => vestingAccountQuery.data?.companyName ?? '',
    [vestingAccountQuery.data]
  );

  const handleCreate = () => {
    createEmployeeVestingAccount.mutate({
      startTime,
      cliffTime,
      endTime,
      totalAmount,
      beneficiaryPublicKeyString,
    });
  };

  const isFormValid =
    startTime > 0 &&
    endTime > 0 &&
    endTime > startTime &&
    cliffTime > 0 &&
    cliffTime > startTime &&
    cliffTime <= endTime &&
    totalAmount > 0 &&
    beneficiaryPublicKeyString.trim().length > 0;

  return vestingAccountQuery.isLoading ? (
    <span className='loading loading-spinner loading-lg'></span>
  ) : (
    <div className='card card-bordered border-base-300 border-4 text-neutral-content'>
      <div className='card-body items-center text-center'>
        <div className='space-y-6'>
          <h2
            className='card-title justify-center text-3xl cursor-pointer'
            onClick={() => vestingAccountQuery.refetch()}
          >
            {companyName}
          </h2>
          <div className='card-actions justify-around'>
            <input
              type='number'
              placeholder='Start Time'
              className='input input-bordered w-full max-w-xs'
              value={startTime === 0 ? '' : startTime}
              onChange={(e) => setStartTime(+e.currentTarget.value)}
            />
            <input
              type='number'
              placeholder='End Time'
              className='input input-bordered w-full max-w-xs'
              value={endTime === 0 ? '' : endTime}
              onChange={(e) => setEndTime(+e.currentTarget.value)}
            />
            <input
              type='number'
              placeholder='Cliff Time'
              className='input input-bordered w-full max-w-xs'
              value={cliffTime === 0 ? '' : cliffTime}
              onChange={(e) => setCliffTime(+e.currentTarget.value)}
            />
            <input
              type='number'
              placeholder='Total Allocation Amount'
              className='input input-bordered w-full max-w-xs'
              value={totalAmount === 0 ? '' : totalAmount}
              onChange={(e) => setTotalAmount(+e.currentTarget.value)}
            />
            <input
              type='string'
              placeholder='Beneficiary Wallet Address'
              className='input input-bordered w-full max-w-xs'
              value={beneficiaryPublicKeyString}
              onChange={(e) =>
                setBeneficiaryPublicKeyString(e.currentTarget.value)
              }
            />
            <button
              className='btn btn-xs lg:btn-md btn-outline'
              onClick={handleCreate}
              disabled={!isFormValid || createEmployeeVestingAccount.isPending}
            >
              {createEmployeeVestingAccount.isPending
                ? 'Creating...'
                : 'Create Employee Vesting'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
