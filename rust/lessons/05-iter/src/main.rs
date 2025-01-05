mod iter;

use iter::iter::*;

fn main() {
  let mut colors = vec![String::from("red"), String::from("blue"), String::from("green")];

  /* vector slice (From index 0 to 2, excluding 2) */
  // print_elements(&colors[0..2]);

  let uppercased_colors = to_uppercase(&colors);
  print_elements(&uppercased_colors);

  shorten_strings(&mut colors);
  print_elements(&colors);

  let mut new_vec: Vec<String> = vec![];
  move_elements(uppercased_colors, &mut new_vec);
  print_elements(&new_vec);

  let char_vecs = explode_elemnts(&new_vec);
  println!("{:#?}", &char_vecs);

  let color = find_element_or(&new_vec, "re", "orange");
  println!("Color: {}", &color);
}
