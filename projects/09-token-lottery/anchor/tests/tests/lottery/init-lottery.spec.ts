import * as anchor from '@coral-xyz/anchor';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import { BN } from 'bn.js';
import { AddedAccount, AddedProgram } from 'solana-bankrun';
import IDL from '../../../target/idl/token_lottery.json';
import { TokenLottery } from '../../../target/types/token_lottery';
import {
  APP_NAME,
  IS_TESTING_ON_CHAIN,
  TEST_FEE_PAYER_ID_FILE_PATH,
  TEST_PROGRAM_OWNER_ID_FILE_PATH,
} from '../../constants';
import { AccountUtil } from '../../utils/account.util';
import { FileUtil } from '../../utils/file.util';
import { ProgramUtil } from '../../utils/program.util';
import {
  createInitializeMetadataPointerInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { airdropIfRequired } from '@solana-developers/helpers';

interface ITestData {
  program: anchor.Program<TokenLottery>;
  keypairs: {
    feePayer: Keypair;
    programOwner: Keypair;
  };
  publicKeys: {
    lottery: PublicKey;
  };
}

describe('Test initialize_lottery()', () => {
  let testData: ITestData;

  beforeAll(async () => {
    const feePayerKeypair = FileUtil.isFileExist(TEST_FEE_PAYER_ID_FILE_PATH)
      ? Keypair.fromSecretKey(
          Uint8Array.from(
            JSON.parse(await FileUtil.readFile(TEST_FEE_PAYER_ID_FILE_PATH))
          )
        )
      : new Keypair();
    const programOwnerKeypair = FileUtil.isFileExist(
      TEST_PROGRAM_OWNER_ID_FILE_PATH
    )
      ? Keypair.fromSecretKey(
          Uint8Array.from(
            JSON.parse(await FileUtil.readFile(TEST_PROGRAM_OWNER_ID_FILE_PATH))
          )
        )
      : new Keypair();

    const addedAccounts: AddedAccount[] = [
      AccountUtil.createAddedAccount(feePayerKeypair.publicKey, {
        lamports: 10 * LAMPORTS_PER_SOL,
      }),
      AccountUtil.createAddedAccount(programOwnerKeypair.publicKey, {
        lamports: 10 * LAMPORTS_PER_SOL,
      }),
    ];
    const addedPrograms: AddedProgram[] = [
      {
        name: APP_NAME,
        programId: new PublicKey(IDL.address),
      },
    ];

    const programUtil = new ProgramUtil<TokenLottery>(
      ProgramUtil.generateConstructorParams({
        isTestingOnChain: IS_TESTING_ON_CHAIN,
        anchorRootPath: '',
        addedAccounts,
        addedPrograms,
      })
    );

    const program = await programUtil.getProgram();

    const [lotteryPublicKey] = PublicKey.findProgramAddressSync(
      [Buffer.from('token_lottery')],
      program.programId
    );

    testData = {
      program,
      keypairs: {
        feePayer: feePayerKeypair,
        programOwner: programOwnerKeypair,
      },
      publicKeys: {
        lottery: lotteryPublicKey,
      },
    };

    console.log({
      feePayer: feePayerKeypair.publicKey.toBase58(),
      programOwner: programOwnerKeypair.publicKey.toBase58(),
      lottery: lotteryPublicKey.toBase58(),
    });

    // Init Config
    try {
      await program.account.tokenLottery.fetch(lotteryPublicKey);
      console.log(`[Before All]: Lottery config is already initialized`);
    } catch (error) {
      if (IS_TESTING_ON_CHAIN) {
        await airdropIfRequired(
          program.provider.connection,
          feePayerKeypair.publicKey,
          10,
          5
        );

        console.log(`Airdrop to ${feePayerKeypair}`);
      }

      const transactionSignature = await program.methods
        .initializeConfig(new BN(0), new BN(0), new BN(0))
        .accounts({
          payer: feePayerKeypair.publicKey,
        })
        .signers([feePayerKeypair])
        .rpc({
          skipPreflight: true,
        });

      console.log(
        `[Before All]: Config of lottery [${lotteryPublicKey}] is initialized in transaction [${transactionSignature}]`
      );
    }
  }, 30000);

  it('should be able to initialize lottery', async () => {
    const {
      program,
      keypairs: { feePayer, programOwner },
    } = testData;

    const transactionSignature = await program.methods
      .initializeLottery(new BN(1))
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
        payer: feePayer.publicKey,
      })
      .signers([feePayer, programOwner])
      .rpc({ skipPreflight: true });

    // const instruction = await program.methods
    //   .initializeLottery()
    //   .accounts({
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     payer: feePayer.publicKey,
    //   })
    //   // .signers([feePayer])
    //   .instruction();

    // const blockhash = await program.provider.connection.getLatestBlockhash();

    // const transaction = new Transaction({
    //   blockhash: blockhash.blockhash,
    //   lastValidBlockHeight: blockhash.lastValidBlockHeight,
    //   feePayer: feePayer.publicKey,
    // }).add(instruction);

    // const transactionSignature = await anchor.web3.sendAndConfirmTransaction(
    //   program.provider.connection,
    //   transaction,
    //   [feePayer, programOwner],
    //   {
    //     skipPreflight: true,
    //   }
    // );

    console.log({ transactionSignature });
  });
});
