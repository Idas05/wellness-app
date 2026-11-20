// Foods you can search, and the serving sizes you can pick from.
import { syncedLoad, syncedSave } from './cloudKv';
import { scaleMacros, type Macros } from './macros';
// Common foods are built in (calories per 100 g from USDA FoodData Central, rounded),
// so they show up instantly and work offline. Branded foods come from Open Food Facts.

/** m: protein, fat and carbs in this serving, when known. */
export type Serving = { label: string; cal: number; m?: Macros };
export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  servings: Serving[]; // first one is the default
  source: 'common' | 'online' | 'recent' | 'recipe';
};

type Row = [name: string, per100g: number, servings: [label: string, grams: number][]];

const COMMON: Row[] = [
  // Fruit
  ['Apple', 52, [['1 medium', 182], ['1 cup, sliced', 109]]],
  ['Banana', 89, [['1 medium', 118], ['1 large', 136]]],
  ['Orange', 47, [['1 medium', 131]]],
  ['Strawberries', 32, [['1 cup', 152]]],
  ['Blueberries', 57, [['1 cup', 148]]],
  ['Raspberries', 52, [['1 cup', 123]]],
  ['Grapes', 69, [['1 cup', 151]]],
  ['Watermelon', 30, [['1 cup, diced', 152]]],
  ['Pineapple', 50, [['1 cup, chunks', 165]]],
  ['Mango', 60, [['1 cup, sliced', 165]]],
  ['Avocado', 160, [['1/2 avocado', 75], ['1 whole', 150]]],
  ['Pear', 57, [['1 medium', 178]]],
  ['Peach', 39, [['1 medium', 150]]],
  ['Cherries', 63, [['1 cup', 138]]],
  ['Kiwi', 61, [['1 fruit', 69]]],
  ['Grapefruit', 42, [['1/2 fruit', 123]]],
  ['Medjool dates', 277, [['1 date', 24]]],
  ['Raisins', 299, [['1 small box', 43]]],
  // Vegetables
  ['Broccoli', 34, [['1 cup, chopped', 91]]],
  ['Spinach, raw', 23, [['1 cup', 30]]],
  ['Carrot', 41, [['1 medium', 61], ['1 cup, baby carrots', 128]]],
  ['Tomato', 18, [['1 medium', 123]]],
  ['Cucumber', 15, [['1 cup, sliced', 119]]],
  ['Romaine lettuce', 17, [['1 cup, shredded', 47]]],
  ['Mixed salad greens', 20, [['2 cups', 85]]],
  ['Bell pepper', 31, [['1 medium', 119]]],
  ['Onion', 40, [['1 medium', 110]]],
  ['Baked potato', 93, [['1 medium', 173]]],
  ['Sweet potato, baked', 90, [['1 medium', 114]]],
  ['Corn', 96, [['1 ear', 90], ['1 cup', 145]]],
  ['Green beans', 31, [['1 cup', 100]]],
  ['Peas', 81, [['1 cup', 145]]],
  ['Mushrooms', 22, [['1 cup', 70]]],
  ['Cauliflower', 25, [['1 cup', 107]]],
  ['Asparagus', 20, [['5 spears', 80]]],
  ['Zucchini', 17, [['1 medium', 196]]],
  ['Kale', 49, [['1 cup', 21]]],
  ['Brussels sprouts', 43, [['1 cup', 88]]],
  ['Celery', 16, [['1 stalk', 40]]],
  // Grains and bread
  ['Rice, white, cooked', 130, [['1 cup', 158]]],
  ['Rice, brown, cooked', 123, [['1 cup', 195]]],
  ['Pasta, cooked', 158, [['1 cup', 140]]],
  ['Oatmeal, cooked', 71, [['1 cup', 234]]],
  ['Rolled oats, dry', 379, [['1/2 cup', 40]]],
  ['Quinoa, cooked', 120, [['1 cup', 185]]],
  ['Couscous, cooked', 112, [['1 cup', 157]]],
  ['White bread', 265, [['1 slice', 28]]],
  ['Whole wheat bread', 252, [['1 slice', 32]]],
  ['Bagel', 250, [['1 bagel', 105]]],
  ['Flour tortilla', 312, [['1 medium (8")', 45]]],
  ['Corn tortilla', 218, [['1 tortilla', 26]]],
  ['English muffin', 227, [['1 muffin', 57]]],
  ['Pancake', 227, [['1 medium', 77]]],
  ['Waffle, frozen', 273, [['1 waffle', 35]]],
  ['Croissant', 406, [['1 medium', 57]]],
  ['Granola', 471, [['1/2 cup', 61]]],
  ['Cheerios', 376, [['1 cup', 28]]],
  ['Corn flakes', 357, [['1 cup', 28]]],
  ['Popcorn, air-popped', 387, [['3 cups', 24]]],
  // Meat, fish, eggs, beans
  ['Chicken breast, cooked', 165, [['1 breast', 172], ['3 oz', 85]]],
  ['Chicken thigh, cooked', 209, [['1 thigh', 116]]],
  ['Rotisserie chicken', 190, [['3 oz', 85]]],
  ['Ground beef 85% lean, cooked', 250, [['3 oz', 85], ['1 patty (4 oz raw)', 85]]],
  ['Sirloin steak, cooked', 206, [['3 oz', 85], ['8 oz', 227]]],
  ['Salmon, cooked', 206, [['1 fillet', 154], ['3 oz', 85]]],
  ['Tuna, canned in water', 116, [['1 can', 142]]],
  ['Shrimp, cooked', 99, [['3 oz', 85]]],
  ['Tilapia, cooked', 128, [['1 fillet', 87]]],
  ['Deli turkey', 104, [['2 slices', 56]]],
  ['Ham', 145, [['2 slices', 56]]],
  ['Bacon, cooked', 541, [['1 slice', 8]]],
  ['Pork chop, cooked', 231, [['1 chop', 145]]],
  ['Sausage link', 325, [['1 link', 25]]],
  ['Hot dog', 290, [['1 frank', 52]]],
  ['Egg', 143, [['1 large', 50]]],
  ['Egg white', 52, [['1 large', 33]]],
  ['Firm tofu', 144, [['1/2 cup', 126]]],
  ['Black beans, cooked', 132, [['1 cup', 172]]],
  ['Chickpeas, cooked', 164, [['1 cup', 164]]],
  ['Lentils, cooked', 116, [['1 cup', 198]]],
  ['Hummus', 166, [['2 tbsp', 30]]],
  ['Whey protein powder', 400, [['1 scoop', 30]]],
  // Dairy
  ['Whole milk', 61, [['1 cup', 244]]],
  ['2% milk', 50, [['1 cup', 244]]],
  ['Skim milk', 34, [['1 cup', 245]]],
  ['Almond milk, unsweetened', 15, [['1 cup', 240]]],
  ['Greek yogurt, plain nonfat', 59, [['1 container', 170], ['1 cup', 227]]],
  ['Fruit yogurt, low-fat', 99, [['1 container', 170]]],
  ['Cheddar cheese', 403, [['1 slice', 28], ['1 oz', 28]]],
  ['Mozzarella', 280, [['1 oz', 28]]],
  ['American cheese', 330, [['1 slice', 21]]],
  ['String cheese', 286, [['1 stick', 28]]],
  ['Parmesan, grated', 431, [['1 tbsp', 5]]],
  ['Cottage cheese 2%', 84, [['1 cup', 226]]],
  ['Butter', 717, [['1 tbsp', 14]]],
  ['Cream cheese', 342, [['1 tbsp', 15]]],
  ['Vanilla ice cream', 207, [['1/2 cup', 66]]],
  // Nuts, oils, sauces, sweet stuff
  ['Peanut butter', 588, [['2 tbsp', 32]]],
  ['Almonds', 579, [['1 oz (23 nuts)', 28]]],
  ['Walnuts', 654, [['1 oz', 28]]],
  ['Cashews', 553, [['1 oz', 28]]],
  ['Peanuts', 567, [['1 oz', 28]]],
  ['Chia seeds', 486, [['1 tbsp', 12]]],
  ['Olive oil', 884, [['1 tbsp', 13.5]]],
  ['Mayonnaise', 680, [['1 tbsp', 14]]],
  ['Ranch dressing', 430, [['2 tbsp', 30]]],
  ['Ketchup', 101, [['1 tbsp', 17]]],
  ['Honey', 304, [['1 tbsp', 21]]],
  ['Maple syrup', 260, [['1 tbsp', 20]]],
  ['Jam', 250, [['1 tbsp', 20]]],
  ['Sugar', 387, [['1 tsp', 4]]],
  // Meals and fast food
  ['Cheese pizza', 266, [['1 slice (14")', 107]]],
  ['Pepperoni pizza', 298, [['1 slice (14")', 111]]],
  ['Hamburger', 250, [['1 burger', 100]]],
  ['Cheeseburger', 263, [['1 burger', 119]]],
  ['French fries', 312, [['1 medium order', 117], ['1 small order', 71]]],
  ['Chicken nuggets', 296, [['6 pieces', 96], ['10 pieces', 160]]],
  ['Beef taco', 226, [['1 taco', 78]]],
  ['Bean and cheese burrito', 190, [['1 burrito', 200]]],
  ['Spaghetti with meat sauce', 132, [['1 cup', 248]]],
  ['Mac and cheese', 164, [['1 cup', 200]]],
  ['Fried rice', 163, [['1 cup', 198]]],
  ['California roll', 129, [['6 pieces', 170]]],
  ['Peanut butter and jelly sandwich', 347, [['1 sandwich', 100]]],
  ['Grilled cheese sandwich', 370, [['1 sandwich', 110]]],
  ['Chicken noodle soup', 25, [['1 cup', 248]]],
  // Snacks
  ['Potato chips', 536, [['1 oz', 28]]],
  ['Tortilla chips', 489, [['1 oz', 28]]],
  ['Pretzels', 380, [['1 oz', 28]]],
  ['Dark chocolate', 598, [['1 oz', 28]]],
  ['Milk chocolate bar', 535, [['1 bar (1.55 oz)', 44]]],
  ['Chocolate chip cookie', 488, [['1 cookie', 30]]],
  ['Brownie', 466, [['1 brownie', 56]]],
  ['Glazed donut', 421, [['1 donut', 64]]],
  ['Blueberry muffin', 377, [['1 muffin', 113]]],
  ['Granola bar', 430, [['1 bar', 28]]],
  ['Protein bar', 350, [['1 bar', 60]]],
  ['Rice cake', 387, [['1 cake', 9]]],
  ['Trail mix', 462, [['1/4 cup', 38]]],
  ['Beef jerky', 410, [['1 oz', 28]]],
  // Drinks
  ['Coffee, black', 1, [['1 cup (8 fl oz)', 237]]],
  ['Latte, whole milk', 54, [['12 fl oz', 355], ['16 fl oz', 473]]],
  ['Orange juice', 45, [['1 cup', 248]]],
  ['Apple juice', 46, [['1 cup', 248]]],
  ['Cola', 42, [['1 can (12 fl oz)', 368]]],
  ['Diet soda', 0, [['1 can (12 fl oz)', 355]]],
  ['Sports drink', 26, [['1 bottle (20 fl oz)', 591]]],
  ['Energy drink', 45, [['1 can (8.4 fl oz)', 248]]],
  ['Protein shake, ready to drink', 50, [['1 bottle', 325]]],
  ['Beer', 43, [['1 can (12 fl oz)', 356]]],
  ['Red wine', 85, [['1 glass (5 fl oz)', 147]]],
];

/** Protein, fat and carbs in grams per 100 g (USDA FoodData Central, rounded). */
const MACROS: Record<string, [number, number, number]> = {
  Apple: [0.3, 0.2, 14], Banana: [1.1, 0.3, 23], Orange: [0.9, 0.1, 12], Strawberries: [0.7, 0.3, 7.7], Blueberries: [0.7, 0.3, 14.5],
  Raspberries: [1.2, 0.7, 12], Grapes: [0.7, 0.2, 18], Watermelon: [0.6, 0.2, 7.6], Pineapple: [0.5, 0.1, 13], Mango: [0.8, 0.4, 15],
  Avocado: [2, 14.7, 8.5], Pear: [0.4, 0.1, 15], Peach: [0.9, 0.3, 9.5], Cherries: [1.1, 0.2, 16], Kiwi: [1.1, 0.5, 15],
  Grapefruit: [0.8, 0.1, 10.7], 'Medjool dates': [1.8, 0.2, 75], Raisins: [3.1, 0.5, 79],
  Broccoli: [2.8, 0.4, 6.6], 'Spinach, raw': [2.9, 0.4, 3.6], Carrot: [0.9, 0.2, 9.6], Tomato: [0.9, 0.2, 3.9], Cucumber: [0.7, 0.1, 3.6],
  'Romaine lettuce': [1.2, 0.3, 3.3], 'Mixed salad greens': [1.5, 0.2, 3.6], 'Bell pepper': [1, 0.3, 6], Onion: [1.1, 0.1, 9.3],
  'Baked potato': [2.5, 0.1, 21], 'Sweet potato, baked': [2, 0.2, 21], Corn: [3.4, 1.5, 21], 'Green beans': [1.8, 0.2, 7], Peas: [5.4, 0.4, 14.5],
  Mushrooms: [3.1, 0.3, 3.3], Cauliflower: [1.9, 0.3, 5], Asparagus: [2.2, 0.1, 3.9], Zucchini: [1.2, 0.3, 3.1], Kale: [4.3, 0.9, 8.8],
  'Brussels sprouts': [3.4, 0.3, 9], Celery: [0.7, 0.2, 3],
  'Rice, white, cooked': [2.7, 0.3, 28], 'Rice, brown, cooked': [2.7, 1, 25.6], 'Pasta, cooked': [5.8, 0.9, 31], 'Oatmeal, cooked': [2.5, 1.5, 12],
  'Rolled oats, dry': [13, 6.5, 68], 'Quinoa, cooked': [4.4, 1.9, 21], 'Couscous, cooked': [3.8, 0.2, 23], 'White bread': [9, 3.2, 49],
  'Whole wheat bread': [12.5, 3.5, 43], Bagel: [10, 1.5, 49], 'Flour tortilla': [8.3, 8, 52], 'Corn tortilla': [5.7, 2.9, 45],
  'English muffin': [8.9, 1.7, 44], Pancake: [6.4, 9.7, 28], 'Waffle, frozen': [6.6, 9.5, 41], Croissant: [8.2, 21, 46], Granola: [11, 20, 64],
  Cheerios: [12, 6.7, 73], 'Corn flakes': [7, 0.4, 84], 'Popcorn, air-popped': [13, 4.5, 78],
  'Chicken breast, cooked': [31, 3.6, 0], 'Chicken thigh, cooked': [26, 10.9, 0], 'Rotisserie chicken': [27, 8.5, 0],
  'Ground beef 85% lean, cooked': [26, 15, 0], 'Sirloin steak, cooked': [30, 8.6, 0], 'Salmon, cooked': [22, 12, 0],
  'Tuna, canned in water': [26, 0.8, 0], 'Shrimp, cooked': [24, 0.3, 0.2], 'Tilapia, cooked': [26, 2.7, 0], 'Deli turkey': [17, 2, 4],
  Ham: [17, 6, 3], 'Bacon, cooked': [37, 42, 1.4], 'Pork chop, cooked': [27, 13, 0], 'Sausage link': [13, 29, 1.5], 'Hot dog': [10, 26, 4],
  Egg: [12.6, 9.5, 0.7], 'Egg white': [10.9, 0.2, 0.7], 'Firm tofu': [17, 9, 3], 'Black beans, cooked': [8.9, 0.5, 24],
  'Chickpeas, cooked': [8.9, 2.6, 27], 'Lentils, cooked': [9, 0.4, 20], Hummus: [8, 9.6, 14], 'Whey protein powder': [80, 6, 8],
  'Whole milk': [3.2, 3.3, 4.8], '2% milk': [3.3, 2, 4.8], 'Skim milk': [3.4, 0.1, 5], 'Almond milk, unsweetened': [0.6, 1.1, 0.3],
  'Greek yogurt, plain nonfat': [10.3, 0.4, 3.6], 'Fruit yogurt, low-fat': [4, 1.2, 18], 'Cheddar cheese': [23, 33, 1.3], Mozzarella: [22, 17, 2.2],
  'American cheese': [16, 26, 8], 'String cheese': [24, 20, 2.5], 'Parmesan, grated': [29, 28, 14], 'Cottage cheese 2%': [11, 2.3, 4.3],
  Butter: [0.9, 81, 0.1], 'Cream cheese': [6, 34, 4], 'Vanilla ice cream': [3.5, 11, 24],
  'Peanut butter': [25, 50, 20], Almonds: [21, 50, 22], Walnuts: [15, 65, 14], Cashews: [18, 44, 30], Peanuts: [26, 49, 16],
  'Chia seeds': [17, 31, 42], 'Olive oil': [0, 100, 0], Mayonnaise: [1, 75, 0.6], 'Ranch dressing': [1, 45, 6], Ketchup: [1, 0.1, 27],
  Honey: [0.3, 0, 82], 'Maple syrup': [0, 0.1, 67], Jam: [0.4, 0.1, 65], Sugar: [0, 0, 100],
  'Cheese pizza': [11, 10, 33], 'Pepperoni pizza': [12, 13, 34], Hamburger: [12.4, 10, 28], Cheeseburger: [13, 12, 26], 'French fries': [3.4, 15, 41],
  'Chicken nuggets': [15, 18, 17], 'Beef taco': [9, 12, 20], 'Bean and cheese burrito': [7.5, 6, 27], 'Spaghetti with meat sauce': [6.5, 4, 17],
  'Mac and cheese': [6.5, 7, 19], 'Fried rice': [5, 6, 21], 'California roll': [3, 3.5, 20], 'Peanut butter and jelly sandwich': [11, 15, 45],
  'Grilled cheese sandwich': [12, 20, 35], 'Chicken noodle soup': [1.6, 0.8, 3],
  'Potato chips': [7, 35, 53], 'Tortilla chips': [7, 23, 64], Pretzels: [10, 3, 80], 'Dark chocolate': [7.8, 43, 46], 'Milk chocolate bar': [7.6, 30, 59],
  'Chocolate chip cookie': [5, 24, 64], Brownie: [6, 23, 62], 'Glazed donut': [5, 23, 49], 'Blueberry muffin': [5.5, 17, 51], 'Granola bar': [8, 17, 64],
  'Protein bar': [30, 10, 35], 'Rice cake': [8, 3, 82], 'Trail mix': [14, 29, 45], 'Beef jerky': [33, 26, 11],
  'Coffee, black': [0.1, 0, 0], 'Latte, whole milk': [2.9, 2.9, 4.4], 'Orange juice': [0.7, 0.2, 10.4], 'Apple juice': [0.1, 0.1, 11.3], Cola: [0, 0, 10.6],
  'Diet soda': [0, 0, 0], 'Sports drink': [0, 0, 6.4], 'Energy drink': [0.5, 0, 11], 'Protein shake, ready to drink': [9, 1.3, 2], Beer: [0.5, 0, 3.6],
  'Red wine': [0.1, 0, 2.6],
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const COMMON_FOODS: FoodItem[] = COMMON.map(([name, per100, servings]) => {
  const [protein, fat, carbs] = MACROS[name] ?? [0, 0, 0];
  const m100: Macros = { protein, fat, carbs };
  return {
    id: `common-${slug(name)}`,
    name,
    source: 'common',
    servings: [
      ...servings.map(([label, g]) => ({ label: `${label} (${Math.round(g)} g)`, cal: Math.round((per100 * g) / 100), m: scaleMacros(m100, g / 100) })),
      { label: '100 g', cal: per100, m: m100 },
      { label: '1 g', cal: per100 / 100, m: scaleMacros(m100, 0.01) },
    ],
  };
});

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9% ]+/g, ' ').trim();

// Everyday basics win ties, so "rice" shows cooked rice before rice cakes.
const STAPLES = new Set(['Rice, white, cooked', 'Rice, brown, cooked', 'Chicken breast, cooked', 'Chicken thigh, cooked']);

/** Built-in foods that match every word you typed, best matches first. */

export function searchCommon(query: string, limit = 12): FoodItem[] {
  const q = norm(query);
  if (!q) return [];
  const words = q.split(/\s+/);
  const scored: { f: FoodItem; s: number }[] = [];
  for (const f of COMMON_FOODS) {
    const n = norm(f.name);
    const parts = n.split(/\s+/);
    // Each typed word has to start one of the food's words ("chick" finds "chicken").
    if (!words.every((w) => parts.some((p) => p.startsWith(w) || (w.length > 3 && p.startsWith(w.replace(/s$/, '')))))) continue;
    let s = 0;
    if (n.startsWith(q)) s += 10;
    if (parts[0].startsWith(words[0])) s += 5;
    s -= n.length / 20;
    if (STAPLES.has(f.name)) s += 1.5;
    scored.push({ f, s });
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.f);
}

// ---- Branded foods from Open Food Facts (free, no account) ----

type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number | string;
  nutriments?: Record<string, number | string | undefined>;
};

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** Protein, fat and carbs from Open Food Facts, per 100 g and per serving (left out when the label doesn't list them). */
export function offMacros(n: Record<string, number | string | undefined>, servingGrams: number | null): { m100?: Macros; mServing?: Macros } {
  const get = (k: string) => ({ protein: num(n[`proteins_${k}`]), fat: num(n[`fat_${k}`]), carbs: num(n[`carbohydrates_${k}`]) });
  const full = (x: { protein: number | null; fat: number | null; carbs: number | null }): Macros | undefined =>
    x.protein === null && x.fat === null && x.carbs === null ? undefined : { protein: x.protein ?? 0, fat: x.fat ?? 0, carbs: x.carbs ?? 0 };
  const m100 = full(get('100g'));
  const mServing = full(get('serving')) ?? (m100 && servingGrams ? scaleMacros(m100, servingGrams / 100) : undefined);
  return { m100, mServing };
}

export function fromOff(p: OffProduct): FoodItem | null {
  const n = p.nutriments ?? {};
  const per100 = num(n['energy-kcal_100g']) ?? (num(n['energy_100g']) !== null ? num(n['energy_100g'])! / 4.184 : null);
  const qty = num(p.serving_quantity);
  const perServing = num(n['energy-kcal_serving']) ?? (per100 !== null && qty ? (per100 * qty) / 100 : null);
  const name = p.product_name?.trim();
  if (!name || (per100 === null && perServing === null)) return null;
  const { m100, mServing } = offMacros(n, qty);
  const servings: Serving[] = [];
  if (perServing !== null) servings.push({ label: p.serving_size?.trim() || '1 serving', cal: Math.round(perServing), m: mServing });
  if (per100 !== null) servings.push({ label: '100 g', cal: Math.round(per100), m: m100 }, { label: '1 g', cal: per100 / 100, m: m100 && scaleMacros(m100, 0.01) });
  const brand = p.brands?.split(',')[0]?.trim() || undefined;
  return { id: `off-${p.code || slug(name)}`, name, brand, servings, source: 'online' };
}

/** Searches Open Food Facts for packaged and restaurant foods. */
export async function searchOnline(query: string, signal?: AbortSignal): Promise<FoodItem[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url =
    'https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=30' +
    '&fields=code,product_name,brands,serving_size,serving_quantity,nutriments' +
    `&search_terms=${encodeURIComponent(q)}`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Search failed (${res.status}).`);
  const data = (await res.json()) as { products?: OffProduct[] };
  const seen = new Set<string>();
  const out: FoodItem[] = [];
  for (const p of data.products ?? []) {
    const f = fromOff(p);
    if (!f) continue;
    const key = `${f.brand ?? ''}|${f.name}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

// ---- Foods you've added before, for one-tap re-adding ----

export type RecentFood = { name: string; brand?: string; serving: Serving; qty: number; servings?: Serving[] };
const RECENT_KEY = 'wellness.recentFoods.v1';

const sameFood = (a: RecentFood, b: RecentFood) => a.name === b.name && a.brand === b.brand;

export async function loadRecent(): Promise<RecentFood[]> {
  return syncedLoad<RecentFood[]>(RECENT_KEY, [], (local, remote) =>
    [...local, ...remote.filter((r) => !local.some((l) => sameFood(l, r)))].slice(0, 30),
  );
}

export async function rememberFood(r: RecentFood): Promise<void> {
  const list = (await loadRecent()).filter((x) => !sameFood(x, r));
  await syncedSave(RECENT_KEY, [r, ...list].slice(0, 30));
}

export function recentToItem(r: RecentFood): FoodItem {
  const rest = (r.servings ?? []).filter((s) => s.label !== r.serving.label);
  return { id: `recent-${slug(r.name)}`, name: r.name, brand: r.brand, servings: [r.serving, ...rest], source: 'recent' };
}

export function displayName(f: { name: string; brand?: string }) {
  return f.brand && !f.name.toLowerCase().includes(f.brand.toLowerCase()) ? `${f.brand} ${f.name}` : f.name;
}

/** "2 × 1 medium (118 g)" or "1 medium (118 g)" or "150 g". */
export function amountText(serving: Serving, qty: number) {
  if (serving.label === '1 g') return `${+qty.toFixed(1)} g`;
  return qty === 1 ? serving.label : `${+qty.toFixed(2)} × ${serving.label}`;
}
