use std::f64::consts::E;

use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, Price, PriceUpdateV2};

use crate::{error::ErrorCode, Bank, User, PRICE_FEED_MAX_AGE, SOL_USD_FEED_ID, USDC_USD_FEED_ID};

#[derive(Accounts)]
pub struct Borrow<'info> {
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
    associated_token::token_program = token_program,
  )]
  pub user_token_account: InterfaceAccount<'info, TokenAccount>,

  /**
   * PriceUpdateV2 gotten from pyth-solana-receiver-sdk
   */
  pub price_update_account: Account<'info, PriceUpdateV2>,
}

pub fn process_borrow(context: Context<Borrow>, amount: u64) -> Result<()> {
  let bank = &mut context.accounts.bank;
  let user = &mut context.accounts.user;
  let price_update = &mut context.accounts.price_update_account;

  let total_collateral: u64;

  let mint_pubkey = context.accounts.mint.to_account_info().key();

  match mint_pubkey {
    key if key == user.usdc.address => {
      // User is borrowing USDC
      msg!("User is borrowing USDC.");
      let sol_feed_id: [u8; 32] = get_feed_id_from_hex(SOL_USD_FEED_ID)?;
      let sol_price: Price =
        price_update.get_price_no_older_than(&Clock::get()?, PRICE_FEED_MAX_AGE, &sol_feed_id)?;
      let new_value: u64 =
        calculate_accrued_interest(user.sol.deposit, bank.interest_rate, user.last_updated)?;
      total_collateral = (sol_price.price as u64) * new_value;
    }
    _ => {
      msg!("User is borrowing SOL.");
      let usdc_feed_id = get_feed_id_from_hex(USDC_USD_FEED_ID)?;
      let usdc_price: Price =
        price_update.get_price_no_older_than(&Clock::get()?, PRICE_FEED_MAX_AGE, &usdc_feed_id)?;
      let new_value: u64 =
        calculate_accrued_interest(user.sol.deposit, bank.interest_rate, user.last_updated)?;
      total_collateral = (usdc_price.price as u64) * new_value;
    }
  }

  msg!("Total collateral for user ({}) is {}", user.key(), total_collateral);

  msg!("Calculating borrowable amount based on collateral...");
  let borrowable_amount = total_collateral.checked_mul(bank.liquidation_thredshold).unwrap();
  msg!("Borrowable amount is {}", borrowable_amount);

  if amount > borrowable_amount {
    return Err(ErrorCode::OverBorrowableAmount.into());
  }

  let transfer_cpi_accounts = TransferChecked {
    from: context.accounts.bank_token_account.to_account_info(),
    to: context.accounts.user_token_account.to_account_info(),
    authority: context.accounts.bank_token_account.to_account_info(),
    mint: context.accounts.mint.to_account_info(),
  };
  let cpi_program = context.accounts.token_program.to_account_info();
  let mint_key = context.accounts.mint.key();
  let signer_seeds: &[&[&[u8]]] =
    &[&[b"treasury", mint_key.as_ref(), &[context.bumps.bank_token_account]]];

  let cpi_context = CpiContext::new_with_signer(cpi_program, transfer_cpi_accounts, signer_seeds);
  let decimals = context.accounts.mint.decimals;

  msg!("Transfering amount...");
  transfer_checked(cpi_context, amount, decimals)?;
  msg!("Transfer successfully ✅");

  msg!("Updating bank and user data...");

  if bank.total_borrowed == 0 {
    bank.total_borrowed = amount;
    bank.total_borrowed_shares = amount;
  }

  let borrow_ratio = amount.checked_div(bank.total_borrowed).unwrap();
  let user_shares = bank.total_borrowed_shares.checked_mul(borrow_ratio).unwrap();

  match mint_pubkey {
    key if key == user.usdc.address => {
      user.usdc.borrow += amount;
      user.usdc.borrow_shares += user_shares;
    }
    _ => {
      user.sol.borrow += amount;
      user.sol.borrow_shares += user_shares;
    }
  }

  let current_timestamp = Clock::get()?.unix_timestamp;
  user.last_updated_borrow = current_timestamp;

  msg!("Bank and user data updated ✅");

  Ok(())
}

pub fn calculate_accrued_interest(
  deposited: u64,
  interest_rate: u64,
  last_updated: i64,
) -> Result<u64> {
  let current_time = Clock::get()?.unix_timestamp;
  let time_diff = current_time - last_updated;
  let new_value =
    (deposited as f64 * E.powf((interest_rate as f32 * time_diff as f32) as f64)) as u64;

  Ok(new_value)
}
