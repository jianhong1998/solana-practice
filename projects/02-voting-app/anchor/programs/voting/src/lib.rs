#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod voting {

  use super::*;

  pub fn initialize_poll(
    context: Context<InitializePoll>,
    poll_id: u64,
    poll_start: u64,
    poll_end: u64,
    description: String,
  ) -> Result<()> {
    let poll = &mut context.accounts.poll;
    poll.poll_id = poll_id;
    poll.description = description;
    poll.poll_start = poll_start;
    poll.poll_end = poll_end;
    poll.candidate_amount = 0;

    Ok(())
  }

  pub fn initialize_candidate(
    context: Context<InitializeCandidate>,
    candidate_name: String,
    _poll_id: u64,
  ) -> Result<()> {
    let candidate: &mut Account<'_, Candidate> = &mut context.accounts.candidate_account;
    let poll: &mut Account<'_, Poll> = &mut context.accounts.poll;

    candidate.candidate_name = candidate_name;
    candidate.candidate_vote = 0;

    poll.candidate_amount += 1;

    Ok(())
  }

  pub fn vote(context: Context<Vote>, _poll_id: u64, _candidate_name: String) -> Result<()> {
    let candidate: &mut Account<'_, Candidate> = &mut context.accounts.candidate;

    candidate.candidate_vote += 1;

    Ok(())
  }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
    init,
    payer = signer,
    space = 8 + Poll::INIT_SPACE,
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump,
  )]
  pub poll: Account<'info, Poll>,

  pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
  pub poll_id: u64,
  pub poll_start: u64,
  pub poll_end: u64,
  pub candidate_amount: u64,
  #[max_len(280)]
  pub description: String,
}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]
pub struct InitializeCandidate<'candidate_info> {
  #[account(mut)]
  pub signer: Signer<'candidate_info>,

  #[account(
    mut,
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump,
  )]
  pub poll: Account<'candidate_info, Poll>,

  #[account(
    init,
    payer = signer,
    space = 8 + Candidate::INIT_SPACE,
    seeds = [
      poll_id.to_le_bytes().as_ref(),
      candidate_name.as_bytes()
    ],
    bump
  )]
  pub candidate_account: Account<'candidate_info, Candidate>,

  pub system_program: Program<'candidate_info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
  #[max_len(100)]
  pub candidate_name: String,

  pub candidate_vote: u64,
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_name: String)]
pub struct Vote<'vote_info> {
  #[account()]
  signer: Signer<'vote_info>,

  #[account(
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump
  )]
  poll: Account<'vote_info, Poll>,

  #[account(
    mut,
    seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
    bump
  )]
  candidate: Account<'vote_info, Candidate>,
}
