use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Lottery is not open")]
  LotteryNotOpen,

  #[msg("Payer is unauthorized to perform this action")]
  NotAauthorized,

  #[msg("Randomness is already revealed")]
  RandomnessAlreadyRevealed,

  #[msg("Incorrect randomness account")]
  IncorrectRandomnessAccount,

  #[msg("Lottery is not completed")]
  LotteryNotCompleted,

  #[msg("Winner was chosen")]
  WinnerChosen,

  #[msg("Winner is not chosen")]
  WinnerNotChosen,

  #[msg("Randomness is not resolved")]
  RandomnessNotResolved,

  #[msg("Not verified")]
  NotVerified,

  #[msg("Incorrect ticket")]
  IncorrectTicket,

  #[msg("No ticket in this account")]
  NoTicket,
}
