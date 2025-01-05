pub fn split_string(string_val: &str) -> Vec<String> {
  let spltted = string_val.split("\n");
  spltted.into_iter().map(|val: &str| String::from(val)).collect::<Vec<String>>()
}

pub fn extract_error_logs(log_string: &str) -> Vec<String> {
  let mut error_logs: Vec<String> = vec![];

  split_string(log_string)
    .iter()
    .filter(|log| log.to_lowercase().starts_with("error"))
    .for_each(|log| error_logs.push(String::from(log)));

  error_logs
}
