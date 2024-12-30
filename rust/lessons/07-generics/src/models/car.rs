use crate::traits::vehicle::Vehicle;

pub struct Car {
  pub car_plate_number: String,
}

impl Vehicle for Car {
  fn start(&self) {
    println!("{} started", self.car_plate_number);
  }
}

impl Car {
  pub fn new(car_plate_number: &str) -> Self {
    Car { car_plate_number: car_plate_number.to_string() }
  }
}
