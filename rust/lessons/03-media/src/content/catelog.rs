use super::media::*;

#[derive(Debug)]
pub struct Catelog {
  pub items: Vec<Media>,
}

impl Catelog {
  pub fn new() -> Self {
    Catelog { items: vec![] }
  }

  pub fn add(&mut self, media: Media) {
    self.items.push(media);
  }

  pub fn _print(&self) {
    println!("{:#?}", self);
  }

  pub fn get_by_index(&self, index: usize) -> MightHaveValue {
    if self.items.len() <= index {
      return MightHaveValue::NoValueAvailable;
    }

    MightHaveValue::ThereIsValue(&self.items[index])
  }

  pub fn get_by_index_2(&self, index: usize) -> Option<&Media> {
    if self.items.len() <= index {
      return None;
    }

    Some(&self.items[index])
  }
}
