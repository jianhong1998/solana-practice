use std::f32::consts::E;

use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{error::ErrorCode, Bank, User};

#[derive(Accounts)]
pub struct Withdraw<'info> {
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
      mint.key().as_ref()
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
  pub user: Account<'info, User>,

  #[account(
    init_if_needed,
    payer = signer,
    associated_token::mint = mint,
    associated_token::authority = signer,
    associated_token::token_program = token_program
  )]
  pub user_token_account: InterfaceAccount<'info, TokenAccount>,
}

pub fn process_withdraw(context: Context<Withdraw>, amount: u64) -> Result<()> {
  let user = &mut context.accounts.user;
  let deposited_value: u64;

  if context.accounts.mint.to_account_info().key() == user.usdc.address {
    deposited_value = user.usdc.deposit;
  } else {
    deposited_value = user.sol.deposit;
  }

  if amount > deposited_value {
    return Err(ErrorCode::InsufficientFunds.into());
  }

  let time_diff = user.last_updated - Clock::get()?.unix_timestamp;
  let bank = &mut context.accounts.bank;

  msg!("Updating bank total deposits based on time being...");
  bank.total_deposits = (bank.total_deposits as f64
    * E.powf(bank.interest_rate as f32 * time_diff as f32) as f64) as u64;
  let value_per_share = bank.total_deposits as f64 / bank.total_deposit_shares as f64;
  msg!("Updated bank value per share: {}", value_per_share);

  let user_value = deposited_value as f64 / value_per_share;

  if user_value < amount as f64 {
    return Err(ErrorCode::InsufficientFunds.into());
  }

  let transfer_cpi_accounts = TransferChecked {
    mint: context.accounts.mint.to_account_info(),
    authority: context.accounts.bank_token_account.to_account_info(),
    from: context.accounts.bank_token_account.to_account_info(),
    to: context.accounts.user_token_account.to_account_info(),
  };
  let cpi_program = context.accounts.token_program.to_account_info();

  let mint_key = context.accounts.mint.key();
  let signer_seeds: &[&[&[u8]]] =
    &[&[b"treasury", mint_key.as_ref(), &[context.bumps.bank_token_account]]];

  let cpi_context = CpiContext::new_with_signer(cpi_program, transfer_cpi_accounts, signer_seeds);
  let decimals = context.accounts.mint.decimals;

  msg!(
    "Transfering token from bank token account ({}) to user token account ({})...",
    context.accounts.bank_token_account.key(),
    context.accounts.user_token_account.key()
  );
  transfer_checked(cpi_context, amount, decimals)?;
  msg!("Transfer completed! ✅");

  let bank = &mut context.accounts.bank;
  let shares_to_remove =
    (amount as f64 / bank.total_deposits as f64) * bank.total_deposit_shares as f64;

  if context.accounts.mint.to_account_info().key() == user.usdc.address {
    msg!("Mint address is same with user USDC address, updating user USDC account...");
    user.usdc.deposit -= amount;
    user.usdc.deposit_shares -= shares_to_remove as u64;
    msg!("User USDC account updated ✅");
    msg!(
      "Current USDC amount: {}\nCurrent USDC shares: {}",
      user.usdc.deposit,
      user.usdc.deposit_shares
    );
  } else {
    msg!("Mint address is different with user USDC address, updating user SOL account...");
    user.sol.deposit -= amount;
    user.sol.deposit_shares -= shares_to_remove as u64;
    msg!("User SOL account updated ✅");
    msg!(
      "Current SOL amount: {}\nCurrent SOL shares: {}",
      user.sol.deposit,
      user.sol.deposit_shares
    );
  }

  user.last_updated = Clock::get()?.unix_timestamp;

  msg!("Updating bank data...");
  bank.total_deposits -= amount;
  bank.total_deposit_shares -= shares_to_remove as u64;
  bank.last_updated = Clock::get()?.unix_timestamp;
  msg!("Bank updated ✅");
  msg!(
    "Current total deposit in bank: {}\nCurrent total deposit shares in bank: {}",
    bank.total_deposits,
    bank.total_deposit_shares
  );

  Ok(())
}
