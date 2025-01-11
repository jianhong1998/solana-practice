use crate::{constants::error_code::ErrorCode, states::token_lottery::TokenLottery};
use anchor_lang::prelude::*;
use switchboard_on_demand::accounts::RandomnessAccountData;

#[derive(Accounts)]
pub struct CommitRandomness<'info> {
  system_program: Program<'info, System>,

  #[account(mut)]
  payer: Signer<'info>,

  #[account(
    mut,
    seeds = [
      b"token_lottery".as_ref()
    ],
    bump
  )]
  pub token_lottery: Account<'info, TokenLottery>,

  /// CHECK: this account is checked by the Switchboard smart contract
  pub randomness_account: UncheckedAccount<'info>,
}

pub fn commit_randomness(context: Context<CommitRandomness>) -> Result<()> {
  let clock = Clock::get()?;

  let token_lottery = &mut context.accounts.token_lottery;

  if context.accounts.payer.key() != token_lottery.authority.key() {
    return Err(ErrorCode::NotAauthorized.into());
  }

  let randomness_data =
    RandomnessAccountData::parse(context.accounts.randomness_account.data.borrow()).unwrap();

  if randomness_data.seed_slot != clock.slot - 1 {
    return Err(ErrorCode::RandomnessAlreadyRevealed.into());
  }

  token_lottery.randomness_account = context.accounts.randomness_account.key();

  Ok(())
}
