use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};

use crate::{
  calculate_accrued_interest, error::ErrorCode, Bank, User, PRICE_FEED_MAX_AGE, SOL_USD_FEED_ID,
  USDC_USD_FEED_ID,
};

#[derive(Accounts)]
pub struct Liquidate<'info> {
  pub system_program: Program<'info, System>,
  pub token_program: Interface<'info, TokenInterface>,
  pub associated_token_program: Program<'info, AssociatedToken>,

  #[account(mut)]
  pub liquidator: Signer<'info>,

  pub price_update_account: Account<'info, PriceUpdateV2>,

  pub collateral_mint: InterfaceAccount<'info, Mint>,

  pub borrower_mint: InterfaceAccount<'info, Mint>,

  #[account(
    mut,
    seeds = [
      collateral_mint.key().as_ref()
    ],
    bump
  )]
  pub collateral_bank: Account<'info, Bank>,

  #[account(
    mut,
    seeds = [
      borrower_mint.key().as_ref()
    ],
    bump
  )]
  pub borrower_bank: Account<'info, Bank>,

  #[account(
    mut,
    seeds = [
      b"treasury",
      collateral_mint.key().as_ref()
    ],
    bump
  )]
  pub collateral_bank_token_account: InterfaceAccount<'info, TokenAccount>,

  #[account(
    mut,
    seeds = [
      b"treasury",
      borrower_bank_token_account.key().as_ref()
    ],
    bump
  )]
  pub borrower_bank_token_account: InterfaceAccount<'info, TokenAccount>,

  #[account(
    mut,
    seeds = [
      liquidator.key().as_ref()
    ],
    bump
  )]
  pub user: Account<'info, User>,

  #[account(
    init_if_needed,
    payer = liquidator,
    associated_token::mint = collateral_mint,
    associated_token::authority = liquidator,
    associated_token::token_program = token_program,
  )]
  pub liquidator_collateral_token_account: InterfaceAccount<'info, TokenAccount>,

  #[account(
    init_if_needed,
    payer = liquidator,
    associated_token::mint = borrower_mint,
    associated_token::authority = liquidator,
    associated_token::token_program = token_program
  )]
  pub liquidator_borrowed_token_account: InterfaceAccount<'info, TokenAccount>,
}

pub fn process_liquidate(context: Context<Liquidate>) -> Result<()> {
  let collateral_bank = &mut context.accounts.collateral_bank;
  let borrowed_bank = &mut context.accounts.borrower_bank;
  let user = &mut context.accounts.user;
  let price_update = &mut context.accounts.price_update_account;
  let collateral_mint_key = context.accounts.collateral_mint.to_account_info().key();

  msg!("Fetching SOL & USDC feed ID...");

  let sol_feed_id = get_feed_id_from_hex(SOL_USD_FEED_ID)?;
  let usdc_feed_id = get_feed_id_from_hex(USDC_USD_FEED_ID)?;

  msg!("Fetched SOL & USDC feed ID ✅");

  msg!("Calculating SOL & USDC price...");

  let sol_price =
    price_update.get_price_no_older_than(&Clock::get()?, PRICE_FEED_MAX_AGE, &sol_feed_id)?;
  let usdc_price =
    price_update.get_price_no_older_than(&Clock::get()?, PRICE_FEED_MAX_AGE, &usdc_feed_id)?;

  msg!("Complete Calculating of SOL & USDC price ✅");

  let total_collateral: u64;
  let total_borrowed: u64;

  msg!("Checking account health factor...");

  match collateral_mint_key {
    key if key == user.usdc.address => {
      let new_usdc = calculate_accrued_interest(
        user.usdc.deposit,
        collateral_bank.interest_rate,
        user.last_updated,
      )?;
      total_collateral = usdc_price.price as u64 * new_usdc;

      let new_sol = calculate_accrued_interest(
        user.sol.borrow,
        borrowed_bank.interest_rate,
        user.last_updated_borrow,
      )?;
      total_borrowed = sol_price.price as u64 * new_sol;
    }
    _ => {
      let new_sol = calculate_accrued_interest(
        user.sol.deposit,
        collateral_bank.interest_rate,
        user.last_updated,
      )?;

      let new_usdc = calculate_accrued_interest(
        user.usdc.borrow,
        borrowed_bank.interest_rate,
        user.last_updated_borrow,
      )?;

      total_collateral = sol_price.price as u64 * new_sol;
      total_borrowed = usdc_price.price as u64 * new_usdc;
    }
  }

  let health_factor = ((total_collateral as f64 * collateral_bank.liquidation_thredshold as f64)
    / total_borrowed as f64) as f64;

  if health_factor >= 1.0 {
    return Err(ErrorCode::NotUnderCollateralized.into());
  }

  msg!("Account is under collateralized ✅");

  msg!("Calculating liquidation & loquidator amount...");
  let liquidation_amount =
    total_borrowed.checked_mul(borrowed_bank.liquidation_close_factor).unwrap();
  let liquidator_amount =
    (liquidation_amount * collateral_bank.liquidation_bonus) + liquidation_amount;
  msg!("Completed calculating of liquidation & liquidator amount: {}", liquidation_amount);

  msg!("Transfering token to borrower bank account...");
  let transfer_bank_accounts = TransferChecked {
    from: context.accounts.liquidator_borrowed_token_account.to_account_info(),
    to: context.accounts.borrower_bank_token_account.to_account_info(),
    authority: context.accounts.liquidator.to_account_info(),
    mint: context.accounts.borrower_mint.to_account_info(),
  };
  let cpi_program = context.accounts.token_program.to_account_info();
  let decimals = context.accounts.borrower_mint.decimals;

  let transfer_bank_context = CpiContext::new(cpi_program.clone(), transfer_bank_accounts);

  transfer_checked(transfer_bank_context, liquidation_amount, decimals)?;
  msg!("Token transfered to borrower bank account ✅");

  msg!("Transfering token to liquidator account...");
  let transfer_to_liquidator_accounts = TransferChecked {
    from: context.accounts.collateral_bank_token_account.to_account_info(),
    to: context.accounts.liquidator_collateral_token_account.to_account_info(),
    authority: context.accounts.collateral_bank_token_account.to_account_info(),
    mint: context.accounts.collateral_mint.to_account_info(),
  };
  let signer_seeds: &[&[&[u8]]] =
    &[&[b"treasury", collateral_mint_key.as_ref(), &[context.bumps.collateral_bank_token_account]]];
  let transfer_to_liquidator_decimals = context.accounts.collateral_mint.decimals;
  let transfer_to_liquidator_context =
    CpiContext::new_with_signer(cpi_program, transfer_to_liquidator_accounts, signer_seeds);

  transfer_checked(
    transfer_to_liquidator_context,
    liquidator_amount,
    transfer_to_liquidator_decimals,
  )?;
  msg!("Token transfered to liquidator account ✅");

  Ok(())
}
