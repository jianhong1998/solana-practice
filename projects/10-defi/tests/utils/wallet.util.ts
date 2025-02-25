import { Provider, Wallet } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { KeypairUtil } from './keypair.util';
import { FEE_PAYER_ID_FILE_PATH, IS_TESTING_ON_CHAIN } from '../constants';
import { BankrunProvider } from 'anchor-bankrun';

export class WalletUtil {
  public onChainWallet: Wallet;

  private static self: WalletUtil;

  private constructor() {
    const keypair = KeypairUtil.readKeypairFromFile(FEE_PAYER_ID_FILE_PATH);

    this.onChainWallet = new Wallet(keypair);
  }

  public static getWallet(provider: BankrunProvider): Wallet {
    if (IS_TESTING_ON_CHAIN) return this.getSelf().onChainWallet;

    if (!(provider instanceof BankrunProvider)) {
      throw new Error('Invalid provider, must be BankrunProvider');
    }

    return provider.wallet;
  }

  private static getSelf(): WalletUtil {
    if (!this.self) this.self = new WalletUtil();

    return this.self;
  }
}
