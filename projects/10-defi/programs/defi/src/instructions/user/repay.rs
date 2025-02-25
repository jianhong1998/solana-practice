use std::f64::consts::E;

use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{error::ErrorCode, Bank, User};

#[derive(Accounts)]
pub struct Repay<'info> {
  pub system_program: Program<'info, System>,
  pub token_program: Interface<'info, TokenInterface>,
  pub associated_token_program: Program<'info, AssociatedToken>,

  #[account(mut)]
  pub signer: Signer<'info>,

  pub mint: InterfaceAccount<'info, Mint>,

  #[account(
    mut,
    seeds = [
      mint.key().as_ref()
    ],
    bump
  )]
  pub bank: Account<'info, Bank>,

  #[account(
    mut,
    seeds = [
      b"treasury",
      mint.key().as_ref(),
    ],
    bump
  )]
  pub bank_token_account: InterfaceAccount<'info, TokenAccount>,

  #[account(
    mut,
    seeds = [
      signer.key().as_ref()
    ],
    bump
  )]
  pub user_account: Account<'info, User>,

  #[account(
    mut,
    associated_token::mint = mint,
    associated_token::authority = signer,
    associated_token::token_program = token_program,
  )]
  pub user_token_account: InterfaceAccount<'info, TokenAccount>,
}

pub fn process_repay(context: Context<Repay>, amount: u64) -> Result<()> {
  let user = &mut context.accounts.user_account;
  let bank = &mut context.accounts.bank;
  let borrowed_amount: u64;
  let mint_key = context.accounts.mint.to_account_info().key();
  let token_repaying: &str;

  match mint_key {
    key if key == user.usdc.address => {
      msg!("User ({}) is repaying for USDC", user.key());
      borrowed_amount = user.usdc.borrow;
      token_repaying = "USDC"
    }
    _ => {
      msg!("User ({}) is repaying for SOL", user.key());
      borrowed_amount = user.sol.borrow;
      token_repaying = "SOL"
    }
  }

  let time_diff = user.last_updated_borrow - Clock::get()?.unix_timestamp;

  bank.total_borrowed -= (bank.total_borrowed as f64
    * E.powf((bank.interest_rate as f32 * time_diff as f32) as f64))
    as u64;

  let value_per_share = bank.total_borrowed as f64 / bank.total_borrowed_shares as f64;

  let user_value = borrowed_amount / value_per_share as u64;

  msg!("User borrowed {} {}", user_value, token_repaying);

  if amount > user_value {
    return Err(ErrorCode::OverRepayAmount.into());
  }

  // Start transfer token from user token account to bank token account

  let transfer_cpi_accounts = TransferChecked {
    from: context.accounts.user_token_account.to_account_info(),
    to: context.accounts.bank_token_account.to_account_info(),
    mint: context.accounts.mint.to_account_info(),
    authority: context.accounts.signer.to_account_info(),
  };
  let cpi_program = context.accounts.token_program.to_account_info();
  let cpi_context = CpiContext::new(cpi_program, transfer_cpi_accounts);
  let decimals = context.accounts.mint.decimals;

  msg!("Transfering tokens...");
  transfer_checked(cpi_context, amount, decimals)?;
  msg!("Token transfered successfully ✅");

  let borrow_ratio = amount.checked_div(bank.total_borrowed).unwrap();
  let user_shares = bank.total_borrowed_shares.checked_mul(borrow_ratio).unwrap();

  msg!("Updating bank and user data...");
  match mint_key {
    key if key == user.usdc.address => {
      user.usdc.borrow -= amount;
      user.usdc.borrow_shares -= user_shares;
    }
    _ => {
      user.sol.borrow -= amount;
      user.sol.borrow_shares -= user_shares;
    }
  }

  let current_timestamp = Clock::get()?.unix_timestamp;
  user.last_updated = current_timestamp;

  bank.total_borrowed -= amount;
  bank.total_borrowed_shares -= user_shares;

  msg!("Bank and user data udpated ✅");

  Ok(())
}
