use crate::constants::{TOKEN_NAME, TOKEN_SYMBOL, TOKEN_URI};
use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  metadata::{
    create_master_edition_v3, create_metadata_accounts_v3,
    mpl_token_metadata::types::{CollectionDetails, Creator, DataV2},
    sign_metadata, CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata, SignMetadata,
  },
  token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface},
};

#[derive(Accounts)]
#[instruction(lottery_id: u64)]
pub struct InitLottery<'info> {
  pub system_program: Program<'info, System>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_metadata_program: Program<'info, Metadata>,
  pub token_program: Interface<'info, TokenInterface>,
  pub rent: Sysvar<'info, Rent>,

  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
    init,
    payer = payer,
    seeds = [
      b"collection_mint",
      payer.key().as_ref(),
      lottery_id.to_le_bytes().as_ref(),
    ],
    bump,
    mint::decimals = 0,
    mint::authority = collection_mint,
    mint::freeze_authority = collection_mint
  )]
  pub collection_mint: InterfaceAccount<'info, Mint>,

  #[account(
    init,
    payer = payer,
    seeds = [
      b"collection_associated_token_account",
      payer.key().as_ref(),
      lottery_id.to_le_bytes().as_ref()
    ],
    bump,
    token::mint = collection_mint,
    token::authority = collection_token_account,
  )]
  pub collection_token_account: InterfaceAccount<'info, TokenAccount>,

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
  pub metadata: UncheckedAccount<'info>,

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
  pub master_edition: UncheckedAccount<'info>,
}

pub fn init_lottery(context: Context<InitLottery>) -> Result<()> {
  let signer_seeds: &[&[&[u8]]] = &[&[b"collection_mint", &[context.bumps.collection_mint]]];

  /* Step 1 - Create Mint Account */
  msg!("🔄 Creating Mint account");

  mint_to(
    CpiContext::new_with_signer(
      context.accounts.token_program.to_account_info(),
      MintTo {
        mint: context.accounts.collection_mint.to_account_info(),
        to: context.accounts.collection_token_account.to_account_info(),
        authority: context.accounts.collection_mint.to_account_info(),
      },
      &signer_seeds,
    ),
    1,
  )?;

  msg!("Mint account created ✅");

  /* Step 2 - Create Metadata account */
  msg!("🔄 Creating Metadata account");

  create_metadata_accounts_v3(
    CpiContext::new_with_signer(
      context.accounts.token_metadata_program.to_account_info(),
      CreateMetadataAccountsV3 {
        metadata: context.accounts.metadata.to_account_info(),
        mint: context.accounts.collection_mint.to_account_info(),
        mint_authority: context.accounts.collection_mint.to_account_info(),
        update_authority: context.accounts.collection_mint.to_account_info(),
        payer: context.accounts.payer.to_account_info(),
        system_program: context.accounts.system_program.to_account_info(),
        rent: context.accounts.rent.to_account_info(),
      },
      &signer_seeds,
    ),
    DataV2 {
      name: TOKEN_NAME.to_string(),
      symbol: TOKEN_SYMBOL.to_string(),
      uri: TOKEN_URI.to_string(),
      seller_fee_basis_points: 0,
      creators: Some(vec![Creator {
        address: context.accounts.collection_mint.key(),
        verified: false,
        share: 100,
      }]),
      collection: None,
      uses: None,
    },
    true,
    true,
    Some(CollectionDetails::V1 { size: 0 }),
  )?;

  msg!("Metadata account created ✅");

  /* Step 3 - Create Master Edition account */
  msg!("🔄 Creating Master Edition account");
  create_master_edition_v3(
    CpiContext::new_with_signer(
      context.accounts.token_metadata_program.to_account_info(),
      CreateMasterEditionV3 {
        payer: context.accounts.payer.to_account_info(),
        mint: context.accounts.collection_mint.to_account_info(),
        mint_authority: context.accounts.collection_mint.to_account_info(),
        update_authority: context.accounts.collection_mint.to_account_info(),
        edition: context.accounts.master_edition.to_account_info(),
        metadata: context.accounts.metadata.to_account_info(),
        token_program: context.accounts.token_program.to_account_info(),
        system_program: context.accounts.system_program.to_account_info(),
        rent: context.accounts.rent.to_account_info(),
      },
      &signer_seeds,
    ),
    Some(0),
  )?;

  msg!("Master Edition account created ✅");

  /* Step 4 - Verify Collection */
  msg!("🔄 Verifing collection");

  sign_metadata(CpiContext::new_with_signer(
    context.accounts.token_metadata_program.to_account_info(),
    SignMetadata {
      creator: context.accounts.collection_mint.to_account_info(),
      metadata: context.accounts.metadata.to_account_info(),
    },
    signer_seeds,
  ))?;

  msg!("Collection verified ✅");

  Ok(())
}