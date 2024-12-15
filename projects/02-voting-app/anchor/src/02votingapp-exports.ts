// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import 02votingappIDL from '../target/idl/02votingapp.json'
import type { 02votingapp } from '../target/types/02votingapp'

// Re-export the generated IDL and type
export { 02votingapp, 02votingappIDL }

// The programId is imported from the program IDL.
export const 02VOTINGAPP_PROGRAM_ID = new PublicKey(02votingappIDL.address)

// This is a helper function to get the 02votingapp Anchor program.
export function get02votingappProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...02votingappIDL, address: address ? address.toBase58() : 02votingappIDL.address } as 02votingapp, provider)
}

// This is a helper function to get the program ID for the 02votingapp program depending on the cluster.
export function get02votingappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the 02votingapp program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return 02VOTINGAPP_PROGRAM_ID
  }
}
