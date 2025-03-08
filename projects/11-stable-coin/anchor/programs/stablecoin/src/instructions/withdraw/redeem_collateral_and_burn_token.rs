use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, Token2022, TokenAccount};
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;

use crate::{
  constants::{COLLATERAL_ACCOUNT_SEED, CONFIG_SEED, MINT_SEED},
  instructions::check_health_factor,
  states::{Collateral, Config},
};

use super::{burn_token, withdraw_sol};

#[derive(Accounts)]
pub struct RedeemCollateralAndBurnToken<'info> {
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token2022>,

  #[account(mut)]
  pub depositor: Signer<'info>,

  pub price_update: Account<'info, PriceUpdateV2>,

  #[account(
    seeds = [CONFIG_SEED],
    bump = config.bump,
    has_one = mint_account
  )]
  pub config: Account<'info, Config>,

  #[account(
    mut,
    seeds = [MINT_SEED],
    bump = config.bump_mint_account,
  )]
  pub mint_account: InterfaceAccount<'info, Mint>,

  #[account(
    mut,
    seeds = [COLLATERAL_ACCOUNT_SEED, depositor.key().as_ref()],
    bump = collateral_acount.bump,
    has_one = sol_account,
    has_one = token_account
  )]
  pub collateral_acount: Account<'info, Collateral>,

  #[account(mut)]
  pub sol_account: SystemAccount<'info>,

  #[account(mut)]
  pub token_account: InterfaceAccount<'info, TokenAccount>,
}

pub fn process_redeem_collateral_and_burn_token(
  context: Context<RedeemCollateralAndBurnToken>,
  collateral_amount: u64,
  burn_amount: u64,
) -> Result<()> {
  let collateral_account = &mut context.accounts.collateral_acount;

  //                                                16 SOL                            5 SOL
  collateral_account.lamport_balance = context.accounts.sol_account.lamports() - collateral_amount; // 11 SOL
  collateral_account.amount_minted -= burn_amount; // 5 USDC

  check_health_factor(
    &collateral_account,
    &context.accounts.config,
    &context.accounts.price_update,
  )?;

  burn_token(
    &context.accounts.mint_account,
    &context.accounts.token_account,
    &context.accounts.token_program,
    &context.accounts.depositor,
    burn_amount,
  )?;

  withdraw_sol(
    &context.accounts.depositor.key(),
    &context.accounts.sol_account,
    &context.accounts.depositor.to_account_info(),
    collateral_amount,
    &context.accounts.system_program,
    context.accounts.collateral_acount.bump_sol_account,
  )?;

  Ok(())
}
