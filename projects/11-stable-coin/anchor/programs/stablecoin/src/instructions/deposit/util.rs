use anchor_lang::{
  prelude::*,
  system_program::{transfer, Transfer},
};
use anchor_spl::{
  token_2022::{mint_to, MintTo, Token2022},
  token_interface::{Mint, TokenAccount},
};

use crate::constants::MINT_SEED;

pub fn mint_tokens<'info>(
  mint: &InterfaceAccount<'info, Mint>,
  to_token_account: &InterfaceAccount<'info, TokenAccount>,
  mint_amount: u64,
  token_program: &Program<'info, Token2022>,
  mint_bump: u8,
) -> Result<()> {
  let signer_seeds: &[&[&[u8]]] = &[&[MINT_SEED, &[mint_bump]]];
  let cpi_accounts = MintTo {
    authority: mint.to_account_info(),
    mint: mint.to_account_info(),
    to: to_token_account.to_account_info(),
  };
  let cpi_context =
    CpiContext::new_with_signer(token_program.to_account_info(), cpi_accounts, signer_seeds);

  msg!("Minting {} to token account ({})...", mint_amount, to_token_account.key());

  mint_to(cpi_context, mint_amount)?;

  msg!("Completed minting {} to token account ({}) ✅", mint_amount, to_token_account.key());

  Ok(())
}

pub fn deposit_sol<'info>(
  from: &Signer<'info>,
  to: &SystemAccount<'info>,
  lamport_amount: u64,
  system_program: &Program<'info, System>,
) -> Result<()> {
  let cpi_accounts = Transfer { from: from.to_account_info(), to: to.to_account_info() };
  let cpi_context = CpiContext::new(system_program.to_account_info(), cpi_accounts);

  msg!(
    "Transfering {} lamports from SOL account ({}) to SOL account ({})...",
    lamport_amount,
    from.key(),
    to.key()
  );

  transfer(cpi_context, lamport_amount)?;

  msg!(
    "Completed transfering {} lamports from SOL account ({}) to SOL account ({}) ✅",
    lamport_amount,
    from.key(),
    to.key()
  );

  Ok(())
}
