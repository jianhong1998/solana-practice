use crate::{constants::error_code::ErrorCode, states::token_lottery::TokenLottery};
use anchor_lang::prelude::*;
use switchboard_on_demand::RandomnessAccountData;

#[derive(Accounts)]
pub struct RevealWinner<'info> {
  pub system_program: Program<'info, System>,

  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
    mut,
    seeds = [b"token_lottery".as_ref()],
    bump = token_lottery.bump
  )]
  pub token_lottery: Account<'info, TokenLottery>,

  /// CHECK: This account is checked by the Switchboard smart contract
  pub randomness_account: UncheckedAccount<'info>,
}

pub fn reveal_winner(context: Context<RevealWinner>) -> Result<()> {
  let clock = Clock::get()?;
  let token_lottery = &mut context.accounts.token_lottery;

  if context.accounts.payer.key() != token_lottery.authority.key() {
    return Err(ErrorCode::NotAauthorized.into());
  }

  if context.accounts.randomness_account.key() != token_lottery.randomness_account.key() {
    return Err(ErrorCode::IncorrectRandomnessAccount.into());
  }

  if clock.slot < token_lottery.end_time {
    return Err(ErrorCode::LotteryNotCompleted.into());
  }

  require!(!token_lottery.is_winner_choosen, ErrorCode::WinnerChosen);

  let randomness_data =
    RandomnessAccountData::parse(context.accounts.randomness_account.data.borrow()).unwrap();

  let reveal_random_value =
    randomness_data.get_value(&clock).map_err(|_| ErrorCode::RandomnessNotResolved)?;

  let winner = reveal_random_value[0] as u64 % token_lottery.total_tickets;

  token_lottery.winner = winner;
  token_lottery.is_winner_choosen = true;

  Ok(())
}
