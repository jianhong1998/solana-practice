use crate::Account;

#[derive(Debug)]
pub struct Bank {
  accounts: Vec<Account>,
}

impl Bank {
  pub fn new() -> Self {
    Bank { accounts: vec![] }
  }

  pub fn create_account(&mut self, id: u32, holder: String) -> &Account {
    let account = Account::new(id, holder);
    self.accounts.push(account);

    let total_account = &self.accounts.len();

    return &self.accounts[total_account - 1];
  }

  pub fn print(&self) {
    println!("{:#?}", self);
  }

  pub fn get_account_by_index<'info>(&mut self, index: usize) -> &mut Account {
    &mut self.accounts[index]
  }

  pub fn total_balance(&self) -> i32 {
    self.accounts.iter().map(|account| account.balance).sum()
  }

  pub fn summary(&self) -> Vec<String> {
    self.accounts.iter().map(|account| account.summary()).collect::<Vec<String>>()
  }
}
