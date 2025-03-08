use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, Token2022};

use crate::{
  constants::{
    CONFIG_SEED, LIQUIDATION_BONUS, LIQUIDATION_THRESHOLD, MINT_DECIMALS, MINT_SEED,
    MIN_HEALTH_FACTOR, SPACE_DISCRIMINATOR,
  },
  states::Config,
};

#[derive(Accounts)]
pub struct InitConfig<'info> {
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token2022>,

  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
    init,
    payer = signer,
    space = SPACE_DISCRIMINATOR + Config::INIT_SPACE,
    seeds = [
      CONFIG_SEED
    ],
    bump
  )]
  pub config: Account<'info, Config>,

  #[account(
    init,
    payer = signer,
    mint::decimals = MINT_DECIMALS,
    mint::authority = mint_account,
    mint::freeze_authority = mint_account,
    mint::token_program = token_program,
    seeds = [
      MINT_SEED
    ],
    bump
  )]
  pub mint_account: InterfaceAccount<'info, Mint>,
}

pub fn process_init_config(context: Context<InitConfig>) -> Result<()> {
  *context.accounts.config = Config {
    authority: context.accounts.signer.key(),
    mint_account: context.accounts.mint_account.key(),
    liquidation_bonus: LIQUIDATION_BONUS,
    liquidation_threshold: LIQUIDATION_THRESHOLD,
    min_health_factor: MIN_HEALTH_FACTOR,
    bump: context.bumps.config,
    bump_mint_account: context.bumps.mint_account,
  };

  Ok(())
}
