use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct SolAccount {
  pub deposit: u64,
  pub deposit_shares: u64,
  pub borrow: u64,
  pub borrow_shares: u64,
}

#[account]
#[derive(InitSpace)]
pub struct OtherTokenAccount {
  pub address: Pubkey,
  pub deposit: u64,
  pub deposit_shares: u64,
  pub borrow: u64,
  pub borrow_shares: u64,
}

#[account]
#[derive(InitSpace)]
pub struct User {
  pub owner: Pubkey,
  pub last_updated: i64,
  pub last_updated_borrow: i64,
  pub sol: SolAccount,
  pub usdc: OtherTokenAccount,
}
