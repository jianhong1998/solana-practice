use anchor_lang::prelude::*;

#[error_code]
pub enum CustomErrorCode {
  #[msg("Claim not available yet")]
  ClaimNotAvailableYet,

  #[msg("Invalid vesting period")]
  InvalidVestingPeriod,

  #[msg("Calculation overflow")]
  CalculationOverflow,

  #[msg("Nothing to claim")]
  NothingToClaim,
}
