use anchor_lang::prelude::*;

// Will auto filled up by Anchor when deployed
declare_id!("x4YCBaw3sqJGA9bMwZZPxFyWDGKy7twFimBjT754RQ6");

// Minimum space Anchor account need
pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod favorites {
    use super::*;

    // Instruction Handler
    pub fn set_favorites(
        context: Context<SetFavorites>,
        number: u64,
        color: String,
        hobbies: Vec<String>,
    ) -> Result<()> {
        // FILL UP LATER
        msg!("Greeting from {}", context.program_id); // Write into Solana log file

        let user_public_key: Pubkey = context.accounts.user.key();

        msg!(
            "User {}'s favrites number is {}, favorites color is {} and their hobbies are {:?}",
            user_public_key,
            number,
            color,
            hobbies
        );

        context.accounts.favorites.set_inner(Favorites {
            number,
            color,
            hobbies,
        });

        Ok(())
    }

}

#[account] // Save this to account
#[derive(InitSpace)] // Let Anchor know how big Favorites is
pub struct Favorites {
    pub number: u64,

    #[max_len(50)]
    pub color: String,

    #[max_len(5, 50)]
    pub hobbies: Vec<String>,
}

// Instruction of fn set_favorites
#[derive(Accounts)] // Tell Anchor this is an account struct
pub struct SetFavorites<'info> {
    #[account(mut)] // Set the account to be mutable
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Favorites::INIT_SPACE,
        // b is bytes
        seeds = [b"favorites", user.key().as_ref()],
        bump
    )]
    pub favorites: Account<'info, Favorites>,

    pub system_program: Program<'info, System>,
}
