import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {02votingapp} from '../target/types/02votingapp'

describe('02votingapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.02votingapp as Program<02votingapp>

  const 02votingappKeypair = Keypair.generate()

  it('Initialize 02votingapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        02votingapp: 02votingappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([02votingappKeypair])
      .rpc()

    const currentCount = await program.account.02votingapp.fetch(02votingappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment 02votingapp', async () => {
    await program.methods.increment().accounts({ 02votingapp: 02votingappKeypair.publicKey }).rpc()

    const currentCount = await program.account.02votingapp.fetch(02votingappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment 02votingapp Again', async () => {
    await program.methods.increment().accounts({ 02votingapp: 02votingappKeypair.publicKey }).rpc()

    const currentCount = await program.account.02votingapp.fetch(02votingappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement 02votingapp', async () => {
    await program.methods.decrement().accounts({ 02votingapp: 02votingappKeypair.publicKey }).rpc()

    const currentCount = await program.account.02votingapp.fetch(02votingappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set 02votingapp value', async () => {
    await program.methods.set(42).accounts({ 02votingapp: 02votingappKeypair.publicKey }).rpc()

    const currentCount = await program.account.02votingapp.fetch(02votingappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the 02votingapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        02votingapp: 02votingappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.02votingapp.fetchNullable(02votingappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
