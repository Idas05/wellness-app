import AsyncStorage from '@react-native-async-storage/async-storage';

export type Ingredient = { id: string; name: string; amount: string; cal: number };
export type Recipe = { id: string; name: string; servings: number; ingredients: Ingredient[]; updatedAt: string };

const KEY = 'wellness.recipes.v1';

export const recipeTotal = (r: Pick<Recipe, 'ingredients'>) => r.ingredients.reduce((s, i) => s + i.cal, 0);
export const perServing = (r: Pick<Recipe, 'ingredients' | 'servings'>) => Math.round(recipeTotal(r) / Math.max(1, r.servings));

export async function loadRecipes(): Promise<Recipe[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Recipe[]) : [];
  } catch {
    return [];
  }
}

export async function saveRecipe(r: Recipe): Promise<void> {
  const list = (await loadRecipes()).filter((x) => x.id !== r.id);
  await AsyncStorage.setItem(KEY, JSON.stringify([r, ...list]));
}

export async function deleteRecipe(id: string): Promise<void> {
  const list = (await loadRecipes()).filter((x) => x.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}
