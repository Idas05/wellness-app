import { syncedLoad, syncedSave } from './cloudKv';
import { scaleMacros, sumMacros, type Macros } from './macros';

/** m: protein, carbs and fat, when the ingredient came from food search (typed-in ones only have calories). */
export type Ingredient = { id: string; name: string; amount: string; cal: number; m?: Macros };
export type Recipe = { id: string; name: string; servings: number; ingredients: Ingredient[]; updatedAt: string };

const KEY = 'wellness.recipes.v1';

export const recipeTotal = (r: Pick<Recipe, 'ingredients'>) => r.ingredients.reduce((s, i) => s + i.cal, 0);
export const perServing = (r: Pick<Recipe, 'ingredients' | 'servings'>) => Math.round(recipeTotal(r) / Math.max(1, r.servings));
/** Protein, carbs and fat in one serving, from the ingredients that have them. */
export const macrosPerServing = (r: Pick<Recipe, 'ingredients' | 'servings'>): Macros | undefined =>
  r.ingredients.some((i) => i.m) ? scaleMacros(sumMacros(r.ingredients.map((i) => i.m ?? {})), 1 / Math.max(1, r.servings)) : undefined;

/** Both sides' recipes; when the same one was edited on both, the newer edit wins. */
function mergeRecipes(local: Recipe[], remote: Recipe[]): Recipe[] {
  const byId = new Map<string, Recipe>();
  for (const r of [...remote, ...local]) {
    const had = byId.get(r.id);
    if (!had || r.updatedAt > had.updatedAt) byId.set(r.id, r);
  }
  return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function loadRecipes(): Promise<Recipe[]> {
  return syncedLoad<Recipe[]>(KEY, [], mergeRecipes);
}

export async function saveRecipe(r: Recipe): Promise<void> {
  const list = (await loadRecipes()).filter((x) => x.id !== r.id);
  await syncedSave(KEY, [r, ...list]);
}

export async function deleteRecipe(id: string): Promise<void> {
  const list = (await loadRecipes()).filter((x) => x.id !== id);
  await syncedSave(KEY, list);
}
