use anchor_lang::{
  prelude::*,
  system_program::{transfer, Transfer},
};
use anchor_spl::{
  token_2022::{burn, Burn},
  token_interface::{Mint, Token2022, TokenAccount},
};

use crate::constants::SOL_ACCOUNT_SEED;

pub fn withdraw_sol<'info>(
  depositor_key: &Pubkey,
  from_account: &SystemAccount<'info>,
  to_account: &AccountInfo<'info>,
  lamport_amount: u64,
  system_program: &Program<'info, System>,
  sol_account_bump: u8,
) -> Result<()> {
  let signer_seeds: &[&[&[u8]]] =
    &[&[SOL_ACCOUNT_SEED, depositor_key.as_ref(), &[sol_account_bump]]];

  let cpi_accounts =
    Transfer { from: from_account.to_account_info(), to: to_account.to_account_info() };
  let cpi_program = system_program.to_account_info();

  let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

  msg!(
    "Withdrawing {} lamports from SOL account ({}) to SOL account ({})...",
    lamport_amount,
    from_account.key(),
    to_account.key()
  );

  transfer(cpi_context, lamport_amount)?;

  msg!(
    "Completed withdrawing {} lamports from SOL account ({}) to SOL account ({}) ✅",
    lamport_amount,
    from_account.key(),
    to_account.key()
  );

  Ok(())
}

pub fn burn_token<'info>(
  mint: &InterfaceAccount<'info, Mint>,
  from_token_account: &InterfaceAccount<'info, TokenAccount>,
  token_program: &Program<'info, Token2022>,
  authority: &Signer<'info>,
  amount: u64,
) -> Result<()> {
  let cpi_accounts = Burn {
    from: from_token_account.to_account_info(),
    mint: mint.to_account_info(),
    authority: authority.to_account_info(),
  };

  let cpi_context = CpiContext::new(token_program.to_account_info(), cpi_accounts);

  burn(cpi_context, amount)?;

  Ok(())
}
