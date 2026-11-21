# Recipe generator

`src/lib/recipeLibraryMore.ts` is generated from these files. Each recipe lists ingredients by weight; calories,
protein, carbs and fat are added up from `ingredients.py` (per 100 g), and meats and allergens come from the
ingredients' tags, so the diet and allergy filters always match what's in the recipe.

To add recipes, edit an `r_*.py` file, then from the repo root run:

    python3 scripts/recipes/build.py scripts/recipes src/lib/recipeLibrary.ts src/lib/recipeLibraryMore.ts
