import { program } from '@coral-xyz/anchor/dist/cjs/native/system';
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { BankrunProvider } from 'anchor-bankrun';
import { Defi } from '../../target/types/defi';
import { IS_TESTING_ON_CHAIN, SOL_PRICE_FEED_ID } from '../constants';
import { AccountUtil } from '../utils/account.util';
import { ProgramUtil } from '../utils/program.util';
import { WalletUtil } from '../utils/wallet.util';
import IDL from '../../target/idl/defi.json';
import { AnchorProvider } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';

type IGetTestConfigParams = {
  provider: BankrunProvider | AnchorProvider;
  payerKeypair: Keypair;
};

export class TestConfig {
  private constructor() {}

  public static async getTestConfig(params: IGetTestConfigParams) {
    if (IS_TESTING_ON_CHAIN) return await this.getOnChainConfig();
    return await this.getBankrunConfig(params);
  }

  private static async getOnChainConfig() {}

  private static async getBankrunConfig(params: IGetTestConfigParams) {
    const { provider, payerKeypair } = params;
    const devConnection = new Connection(clusterApiUrl('devnet'));

    const pythSolanaReceiver = new PythSolanaReceiver({
      connection: provider.connection,
      wallet: WalletUtil.getWallet(provider as BankrunProvider),
    });

    const pythPublicKey = new PublicKey(
      '7UVimffxr9ow1uXYxsr4LHAcV58mLzhwaeKvJ1pjLiE',
    );
    const solUsdPriceFeedAccountPublicKey =
      pythSolanaReceiver.getPriceFeedAccountAddress(0, SOL_PRICE_FEED_ID);

    const pythInfo = await devConnection.getAccountInfo(pythPublicKey);
    const feedAccountInfo = await devConnection.getAccountInfo(
      solUsdPriceFeedAccountPublicKey,
    );

    if (!pythInfo) {
      throw new Error(
        `Pyth info is not able to fetch from dev connection, please check the public key (${pythPublicKey})`,
      );
    }
    if (!feedAccountInfo) {
      throw new Error(
        `Feed account info is not able to fetch from dev connection, please check the public key (${solUsdPriceFeedAccountPublicKey})`,
      );
    }

    const programUtil = new ProgramUtil<Defi>(
      ProgramUtil.generateConstructorParams({
        anchorRootPath: '',
        isTestingOnChain: IS_TESTING_ON_CHAIN,
        addedAccounts: [
          AccountUtil.createAddedAccount(payerKeypair.publicKey, {
            lamports: 10 * LAMPORTS_PER_SOL,
          }),
          { address: pythPublicKey, info: pythInfo },
          { address: solUsdPriceFeedAccountPublicKey, info: feedAccountInfo },
        ],
        addedPrograms: [
          {
            name: 'defi',
            programId: new PublicKey(IDL.address),
          },
        ],
      }),
    );

    const program = await programUtil.getProgram();

    return { program };
  }
}
