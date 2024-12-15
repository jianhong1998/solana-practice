import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { Voting } from '../target/types/voting';
import { ProgramTestContext, startAnchor } from 'solana-bankrun';
import { BankrunProvider } from 'anchor-bankrun';
import { addDays } from 'date-fns';

const IDL = require('../target/idl/voting.json');

const PROGRAM_PUBLIC_KEY = new PublicKey(
  'coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF'
);

describe('Voting', () => {
  let context: ProgramTestContext;
  let provider: BankrunProvider;
  let votingProgram: Program<Voting>;

  beforeAll(async () => {
    context = await startAnchor(
      '',
      [{ name: 'voting', programId: PROGRAM_PUBLIC_KEY }],
      []
    );
    provider = new BankrunProvider(context);
    votingProgram = new Program<Voting>(IDL, provider);
  });

  describe('Initialze Poll', () => {
    it('should initialize poll', async () => {
      const TEST_DESCRIPTION = 'What is your favorite peanut butter?';

      const pollStart = new Date();
      const pollEnd = addDays(new Date(), 5);

      await votingProgram.methods
        .initializePoll(
          new anchor.BN(1), // poll_id
          new anchor.BN(pollStart.getTime()), // poll_end
          new anchor.BN(pollEnd.getTime()), // poll_end
          TEST_DESCRIPTION // description
        )
        .rpc();

      const [pollAddress] = PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
        PROGRAM_PUBLIC_KEY
      );

      const poll = await votingProgram.account.poll.fetch(pollAddress); // Fetching the poll account

      expect(poll.pollId.toNumber()).toEqual(1);
      expect(poll.pollStart.toNumber()).toEqual(pollStart.getTime());
      expect(poll.pollEnd.toNumber()).toEqual(pollEnd.getTime());
      expect(poll.description).toBe(TEST_DESCRIPTION);
      expect(poll.candidateAmount.toNumber()).toEqual(0);
    });
  });

  describe('Initialize Candidate', () => {
    it('should initialize candidate', async () => {
      const TEST_CANDIDATE_NAME_1 = 'test name 1';
      const TEST_CANDIDATE_NAME_2 = 'test name 2';
      const TEST_POLL_ID = new anchor.BN(1);

      await votingProgram.methods
        .initializeCandidate(TEST_CANDIDATE_NAME_1, TEST_POLL_ID)
        .rpc();
      await votingProgram.methods
        .initializeCandidate(TEST_CANDIDATE_NAME_2, TEST_POLL_ID)
        .rpc();

      // Fetch candidate data

      const [candidate1Address] = PublicKey.findProgramAddressSync(
        [
          TEST_POLL_ID.toArrayLike(Buffer, 'le', 8),
          Buffer.from(TEST_CANDIDATE_NAME_1),
        ],
        PROGRAM_PUBLIC_KEY
      );
      const [candidate2Address] = PublicKey.findProgramAddressSync(
        [
          TEST_POLL_ID.toArrayLike(Buffer, 'le', 8),
          Buffer.from(TEST_CANDIDATE_NAME_2),
        ],
        PROGRAM_PUBLIC_KEY
      );
      const [pollAddress] = PublicKey.findProgramAddressSync(
        [TEST_POLL_ID.toArrayLike(Buffer, 'le', 8)],
        PROGRAM_PUBLIC_KEY
      );

      const candidate1 = await votingProgram.account.candidate.fetch(
        candidate1Address
      );
      const candidate2 = await votingProgram.account.candidate.fetch(
        candidate2Address
      );
      const poll = await votingProgram.account.poll.fetch(pollAddress);

      expect(candidate1.candidateName).toBe(TEST_CANDIDATE_NAME_1);
      expect(candidate2.candidateName).toBe(TEST_CANDIDATE_NAME_2);
      expect(candidate1.candidateVote.toNumber()).toEqual(0);
      expect(candidate2.candidateVote.toNumber()).toEqual(0);
      expect(poll.candidateAmount.toNumber()).toEqual(2);
    });
  });

  describe('Vote', () => {
    it('should be able to vote', async () => {
      const TEST_CANDIDATE_NAME = 'test name 1';
      const TEST_POLL_ID = new anchor.BN(1);

      await votingProgram.methods.vote(TEST_POLL_ID, TEST_CANDIDATE_NAME).rpc();

      const [candidateAddress] = PublicKey.findProgramAddressSync(
        [
          TEST_POLL_ID.toArrayLike(Buffer, 'le', 8),
          Buffer.from(TEST_CANDIDATE_NAME),
        ],
        PROGRAM_PUBLIC_KEY
      );

      const candidate = await votingProgram.account.candidate.fetch(
        candidateAddress
      );

      console.log({
        candidate,
      });

      expect(candidate.candidateVote.toNumber()).toBe(1);
    });
  });
});
