use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, Token2022, TokenAccount};
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;

use crate::{
  constants::{CustomError, CONFIG_SEED},
  instructions::{burn_token, calculate_health_factor, get_lamports_from_usd, withdraw_sol},
  states::{Collateral, Config},
};

#[derive(Accounts)]
pub struct Liquidate<'info> {
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token2022>,

  #[account(mut)]
  pub liquidator: Signer<'info>,

  pub price_update: Account<'info, PriceUpdateV2>,

  #[account(
    seeds = [CONFIG_SEED],
    bump = config_account.bump,
    has_one = mint_account
  )]
  pub config_account: Account<'info, Config>,

  #[account(mut)]
  pub mint_account: InterfaceAccount<'info, Mint>,

  #[account(
    mut,
    has_one = sol_account
  )]
  pub collateral_account: Account<'info, Collateral>,

  #[account(mut)]
  pub sol_account: SystemAccount<'info>,

  #[account(
    mut,
    associated_token::mint = mint_account,
    associated_token::authority = liquidator,
    associated_token::token_program = token_program,
  )]
  pub token_account: InterfaceAccount<'info, TokenAccount>,
}

pub fn process_liquidate(context: Context<Liquidate>, amount_to_burn: u64) -> Result<()> {
  let health_factor = calculate_health_factor(
    &context.accounts.collateral_account,
    &context.accounts.config_account,
    &context.accounts.price_update,
  )?;

  require!(
    health_factor < context.accounts.config_account.min_health_factor,
    CustomError::AboveMinHealthFactor
  );

  let lamports = get_lamports_from_usd(&amount_to_burn, &context.accounts.price_update)?;
  let liquidation_bonus = lamports * &context.accounts.config_account.liquidation_bonus / 100;
  let amount_to_liquidate = lamports + liquidation_bonus;

  withdraw_sol(
    &context.accounts.collateral_account.depositor.key(),
    &context.accounts.sol_account,
    &context.accounts.liquidator,
    amount_to_liquidate,
    &context.accounts.system_program,
    context.accounts.collateral_account.bump_sol_account,
  )?;

  burn_token(
    &context.accounts.mint_account,
    &context.accounts.token_account,
    &context.accounts.token_program,
    &context.accounts.liquidator,
    amount_to_burn,
  )?;

  let collateral_acount = &mut context.accounts.collateral_account;

  collateral_acount.lamport_balance = context.accounts.sol_account.lamports();
  collateral_acount.amount_minted -= amount_to_burn;

  let new_health_factor = calculate_health_factor(
    &context.accounts.collateral_account,
    &context.accounts.config_account,
    &context.accounts.price_update,
  )?;

  msg!("New health factor: {}", new_health_factor);

  Ok(())
}
