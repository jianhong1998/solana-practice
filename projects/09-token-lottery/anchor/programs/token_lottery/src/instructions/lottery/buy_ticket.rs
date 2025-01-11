use crate::{
  constants::{error_code::ErrorCode, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_URI},
  states::token_lottery::*,
};
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::{
  associated_token::AssociatedToken,
  metadata::{
    create_master_edition_v3, create_metadata_accounts_v3, mpl_token_metadata::types::DataV2,
    set_and_verify_sized_collection_item, CreateMasterEditionV3, CreateMetadataAccountsV3,
    Metadata, SetAndVerifySizedCollectionItem,
  },
  token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface},
};

#[derive(Accounts)]
pub struct BuyTicket<'info> {
  pub system_program: Program<'info, System>,
  pub token_program: Interface<'info, TokenInterface>,
  pub token_metadata_program: Program<'info, Metadata>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub rent: Sysvar<'info, Rent>,

  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
    mut,
    seeds = [
      b"token_lottery".as_ref()
    ],
    bump,
  )]
  pub token_lottery: Account<'info, TokenLottery>,

  #[account(
    init,
    payer = payer,
    seeds = [
      token_lottery.total_tickets.to_le_bytes().as_ref()
    ],
    bump,
    mint::decimals = 0,
    mint::authority = collection_mint,
    mint::freeze_authority = collection_mint,
    mint::token_program = token_program
  )]
  pub ticket_mint: InterfaceAccount<'info, Mint>,

  #[account(
    mut,
    seeds = [
      b"metadata",
      token_metadata_program.key().as_ref(),
      ticket_mint.key().as_ref()
    ],
    bump,
    seeds::program = token_metadata_program.key(),
  )]
  /// CHECK: This account is checked by metadata smart contract
  pub ticket_metadata: UncheckedAccount<'info>,

  #[account(
    mut,
    seeds = [
      b"metadata",
      token_metadata_program.key().as_ref(),
      ticket_mint.key().as_ref(),
      b"edition"
    ],
    bump,
    seeds::program = token_metadata_program.key()
  )]
  /// CHECK: This account is checked by metadata smart contract
  pub ticket_master_edition: UncheckedAccount<'info>,

  #[account(
    init,
    payer = payer,
    associated_token::mint = ticket_mint,
    associated_token::authority = payer,
    associated_token::token_program = token_program
  )]
  pub destination: InterfaceAccount<'info, TokenAccount>,

  #[account(
    mut,
    seeds = [b"collection_mint".as_ref()],
    bump,
  )]
  pub collection_mint: InterfaceAccount<'info, Mint>,

  #[account(
    mut,
    seeds = [
      b"metadata",
      token_metadata_program.key.as_ref(),
      collection_mint.key().as_ref()
    ],
    bump,
    seeds::program = token_metadata_program.key()
    )]
  /* This CHECK comment must appear to let Anchor know that we have handled this UncheckedAccount */
  /// CHECK: This account is checked by metadata smart contract
  pub collection_metadata: UncheckedAccount<'info>,

  #[account(
    mut,
  seeds = [
    b"metadata",
    token_metadata_program.key.as_ref(),
    collection_mint.key().as_ref(),
    b"master_edition"
  ],
  bump,
  seeds::program = token_metadata_program.key()
  )]
  /* This CHECK comment must appear to let Anchor know that we have handled this UncheckedAccount */
  /// CHECK: This account is checked by metadata smart contract
  pub collection_master_edition: UncheckedAccount<'info>,
}

pub fn buy_ticket(context: Context<BuyTicket>) -> Result<()> {
  let clock = Clock::get()?;

  let ticket_name =
    TOKEN_NAME.to_owned() + context.accounts.token_lottery.total_tickets.to_string().as_str();

  if clock.slot < context.accounts.token_lottery.start_time
    || clock.slot > context.accounts.token_lottery.end_time
  {
    return Err(ErrorCode::LotteryNotOpen.into());
  }

  msg!(
    "Transfering {} lamports from {} to {}...",
    context.accounts.token_lottery.ticket_price,
    context.accounts.payer.key(),
    context.accounts.token_lottery.key(),
  );
  transfer(
    CpiContext::new(
      context.accounts.system_program.to_account_info(),
      Transfer {
        to: context.accounts.token_lottery.to_account_info(),
        from: context.accounts.payer.to_account_info(),
      },
    ),
    context.accounts.token_lottery.ticket_price,
  )?;
  msg!("SOL transferred ✅");

  let signer_seeds: &[&[&[u8]]] =
    &[&[b"collection_mint".as_ref(), &[context.bumps.collection_mint]]];

  msg!("Minting ticket token to {}...", context.accounts.destination.key());
  mint_to(
    CpiContext::new_with_signer(
      context.accounts.token_program.to_account_info(),
      MintTo {
        authority: context.accounts.collection_mint.to_account_info(),
        mint: context.accounts.collection_mint.to_account_info(),
        to: context.accounts.destination.to_account_info(),
      },
      &signer_seeds,
    ),
    1,
  )?;
  msg!("Ticket token minted ✅");

  msg!("Creating metadata account...");
  create_metadata_accounts_v3(
    CpiContext::new_with_signer(
      context.accounts.token_metadata_program.to_account_info(),
      CreateMetadataAccountsV3 {
        metadata: context.accounts.ticket_metadata.to_account_info(),
        mint: context.accounts.ticket_mint.to_account_info(),
        mint_authority: context.accounts.collection_mint.to_account_info(),
        payer: context.accounts.payer.to_account_info(),
        rent: context.accounts.rent.to_account_info(),
        system_program: context.accounts.system_program.to_account_info(),
        update_authority: context.accounts.collection_mint.to_account_info(),
      },
      &signer_seeds,
    ),
    DataV2 {
      name: ticket_name,
      symbol: TOKEN_SYMBOL.to_string(),
      uri: TOKEN_URI.to_string(),
      seller_fee_basis_points: 0,
      creators: None,
      collection: None,
      uses: None,
    },
    true,
    true,
    None,
  )?;
  msg!("Metadata account created! ✅");

  msg!("Creating master edition account...");
  create_master_edition_v3(
    CpiContext::new_with_signer(
      context.accounts.token_metadata_program.to_account_info(),
      CreateMasterEditionV3 {
        payer: context.accounts.payer.to_account_info(),
        mint: context.accounts.ticket_mint.to_account_info(),
        mint_authority: context.accounts.collection_mint.to_account_info(),
        update_authority: context.accounts.collection_mint.to_account_info(),
        edition: context.accounts.ticket_master_edition.to_account_info(),
        metadata: context.accounts.ticket_metadata.to_account_info(),
        system_program: context.accounts.system_program.to_account_info(),
        token_program: context.accounts.token_program.to_account_info(),
        rent: context.accounts.rent.to_account_info(),
      },
      &signer_seeds,
    ),
    Some(0),
  )?;
  msg!("Master edition account created! ✅");

  msg!("Verifying ticket...");
  set_and_verify_sized_collection_item(
    CpiContext::new_with_signer(
      context.accounts.token_metadata_program.to_account_info(),
      SetAndVerifySizedCollectionItem {
        payer: context.accounts.payer.to_account_info(),
        metadata: context.accounts.ticket_metadata.to_account_info(),
        collection_mint: context.accounts.collection_mint.to_account_info(),
        collection_authority: context.accounts.collection_mint.to_account_info(),
        update_authority: context.accounts.collection_mint.to_account_info(),
        collection_metadata: context.accounts.collection_metadata.to_account_info(),
        collection_master_edition: context.accounts.collection_master_edition.to_account_info(),
      },
      signer_seeds,
    ),
    None,
  )?;
  msg!("Ticket verified! ✅");

  context.accounts.token_lottery.total_tickets += 1;

  Ok(())
}
