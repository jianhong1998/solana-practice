use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct VestingAccount {
  pub owner: Pubkey,

  pub mint: Pubkey,

  pub treasury_token_account: Pubkey,

  #[max_len(50)]
  pub company_name: String,

  pub tresury_bump: u8,

  pub bump: u8,
}
