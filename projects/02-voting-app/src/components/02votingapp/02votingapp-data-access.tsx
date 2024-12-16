'use client'

import { get02votingappProgram, get02votingappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function use02votingappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => get02votingappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => get02votingappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['02votingapp', 'all', { cluster }],
    queryFn: () => program.account.02votingapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['02votingapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ 02votingapp: keypair.publicKey }).signers([keypair]).rpc(),
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

export function use02votingappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = use02votingappProgram()

  const accountQuery = useQuery({
    queryKey: ['02votingapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.02votingapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['02votingapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ 02votingapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['02votingapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ 02votingapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['02votingapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ 02votingapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['02votingapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ 02votingapp: account }).rpc(),
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
