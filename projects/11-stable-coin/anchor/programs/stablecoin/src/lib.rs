#![allow(clippy::result_large_err)]

pub mod constants;
pub mod instructions;
pub mod states;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("3cXYz6evVwR2PYHqLgN6eY7TKhkqKep6eYrMFkBY9khc");

#[program]
pub mod stablecoin {
  use super::*;

  pub fn init_config(context: Context<InitConfig>) -> Result<()> {
    process_init_config(context)
  }

  pub fn update_config(context: Context<UpdateConfig>, min_health_factor: u64) -> Result<()> {
    process_update_config(context, min_health_factor)
  }

  pub fn deposit_collateral_and_mint_token(
    context: Context<DepositCollateralAndMintToken>,
    amount_collateral: u64,
    amount_to_mint: u64,
  ) -> Result<()> {
    process_deposit_collateral_and_mint_token(context, amount_collateral, amount_to_mint)
  }

  pub fn redeem_collateral_and_burn_token(
    context: Context<RedeemCollateralAndBurnToken>,
    collateral_amount: u64,
    burn_amount: u64,
  ) -> Result<()> {
    process_redeem_collateral_and_burn_token(context, collateral_amount, burn_amount)
  }

  pub fn liquidate(context: Context<Liquidate>, amount_to_burn: u64) -> Result<()> {
    process_liquidate(context, amount_to_burn)
  }
}
