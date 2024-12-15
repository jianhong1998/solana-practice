#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod 02votingapp {
    use super::*;

  pub fn close(_ctx: Context<Close02votingapp>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.02votingapp.count = ctx.accounts.02votingapp.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.02votingapp.count = ctx.accounts.02votingapp.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<Initialize02votingapp>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.02votingapp.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct Initialize02votingapp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + 02votingapp::INIT_SPACE,
  payer = payer
  )]
  pub 02votingapp: Account<'info, 02votingapp>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct Close02votingapp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub 02votingapp: Account<'info, 02votingapp>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub 02votingapp: Account<'info, 02votingapp>,
}

#[account]
#[derive(InitSpace)]
pub struct 02votingapp {
  count: u8,
}
