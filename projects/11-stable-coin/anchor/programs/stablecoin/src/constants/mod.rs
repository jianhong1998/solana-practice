mod error_code;
mod liquidation;
mod pda;

use anchor_lang::constant;
pub use error_code::*;
pub use liquidation::*;
pub use pda::*;

pub const SPACE_DISCRIMINATOR: usize = 8;
pub const MINT_DECIMALS: u8 = 9;

/** Maximum cache time for a price in `seconds`. If a price exist more than this seconds then will be considered as stale. */
pub const MAX_PRICE_AGE: u64 = 100;
pub const PRICE_FEED_DECIMAL_ADJUSTMENT: u128 = 10;

#[constant]
pub const SOL_PRICE_FEED_ID: &str =
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
