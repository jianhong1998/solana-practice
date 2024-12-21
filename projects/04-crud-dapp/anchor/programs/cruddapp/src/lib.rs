#![allow(clippy::result_large_err)]

use core::str;

use anchor_lang::prelude::*;

declare_id!("Da93sUeitPGg2w9b7G44LSRHDDwVuo2MaCxSuabvXGnc");

#[program]
pub mod cruddapp {
  use super::*;

  pub fn create_journal_entry(
    context: Context<CreateEntry>,
    title: String,
    message: String,
  ) -> Result<()> {
    let journal_entry = &mut context.accounts.journal_entry;
    journal_entry.owner = *context.accounts.owner.key;
    journal_entry.title = title;
    journal_entry.message = message;

    Ok(())
  }

  pub fn update_journal_entry(
    context: Context<UpdateEntry>,
    _title: String,
    message: String,
  ) -> Result<()> {
    let journal_entry: &mut Account<'_, JournalEntryState> = &mut context.accounts.journal_entry;
    journal_entry.message = message;

    Ok(())
  }

  pub fn delete_journal_entry(_context: Context<DeleteEntry>, _title: String) -> Result<()> {
    Ok(())
  }
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
  pub owner: Pubkey,

  #[max_len(50)]
  pub title: String,

  #[max_len(1000)]
  pub message: String,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateEntry<'create_entry_info> {
  pub system_program: Program<'create_entry_info, System>,

  #[account(mut)]
  pub owner: Signer<'create_entry_info>,

  #[account(
    init,
    payer = owner,
    space = 8 + JournalEntryState::INIT_SPACE,
    seeds = [owner.key().as_ref(), title.as_bytes()],
    bump
  )]
  pub journal_entry: Account<'create_entry_info, JournalEntryState>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateEntry<'update_entry_info> {
  pub system_program: Program<'update_entry_info, System>,

  #[account(mut)]
  pub owner: Signer<'update_entry_info>,

  #[account(
    mut,
    seeds = [owner.key().as_ref(), title.as_bytes()],
    bump,
    realloc = 8 + JournalEntryState::INIT_SPACE,
    realloc::payer = owner,
    realloc::zero = true
  )]
  pub journal_entry: Account<'update_entry_info, JournalEntryState>,
}

#[derive(Accounts)]
#[instruction(title:String)]
pub struct DeleteEntry<'delete_entry_info> {
  pub system_program: Program<'delete_entry_info, System>,

  #[account(mut)]
  pub owner: Signer<'delete_entry_info>,

  #[account(
    mut,
    seeds = [owner.key().as_ref(), title.as_bytes()],
    bump,
    close = owner,
  )]
  pub journal_entry: Account<'delete_entry_info, JournalEntryState>,
}
