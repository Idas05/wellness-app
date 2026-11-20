// Foods you can search, and the serving sizes you can pick from.
import { syncedLoad, syncedSave } from './cloudKv';
// Common foods are built in (calories per 100 g from USDA FoodData Central, rounded),
// so they show up instantly and work offline. Branded foods come from Open Food Facts.

export type Serving = { label: string; cal: number };
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

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const COMMON_FOODS: FoodItem[] = COMMON.map(([name, per100, servings]) => ({
  id: `common-${slug(name)}`,
  name,
  source: 'common',
  servings: [
    ...servings.map(([label, g]) => ({ label: `${label} (${Math.round(g)} g)`, cal: Math.round((per100 * g) / 100) })),
    { label: '100 g', cal: per100 },
    { label: '1 g', cal: per100 / 100 },
  ],
}));

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

export function fromOff(p: OffProduct): FoodItem | null {
  const n = p.nutriments ?? {};
  const per100 = num(n['energy-kcal_100g']) ?? (num(n['energy_100g']) !== null ? num(n['energy_100g'])! / 4.184 : null);
  const qty = num(p.serving_quantity);
  const perServing = num(n['energy-kcal_serving']) ?? (per100 !== null && qty ? (per100 * qty) / 100 : null);
  const name = p.product_name?.trim();
  if (!name || (per100 === null && perServing === null)) return null;
  const servings: Serving[] = [];
  if (perServing !== null) servings.push({ label: p.serving_size?.trim() || '1 serving', cal: Math.round(perServing) });
  if (per100 !== null) servings.push({ label: '100 g', cal: Math.round(per100) }, { label: '1 g', cal: per100 / 100 });
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
