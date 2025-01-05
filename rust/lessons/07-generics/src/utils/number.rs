use num_traits::{Float, ToPrimitive};

pub fn solve(a: f64, b: f64) -> f64 {
  (a.powi(2) + b.powi(2)).sqrt()
}

pub fn solve_v1<T: Float>(a: T, b: T) -> f64 {
  let a_f64 = a.to_f64().unwrap();
  let b_f64 = b.to_f64().unwrap();

  (a_f64.powi(2) + b_f64.powi(2)).sqrt()
}

pub fn solve_v2<T: Float, U: Float>(a: T, b: U) -> f64 {
  let a_f64 = a.to_f64().unwrap();
  let b_f64 = b.to_f64().unwrap();

  (a_f64.powi(2) + b_f64.powi(2)).sqrt()
}

pub fn convert_f32_to_f64(num: f32) -> f64 {
  /* Approach 1: native way */
  // return  num as f64;

  /* Approach 2: use num_traits::ToPrimitive */
  /* This approach need to install num_traits */
  return num.to_f64().unwrap();
}
