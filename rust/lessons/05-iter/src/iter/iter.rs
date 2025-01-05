pub fn print_elements(string_vec: &[String]) {
  string_vec.iter().map(|val| format!("{} {}", val, val)).for_each(|val| println!("{}", val));
}

pub fn shorten_strings(string_vec: &mut [String]) {
  string_vec.iter_mut().for_each(|val| val.truncate(1));
}

pub fn to_uppercase(string_vec: &[String]) -> Vec<String> {
  string_vec.iter().map(|val| val.to_uppercase()).collect::<Vec<String>>()
}

pub fn move_elements(from: Vec<String>, to: &mut Vec<String>) {
  from.into_iter().for_each(|val| to.push(val));
}

pub fn explode_elemnts(string_vec: &[String]) -> Vec<Vec<String>> {
  string_vec
    .iter()
    .map(|val| val.chars())
    .map(|chars| chars.map(|char| char.to_string()).collect::<Vec<String>>())
    .collect::<Vec<Vec<String>>>()
}

pub fn find_element_or<'info>(
  strings: &'info [String],
  find_string: &str,
  fallback: &str,
) -> String {
  let lowered_find_string = find_string.to_lowercase();

  strings
    .iter()
    .find(|val| val.to_lowercase().contains(&lowered_find_string))
    .map_or(String::from(fallback), |val| val.to_string())
}
