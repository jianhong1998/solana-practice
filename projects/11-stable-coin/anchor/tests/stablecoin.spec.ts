import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Stablecoin} from '../target/types/stablecoin'

describe('stablecoin', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Stablecoin as Program<Stablecoin>

  const stablecoinKeypair = Keypair.generate()

  it('Initialize Stablecoin', async () => {
    await program.methods
      .initialize()
      .accounts({
        stablecoin: stablecoinKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([stablecoinKeypair])
      .rpc()

    const currentCount = await program.account.stablecoin.fetch(stablecoinKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Stablecoin', async () => {
    await program.methods.increment().accounts({ stablecoin: stablecoinKeypair.publicKey }).rpc()

    const currentCount = await program.account.stablecoin.fetch(stablecoinKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Stablecoin Again', async () => {
    await program.methods.increment().accounts({ stablecoin: stablecoinKeypair.publicKey }).rpc()

    const currentCount = await program.account.stablecoin.fetch(stablecoinKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Stablecoin', async () => {
    await program.methods.decrement().accounts({ stablecoin: stablecoinKeypair.publicKey }).rpc()

    const currentCount = await program.account.stablecoin.fetch(stablecoinKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set stablecoin value', async () => {
    await program.methods.set(42).accounts({ stablecoin: stablecoinKeypair.publicKey }).rpc()

    const currentCount = await program.account.stablecoin.fetch(stablecoinKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the stablecoin account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        stablecoin: stablecoinKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.stablecoin.fetchNullable(stablecoinKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
