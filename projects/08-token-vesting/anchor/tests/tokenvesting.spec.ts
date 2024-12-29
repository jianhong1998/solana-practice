import * as anchor from '@coral-xyz/anchor';
import { Program, BN } from '@coral-xyz/anchor';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Tokenvesting } from '../target/types/tokenvesting';
import {
  BanksClient,
  Clock,
  ProgramTestContext,
  startAnchor,
} from 'solana-bankrun';
import IDL from '../target/idl/tokenvesting.json';
import { SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system';
import { BankrunProvider } from 'anchor-bankrun';
import { createMint, mintTo } from 'spl-token-bankrun';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

describe('tokenvesting', () => {
  const COMPANY_NAME = 'valid company name';

  let beneficiaryKeypair: anchor.web3.Keypair;
  let employerKeypair: anchor.web3.Keypair;

  let context: ProgramTestContext;
  let provider: BankrunProvider;

  let program: Program<Tokenvesting>;
  let program2: Program<Tokenvesting>;

  let banksClient: BanksClient;
  let beneficiaryProvider: BankrunProvider;

  let mint: PublicKey;
  let vestingAccountPublicKey: PublicKey;
  let treasuryAccountPublicKey: PublicKey;
  let employeeAccountPublicKey: PublicKey;

  beforeAll(async () => {
    beneficiaryKeypair = new anchor.web3.Keypair();

    context = await startAnchor(
      '',
      [
        {
          name: 'tokenvesting', // Same with the fixtures/tokenvesting.so
          programId: new PublicKey(IDL.address),
        },
      ],
      [
        {
          address: beneficiaryKeypair.publicKey,
          info: {
            lamports: 1_000_000_000,
            data: Buffer.alloc(0),
            owner: SYSTEM_PROGRAM_ID,
            executable: false,
          },
        },
      ]
    );

    provider = new BankrunProvider(context);
    anchor.setProvider(provider);

    program = new Program<Tokenvesting>(IDL as Tokenvesting, provider);
    banksClient = context.banksClient;

    employerKeypair = provider.wallet.payer;

    mint = await createMint(
      // @ts-expect-error - Type error in spl-token-bankrun dependancy
      banksClient,
      employerKeypair,
      employerKeypair.publicKey,
      null,
      2
    );

    // Setup Program 2

    beneficiaryProvider = new BankrunProvider(context);
    beneficiaryProvider.wallet = new NodeWallet(beneficiaryKeypair);

    program2 = new Program<Tokenvesting>(
      IDL as Tokenvesting,
      beneficiaryProvider
    );

    [vestingAccountPublicKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(COMPANY_NAME)],
      program.programId
    );

    [treasuryAccountPublicKey] = PublicKey.findProgramAddressSync(
      [Buffer.from('vesting_treasury'), Buffer.from(COMPANY_NAME)],
      program.programId
    );

    [employeeAccountPublicKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('employee_vesting'),
        beneficiaryKeypair.publicKey.toBuffer(),
        vestingAccountPublicKey.toBuffer(),
      ],
      program.programId
    );
  });

  it('should create a treasury token account', async () => {
    const expectedTreasuryTokenAccountPublicKeyString =
      treasuryAccountPublicKey.toBase58();
    const expectedMintPublicKeyString = mint.toBase58();
    const expectedOwnerPublicKeyString = employerKeypair.publicKey.toBase58();
    const expectedCompanyName = COMPANY_NAME;

    await program.methods
      .createVestingAccount(COMPANY_NAME)
      .accounts({
        signer: employerKeypair.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({
        commitment: 'confirmed',
      });

    const vestingAccountData = await program.account.vestingAccount.fetch(
      vestingAccountPublicKey,
      'confirmed'
    );

    expect(vestingAccountData.companyName).toBe(expectedCompanyName);
    expect(vestingAccountData.treasuryTokenAccount.toBase58()).toBe(
      expectedTreasuryTokenAccountPublicKeyString
    );
    expect(vestingAccountData.mint.toBase58()).toBe(
      expectedMintPublicKeyString
    );
    expect(vestingAccountData.owner.toBase58()).toBe(
      expectedOwnerPublicKeyString
    );

    const amount = 10_000 * LAMPORTS_PER_SOL;
    await mintTo(
      // @ts-expect-error - Type error in spl-token-bankrun dependancy
      banksClient,
      employerKeypair,
      mint,
      treasuryAccountPublicKey,
      employerKeypair,
      amount
    );

    const mintAccountInfo = await program.provider.connection.getAccountInfo(
      mint
    );

    expect(mintAccountInfo?.lamports).toBeGreaterThan(0);
  });

  it('should creat an employee vesting account', async () => {
    const startTimeNumber = 0;
    const endTimeNumber = 100;
    const cliffTimeNumber = 100;
    const amountNumber = 10000;

    await program.methods
      .createEmployeeAccount(
        new BN(startTimeNumber),
        new BN(endTimeNumber),
        new BN(cliffTimeNumber),
        new BN(amountNumber)
      )
      .accounts({
        beneficiary: beneficiaryKeypair.publicKey,
        vestingAccount: vestingAccountPublicKey,
      })
      .rpc({
        commitment: 'confirmed',
        skipPreflight: true,
      });

    const seeds = [
      Buffer.from('employee_vesting'),
      beneficiaryKeypair.publicKey.toBuffer(),
      vestingAccountPublicKey.toBuffer(),
    ];

    const [employeeAccountPublicKey] = PublicKey.findProgramAddressSync(
      seeds,
      program.programId
    );

    const employeeAccount = await program.account.employeeAccount.fetch(
      employeeAccountPublicKey
    );

    expect(employeeAccount.beneficiary.toBase58()).toBe(
      beneficiaryKeypair.publicKey.toBase58()
    );
    expect(employeeAccount.vestingAccount.toBase58()).toBe(
      vestingAccountPublicKey.toBase58()
    );
    expect(employeeAccount.startTime.eq(new BN(startTimeNumber))).toBeTruthy();
    expect(employeeAccount.endTime.eq(new BN(endTimeNumber))).toBeTruthy();
    expect(employeeAccount.cliffTime.eq(new BN(cliffTimeNumber))).toBeTruthy();
    expect(employeeAccount.totalAmount.eq(new BN(amountNumber))).toBeTruthy();
    expect(employeeAccount.totalWithdrawn.eq(new BN(0))).toBeTruthy();
  });

  it("should claim the employee's vested token", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const initialEmployeeAccount = await program2.account.employeeAccount.fetch(
      employeeAccountPublicKey
    );

    expect(initialEmployeeAccount.totalWithdrawn.eq(new BN(0))).toBeTruthy();

    const currentClock = await banksClient.getClock();
    context.setClock(
      new Clock(
        currentClock.slot,
        currentClock.epochStartTimestamp,
        currentClock.epoch,
        currentClock.leaderScheduleEpoch,
        1000n
      )
    );

    await program2.methods
      .claimToken(COMPANY_NAME)
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({
        commitment: 'confirmed',
      });

    const employeeAccount = await program2.account.employeeAccount.fetch(
      employeeAccountPublicKey
    );

    expect(
      employeeAccount.totalWithdrawn.eq(employeeAccount.totalAmount)
    ).toBeTruthy();
  });
});
