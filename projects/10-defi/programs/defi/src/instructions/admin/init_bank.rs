use crate::{constants::ANCHOR_INIT_SPACE, state::bank::Bank};

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[derive(Accounts)]
pub struct InitBank<'info> {
  pub system_program: Program<'info, System>,
  pub token_program: Interface<'info, TokenInterface>,

  #[account(mut)]
  pub signer: Signer<'info>,

  pub mint: InterfaceAccount<'info, Mint>,

  #[account(
    init,
    payer = signer,
    space = ANCHOR_INIT_SPACE + Bank::INIT_SPACE,
    seeds = [
      mint.key().as_ref()
    ],
    bump
  )]
  pub bank: Account<'info, Bank>,

  #[account(
    init,
    payer = signer,
    seeds = [
      b"treasury",
      mint.key().as_ref()
    ],
    bump,
    token::mint = mint,
    token::authority = bank_token_account
  )]
  pub bank_token_account: InterfaceAccount<'info, TokenAccount>,
}

pub fn process_init_bank(
  context: Context<InitBank>,
  liquidation_thredshold: u64,
  max_ltv: u64,
) -> Result<()> {
  let bank = &mut context.accounts.bank;

  bank.authority = context.accounts.signer.key();
  bank.mint_address = context.accounts.mint.key();
  bank.liquidation_thredshold = liquidation_thredshold;
  bank.max_ltv = max_ltv;
  bank.interest_rate = 5;

  Ok(())
}
