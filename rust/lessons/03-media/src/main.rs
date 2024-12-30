mod content;
use content::{
  catelog::Catelog,
  media::{Media, MightHaveValue},
};

fn handle_get_by_index(catelog: &Catelog, index: usize) {
  let match_key: &str = "Use Match";
  let if_let_key: &str = "Use If Let";

  match catelog.get_by_index(index) {
    MightHaveValue::ThereIsValue(media) => {
      println!("{}: {}\n", match_key, media.description_2());
    }
    MightHaveValue::NoValueAvailable => {
      println!("{}: No value available\n", match_key);
    }
  }

  if let MightHaveValue::ThereIsValue(media) = catelog.get_by_index(index) {
    println!("{}: {}\n", if_let_key, media.description_2());
  } else {
    println!("{}: No value available\n", if_let_key);
  }
}

fn handle_get_by_index_2(catelog: &Catelog, index: usize) {
  match catelog.get_by_index_2(index) {
    Some(media) => {
      println!("{}", media.description_2());
    }
    None => {
      println!("No value available")
    }
  }
}

fn handle_option(option: &Option<&Media>) {
  println!("\nHandling Option");

  // This will throw panic error if option is returning None
  // Not recommended to use
  println!("{:#?}", option.unwrap().description_1());

  // This will throw panic error with the message for better debugging
  // Use when we want to throw error when there is no value
  println!("{:#?}", option.expect("Expected to have media").description_1());

  // This will return a default value if the option return None
  println!("{:#?}", option.unwrap_or(&Media::Placeholder).description_1());
}

fn main() {
  let audiobook = Media::Audiobook { title: String::from("Audio Book 1") };

  let good_movie =
    Media::Movie { title: String::from("Movie Title"), director: String::from("Director 1") };

  let bad_book =
    Media::Book { title: String::from("A Good Book"), author: String::from("Author 1") };

  // println!("{}", audiobook.description_1());
  // println!("{}", bad_book.description_1());
  // println!("{}", good_movie.description_1());

  // println!("");

  // println!("{}", audiobook.description_2());
  // println!("{}", bad_book.description_2());
  // println!("{}", good_movie.description_2());

  // println!("");

  let mut catelog = Catelog::new();

  catelog.add(audiobook);
  catelog.add(good_movie);
  catelog.add(bad_book);

  // catelog.print();

  handle_get_by_index(&catelog, 1);
  handle_get_by_index(&catelog, 100);

  handle_get_by_index_2(&catelog, 1);
  handle_get_by_index_2(&catelog, 100);

  handle_option(&catelog.get_by_index_2(40));
}
