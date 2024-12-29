#[derive(Debug)]
pub struct Account {
  _id: u32,
  pub balance: i32,
  pub holder: String,
}

impl Account {
  pub fn new(id: u32, holder: String) -> Self {
    Account { _id: id, balance: 0, holder }
  }

  pub fn _print(account: &Account) {
    println!("{:#?}", account);
  }

  pub fn deposit(&mut self, amount: i32) -> i32 {
    self.balance += amount;
    self.balance
  }

  pub fn withdraw(&mut self, amount: i32) -> i32 {
    self.balance -= amount;
    self.balance
  }

  pub fn summary(&self) -> String {
    format!("{}. {} has {}", self._id, self.holder, self.balance)
  }
}
