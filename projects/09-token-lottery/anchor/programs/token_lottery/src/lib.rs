use anchor_lang::prelude::*;

pub mod constants;
pub mod instructions;
pub mod states;

use instructions::{
  init_config::init_config::{init_config, InitConfig, __client_accounts_init_config},
  lottery::{
    buy_ticket::{BuyTicket, __client_accounts_buy_ticket},
    claim_winnings::{ClaimWinnings, __client_accounts_claim_winnings},
    commit_randomness::{CommitRandomness, __client_accounts_commit_randomness},
    create_lottery::{init_lottery, InitLottery, __client_accounts_init_lottery},
    reveal_winner::{RevealWinner, __client_accounts_reveal_winner},
  },
};

declare_id!("6raAatS4bs7rLZbBegRAczMnR7RzRpb2SYr9BPJJCqdC");

#[program]
pub mod token_lottery {

  use super::*;

  pub fn initialize_config(
    context: Context<InitConfig>,
    start_time: u64,
    end_time: u64,
    price: u64,
  ) -> Result<()> {
    init_config(context, start_time, end_time, price)
  }

  pub fn initialize_lottery(context: Context<InitLottery>, _lottery_id: u64) -> Result<()> {
    init_lottery(context)
  }

  pub fn buy_ticket(context: Context<BuyTicket>) -> Result<()> {
    instructions::lottery::buy_ticket::buy_ticket(context)
  }

  pub fn commit_randomness(context: Context<CommitRandomness>) -> Result<()> {
    instructions::lottery::commit_randomness::commit_randomness(context)
  }

  pub fn reveal_winner(context: Context<RevealWinner>) -> Result<()> {
    instructions::lottery::reveal_winner::reveal_winner(context)
  }

  pub fn claim_winnings(context: Context<ClaimWinnings>) -> Result<()> {
    instructions::lottery::claim_winnings::claim_winnings(context)
  }
}
