import { Program, Provider } from '@coral-xyz/anchor';
import { clusterApiUrl, Keypair } from '@solana/web3.js';
import IDL from '../../target/idl/defi.json';
import { Defi } from '../../target/types/defi';
import { FEE_PAYER_ID_FILE_PATH, IS_TESTING_ON_CHAIN } from '../constants';
import { KeypairUtil } from '../utils/keypair.util';
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';
import { ProgramUtil } from '../utils/program.util';
import { PublicKey } from '@solana/web3.js';
import { AccountUtil } from '../utils/account.util';
import { Connection } from '@solana/web3.js';
import { createMint } from 'spl-token-bankrun';
import { BanksClient } from 'spl-token-bankrun/node_modules/solana-bankrun/dist/index';

type ITestData = {
  keypairs: {
    signer: Keypair;
  };
  publicKey: {
    pyth: PublicKey;
  };
};

describe('Test init_bank() instruction', () => {
  let program: Program<Defi>;
  let provider: Provider;
  let testData: ITestData;

  beforeAll(async () => {
    const payerKeypair = KeypairUtil.readKeypairFromFile(
      FEE_PAYER_ID_FILE_PATH,
    );

    const devnetConnection = new Connection(clusterApiUrl('devnet'));

    const pythPublicKey = new PublicKey(
      '7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE',
    );
    const pythAccountInfo =
      await devnetConnection.getAccountInfo(pythPublicKey);
    const pythAddedAccounts = pythAccountInfo
      ? [AccountUtil.createAddedAccount(pythPublicKey, pythAccountInfo)]
      : [];

    const programUtil = new ProgramUtil<Defi>(
      ProgramUtil.generateConstructorParams({
        addedAccounts: [...pythAddedAccounts],
        addedPrograms: [
          { name: 'defi', programId: new PublicKey(IDL.address) },
        ],
        anchorRootPath: '',
        isTestingOnChain: IS_TESTING_ON_CHAIN,
      }),
    );

    program = await programUtil.getProgram();
    provider = await programUtil.getProvider();

    const context = await programUtil.getContext();
    const banksClient =
      (context?.banksClient as BanksClient | undefined) ?? null;

    if (banksClient) {
      const mintUsdc = await createMint(
        banksClient,
        payerKeypair,
        payerKeypair.publicKey,
        null,
        2,
      );

      const mintSol = await createMint(
        banksClient,
        payerKeypair,
        payerKeypair.publicKey,
        null,
        2,
      );
    }

    testData = {
      keypairs: {
        signer: payerKeypair,
      },
      publicKey: {
        pyth: pythPublicKey,
      },
    };
  });

  it('should ', async () => {
    const pythPublicKey = testData.publicKey.pyth;

    const pythAccountInfo =
      await provider.connection.getAccountInfo(pythPublicKey);

    console.log({ pythPublicKey: pythPublicKey.toBase58() });
    console.log({ pythAccountInfo });
  });
});
