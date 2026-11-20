import type { DietPrefs } from './mealPrep';

// Meals at popular chains, with the way to order them. Numbers are approximate, added up from each
// chain's published nutrition info (US menus, late 2026), and menus change, so the app says to check.

type Meat = 'chicken' | 'turkey' | 'beef' | 'pork' | 'fish' | 'shellfish';

export type RestaurantMeal = {
  id: string;
  place: string;
  name: string;
  /** What to ask for, when it isn't just the menu item. */
  order?: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  meats: Meat[];
  dairy?: boolean;
  egg?: boolean;
  breakfast?: boolean;
};

type Row = [place: string, name: string, order: string, cal: number, protein: number, carbs: number, fat: number, meats: Meat[], flags?: string];

const ROWS: Row[] = [
  // Chipotle
  ['Chipotle', 'Chicken burrito bowl', 'White rice, black beans, fajita veggies, tomato salsa, lettuce', 570, 44, 71, 13, ['chicken']],
  ['Chipotle', 'Double chicken bowl', 'Double chicken, brown rice, black beans, fajita veggies, tomato salsa', 745, 76, 67, 22, ['chicken']],
  ['Chipotle', 'Chicken salad', 'Lettuce, chicken, black beans, fajita veggies, tomato salsa (no dressing)', 360, 41, 32, 9, ['chicken']],
  ['Chipotle', 'Steak bowl', 'Steak, brown rice, pinto beans, fajita veggies, tomato salsa', 545, 34, 65, 14, ['beef']],
  ['Chipotle', 'Sofritas bowl', 'Sofritas, white rice, black beans, fajita veggies, tomato salsa', 535, 20, 80, 16, []],
  ['Chipotle', 'Steak burrito', 'Steak, white rice, pinto beans, tomato salsa, cheese', 945, 48, 127, 29, ['beef'], 'dairy'],
  // Chick-fil-A
  ['Chick-fil-A', '12-count grilled nuggets + fruit cup', '', 260, 39, 17, 5, ['chicken']],
  ['Chick-fil-A', '8-count grilled nuggets', '', 130, 25, 1, 3, ['chicken']],
  ['Chick-fil-A', 'Grilled chicken sandwich', '', 390, 28, 44, 11, ['chicken'], 'dairy'],
  ['Chick-fil-A', 'Grilled Cool Wrap', 'Skip the dressing', 350, 42, 29, 13, ['chicken'], 'dairy'],
  ['Chick-fil-A', 'Chicken sandwich', '', 420, 29, 41, 18, ['chicken'], 'dairy'],
  ['Chick-fil-A', 'Spicy Southwest salad', 'Skip the dressing', 450, 33, 27, 22, ['chicken'], 'dairy'],
  ['Chick-fil-A', 'Egg white grill', '', 300, 27, 31, 8, ['chicken'], 'dairy egg breakfast'],
  // Subway (6-inch on multigrain)
  ['Subway', 'Rotisserie-style chicken, 6-inch', 'Load up on veggies, mustard instead of mayo', 350, 29, 42, 7, ['chicken']],
  ['Subway', 'Oven-roasted turkey, 6-inch', 'Load up on veggies, mustard instead of mayo', 270, 18, 41, 4, ['turkey']],
  ['Subway', 'Turkey footlong', 'Load up on veggies, mustard instead of mayo', 540, 36, 82, 7, ['turkey']],
  ['Subway', 'Steak & cheese, 6-inch', '', 370, 26, 43, 10, ['beef'], 'dairy'],
  ['Subway', 'Veggie Delite, 6-inch', '', 200, 9, 39, 3, []],
  // McDonald's
  ["McDonald's", 'Egg McMuffin', '', 310, 17, 30, 13, ['pork'], 'dairy egg breakfast'],
  ["McDonald's", 'McDouble', '', 400, 22, 33, 20, ['beef'], 'dairy'],
  ["McDonald's", 'Quarter Pounder with Cheese', '', 520, 30, 42, 26, ['beef'], 'dairy'],
  ["McDonald's", 'Hamburger', '', 250, 12, 31, 9, ['beef']],
  ["McDonald's", '10-piece Chicken McNuggets', '', 410, 23, 25, 24, ['chicken']],
  // Taco Bell
  ['Taco Bell', 'Chicken Power Menu Bowl', '', 460, 26, 45, 20, ['chicken'], 'dairy'],
  ['Taco Bell', 'Veggie Power Menu Bowl', '', 430, 12, 57, 17, [], 'dairy'],
  ['Taco Bell', '2 chicken soft tacos', 'Order them fresco style', 300, 24, 32, 8, ['chicken']],
  ['Taco Bell', 'Bean burrito', '', 350, 13, 55, 9, [], 'dairy'],
  // Panda Express
  ['Panda Express', 'Grilled teriyaki chicken + super greens', 'Bowl, super greens instead of rice', 390, 42, 18, 16, ['chicken']],
  ['Panda Express', 'String bean chicken + super greens', 'Bowl, super greens instead of rice', 300, 18, 23, 12, ['chicken']],
  ['Panda Express', 'Broccoli beef + white rice', 'Bowl', 530, 16, 100, 7, ['beef']],
  // Starbucks
  ['Starbucks', 'Egg white & red pepper egg bites', '', 170, 12, 11, 8, [], 'dairy egg breakfast'],
  ['Starbucks', 'Bacon & Gruyère egg bites', '', 300, 19, 9, 20, ['pork'], 'dairy egg breakfast'],
  ['Starbucks', 'Spinach, feta & egg white wrap', '', 290, 20, 34, 8, [], 'dairy egg breakfast'],
  ['Starbucks', 'Turkey bacon & egg white sandwich', '', 230, 17, 28, 5, ['turkey'], 'dairy egg breakfast'],
  // Wendy's
  ["Wendy's", 'Grilled chicken sandwich', '', 370, 34, 37, 10, ['chicken']],
  ["Wendy's", 'Large chili', '', 330, 24, 34, 11, ['beef']],
  ["Wendy's", 'Jr. cheeseburger', '', 280, 14, 26, 13, ['beef'], 'dairy'],
  // In-N-Out
  ['In-N-Out', 'Double-Double, protein style', 'Lettuce wrap instead of a bun', 520, 33, 11, 39, ['beef'], 'dairy'],
  ['In-N-Out', 'Hamburger, protein style', 'Lettuce wrap instead of a bun', 240, 13, 11, 17, ['beef']],
  ['In-N-Out', 'Double-Double', '', 670, 37, 39, 41, ['beef'], 'dairy'],
];

export const RESTAURANT_MEALS: RestaurantMeal[] = ROWS.map(([place, name, order, cal, protein, carbs, fat, meats, flags = '']) => ({
  id: `${place}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  place,
  name,
  order: order || undefined,
  cal,
  protein,
  carbs,
  fat,
  meats,
  dairy: flags.includes('dairy'),
  egg: flags.includes('egg'),
  breakfast: flags.includes('breakfast'),
}));

export const PLACES = [...new Set(RESTAURANT_MEALS.map((m) => m.place))];

const LAND = ['chicken', 'turkey', 'beef', 'pork'];

/** Diet answers from Meal Prep. Allergies aren't checked here: restaurant kitchens share equipment, so the app says to ask. */
export function fitsDietOut(m: RestaurantMeal, p: DietPrefs): boolean {
  const land = m.meats.some((x) => LAND.includes(x));
  for (const d of p.diets) {
    if (d === 'vegetarian' && m.meats.length) return false;
    if (d === 'vegan' && (m.meats.length || m.dairy || m.egg)) return false;
    if (d === 'pescatarian' && land) return false;
    if ((d === 'halal' || d === 'nopork') && m.meats.includes('pork')) return false;
    if (d === 'kosher' && (m.meats.includes('pork') || m.meats.includes('shellfish') || (land && m.dairy))) return false;
    if (d === 'nobeef' && m.meats.includes('beef')) return false;
  }
  return true;
}

export type OutPick = { meal: RestaurantMeal; fits: boolean };

/**
 * Meals that fit the calories you have left. Best first means the most of your remaining protein,
 * with a small cost per calorie so a light, high-protein meal beats a heavy one with the same protein.
 * Breakfast items only show for breakfast. If nothing fits, the lightest options instead.
 */
export function pickRestaurantMeals(calLeft: number, prefs: DietPrefs, breakfast: boolean, place: string | null, proteinLeft: number | null = null): OutPick[] {
  const pool = RESTAURANT_MEALS.filter((m) => (place ? m.place === place : true) && !!m.breakfast === breakfast && fitsDietOut(m, prefs));
  const score = (m: RestaurantMeal) => Math.min(m.protein, proteinLeft != null && proteinLeft > 0 ? proteinLeft : Infinity) - 0.03 * m.cal;
  const fit = pool.filter((m) => m.cal <= calLeft).sort((a, b) => score(b) - score(a));
  if (fit.length) return fit.map((meal) => ({ meal, fits: true }));
  return [...pool].sort((a, b) => a.cal - b.cal).slice(0, 4).map((meal) => ({ meal, fits: false }));
}
