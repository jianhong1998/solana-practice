pub mod game;
pub mod game_option;
pub mod player;

use game::Game;
use game_option::GameOption;
use player::Player;

fn main() {
  let player1: Player = Player { name: "Computer 1", option: GameOption::ROCK };
  let player2: Player = Player { name: "Computer 2", option: GameOption::PAPER };

  println!("Player 1: {:?}", player1);
  println!("Player 2: {:?}", player2);

  let game: Game<'_> = Game { player1, player2 };

  match game.determine_winner() {
    Err(e) => eprintln!("Error: {}", e),
    Ok(result) => match result {
      Some(winner) => println!("Winner is {}", winner.name),
      None => print!("Tie!"),
    },
  }
}
