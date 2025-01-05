use utils::vector::{find_last, find_longest, find_next};

mod utils;

fn main() {
  let languages = vec![
    String::from("Rust"),
    String::from("Go"),
    String::from("Typescript"),
    String::from("Python"),
  ];

  println!("{}", find_next(&languages, "Rust"));
  println!("{}", find_last(&languages));
  println!("{}", find_longest(&languages[0], &languages[2]));
}
