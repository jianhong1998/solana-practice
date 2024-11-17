use crate::GameOption;

#[derive(Debug)]
pub struct Player<'str> {
  pub option: GameOption,
  pub name: &'str str,
}
