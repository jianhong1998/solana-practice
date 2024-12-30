pub fn find_next<'a>(string_vec: &'a [String], search: &str) -> &'a str {
  let mut is_found = false;

  for value in string_vec {
    if is_found {
      return value;
    }

    if value == search {
      is_found = true;
    }
  }

  string_vec.last().unwrap()
}

pub fn find_last(string_vec: &[String]) -> &str {
  string_vec.last().unwrap()
}

pub fn find_longest<'a>(string_1: &'a str, string_2: &'a str) -> &'a str {
  if string_1.len() >= string_2.len() {
    return string_1;
  }

  string_2
}
