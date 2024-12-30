#[derive(Debug)]
pub enum Media {
  Book { title: String, author: String },
  Movie { title: String, director: String },
  Audiobook { title: String },
  Placeholder,
}

impl Media {
  pub fn description_1(&self) -> String {
    if let Media::Book { title, author } = self {
      format!("Book: {} (Writen by {})", title, author)
    } else if let Media::Audiobook { title } = self {
      format!("Audiobook: {}", title)
    } else if let Media::Movie { title, director } = self {
      format!("Movie: {} (Directed by {})", title, director)
    } else if let Media::Placeholder = self {
      String::from("Placeholder")
    } else {
      String::from("Media description")
    }
  }

  pub fn description_2(&self) -> String {
    match self {
      Media::Book { title, author } => {
        format!("Book: {} (Writen by {})", title, author)
      }
      Media::Audiobook { title } => {
        format!("Audiobook: {}", title)
      }
      Media::Movie { title, director } => {
        format!("Movie: {} (Directed by {})", title, director)
      }
      Media::Placeholder => {
        format!("Placeholder")
      }
    }
  }
}

pub enum MightHaveValue<'info> {
  ThereIsValue(&'info Media),
  NoValueAvailable,
}
