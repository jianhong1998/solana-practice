'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useStablecoinProgram } from './stablecoin-data-access'
import { StablecoinCreate, StablecoinList } from './stablecoin-ui'

export default function StablecoinFeature() {
  const { publicKey } = useWallet()
  const { programId } = useStablecoinProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Stablecoin"
        subtitle={
          'Create a new account by clicking the "Create" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (increment, decrement, set, and close).'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <StablecoinCreate />
      </AppHero>
      <StablecoinList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
