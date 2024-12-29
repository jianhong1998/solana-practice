'use client';

import {
  getTokenvestingProgram,
  getTokenvestingProgramId,
} from '@project/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';

export type ICreateVestingAccountParams = {
  companyName: string;
  mintPublicKeyString: string;
};

export function useTokenvestingProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getTokenvestingProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = useMemo(
    () => getTokenvestingProgram(provider, programId),
    [provider, programId]
  );

  const employeeAccounts = useQuery({
    queryKey: ['employee-account', 'all', { cluster }],
    queryFn: () => program.account.employeeAccount.all(),
  });

  const vestingAccounts = useQuery({
    queryKey: ['vesting-account', 'all', { cluster }],
    queryFn: () => program.account.vestingAccount.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createVestingAccount = useMutation<
    string,
    Error,
    ICreateVestingAccountParams
  >({
    mutationKey: ['vesting-account', 'create', { cluster }],
    mutationFn: ({ companyName, mintPublicKeyString }) =>
      program.methods
        .createVestingAccount(companyName)
        .accounts({
          mint: new PublicKey(mintPublicKeyString),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(
        `Vesting account created, transaction signature: ${signature}`
      );
      return vestingAccounts.refetch();
    },
    onError: (_error) => {
      toast.error(`Failed to create vesting account.`);
    },
  });

  return {
    program,
    programId,
    employeeAccounts,
    vestingAccounts,
    getProgramAccount,
    createVestingAccount,
  };
}

type IUseVestingProgramAccountParams = { vestingAccountPublicKey: PublicKey };
type ICreateEmployeeVestingAccountParams = {
  startTime: number;
  endTime: number;
  cliffTime: number;
  totalAmount: number;
  beneficiaryPublicKeyString: string;
};

export const useVestingProgramAccount = ({
  vestingAccountPublicKey,
}: IUseVestingProgramAccountParams) => {
  const { cluster } = useCluster();
  const { program } = useTokenvestingProgram();

  const vestingAccountQuery = useQuery({
    queryKey: [
      'vesting-account',
      'fetch',
      { cluster, account: vestingAccountPublicKey },
    ],
    queryFn: () =>
      program.account.vestingAccount.fetch(vestingAccountPublicKey),
  });

  const createEmployeeVestingAccount = useMutation<
    string,
    Error,
    ICreateEmployeeVestingAccountParams
  >({
    mutationKey: [
      'employee-account',
      'create',
      { cluster, account: vestingAccountPublicKey },
    ],
    mutationFn: ({
      cliffTime,
      endTime,
      startTime,
      totalAmount,
      beneficiaryPublicKeyString,
    }) =>
      program.methods
        .createEmployeeAccount(
          new BN(startTime),
          new BN(endTime),
          new BN(cliffTime),
          new BN(totalAmount)
        )
        .accounts({
          beneficiary: new PublicKey(beneficiaryPublicKeyString),
          vestingAccount: vestingAccountPublicKey,
        })
        .rpc(),
    onSuccess: () => {
      toast.success('Vesting account for employee is created');
    },
    onError: (error) => {
      toast.error(
        `Failed to create employee vesting account: ${error.message}`
      );
    },
  });

  return { vestingAccountQuery, createEmployeeVestingAccount };
};
