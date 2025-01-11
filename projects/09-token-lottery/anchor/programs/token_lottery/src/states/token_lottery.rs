use anchor_lang::prelude::*;

#[account()]
#[derive(InitSpace)]
pub struct TokenLottery {
  pub winner: u64,
  pub is_winner_choosen: bool,
  pub start_time: u64,
  pub end_time: u64,
  pub lottery_pot_amount: u64,
  pub total_tickets: u64,
  pub ticket_price: u64,
  pub authority: Pubkey,
  pub randomness_account: Pubkey,

  pub bump: u8,
}
