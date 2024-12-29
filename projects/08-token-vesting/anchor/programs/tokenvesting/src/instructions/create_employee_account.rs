use anchor_lang::prelude::*;

use crate::{EmployeeAccount, VestingAccount, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
pub struct CreateEmployeeAccount<'info> {
  pub system_program: Program<'info, System>,

  #[account(mut)]
  pub owner: Signer<'info>,

  pub beneficiary: SystemAccount<'info>,

  #[account(
    has_one = owner
  )]
  pub vesting_account: Account<'info, VestingAccount>,

  #[account(
    init,
    space = ANCHOR_DISCRIMINATOR + EmployeeAccount::INIT_SPACE,
    payer = owner,
    seeds = [
      b"employee_vesting",
      beneficiary.key().as_ref(),
      vesting_account.key().as_ref()
    ],
    bump
  )]
  pub employee_account: Account<'info, EmployeeAccount>,
}

pub fn create_employee(
  context: Context<CreateEmployeeAccount>,
  start_time: i64,
  end_time: i64,
  cliff_time: i64,
  total_amount: u64,
) -> Result<()> {
  *context.accounts.employee_account = EmployeeAccount {
    beneficiary: context.accounts.beneficiary.key(),
    start_time,
    end_time,
    cliff_time,
    total_amount,
    total_withdrawn: 0,
    vesting_account: context.accounts.vesting_account.key(),
    bump: context.bumps.employee_account,
  };

  Ok(())
}
