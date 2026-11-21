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

/** When each meal ends (24-hour clock). Calories a meal didn't use by then move to the next meal. */
export const MEAL_CUTOFF: Record<MealId, number | null> = { breakfast: 11, lunch: 15, dinner: 23, snack: null };
const MEAL_ORDER: MealId[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const hourOf = (d: Date) => d.getHours() + d.getMinutes() / 60;

/** The meal coming up, going by the clock. */
export function mealNow(d = new Date()): MealId {
  const h = hourOf(d);
  if (h >= 4 && h < MEAL_CUTOFF.breakfast!) return 'breakfast';
  if (h >= MEAL_CUTOFF.breakfast! && h < MEAL_CUTOFF.lunch!) return 'lunch';
  if (h >= MEAL_CUTOFF.lunch! && h < MEAL_CUTOFF.dinner!) return 'dinner';
  return 'snack';
}

/** "11 AM", "3 PM", "11 PM". */
export function cutoffLabel(h: number): string {
  return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
}

export type Budget = {
  /** This meal's own share of the day. */
  share: number;
  /** Calories moved in from earlier meals that are over, and which meals they came from. */
  carried: number;
  carriedFrom: MealId[];
  /** The meal's cutoff has passed: what it didn't use has moved on to `movedTo`. */
  closed: boolean;
  movedOut: number;
  movedTo: MealId | null;
  logged: number;
  leftToday: number;
  target: number;
  /** What recipes are sized to: the target, but at most ~1.6× the meal's share, since one plate can't hold a whole day. */
  recipeTarget: number;
  light: boolean;
};

const MAX_PLATE = 1.6;

/**
 * Calories this meal should come to: its share of the goal, plus whatever earlier meals didn't use before
 * their cutoff, less what's already logged for it, and never more than what's left today.
 */
export function mealBudget(daily: number, meal: MealId, loggedByMeal: Record<MealId, number>, eatenToday: number, now = new Date()): Budget {
  const h = hourOf(now);
  const leftToday = daily - eatenToday;
  let carried = 0;
  let carriedFrom: MealId[] = [];
  for (const [i, m] of MEAL_ORDER.entries()) {
    const share = Math.round(daily * MEAL_SHARE[m]);
    const logged = loggedByMeal[m] ?? 0;
    const unused = share + carried - logged;
    const cutoff = MEAL_CUTOFF[m];
    const closed = cutoff != null && h >= cutoff && h >= 4;
    if (m === meal) {
      // Below this there's no real meal left in the budget; suggest something light instead.
      const floor = meal === 'snack' ? 100 : 200;
      const raw = closed ? 0 : Math.min(unused, leftToday);
      return {
        share,
        carried,
        carriedFrom,
        closed,
        movedOut: closed ? Math.max(0, Math.round(unused)) : 0,
        movedTo: closed ? MEAL_ORDER[i + 1] : null,
        logged,
        leftToday,
        target: Math.max(Math.round(raw), floor),
        recipeTarget: Math.min(Math.max(Math.round(raw), floor), Math.round((share * MAX_PLATE) / 10) * 10),
        light: raw < floor,
      };
    }
    if (!closed) {
      carried = 0;
      carriedFrom = [];
    } else if (unused > 0) {
      carried = unused;
      carriedFrom = [...carriedFrom, m];
    } else {
      // Went over: nothing to pass on, and the next meal keeps its own share.
      carried = 0;
      carriedFrom = [];
    }
  }
  throw new Error(`unknown meal ${meal}`);
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

const DAY_MS = 24 * 60 * 60 * 1000;
/** A recipe you logged stays out of Meal Prep for this long. */
export const LOGGED_BREAK_DAYS = 7;

/** When each recipe was last on screen (ms), across all meals. Synced, so the phone and website don't repeat each other. */
export type Shown = Record<string, number>;
const SHOWN_KEY = 'wellness.mealPrepShown.v2';
/** When each recipe was last logged from Meal Prep (ms). Synced. */
const LOGGED_KEY = 'wellness.mealPrepLogged.v1';

/** Two devices' maps join by keeping the later time for each recipe, and old entries are dropped. */
function mergeTimes(a: Record<string, number>, b: Record<string, number>, keepDays: number): Record<string, number> {
  const cutoff = Date.now() - keepDays * DAY_MS;
  const out: Record<string, number> = {};
  for (const src of [a, b]) for (const [id, t] of Object.entries(src ?? {})) if (typeof t === 'number' && t > cutoff && t > (out[id] ?? 0)) out[id] = t;
  return out;
}

// Stamps made this session, kept in memory too, so two quick saves can't overwrite each other's stamps.
let sessionShown: Shown = {};

export async function loadSeen(): Promise<Shown> {
  const saved = await syncedLoad<Shown>(SHOWN_KEY, {}, (local, remote) => mergeTimes(local, remote, 60));
  return mergeTimes(saved, sessionShown, 60);
}

/** Stamps what's on screen now, so it goes to the back of the line for every meal. */
export async function markSeen(ids: string[]): Promise<void> {
  const now = Date.now();
  sessionShown = mergeTimes(sessionShown, Object.fromEntries(ids.map((id) => [id, now])), 60);
  await syncedSave(SHOWN_KEY, await loadSeen());
}

export async function loadLogged(): Promise<Record<string, number>> {
  return syncedLoad<Record<string, number>>(LOGGED_KEY, {}, (local, remote) => mergeTimes(local, remote, LOGGED_BREAK_DAYS + 1));
}

export async function markLogged(id: string): Promise<void> {
  const logged = await loadLogged();
  await syncedSave(LOGGED_KEY, mergeTimes(logged, { [id]: Date.now() }, LOGGED_BREAK_DAYS + 1));
}

/** Recipe ids logged within the last week, from Meal Prep's own record plus food entries named after a recipe. */
export function onBreak(logged: Record<string, number>, recentFoodNames: string[], all: LibraryRecipe[]): Set<string> {
  const cutoff = Date.now() - LOGGED_BREAK_DAYS * DAY_MS;
  const out = new Set(Object.entries(logged).filter(([, t]) => t > cutoff).map(([id]) => id));
  for (const r of all) if (recentFoodNames.some((n) => n === r.name || n.startsWith(`${r.name} ·`))) out.add(r.id);
  return out;
}

/** Never-shown recipes first, then the ones shown longest ago; ties in a random mix. What you saw last visit goes last. */
export function freshFirst(matches: Suggestion[], shown: Shown = {}): Suggestion[] {
  return shuffle(matches).sort((a, b) => (shown[a.recipe.id] ?? 0) - (shown[b.recipe.id] ?? 0));
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
