use anchor_lang::{prelude::*, solana_program::native_token::LAMPORTS_PER_SOL};
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};

use crate::constants::{
  CustomError, MAX_PRICE_AGE, PRICE_FEED_DECIMAL_ADJUSTMENT, SOL_PRICE_FEED_ID,
};

pub fn get_lamports_from_usd(
  amount_in_usd: &u64,
  price_feed: &Account<PriceUpdateV2>,
) -> Result<u64> {
  let feed_id = get_feed_id_from_hex(SOL_PRICE_FEED_ID)?;
  let price = price_feed.get_price_no_older_than(&Clock::get()?, MAX_PRICE_AGE, &feed_id)?;

  require!(price.price > 0, CustomError::InvalidPrice);

  let price_in_usd = price.price as u128 * PRICE_FEED_DECIMAL_ADJUSTMENT;
  let amount_in_sol = (*amount_in_usd) as u128 / price_in_usd;
  let amount_in_lamports = amount_in_sol * LAMPORTS_PER_SOL as u128;

  Ok(amount_in_lamports as u64)
}

pub fn get_usd_value(amount_in_lamports: u64, price_feed: &Account<PriceUpdateV2>) -> Result<u64> {
  let feed_id = get_feed_id_from_hex(SOL_PRICE_FEED_ID)?;
  let price = price_feed.get_price_no_older_than(&Clock::get()?, MAX_PRICE_AGE, &feed_id)?;

  require!(price.price > 0, CustomError::InvalidPrice);

  let price_in_usd = price.price as u128 * PRICE_FEED_DECIMAL_ADJUSTMENT;
  let sol_amount = amount_in_lamports as u128 / LAMPORTS_PER_SOL as u128;
  let amount_in_usd = sol_amount * price_in_usd;

  Ok(amount_in_usd as u64)
}
