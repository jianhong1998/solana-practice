use crate::{constants::ANCHOR_DISCRIMINATOR, states::VestingAccount};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[derive(Accounts)]
#[instruction(company_name: String)]
pub struct CreateVestingAccount<'info> {
  pub system_program: Program<'info, System>,
  pub token_program: Interface<'info, TokenInterface>,

  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
    init,
    space = ANCHOR_DISCRIMINATOR + VestingAccount::INIT_SPACE,
    payer = signer,
    seeds = [company_name.as_ref()],
    bump
  )]
  pub vesting_account: Account<'info, VestingAccount>,

  pub mint: InterfaceAccount<'info, Mint>,

  #[account(
    init,
    token::mint = mint,
    token::authority = treasury_token_account,
    payer = signer,
    seeds = [b"vesting_treasury", company_name.as_bytes()],
    bump,
  )]
  pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,
}

pub fn create_vesting(context: Context<CreateVestingAccount>, company_name: String) -> Result<()> {
  *context.accounts.vesting_account = VestingAccount {
    owner: context.accounts.signer.key(),
    mint: context.accounts.mint.key(),
    treasury_token_account: context.accounts.treasury_token_account.key(),
    company_name,
    tresury_bump: context.bumps.treasury_token_account,
    bump: context.bumps.vesting_account,
  };

  Ok(())
}
