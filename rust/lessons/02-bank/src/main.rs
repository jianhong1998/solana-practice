pub mod models;

pub use models::*;

fn main() {
  let mut bank = Bank::new();
  let name = String::from("Jian Ling");

  bank.create_account(1, String::from("Jian Hong"));
  bank.create_account(2, name.clone());
  bank.create_account(3, name.clone());

  let account = bank.get_account_by_index(2);
  account.holder = String::from("Jing Wei");
  let after_deposit = account.deposit(100);
  let after_withdraw = account.withdraw(10);

  println!("After Deposit: {}\nAfter Withdraw: {}", after_deposit, after_withdraw);

  bank.get_account_by_index(0).deposit(500);
  bank.get_account_by_index(1).deposit(500);

  println!("{:#?}", bank.summary());
  println!("Bank has total {}", bank.total_balance());
}
