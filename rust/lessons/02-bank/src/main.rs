#[derive(Debug)]
struct Account {
  _id: u32,
  balance: i32,
  holder: String,
}

impl Account {
  fn new(id: u32, holder: String) -> Self {
    Account { _id: id, balance: 0, holder }
  }

  fn _print(account: &Account) {
    println!("{:#?}", account);
  }
}

#[derive(Debug)]
struct Bank {
  accounts: Vec<Account>,
}

impl Bank {
  fn new() -> Self {
    Bank { accounts: vec![] }
  }

  fn create_account(&mut self, id: u32, holder: String) -> &Account {
    let account = Account::new(id, holder);
    self.accounts.push(account);

    let total_account = &self.accounts.len();

    return &self.accounts[total_account - 1];
  }

  fn print(&self) {
    println!("{:#?}", self);
  }

  fn get_account_by_index<'info>(&mut self, index: usize) -> &mut Account {
    &mut self.accounts[index]
  }
}

fn main() {
  let mut bank = Bank::new();
  let name = String::from("Jian Ling");

  bank.create_account(1, String::from("Jian Hong"));
  bank.create_account(2, name.clone());
  bank.create_account(3, name.clone());

  let account = bank.get_account_by_index(1);
  account.holder = String::from("Jing Wei");
  account.balance += 10;

  bank.print();
}
