#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod stablecoin {
    use super::*;

  pub fn close(_ctx: Context<CloseStablecoin>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.stablecoin.count = ctx.accounts.stablecoin.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.stablecoin.count = ctx.accounts.stablecoin.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeStablecoin>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.stablecoin.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeStablecoin<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Stablecoin::INIT_SPACE,
  payer = payer
  )]
  pub stablecoin: Account<'info, Stablecoin>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseStablecoin<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub stablecoin: Account<'info, Stablecoin>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub stablecoin: Account<'info, Stablecoin>,
}

#[account]
#[derive(InitSpace)]
pub struct Stablecoin {
  count: u8,
}
