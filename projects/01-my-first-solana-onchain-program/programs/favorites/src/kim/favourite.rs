
use anchor_lang::prelude::*; 

/* 
The Anchor Discriminator is something that's written to every account on the blockchain,  
by an Anchor program that just specifies the type of account it is. 
8 bytes 
*/ 
pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8; 

  
pub fn process_set_favourites(context: Context<SetFavourites>, number: u64, color: String, hobbies: Vec<String>,) -> Result<()> { 
      
  msg!("Greetings from {}", context.program_id); 
  
  let user_public_key =  context.accounts.user.key(); 
  
  msg!("User {}'s favourite stuff are num: {}, color: {}, hobbies: {:?}", user_public_key, number, color, hobbies); 
  
  context.accounts.favourites.set_inner(Favourites { 
    number, 
    color, 
    hobbies, 
  }); 

  Ok(()) 
}

//account macro and define space 
#[account] 
#[derive(InitSpace)] 
pub struct Favourites { 
    pub number: u64, 
    #[max_len(50)] 
    pub color: String, 
    #[max_len(5, 50)] 
    pub hobbies: Vec<String>, 
} 
 
#[derive(Accounts)] 
pub struct SetFavourites<'info> { 
    #[account(mut)] 
    pub user: Signer<'info>, 
 
    #[account( 
        init_if_needed,  
        payer = user,  
        space = ANCHOR_DISCRIMINATOR_SIZE + Favourites::INIT_SPACE, 
        seeds = [b"favourites", user.key().as_ref()], 
        bump, 
        )] 
    pub favourites: Account<'info, Favourites>, 
 
    pub system_program: Program<'info, System>, 
}