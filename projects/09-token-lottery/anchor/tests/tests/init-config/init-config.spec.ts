import * as anchor from '@coral-xyz/anchor';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import { TokenLottery } from '../../../target/types/token_lottery';
import {
  APP_NAME,
  IS_TESTING_ON_CHAIN,
  TEST_FEE_PAYER_ID_FILE_PATH,
  TEST_PROGRAM_OWNER_ID_FILE_PATH,
} from '../../constants';
import { FileUtil } from '../../utils/file.util';
import { ProgramUtil } from '../../utils/program.util';
import { AddedAccount, AddedProgram } from 'solana-bankrun';
import { SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system';
import IDL from '../../../target/idl/token_lottery.json';

interface ITestData {
  program: {
    program: anchor.Program<TokenLottery>;
    provider: anchor.Provider;
    connection: Connection;
  };
  keypairs: {
    feePayer: Keypair;
    programOwner: Keypair;
  };
}

describe.skip('Test initialize_config()', () => {
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
      {
        address: feePayerKeypair.publicKey,
        info: {
          data: Buffer.alloc(0),
          executable: false,
          lamports: 10 * LAMPORTS_PER_SOL,
          owner: SYSTEM_PROGRAM_ID,
        },
      },
      {
        address: programOwnerKeypair.publicKey,
        info: {
          data: Buffer.alloc(0),
          executable: false,
          lamports: 10 * LAMPORTS_PER_SOL,
          owner: SYSTEM_PROGRAM_ID,
        },
      },
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
    const provider = await programUtil.getProvider();
    const connection = provider.connection;

    testData = {
      program: {
        program,
        provider,
        connection,
      },
      keypairs: {
        feePayer: feePayerKeypair,
        programOwner: programOwnerKeypair,
      },
    };

    console.log({
      programId: testData.program.program.programId.toBase58(),

      feePayer: testData.keypairs.feePayer.publicKey.toBase58(),
      programOwner: testData.keypairs.programOwner.publicKey.toBase58(),
    });
  }, 30000);

  it('should initialize config correctly', async () => {
    const {
      program: { connection, program },
      keypairs: { feePayer, programOwner },
    } = testData;

    /* Another way to call program */

    // const instruction = await program.methods
    //   .initializeConfig(
    //     new anchor.BN(0), // start time
    //     new anchor.BN(0), // end time
    //     new anchor.BN(0) // price
    //   )
    //   .instruction();

    // const blockhashWithContext = await connection.getLatestBlockhash();

    // const transaction = new anchor.web3.Transaction({
    //   feePayer: feePayer.publicKey,
    //   blockhash: blockhashWithContext.blockhash,
    //   lastValidBlockHeight: blockhashWithContext.lastValidBlockHeight,
    // }).add(instruction);

    // const transactionSignature = await anchor.web3.sendAndConfirmTransaction(
    //   connection,
    //   transaction,
    //   [feePayer, programOwner],
    //   { skipPreflight: true }
    // );

    const transactionSignature = await program.methods
      .initializeConfig(
        new anchor.BN(0), // start time
        new anchor.BN(0), // end time
        new anchor.BN(0) // price
      )
      .accounts({
        payer: feePayer.publicKey,
      })
      .signers([feePayer])
      .rpc();

    console.log(`Transaction signature: ${transactionSignature}`);
  }, 30000);
});
