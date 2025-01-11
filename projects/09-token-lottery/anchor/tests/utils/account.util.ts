import { SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system';
import { PublicKey } from '@solana/web3.js';
import { AccountInfoBytes, AddedAccount } from 'solana-bankrun';

export class AccountUtil {
  private constructor() {}

  public static createAddedAccount(
    address: PublicKey,
    partialInfo: Partial<AccountInfoBytes>
  ): AddedAccount {
    return {
      address,
      info: {
        data: Buffer.alloc(0),
        executable: false,
        lamports: 0,
        owner: SYSTEM_PROGRAM_ID,
        ...partialInfo,
      },
    };
  }
}
