use anchor_lang::prelude::*;

use crate::{constants::ANCHOR_INIT_SPACE, state::User};

#[derive(Accounts)]
pub struct InitUser<'info> {
  pub system_program: Program<'info, System>,

  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
    init,
    payer = signer,
    space = ANCHOR_INIT_SPACE + User::INIT_SPACE,
    seeds = [
      signer.key().as_ref()
    ],
    bump,
  )]
  pub user: Account<'info, User>,
}

pub fn process_init_user(context: Context<InitUser>, usdc_address: Pubkey) -> Result<()> {
  let user_account = &mut context.accounts.user;

  user_account.usdc.address = usdc_address;
  user_account.owner = context.accounts.signer.key();

  Ok(())
}
