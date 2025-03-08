use anchor_lang::prelude::*;

use crate::{constants::CONFIG_SEED, states::Config};

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
  pub system_program: Program<'info, System>,

  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
    mut,
    seeds = [
      CONFIG_SEED
    ],
    bump = config.bump
  )]
  pub config: Account<'info, Config>,
}

pub fn process_update_config(context: Context<UpdateConfig>, min_health_factor: u64) -> Result<()> {
  let config = &mut context.accounts.config;

  config.min_health_factor = min_health_factor;

  Ok(())
}
