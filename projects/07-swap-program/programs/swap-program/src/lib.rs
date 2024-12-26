pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("HE1mqZFn3DAuNbj1YL3MfRqEWeZ8uUMWBgcAV6J9PzJb");

#[program]
pub mod swap_program {
  use super::*;

  pub fn make_offer(
    context: Context<MakeOffer>,
    id: u64,
    token_a_offered_amount: u64,
    token_b_wanted_amount: u64,
  ) -> Result<()> {
    instructions::make_offer::send_offered_token_to_vault(&context, token_a_offered_amount)?;
    instructions::save_offer(context, id, token_b_wanted_amount)
  }

  pub fn take_offer(context: Context<TakeOffer>) -> Result<()> {
    instructions::take_offer::send_wanted_token_to_maker(&context)?;
    instructions::take_offer::withdraw_and_close_vault(context)?;

    Ok(())
  }
}
