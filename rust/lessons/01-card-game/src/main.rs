use rand::{seq::SliceRandom, thread_rng};

#[derive(Debug)]
struct Deck {
  cards: Vec<String>,
}

impl Deck {
  fn new() -> Self {
    let suites = ["♥️", "♠️", "♦️", "♣️"];
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    let mut cards: Vec<String> = vec![];

    for suit in suites {
      for value in values {
        let card = format!("{} {}", suit, value);
        cards.push(card);
      }
    }

    Deck { cards }
  }

  fn shuffle(&mut self) {
    let mut rng = thread_rng();

    self.cards.shuffle(&mut rng);
  }

  fn deal(&mut self, num_cards: usize) -> Vec<String> {
    self.cards.split_off(self.cards.len() - num_cards)
  }
}

fn main() {
  let mut deck = Deck::new();
  deck.shuffle();

  let cards = deck.deal(52);

  println!("Current Deck: {:#?}", &deck.cards);

  println!("Cards on hand: {:#?}", cards);
  println!("Cards in deck after deal: {}", deck.cards.len());
}
