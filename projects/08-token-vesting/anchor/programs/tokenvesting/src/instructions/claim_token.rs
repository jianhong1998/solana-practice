use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{CustomErrorCode, EmployeeAccount, VestingAccount};

#[derive(Accounts)]
#[instruction(company_name: String)]
pub struct ClaimToken<'info> {
  pub system_program: Program<'info, System>,
  pub token_program: Interface<'info, TokenInterface>,
  pub associated_token_program: Program<'info, AssociatedToken>,

  #[account(mut)]
  pub beneficiary: Signer<'info>,

  #[account(
    mut,
    seeds = [
      b"employee_vesting",
      beneficiary.key().as_ref(),
      vesting_account.key().as_ref()
      ],
      bump = employee_account.bump,
      has_one = beneficiary,
      has_one = vesting_account,
  )]
  pub employee_account: Account<'info, EmployeeAccount>,

  #[account(
    mut,
    seeds = [company_name.as_ref()],
    bump = vesting_account.bump,
    has_one = treasury_token_account,
    has_one = mint
  )]
  pub vesting_account: Account<'info, VestingAccount>,

  pub mint: InterfaceAccount<'info, Mint>,

  #[account(mut)]
  pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,

  #[account(
    init_if_needed,
    payer = beneficiary,
    associated_token::mint = mint,
    associated_token::authority = beneficiary,
    associated_token::token_program = token_program
  )]
  pub employee_token_account: InterfaceAccount<'info, TokenAccount>,
}

pub fn claim(context: Context<ClaimToken>, _company_name: String) -> Result<()> {
  let employee_account = &mut context.accounts.employee_account;

  let now = Clock::get()?.unix_timestamp;

  if now < employee_account.cliff_time {
    return Err(CustomErrorCode::ClaimNotAvailableYet.into());
  }

  let time_since_start = now.saturating_sub(employee_account.start_time);
  let total_vesting_time = employee_account.end_time.saturating_sub(employee_account.start_time);

  if total_vesting_time == 0 {
    return Err(CustomErrorCode::InvalidVestingPeriod.into());
  }

  let vested_amount = if now >= employee_account.end_time {
    employee_account.total_amount
  } else {
    match employee_account.total_amount.checked_mul(time_since_start as u64) {
      Some(product) => product / total_vesting_time as u64,
      None => {
        return Err(CustomErrorCode::CalculationOverflow.into());
      }
    }
  };

  let claimable_amount = vested_amount.saturating_sub(employee_account.total_withdrawn);

  if claimable_amount == 0 {
    return Err(CustomErrorCode::NothingToClaim.into());
  }

  let transfer_cpi_accounts = TransferChecked {
    from: context.accounts.treasury_token_account.to_account_info(),
    to: context.accounts.employee_token_account.to_account_info(),
    authority: context.accounts.treasury_token_account.to_account_info(),
    mint: context.accounts.mint.to_account_info(),
  };

  let cpi_program = context.accounts.token_program.to_account_info();

  let signer_seeds: &[&[&[u8]]] = &[&[
    b"vesting_treasury",
    context.accounts.vesting_account.company_name.as_ref(),
    &[context.accounts.vesting_account.tresury_bump],
  ]];

  let cpi_context = CpiContext::new(cpi_program, transfer_cpi_accounts).with_signer(signer_seeds);

  let decimals = context.accounts.mint.decimals;

  transfer_checked(cpi_context, claimable_amount, decimals)?;

  employee_account.total_withdrawn += claimable_amount;

  Ok(())
}
