'use client'

import { getStablecoinProgram, getStablecoinProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useStablecoinProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getStablecoinProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getStablecoinProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['stablecoin', 'all', { cluster }],
    queryFn: () => program.account.stablecoin.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['stablecoin', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ stablecoin: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useStablecoinProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useStablecoinProgram()

  const accountQuery = useQuery({
    queryKey: ['stablecoin', 'fetch', { cluster, account }],
    queryFn: () => program.account.stablecoin.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['stablecoin', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ stablecoin: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['stablecoin', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ stablecoin: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['stablecoin', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ stablecoin: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['stablecoin', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ stablecoin: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
