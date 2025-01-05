pub trait Vehicle {
  fn start(&self);

  fn stop(&self) {
    println!("Stopped");
  }
}
