mod utils;

use std::io::Error;
use utils::{file::*, string::*};

fn _create_empty_result() -> Result<(), Error> {
  return Ok(());
}

fn _handle_empty_result() {
  match _create_empty_result() {
    Ok(..) => println!("Return Ok"),
    Err(error_message) => println!("{:#?}", error_message),
  }
}

const INPUT_FILE_PATH: &'static str = "assets/logs.txt";
const OUTPUT_FILE_PATH: &'static str = "temp/error_logs.txt";

/*
  Handle error by using Match
*/
// fn main() {
//   // _handle_empty_result();

//   let mut file_string: String = String::from("");

//   match read_file(INPUT_FILE_PATH) {
//     Ok(file_string_result) => file_string = file_string_result,
//     Err(error) => println!("Failed to read file: {}", error),
//   }

//   let error_logs = extract_error_logs(file_string.as_str());

//   match write_file(OUTPUT_FILE_PATH, &error_logs.join("\n")) {
//     Ok(()) => println!("Error logs are written into file"),
//     Err(error) => println!("Failed to write file: {}", error),
//   }
// }

/*
  Handle error by using try operator (?)
*/
fn main() -> Result<(), Error> {
  // let file_string = read_file(INPUT_FILE_PATH).expect("Failed to read file");
  let file_string = read_file(INPUT_FILE_PATH)?;
  let error_logs = extract_error_logs(file_string.as_str());
  // write_file(OUTPUT_FILE_PATH, error_logs.join("\n").as_str()).expect("Failed to write file");
  write_file(OUTPUT_FILE_PATH, error_logs.join("\n").as_str())?;

  println!("Error logs are written into file");

  Ok(())
}
