use crate::traits::vehicle::Vehicle;

pub fn test_vehicle<T: Vehicle>(vehicle: T) {
  vehicle.start();
  vehicle.stop();
}
