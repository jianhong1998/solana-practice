use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{Bank, User};

#[derive(Accounts)]
pub struct Deposit<'info> {
  pub system_program: Program<'info, System>,
  pub token_program: Interface<'info, TokenInterface>,
  pub associated_token_program: Program<'info, AssociatedToken>,

  #[account(mut)]
  pub signer: Signer<'info>,

  pub mint: InterfaceAccount<'info, Mint>,

  #[account(mut)]
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
    bump,
  )]
  pub user: Account<'info, User>,

  #[account(
    mut,
    associated_token::mint = mint,
    associated_token::authority = signer,
    associated_token::token_program = token_program
  )]
  pub user_token_account: InterfaceAccount<'info, TokenAccount>,
}

pub fn process_deposit(context: Context<Deposit>, amount: u64) -> Result<()> {
  let transfer_cpi_accounts = TransferChecked {
    from: context.accounts.user_token_account.to_account_info(),
    to: context.accounts.bank_token_account.to_account_info(),
    authority: context.accounts.signer.to_account_info(),
    mint: context.accounts.mint.to_account_info(),
  };
  let cpi_program = context.accounts.token_program.to_account_info();
  let cpi_context = CpiContext::new(cpi_program, transfer_cpi_accounts);
  let decimals = context.accounts.mint.decimals;

  msg!(
    "Transfering token from user token account {} to bank token account {}...",
    context.accounts.user_token_account.key(),
    context.accounts.bank_token_account.key()
  );
  transfer_checked(cpi_context, amount, decimals)?;
  msg!("Token transfer completed ✅",);

  let bank = &mut context.accounts.bank;
  let is_bank_empty = bank.total_deposits == 0;

  if is_bank_empty {
    msg!("Bank is empty! Updating bank deposit and deposit shares...");

    bank.total_deposits = amount;
    bank.total_deposit_shares = amount;

    msg!("Bank account udpated ✅");
    msg!(
      "Bank now have {} deposits and {} deposit shares",
      bank.total_deposits,
      bank.total_deposit_shares
    );
  }

  let deposit_ratio: u64 = amount.checked_div(bank.total_deposits).unwrap();
  let user_shares: u64 = bank.total_deposit_shares.checked_mul(deposit_ratio).unwrap();

  let user = &mut context.accounts.user;

  msg!("Updating user deposit and deposit shares...");
  match context.accounts.mint.to_account_info().key() {
    key if key == user.usdc.address => {
      user.usdc.deposit += amount;
      user.usdc.deposit_shares += user_shares;
    }
    _ => {
      user.sol.deposit += amount;
      user.sol.deposit_shares += user_shares;
    }
  }
  user.last_updated = Clock::get()?.unix_timestamp;
  msg!("User data updated ✅");
  msg!(
    "User ({}) has {} SOL and {} SOL deposit shares",
    user.key(),
    user.sol.deposit,
    user.sol.deposit_shares
  );
  msg!(
    "User ({}) has {} USDC and {} USDC deposit shares",
    user.key(),
    user.usdc.deposit,
    user.usdc.deposit_shares
  );

  if !is_bank_empty {
    msg!("Bank is not empty! Updating bank deposit and deposit shares...");

    bank.total_deposits += amount;
    bank.total_deposit_shares += user_shares;

    msg!("Bank account udpated ✅");
    msg!(
      "Bank now have {} deposits and {} deposit shares",
      bank.total_deposits,
      bank.total_deposit_shares
    );
  }

  Ok(())
}
