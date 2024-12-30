mod models;
mod traits;
mod utils;

use models::{
  car::Car,
  container::{bucket::Bucket, stack::Stack},
};
use traits::container::Container;
use utils::{number::*, number_v2::*, vehicle::*};

fn put_string_to_container<T: Container<String>>(container: &mut T, val: &str) {
  container.put(val.to_string());
}

fn test_container() {
  let mut bucket1 = Bucket::new(String::from("Hi"));
  let mut bucket2 = Bucket::new(2);
  let bucket3 = Bucket::new(false);

  let mut stack1 = Stack::new(vec![String::from("hi")]);
  let stack2 = Stack::new(vec![1, 2, 3]);

  let sample_string = String::from("sample");

  put_string_to_container(&mut bucket1, sample_string.as_str());
  put_string_to_container(&mut stack1, sample_string.as_str());
  /* This will throw panic as bucket2 is not fulfilling Container<String> */
  // put_string_to_container(&mut bucket2, sample_string.as_str());

  println!("{:#?}", bucket1.get());
  println!("{:#?}", stack1.get());

  bucket2.get();
  println!("Stack 2 is Empty{}", bucket2.is_empty());

  println!("Bucket 3 is Empty: {}", bucket3.is_empty());
  println!("Stack 2 is Empty: {}", stack2.is_empty());
}

fn main() {
  let a: f32 = 3.0;
  let b: f32 = 4.0;

  let a_f64 = convert_f32_to_f64(a);
  let b_f64 = convert_f32_to_f64(b);

  let a_int: u64 = 3;
  let b_int: u64 = 4;

  println!("Original: {}", solve(a_f64, b_f64));
  println!("Version 1: {}", solve_v1::<f32>(a, b));
  println!("Version 2: {}", solve_v2(a, b_f64));

  println!("Version 3: {}", solve_v3(a_int, b));
  println!("Version 3: {}", solve_v3(a, b_f64));
  println!("Version 3: {}", solve_v3(a_int, b_int));

  test_vehicle(Car::new("SB123X"));

  test_container();
}
