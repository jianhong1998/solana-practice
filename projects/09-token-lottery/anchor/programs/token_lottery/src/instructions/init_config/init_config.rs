use crate::{constants::SPACE_DISCRIMENTAL, states::token_lottery::*};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitConfig<'info> {
  pub system_program: Program<'info, System>,

  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
    init,
    payer = payer,
    space = SPACE_DISCRIMENTAL + TokenLottery::INIT_SPACE,
    seeds = [b"token_lottery".as_ref()],
    bump
  )]
  pub token_lottery: Account<'info, TokenLottery>,
}

pub fn init_config(
  context: Context<InitConfig>,
  start_time: u64,
  end_time: u64,
  price: u64,
) -> Result<()> {
  *context.accounts.token_lottery = TokenLottery {
    start_time,
    end_time,
    ticket_price: price,
    winner: 0,
    authority: context.accounts.payer.key(),
    is_winner_choosen: false,
    lottery_pot_amount: 0,
    total_tickets: 0,
    randomness_account: Pubkey::default(),
    bump: context.bumps.token_lottery,
  };

  Ok(())
}
