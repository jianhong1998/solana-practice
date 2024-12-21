'use client';

import { getCruddappProgram, getCruddappProgramId } from '@project/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

type ICreateEntryParams = {
  title: string;
  message: string;
  owner: PublicKey;
};

type IUpdateEntryParams = Pick<ICreateEntryParams, 'title' | 'message'>;

type IDeleteEntryParams = Pick<ICreateEntryParams, 'title'>;

export function useCruddappProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const transactionToast = useTransactionToast();
  const programId = useMemo(
    () => getCruddappProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = useMemo(
    () => getCruddappProgram(provider, programId),
    [provider, programId]
  );

  const accounts = useQuery({
    queryKey: ['cruddapp', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createEntry = useMutation<string, Error, ICreateEntryParams>({
    mutationKey: ['journalEntryState', 'create', { cluster }],
    mutationFn: ({ message, owner, title }) => {
      return program.methods.createJournalEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create entry: ${error.message}`);
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  };
}

export function useCruddappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program } = useCruddappProgram();

  const accountQuery = useQuery({
    queryKey: ['cruddapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  });

  const updateEntry = useMutation<string, Error, IUpdateEntryParams>({
    mutationKey: ['journalEntryState', 'update', { cluster, account }],
    mutationFn: ({ message, title }) => {
      return program.methods.updateJournalEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accountQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update entry: ${error.message}`);
    },
  });

  const deleteEntry = useMutation<string, Error, IDeleteEntryParams>({
    mutationKey: ['journalEntryState', 'delete', { cluster, account }],
    mutationFn: ({ title }) => {
      return program.methods.deleteJournalEntry(title).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accountQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete entry: ${error.message}`);
    },
  });

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  };
}
