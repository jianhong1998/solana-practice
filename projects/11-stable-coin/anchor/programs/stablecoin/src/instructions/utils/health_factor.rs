use anchor_lang::prelude::*;
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;

use crate::{
  constants::CustomError,
  states::{Collateral, Config},
};

use super::get_usd_value;

pub fn check_health_factor<'info>(
  collateral: &Account<'info, Collateral>,
  config: &Account<'info, Config>,
  price_feed: &Account<'info, PriceUpdateV2>,
) -> Result<()> {
  let health_factor = calculate_health_factor(collateral, config, price_feed)?;

  require!(health_factor >= config.min_health_factor, CustomError::BelowMinHealthFactor);

  Ok(())
}

pub fn calculate_health_factor<'info>(
  collateral: &Account<'info, Collateral>,
  config: &Account<'info, Config>,
  price_feed: &Account<'info, PriceUpdateV2>,
) -> Result<u64> {
  let collateral_value_in_usd = get_usd_value(collateral.lamport_balance, &price_feed)?;
  let percentage_collateral_adjusted_for_liquidation_threshold =
    (collateral_value_in_usd * config.liquidation_threshold) / 100;

  // CASE: Someone's account with 0 minted token
  if collateral.amount_minted == 0 {
    msg!("Health Factor Max");
    return Ok(u64::MAX);
  }

  let health_factor =
    percentage_collateral_adjusted_for_liquidation_threshold / collateral.amount_minted;

  Ok(health_factor)
}
