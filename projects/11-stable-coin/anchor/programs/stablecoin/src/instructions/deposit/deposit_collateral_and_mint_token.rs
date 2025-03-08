use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token_interface::{Mint, Token2022, TokenAccount},
};
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;

use crate::{
  constants::{COLLATERAL_ACCOUNT_SEED, CONFIG_SEED, SOL_ACCOUNT_SEED, SPACE_DISCRIMINATOR},
  instructions::check_health_factor,
  states::{Collateral, Config},
};

use super::{deposit_sol, mint_tokens};

#[derive(Accounts)]
pub struct DepositCollateralAndMintToken<'info> {
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token2022>,
  pub associated_token_program: Program<'info, AssociatedToken>,

  #[account(mut)]
  pub depositor: Signer<'info>,

  #[account(
    seeds = [
      CONFIG_SEED
    ],
    bump = config.bump,
    has_one = mint_account
  )]
  pub config: Box<Account<'info, Config>>, // Box is a smart pointer used for heap allocation. It will help manage this data structure.

  #[account(mut)]
  pub mint_account: InterfaceAccount<'info, Mint>,

  #[account(
    init_if_needed,
    payer = depositor,
    space = SPACE_DISCRIMINATOR + Collateral::INIT_SPACE,
    seeds = [
      COLLATERAL_ACCOUNT_SEED,
      depositor.key().as_ref(),
    ],
    bump
  )]
  pub collateral_account: Account<'info, Collateral>,

  #[account(
    mut,
    seeds = [
      SOL_ACCOUNT_SEED,
      depositor.key().as_ref()
    ],
    bump
  )]
  pub sol_account: SystemAccount<'info>,

  #[account(
    init_if_needed,
    payer = depositor,
    associated_token::mint = mint_account,
    associated_token::authority = depositor,
    associated_token::token_program = token_program
  )]
  pub associated_token_account: InterfaceAccount<'info, TokenAccount>,

  pub price_update_account: Account<'info, PriceUpdateV2>,
}

pub fn process_deposit_collateral_and_mint_token(
  context: Context<DepositCollateralAndMintToken>,
  amount_collateral: u64,
  amount_to_mint: u64,
) -> Result<()> {
  let collateral_account = &mut context.accounts.collateral_account;
  collateral_account.lamport_balance = context.accounts.sol_account.lamports() + amount_collateral;
  collateral_account.amount_minted += amount_to_mint;

  if !collateral_account.is_initialized {
    collateral_account.is_initialized = true;
    collateral_account.depositor = context.accounts.depositor.key();
    collateral_account.sol_account = context.accounts.sol_account.key();
    collateral_account.token_account = context.accounts.associated_token_account.key();
    collateral_account.bump = context.bumps.collateral_account;
    collateral_account.bump_sol_account = context.bumps.sol_account;
  }

  check_health_factor(
    &collateral_account,
    &context.accounts.config,
    &context.accounts.price_update_account,
  )?;

  deposit_sol(
    &context.accounts.depositor,
    &context.accounts.sol_account,
    amount_collateral,
    &context.accounts.system_program,
  )?;

  mint_tokens(
    &context.accounts.mint_account,
    &context.accounts.associated_token_account,
    amount_to_mint,
    &context.accounts.token_program,
    context.accounts.config.bump_mint_account,
  )?;

  Ok(())
}
