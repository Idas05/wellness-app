import { syncedLoad, syncedSave } from './cloudKv';
import type { MealId } from './nutrition';
import type { LibraryRecipe } from './recipeLibrary';

// ---- Diet and allergy answers ----

export const DIETS = [
  { id: 'vegetarian', label: 'Vegetarian', hint: 'No meat or fish' },
  { id: 'vegan', label: 'Vegan', hint: 'No animal products' },
  { id: 'pescatarian', label: 'Pescatarian', hint: 'Fish, but no meat' },
  { id: 'halal', label: 'Halal', hint: 'No pork or alcohol' },
  { id: 'kosher', label: 'Kosher', hint: 'No pork or shellfish, no meat with dairy' },
  { id: 'nobeef', label: 'No beef', hint: 'e.g. Hindu' },
  { id: 'nopork', label: 'No pork', hint: '' },
] as const;
export type DietId = (typeof DIETS)[number]['id'];

/** The nine major food allergens. */
export const ALLERGENS = [
  { id: 'milk', label: 'Milk / dairy' },
  { id: 'egg', label: 'Eggs' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'treenut', label: 'Tree nuts' },
  { id: 'peanut', label: 'Peanuts' },
  { id: 'gluten', label: 'Wheat / gluten' },
  { id: 'soy', label: 'Soy' },
  { id: 'sesame', label: 'Sesame' },
] as const;
export type AllergenId = (typeof ALLERGENS)[number]['id'];

export type DietPrefs = { diets: DietId[]; allergies: AllergenId[] };

const PREFS_KEY = 'wellness.dietPrefs.v1';

export async function loadPrefs(): Promise<DietPrefs | null> {
  return syncedLoad<DietPrefs | null>(PREFS_KEY, null, (local, remote) => remote ?? local);
}

export async function savePrefs(p: DietPrefs): Promise<void> {
  await syncedSave(PREFS_KEY, p);
}

// ---- Which meal, and how many calories it gets ----

/** Rough share of the day's calories for each meal. */
export const MEAL_SHARE: Record<MealId, number> = { breakfast: 0.25, lunch: 0.3, dinner: 0.35, snack: 0.1 };

/** The meal coming up, going by the clock. */
export function mealNow(d = new Date()): MealId {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 4 && h < 10.5) return 'breakfast';
  if (h >= 10.5 && h < 15) return 'lunch';
  if (h >= 15 && h < 21) return 'dinner';
  return 'snack';
}

export type Budget = { share: number; logged: number; leftToday: number; target: number; light: boolean };

/** Calories this meal should come to: its share of the goal, less what's already logged for it and never more than what's left today. */
export function mealBudget(daily: number, meal: MealId, loggedForMeal: number, eatenToday: number): Budget {
  const share = Math.round(daily * MEAL_SHARE[meal]);
  const leftToday = daily - eatenToday;
  const raw = Math.min(share - loggedForMeal, leftToday);
  // Below this there's no real meal left in the budget; suggest something light instead.
  const floor = meal === 'snack' ? 100 : 200;
  return { share, logged: loggedForMeal, leftToday, target: Math.max(Math.round(raw), floor), light: raw < floor };
}

// ---- Matching recipes ----

const LAND_MEAT = ['chicken', 'turkey', 'beef', 'pork', 'lamb'] as const;

export function fitsDiet(r: LibraryRecipe, p: DietPrefs): boolean {
  const has = (m: string) => (r.meats as readonly string[]).includes(m);
  const landMeat = LAND_MEAT.some(has);
  for (const d of p.diets) {
    if (d === 'vegetarian' && r.meats.length) return false;
    if (d === 'vegan' && (r.meats.length || r.contains.includes('milk') || r.contains.includes('egg') || r.honey)) return false;
    if (d === 'pescatarian' && landMeat) return false;
    if ((d === 'halal' || d === 'nopork') && has('pork')) return false;
    if (d === 'kosher' && (has('pork') || has('shellfish') || (landMeat && r.contains.includes('milk')))) return false;
    if (d === 'nobeef' && has('beef')) return false;
  }
  return !p.allergies.some((a) => r.contains.includes(a));
}

export type Suggestion = { recipe: LibraryRecipe; portion: number; calories: number };

/** How many servings get closest to the target, in quarter steps. */
export function portionFor(cal: number, target: number): number {
  return Math.min(2.5, Math.max(0.5, Math.round((target / cal) * 4) / 4));
}

/** Recipes for this meal that fit the diet and land within about 12% of the target at a sensible portion. */
export function matchRecipes(all: LibraryRecipe[], meal: MealId, target: number, prefs: DietPrefs): Suggestion[] {
  const out: Suggestion[] = [];
  for (const recipe of all) {
    if (!recipe.meals.includes(meal) || !fitsDiet(recipe, prefs)) continue;
    const portion = portionFor(recipe.cal, target);
    const calories = Math.round(recipe.cal * portion);
    if (Math.abs(calories - target) <= target * 0.12) out.push({ recipe, portion, calories });
  }
  return out;
}

/** Fisher–Yates shuffle, so each refresh brings a new mix. */
export function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- Not showing the same recipes every visit ----

/** Recipe ids already shown for each meal, oldest first. Synced, so the phone and website don't repeat each other. */
export type Seen = Partial<Record<MealId, string[]>>;
const SEEN_KEY = 'wellness.mealPrepSeen.v1';

export async function loadSeen(): Promise<Seen> {
  return syncedLoad<Seen>(SEEN_KEY, {}, (local, remote) => {
    const out: Seen = { ...remote };
    for (const [m, ids] of Object.entries(local) as [MealId, string[]][]) out[m] = [...new Set([...(out[m] ?? []), ...ids])];
    return out;
  });
}

/** Adds what's on screen to the seen list. Once every match has been seen, starts the list over from these. */
export async function markSeen(meal: MealId, ids: string[], matchIds: string[]): Promise<void> {
  const seen = await loadSeen();
  let list = [...(seen[meal] ?? []).filter((id) => !ids.includes(id)), ...ids];
  if (matchIds.every((id) => list.includes(id))) list = ids;
  await syncedSave(SEEN_KEY, { ...seen, [meal]: list.slice(-200) });
}

/** Recipes you haven't been shown yet come first, in a random mix; then the ones seen longest ago. */
export function freshFirst(matches: Suggestion[], seenIds: string[] = []): Suggestion[] {
  const rank = new Map(seenIds.map((id, i) => [id, i]));
  const fresh = shuffle(matches.filter((m) => !rank.has(m.recipe.id)));
  const old = matches.filter((m) => rank.has(m.recipe.id)).sort((a, b) => rank.get(a.recipe.id)! - rank.get(b.recipe.id)!);
  return [...fresh, ...old];
}

// ---- Rewriting a recipe so your portion is one serving ----

const FRACTIONS: Record<string, number> = { '¼': 0.25, '⅓': 1 / 3, '½': 0.5, '⅔': 2 / 3, '¾': 0.75 };
const NICE: [number, string][] = [[0, ''], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, '']];

/** 1.5 → "1½", 0.333 → "⅓": the nearest amount you'd actually measure. */
export function niceAmount(n: number, wholeOnly = false): string {
  if (wholeOnly) return String(Math.max(1, Math.round(n)));
  let whole = Math.floor(n);
  const [frac, sym] = NICE.reduce((best, c) => (Math.abs(n - whole - c[0]) < Math.abs(n - whole - best[0]) ? c : best));
  if (frac === 1) whole += 1;
  if (!whole && !sym) return '¼';
  return `${whole || ''}${sym}`;
}

/** Grams the way you'd weigh them: whole grams up to 100, then the nearest 5. */
export function roundGrams(g: number): number {
  return g < 100 ? Math.max(1, Math.round(g)) : Math.round(g / 5) * 5;
}

const AMOUNT = /(\d+(?:\.\d+)?)?([¼⅓½⅔¾])?(?=\s)/g;
const SINGULAR: Record<string, string> = { cups: 'cup', slices: 'slice', eggs: 'egg', spears: 'spear', cloves: 'clove', leaves: 'leaf' };
const PLURAL = Object.fromEntries(Object.entries(SINGULAR).map(([p, s]) => [s, p]));

/** Multiplies every amount in an ingredient line, e.g. "2 tbsp salsa" × 1.5 → "3 tbsp salsa". Eggs stay whole. */
export function scaleIngredient(line: string, factor: number): string {
  if (factor === 1) return line;
  return line.replace(AMOUNT, (m, num: string | undefined, frac: string | undefined, offset: number) => {
    if (!num && !frac) return m;
    // Leave things like "93% lean" alone.
    if (line[offset + m.length] === '%') return m;
    const value = (num ? parseFloat(num) : 0) + (frac ? FRACTIONS[frac] : 0);
    const next = line.slice(offset + m.length).trim().split(/[\s,(]/)[0].toLowerCase();
    const isEgg = next === 'egg' || next === 'eggs' || /^hard-boiled egg/.test(line.slice(offset + m.length).trim());
    if (next === 'g') return String(roundGrams(value * factor));
    return niceAmount(value * factor, isEgg);
  }).replace(/(^|[+,]\s*)([\d¼⅓½⅔¾]+)\s+(hard-boiled\s+)?(\w+)/g, (all, pre: string, amt: string, adj: string | undefined, word: string) => {
    // Keep "1 cup" / "2 cups" and "1 egg" / "2 eggs" reading right after scaling.
    const many = /^\d/.test(amt) && amt !== '1';
    const lower = word.toLowerCase();
    const fixed = many ? PLURAL[lower] : SINGULAR[lower];
    return fixed ? `${pre}${amt} ${adj ?? ''}${fixed}` : all;
  });
}
