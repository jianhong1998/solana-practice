#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

pub mod constants;
pub mod instructions;
pub mod states;

pub use constants::*;
pub use instructions::*;
pub use states::*;

declare_id!("6akMTEYy5JS8h5hpk69WtyXqvrLsAfkn7sbKdwRh3h6w");

#[program]
pub mod tokenvesting {
  use super::*;

  pub fn create_vesting_account(
    context: Context<CreateVestingAccount>,
    company_name: String,
  ) -> Result<()> {
    instructions::create_vesting_account::create_vesting(context, company_name)
  }

  pub fn create_employee_account(
    context: Context<CreateEmployeeAccount>,
    start_time: i64,
    end_time: i64,
    cliff_time: i64,
    total_amount: u64,
  ) -> Result<()> {
    instructions::create_employee_account::create_employee(
      context,
      start_time,
      end_time,
      cliff_time,
      total_amount,
    )
  }

  pub fn claim_token(context: Context<ClaimToken>, company_name: String) -> Result<()> {
    instructions::claim_token::claim(context, company_name)
  }
}
