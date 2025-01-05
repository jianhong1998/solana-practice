use std::{
  fs::{read_to_string, write},
  io::Error,
};

pub fn read_file(file_path: &str) -> Result<String, Error> {
  read_to_string(file_path)
}

pub fn write_file(file_path: &str, data: &str) -> Result<(), Error> {
  write(file_path, data)
}
