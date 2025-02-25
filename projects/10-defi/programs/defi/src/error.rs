use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Insufficient funds")]
  InsufficientFunds,

  #[msg("Requested amount is exceeded borrowable amount")]
  OverBorrowableAmount,

  #[msg("Requested amount is exceeded borrowed amount")]
  OverRepayAmount,

  #[msg("User is not under collateralized, cannot be liquidated")]
  NotUnderCollateralized,
}
