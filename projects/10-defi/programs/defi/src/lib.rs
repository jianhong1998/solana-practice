pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("Bo5oDTYmi3H7KmPPN3xPrtii6BUdQZAbboAgQZhdXUt6");

#[program]
pub mod defi {
  use super::*;

  pub fn init_bank(
    context: Context<InitBank>,
    liquidation_thredshold: u64,
    max_ltv: u64,
  ) -> Result<()> {
    process_init_bank(context, liquidation_thredshold, max_ltv)
  }

  pub fn init_user(context: Context<InitUser>, usdc_address: Pubkey) -> Result<()> {
    process_init_user(context, usdc_address)
  }

  pub fn deposit(context: Context<Deposit>, amount: u64) -> Result<()> {
    process_deposit(context, amount)
  }

  pub fn withdraw(context: Context<Withdraw>, amount: u64) -> Result<()> {
    process_withdraw(context, amount)
  }

  pub fn borrow(context: Context<Borrow>, amount: u64) -> Result<()> {
    process_borrow(context, amount)
  }

  pub fn repay(context: Context<Repay>, amount: u64) -> Result<()> {
    process_repay(context, amount)
  }

  pub fn liquidate(context: Context<Liquidate>) -> Result<()> {
    process_liquidate(context)
  }
}
