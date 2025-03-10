use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";

pub const ANCHOR_INIT_SPACE: usize = 8;

#[constant]
pub const SOL_USD_FEED_ID: &str =
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

pub const USDC_USD_FEED_ID: &str =
  "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a";

/** Max age in `second` for price feed before stale */
pub const PRICE_FEED_MAX_AGE: u64 = 100;
