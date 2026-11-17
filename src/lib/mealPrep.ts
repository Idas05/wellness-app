import AsyncStorage from '@react-native-async-storage/async-storage';
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
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as DietPrefs) : null;
  } catch {
    return null;
  }
}

export async function savePrefs(p: DietPrefs): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(p));
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

export function portionText(n: number): string {
  const whole = Math.floor(n);
  const frac = ({ 0.25: '¼', 0.5: '½', 0.75: '¾' } as Record<number, string>)[n - whole] ?? '';
  return `${whole || ''}${frac} serving${n > 1 ? 's' : ''}`;
}
