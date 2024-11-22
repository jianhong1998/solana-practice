import { AppMode } from '@/enums/app-mode.enum';
import { clusterApiUrl } from '@solana/web3.js';

export class SolanaHostUtil {
  public DEVNET_ENDPOINT: string;
  public MAINNET_ENDPOINT: string;
  public TESTNET_ENDPOINT: string;

  private static instance: SolanaHostUtil;

  private constructor() {
    this.DEVNET_ENDPOINT = clusterApiUrl('devnet');
    this.MAINNET_ENDPOINT = clusterApiUrl('mainnet-beta');
    this.TESTNET_ENDPOINT = clusterApiUrl('testnet');
  }

  public static getSolanaEndpoint(mode: AppMode) {
    const instance = this.getInstance();

    switch (mode) {
      case AppMode.DEV:
        return instance.DEVNET_ENDPOINT;
      case AppMode.TEST:
        return instance.TESTNET_ENDPOINT;
      case AppMode.PROD:
        return instance.MAINNET_ENDPOINT;
      default:
        throw new Error(`Invalid app mode: ${mode}`);
    }
  }

  private static getInstance(): SolanaHostUtil {
    if (!this.instance) this.instance = new SolanaHostUtil();

    return this.instance;
  }
}
