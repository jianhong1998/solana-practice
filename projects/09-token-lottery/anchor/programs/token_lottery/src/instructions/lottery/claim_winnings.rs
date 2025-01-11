use crate::{
  constants::{error_code::ErrorCode, TOKEN_NAME},
  states::token_lottery::TokenLottery,
};
use anchor_lang::prelude::*;
use anchor_spl::{
  metadata::{Metadata, MetadataAccount},
  token_interface::{Mint, TokenAccount, TokenInterface},
};

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
  pub system_program: Program<'info, System>,
  pub token_program: Interface<'info, TokenInterface>,
  pub token_metadata_program: Program<'info, Metadata>,

  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
    mut,
    seeds = [b"token_lottery".as_ref()],
    bump = token_lottery.bump
  )]
  pub token_lottery: Account<'info, TokenLottery>,

  #[account(
    seeds = [token_lottery.winner.to_le_bytes().as_ref()],
    bump
  )]
  pub ticket_mint: InterfaceAccount<'info, Mint>,

  #[account(
    seeds = [b"collection_mint".as_ref()],
    bump
  )]
  pub collection_mint: InterfaceAccount<'info, Mint>,

  #[account(
    seeds = [
      b"metadata",
      token_metadata_program.key().as_ref(),
      ticket_mint.key().as_ref()
    ],
    bump,
    seeds::program = token_metadata_program.key()
  )]
  pub ticket_metadata: Account<'info, MetadataAccount>,

  #[account(
    associated_token::mint = ticket_mint,
    associated_token::authority = payer,
    associated_token::token_program = token_program,
  )]
  pub ticket_account: InterfaceAccount<'info, TokenAccount>,

  #[account(
    seeds = [
      b"metadata",
      token_metadata_program.key().as_ref(),
      collection_mint.key().as_ref()
    ],
    bump,
    seeds::program = token_metadata_program.key()
  )]
  pub collection_metadata: Account<'info, MetadataAccount>,
}

pub fn claim_winnings(context: Context<ClaimWinnings>) -> Result<()> {
  require!(context.accounts.token_lottery.is_winner_choosen, ErrorCode::WinnerNotChosen);

  require!(
    context.accounts.ticket_metadata.collection.as_ref().unwrap().verified,
    ErrorCode::NotVerified
  );

  require!(
    context.accounts.ticket_metadata.collection.as_ref().unwrap().key
      == context.accounts.collection_mint.key(),
    ErrorCode::IncorrectTicket
  );

  let ticket_name = TOKEN_NAME.to_owned() + &context.accounts.token_lottery.winner.to_string();
  let metadata_name = context.accounts.ticket_metadata.name.replace("\u{0}", "");
  require!(ticket_name == metadata_name, ErrorCode::IncorrectTicket);
  require!(context.accounts.ticket_account.amount > 0, ErrorCode::NoTicket);

  **context.accounts.token_lottery.to_account_info().lamports.borrow_mut() -=
    context.accounts.token_lottery.lottery_pot_amount;
  **context.accounts.payer.to_account_info().lamports.borrow_mut() +=
    context.accounts.token_lottery.lottery_pot_amount;
  context.accounts.token_lottery.lottery_pot_amount = 0;

  Ok(())
}
