use crate::player::Player;
use crate::GameOption;
use std::collections::{HashMap, HashSet};

pub struct Game<'obj> {
  pub player1: Player<'obj>,
  pub player2: Player<'obj>,
}

impl<'obj> Game<'obj> {
  fn get_game_strategy_map() -> HashMap<GameOption, HashSet<GameOption>> {
    let mut map: HashMap<GameOption, HashSet<GameOption>> = HashMap::new();
    map.insert(GameOption::ROCK, vec![GameOption::SCISSORS].into_iter().collect());
    map.insert(GameOption::SCISSORS, vec![GameOption::PAPER].into_iter().collect());
    map.insert(GameOption::PAPER, vec![GameOption::ROCK].into_iter().collect());

    return map;
  }

  pub fn determine_winner(&self) -> Result<Option<&Player<'obj>>, &str> {
    if self.player1.option == self.player2.option {
      return Ok(None);
    }

    let game_strategy_map: HashMap<GameOption, HashSet<GameOption>> =
      Game::<'obj>::get_game_strategy_map();

    if let Some(options) = game_strategy_map.get(&self.player1.option) {
      if options.contains(&self.player2.option) {
        return Ok(Some(&self.player1));
      }
    } else {
      return Err("GameOption is not in the game stratagy map");
    }

    Ok(Some(&self.player2))
  }
}
