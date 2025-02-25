use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bank {
  pub authority: Pubkey,
  pub mint_address: Pubkey,
  pub last_updated: i64,
  pub total_deposits: u64,
  pub total_deposit_shares: u64,
  pub total_borrowed: u64,
  pub total_borrowed_shares: u64,
  pub interest_rate: u64,
  pub liquidation_thredshold: u64, // The loan to value at which a loan is defined as under-collaterized and can be liquidated
  pub liquidation_bonus: u64, // The percentage of the liquidation that's going to be sent to the liquidator as a bonus for processing the liquidation
  pub liquidation_close_factor: u64, // The percentage that the collateral can be liquidated
  pub max_ltv: u64, // The max percentage (%) that the collateral that can be borrowed for a specific asset
}
