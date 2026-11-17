import type { AllergenId } from './mealPrep';
import type { MealId } from './nutrition';

type Meat = 'chicken' | 'turkey' | 'beef' | 'pork' | 'lamb' | 'fish' | 'shellfish';

export type LibraryRecipe = {
  id: string;
  name: string;
  meals: MealId[];
  /** Calories and protein for one serving, which is what the ingredients make. */
  cal: number;
  protein: number;
  mins: number;
  meats: Meat[];
  contains: AllergenId[];
  honey?: boolean;
  ingredients: string[];
  steps: string[];
};

const B: MealId[] = ['breakfast'];
const L: MealId[] = ['lunch'];
const D: MealId[] = ['dinner'];
const LD: MealId[] = ['lunch', 'dinner'];
const S: MealId[] = ['snack'];

/**
 * Built-in recipes, one serving each, with calories worked out from standard nutrition values.
 * Tagged by meat and the nine major allergens so diets and allergies can be filtered reliably.
 */
export const RECIPE_LIBRARY: LibraryRecipe[] = [
  // ---- Breakfast ----
  {
    id: 'yogurt-parfait', name: 'Greek yogurt berry parfait', meals: B, cal: 330, protein: 25, mins: 5, meats: [], contains: ['milk'], honey: true,
    ingredients: ['1 cup nonfat Greek yogurt', '¾ cup mixed berries', '¼ cup granola (gluten-free if needed)', '1 tsp honey'],
    steps: ['Spoon half the yogurt into a glass or jar.', 'Add half the berries and granola, then repeat the layers.', 'Drizzle with honey. Keeps 2 days in the fridge without the granola.'],
  },
  {
    id: 'veggie-scramble', name: 'Veggie egg scramble with toast', meals: B, cal: 360, protein: 24, mins: 10, meats: [], contains: ['egg', 'gluten'],
    ingredients: ['3 eggs', '1 cup spinach', '½ bell pepper, diced', 'Olive oil spray', '1 slice whole-wheat toast', 'Salt and pepper'],
    steps: ['Spray a pan and soften the pepper for 2 minutes over medium heat.', 'Add spinach until wilted.', 'Pour in the beaten eggs and stir gently until just set.', 'Serve with the toast.'],
  },
  {
    id: 'pb-overnight-oats', name: 'Peanut butter banana overnight oats', meals: B, cal: 430, protein: 17, mins: 5, meats: [], contains: ['milk', 'peanut'],
    ingredients: ['½ cup rolled oats (certified gluten-free if needed)', '¾ cup low-fat milk', '1 tbsp peanut butter', '½ banana, sliced', '1 tsp chia seeds', 'Pinch of cinnamon'],
    steps: ['Stir oats, milk, chia and cinnamon together in a jar.', 'Swirl in the peanut butter.', 'Refrigerate overnight and top with banana in the morning.'],
  },
  {
    id: 'tofu-burrito', name: 'Tofu scramble breakfast burrito', meals: B, cal: 450, protein: 24, mins: 15, meats: [], contains: ['soy', 'gluten'],
    ingredients: ['5 oz firm tofu, crumbled', '¼ cup black beans', '2 tbsp salsa', '¼ tsp turmeric', '1 large whole-wheat tortilla', 'Handful of spinach'],
    steps: ['Cook the crumbled tofu with turmeric in a nonstick pan for 5 minutes.', 'Add beans and spinach and heat through.', 'Fill the tortilla, add salsa and roll up. Wrap in foil to meal prep.'],
  },
  {
    id: 'avocado-egg-toast', name: 'Avocado toast with eggs', meals: B, cal: 420, protein: 19, mins: 10, meats: [], contains: ['gluten', 'egg'],
    ingredients: ['2 slices whole-grain bread', '½ avocado', '2 eggs', 'Chili flakes, lemon, salt'],
    steps: ['Toast the bread.', 'Mash avocado with lemon and salt and spread on the toast.', 'Fry or poach the eggs and set on top. Finish with chili flakes.'],
  },
  {
    id: 'banana-pancakes', name: 'Banana oat protein pancakes', meals: B, cal: 330, protein: 16, mins: 15, meats: [], contains: ['egg'],
    ingredients: ['1 ripe banana', '2 eggs', '⅓ cup rolled oats', '½ tsp cinnamon', '¼ tsp baking powder'],
    steps: ['Blend everything until smooth.', 'Cook small pancakes in a lightly oiled pan, about 2 minutes a side.', 'Top with berries. Freeze extras between parchment.'],
  },
  {
    id: 'turkey-egg-muffin', name: 'Turkey sausage egg muffin', meals: B, cal: 390, protein: 27, mins: 10, meats: ['turkey'], contains: ['gluten', 'egg', 'milk'],
    ingredients: ['1 whole-wheat English muffin', '1 egg', '1 turkey sausage patty', '1 slice cheddar'],
    steps: ['Toast the muffin and cook the sausage patty.', 'Fry the egg in the same pan.', 'Stack sausage, egg and cheese in the muffin.'],
  },
  {
    id: 'mango-chia', name: 'Mango chia pudding', meals: B, cal: 300, protein: 8, mins: 5, meats: [], contains: [],
    ingredients: ['3 tbsp chia seeds', '¾ cup oat milk', '½ cup diced mango', '½ tsp vanilla'],
    steps: ['Whisk chia, oat milk and vanilla in a jar.', 'Stir again after 5 minutes, then refrigerate overnight.', 'Top with mango.'],
  },
  {
    id: 'salmon-bagel', name: 'Smoked salmon bagel', meals: B, cal: 330, protein: 20, mins: 5, meats: ['fish'], contains: ['gluten', 'milk', 'fish'],
    ingredients: ['1 whole-wheat bagel thin', '2 tbsp light cream cheese', '2 oz smoked salmon', 'Cucumber slices, capers, red onion'],
    steps: ['Toast the bagel thin.', 'Spread cream cheese on both halves.', 'Layer salmon, cucumber, onion and capers.'],
  },
  {
    id: 'cottage-pineapple', name: 'Cottage cheese pineapple bowl', meals: B, cal: 280, protein: 28, mins: 3, meats: [], contains: ['milk', 'treenut'],
    ingredients: ['1 cup low-fat cottage cheese', '½ cup pineapple chunks', '1 tbsp chopped walnuts'],
    steps: ['Spoon cottage cheese into a bowl.', 'Top with pineapple and walnuts.'],
  },
  {
    id: 'spinach-feta-omelet', name: 'Spinach and feta omelet', meals: B, cal: 320, protein: 23, mins: 10, meats: [], contains: ['egg', 'milk'],
    ingredients: ['3 eggs', '1 cup spinach', '1 oz feta', 'Olive oil spray'],
    steps: ['Wilt the spinach in a sprayed pan and set aside.', 'Pour in beaten eggs and let them set at the edges.', 'Add spinach and feta to one half, fold and cook 1 more minute.'],
  },
  {
    id: 'pb-smoothie', name: 'Peanut butter banana smoothie', meals: B, cal: 420, protein: 18, mins: 5, meats: [], contains: ['milk', 'peanut'],
    ingredients: ['1 banana (frozen is best)', '1 tbsp peanut butter', '1 cup low-fat milk', '¼ cup rolled oats', 'Ice'],
    steps: ['Blend everything until smooth.'],
  },
  {
    id: 'chicken-sausage-hash', name: 'Chicken sausage and potato hash', meals: B, cal: 450, protein: 26, mins: 25, meats: ['chicken'], contains: ['egg'],
    ingredients: ['1 small potato, diced', '1 chicken sausage, sliced', '½ bell pepper and ¼ onion, diced', '1 egg', '1 tsp olive oil', 'Paprika, salt'],
    steps: ['Microwave the diced potato 3 minutes to par-cook.', 'Brown potato, pepper and onion in the oil with paprika for 8 minutes.', 'Add sausage until browned, then fry the egg on top.'],
  },
  {
    id: 'berry-smoothie-bowl', name: 'Berry smoothie bowl', meals: B, cal: 360, protein: 14, mins: 5, meats: [], contains: ['soy'],
    ingredients: ['1 cup frozen mixed berries', '½ frozen banana', '½ cup soy milk', '1 tbsp pumpkin seeds', '2 tbsp rolled oats'],
    steps: ['Blend berries, banana and soy milk until thick.', 'Pour into a bowl and top with seeds and oats.'],
  },
  {
    id: 'shakshuka', name: 'Shakshuka with pita', meals: B, cal: 380, protein: 18, mins: 20, meats: [], contains: ['egg', 'gluten'],
    ingredients: ['2 eggs', '1 cup crushed tomatoes', '¼ onion and ½ bell pepper, diced', '1 tsp olive oil', '½ tsp cumin and paprika', '½ whole-wheat pita'],
    steps: ['Soften onion and pepper in the oil, add spices.', 'Add tomatoes and simmer 5 minutes.', 'Make two wells, crack in the eggs, cover and cook until set.', 'Serve with warm pita.'],
  },
  {
    id: 'huevos-rancheros', name: 'Huevos rancheros', meals: B, cal: 450, protein: 20, mins: 15, meats: [], contains: ['egg'],
    ingredients: ['2 corn tortillas', '2 eggs', '½ cup black beans', '3 tbsp salsa', '¼ avocado'],
    steps: ['Warm the tortillas and beans.', 'Fry the eggs.', 'Top tortillas with beans, eggs, salsa and avocado.'],
  },

  {
    id: 'pb-oatmeal', name: 'Peanut butter banana oatmeal', meals: B, cal: 400, protein: 12, mins: 8, meats: [], contains: ['peanut'],
    ingredients: ['½ cup rolled oats (certified gluten-free if needed)', '1 cup water', '1 tbsp peanut butter', '½ banana, sliced', 'Cinnamon'],
    steps: ['Simmer oats in water for 5 minutes, stirring.', 'Stir in peanut butter and cinnamon.', 'Top with banana.'],
  },
  {
    id: 'apple-oatmeal', name: 'Apple cinnamon oatmeal', meals: B, cal: 350, protein: 12, mins: 10, meats: [], contains: [],
    ingredients: ['½ cup rolled oats (certified gluten-free if needed)', '1 cup oat milk', '½ apple, diced', '1 tbsp pumpkin seeds', '1 tsp maple syrup', 'Cinnamon'],
    steps: ['Simmer oats, oat milk and apple for 6 minutes.', 'Add cinnamon and maple syrup.', 'Top with pumpkin seeds. Make 4 jars at once and reheat.'],
  },
  {
    id: 'sweet-potato-hash', name: 'Sweet potato black bean hash', meals: B, cal: 380, protein: 13, mins: 20, meats: [], contains: [],
    ingredients: ['1 small sweet potato, diced', '½ cup black beans', '¼ onion and ½ bell pepper, diced', '2 tsp olive oil', 'Cumin, smoked paprika', '2 tbsp salsa'],
    steps: ['Cook sweet potato in the oil, covered, for 8 minutes.', 'Add onion, pepper and spices and cook 5 more minutes.', 'Stir in beans and top with salsa.'],
  },
  {
    id: 'chickpea-omelet', name: 'Chickpea flour veggie omelet', meals: B, cal: 320, protein: 16, mins: 15, meats: [], contains: [],
    ingredients: ['½ cup chickpea flour', '½ cup water', 'Pinch of turmeric, salt, black salt if you have it', '½ cup spinach and mushrooms', '1 tsp olive oil'],
    steps: ['Whisk flour, water and spices into a batter and rest 5 minutes.', 'Sauté the vegetables in the oil.', 'Pour the batter over, cook 4 minutes, flip and cook 2 more.'],
  },
  {
    id: 'white-bean-toast', name: 'White bean avocado toast', meals: B, cal: 400, protein: 15, mins: 5, meats: [], contains: ['gluten'],
    ingredients: ['2 slices whole-grain bread', '¼ avocado', '½ cup white beans', 'Lemon, chili flakes, salt'],
    steps: ['Toast the bread.', 'Mash beans and avocado with lemon and salt.', 'Spread on toast and finish with chili flakes.'],
  },

  // ---- Lunch and dinner ----
  {
    id: 'lentil-quinoa-salad', name: 'Lentil quinoa salad', meals: LD, cal: 450, protein: 20, mins: 25, meats: [], contains: [],
    ingredients: ['½ cup cooked lentils', '½ cup cooked quinoa', 'Cucumber, cherry tomatoes, red onion', '1 tbsp olive oil + lemon juice', 'Parsley, mint'],
    steps: ['Cook lentils and quinoa (or use leftovers) and cool.', 'Chop the vegetables and herbs.', 'Toss everything with oil and lemon. Keeps 4 days.'],
  },
  {
    id: 'stuffed-sweet-potato', name: 'Black bean stuffed sweet potato', meals: LD, cal: 480, protein: 16, mins: 15, meats: [], contains: [],
    ingredients: ['1 large sweet potato', '½ cup black beans', '¼ cup corn', '3 tbsp salsa', '¼ avocado', 'Cumin, lime'],
    steps: ['Microwave the sweet potato 6 to 8 minutes until soft.', 'Warm beans and corn with cumin.', 'Split the potato, fill and top with salsa, avocado and lime.'],
  },
  {
    id: 'three-bean-chili', name: 'Three-bean veggie chili', meals: LD, cal: 420, protein: 20, mins: 35, meats: [], contains: [],
    ingredients: ['⅓ cup each kidney, black and pinto beans', '¾ cup crushed tomatoes', '¼ onion and ½ bell pepper, diced', '1 tsp olive oil', 'Chili powder, cumin, garlic'],
    steps: ['Soften onion and pepper in the oil.', 'Add spices, tomatoes and beans.', 'Simmer 20 minutes. Freezes well.'],
  },
  {
    id: 'chickpea-tray-bake', name: 'Roasted veggie and chickpea tray bake', meals: LD, cal: 480, protein: 17, mins: 35, meats: [], contains: [],
    ingredients: ['¾ cup chickpeas', '1 cup cauliflower', '1 small zucchini and ½ red onion', '1 tbsp olive oil', 'Cumin, paprika, garlic', 'Lemon'],
    steps: ['Toss everything with the oil and spices on a tray.', 'Roast at 425 °F for 25 minutes.', 'Finish with lemon.'],
  },
  {
    id: 'minestrone', name: 'Minestrone soup', meals: LD, cal: 340, protein: 13, mins: 35, meats: [], contains: ['gluten'],
    ingredients: ['½ cup cannellini beans', '1 oz small pasta', '1 carrot, 1 celery stalk, ½ zucchini, diced', '¾ cup crushed tomatoes', '2 cups vegetable broth', '1 tsp olive oil, Italian herbs'],
    steps: ['Soften the vegetables in the oil.', 'Add tomatoes, broth and herbs and simmer 15 minutes.', 'Add pasta and beans and cook 10 more minutes.'],
  },
  {
    id: 'grilled-chicken-salad', name: 'Grilled chicken salad', meals: L, cal: 380, protein: 42, mins: 20, meats: ['chicken'], contains: [],
    ingredients: ['5 oz chicken breast', '3 cups mixed greens', '½ cup cherry tomatoes', '½ cucumber', '1 tbsp olive oil + 1 tbsp red wine vinegar', 'Salt, pepper, oregano'],
    steps: ['Season and grill the chicken 6 to 7 minutes a side, then slice.', 'Toss the vegetables with oil and vinegar.', 'Top with chicken. Pack the dressing separately for meal prep.'],
  },
  {
    id: 'turkey-hummus-wrap', name: 'Turkey hummus wrap', meals: L, cal: 420, protein: 34, mins: 5, meats: ['turkey'], contains: ['gluten', 'sesame'],
    ingredients: ['1 large whole-wheat tortilla', '4 oz sliced turkey breast', '2 tbsp hummus', 'Lettuce, tomato, cucumber'],
    steps: ['Spread hummus over the tortilla.', 'Layer turkey and vegetables.', 'Roll tightly and cut in half.'],
  },
  {
    id: 'chickpea-quinoa-bowl', name: 'Chickpea quinoa bowl with tahini', meals: LD, cal: 520, protein: 19, mins: 20, meats: [], contains: ['sesame'],
    ingredients: ['¾ cup cooked quinoa', '½ cup chickpeas', 'Cucumber, tomato, red onion', '1 tbsp tahini + lemon + water', 'Parsley'],
    steps: ['Cook the quinoa (or use leftover).', 'Chop the vegetables.', 'Whisk tahini with lemon and a splash of water.', 'Assemble and drizzle with the sauce.'],
  },
  {
    id: 'tuna-lettuce-wraps', name: 'Tuna salad lettuce wraps', meals: L, cal: 250, protein: 35, mins: 5, meats: ['fish'], contains: ['fish', 'milk'],
    ingredients: ['1 can light tuna, drained', '2 tbsp plain Greek yogurt', '1 celery stalk, diced', '1 tsp Dijon mustard', '4 large lettuce leaves'],
    steps: ['Mix tuna, yogurt, celery and mustard.', 'Spoon into lettuce leaves and wrap.'],
  },
  {
    id: 'black-bean-bowl', name: 'Black bean burrito bowl', meals: LD, cal: 540, protein: 17, mins: 15, meats: [], contains: [],
    ingredients: ['¾ cup cooked rice', '¾ cup black beans', '½ cup corn', '3 tbsp salsa', '¼ avocado', 'Lime, cumin'],
    steps: ['Warm the beans with cumin.', 'Layer rice, beans and corn.', 'Top with salsa, avocado and lime.'],
  },
  {
    id: 'chicken-burrito-bowl', name: 'Chicken burrito bowl', meals: LD, cal: 600, protein: 48, mins: 25, meats: ['chicken'], contains: [],
    ingredients: ['5 oz chicken breast', '¾ cup cooked rice', '½ cup black beans', '3 tbsp salsa', 'Shredded lettuce', 'Chili powder, cumin, lime'],
    steps: ['Season the chicken with chili powder and cumin, cook 6 to 7 minutes a side and slice.', 'Warm the beans.', 'Build bowls with rice, beans, chicken, lettuce and salsa.'],
  },
  {
    id: 'lentil-soup', name: 'Hearty lentil soup', meals: LD, cal: 360, protein: 20, mins: 35, meats: [], contains: [],
    ingredients: ['½ cup dry lentils', '1 carrot, 1 celery stalk, ¼ onion, diced', '½ cup diced tomatoes', '2 cups vegetable broth', '1 tsp olive oil', 'Cumin, thyme'],
    steps: ['Soften the vegetables in the oil for 5 minutes.', 'Add lentils, tomatoes, broth and spices.', 'Simmer 25 minutes until the lentils are tender. Freezes well.'],
  },
  {
    id: 'caprese-sandwich', name: 'Caprese sandwich', meals: L, cal: 480, protein: 20, mins: 5, meats: [], contains: ['gluten', 'milk'],
    ingredients: ['1 small ciabatta roll', '2 oz fresh mozzarella', '1 tomato, sliced', 'Fresh basil', '1 tsp balsamic glaze'],
    steps: ['Slice the roll and layer mozzarella, tomato and basil.', 'Drizzle with balsamic.'],
  },
  {
    id: 'shrimp-avocado-salad', name: 'Shrimp avocado salad', meals: L, cal: 340, protein: 32, mins: 10, meats: ['shellfish'], contains: ['shellfish'],
    ingredients: ['5 oz cooked shrimp', '½ avocado', '2 cups greens', 'Cherry tomatoes', 'Lime juice, cilantro'],
    steps: ['Toss shrimp with lime and cilantro.', 'Arrange over greens with avocado and tomatoes.'],
  },
  {
    id: 'beef-stir-fry', name: 'Beef and veggie stir-fry', meals: LD, cal: 560, protein: 40, mins: 20, meats: ['beef'], contains: ['soy', 'gluten'],
    ingredients: ['5 oz lean sirloin, sliced thin', '1 cup broccoli', '½ bell pepper', '1 tbsp soy sauce (or tamari for gluten-free)', '1 tsp oil, garlic, ginger', '¾ cup cooked rice'],
    steps: ['Sear the beef in hot oil for 2 minutes and set aside.', 'Stir-fry the vegetables with garlic and ginger for 4 minutes.', 'Return the beef, add soy sauce and toss. Serve over rice.'],
  },
  {
    id: 'teriyaki-tofu-bowl', name: 'Teriyaki tofu bowl', meals: LD, cal: 520, protein: 24, mins: 25, meats: [], contains: ['soy', 'gluten', 'sesame'],
    ingredients: ['6 oz firm tofu, cubed', '1 cup broccoli', '¾ cup cooked rice', '2 tbsp teriyaki sauce', '1 tsp sesame seeds'],
    steps: ['Pan-fry or air-fry the tofu until golden, about 12 minutes.', 'Steam the broccoli.', 'Toss tofu in teriyaki and serve over rice with broccoli and sesame.'],
  },
  {
    id: 'med-salmon-salad', name: 'Mediterranean salmon salad', meals: LD, cal: 470, protein: 38, mins: 20, meats: ['fish'], contains: ['fish', 'milk'],
    ingredients: ['5 oz salmon fillet', '3 cups greens', '6 olives', '½ cucumber', '1 oz feta', 'Lemon juice, oregano'],
    steps: ['Bake the salmon at 400 °F for 12 minutes.', 'Toss the salad with lemon and oregano.', 'Top with flaked salmon and feta.'],
  },
  {
    id: 'egg-salad-sandwich', name: 'Greek yogurt egg salad sandwich', meals: L, cal: 390, protein: 22, mins: 15, meats: [], contains: ['egg', 'milk', 'gluten'],
    ingredients: ['2 hard-boiled eggs', '2 tbsp plain Greek yogurt', '1 tsp mustard', '2 slices whole-wheat bread', 'Lettuce'],
    steps: ['Chop the eggs and mix with yogurt and mustard.', 'Spread on bread with lettuce.'],
  },
  {
    id: 'chicken-caesar-wrap', name: 'Chicken caesar wrap', meals: L, cal: 480, protein: 38, mins: 10, meats: ['chicken'], contains: ['gluten', 'milk', 'egg', 'fish'],
    ingredients: ['4 oz cooked chicken breast', '1 large tortilla', '2 cups chopped romaine', '1 tbsp parmesan', '1½ tbsp light caesar dressing'],
    steps: ['Toss romaine with dressing and parmesan.', 'Add chicken, wrap tightly and slice.'],
  },
  {
    id: 'peanut-noodle-salad', name: 'Peanut noodle salad', meals: LD, cal: 520, protein: 18, mins: 15, meats: [], contains: ['peanut', 'soy', 'gluten'],
    ingredients: ['2 oz rice noodles', '1½ tbsp peanut butter', '1 tbsp soy sauce, 1 tsp lime, 1 tsp sriracha', '1 cup shredded cabbage and carrot', '½ cup shelled edamame'],
    steps: ['Cook and rinse the noodles under cold water.', 'Whisk peanut butter, soy, lime and sriracha with a splash of hot water.', 'Toss with noodles, vegetables and edamame. Good cold.'],
  },
  {
    id: 'turkey-chili', name: 'Turkey bean chili', meals: LD, cal: 420, protein: 36, mins: 35, meats: ['turkey'], contains: [],
    ingredients: ['4 oz lean ground turkey', '½ cup kidney beans', '¾ cup crushed tomatoes', '¼ onion, diced', '1 tsp oil', 'Chili powder, cumin, garlic'],
    steps: ['Brown the turkey and onion in the oil.', 'Add spices, tomatoes and beans.', 'Simmer 20 minutes. Freezes well in single portions.'],
  },
  {
    id: 'falafel-pita', name: 'Baked falafel pita', meals: L, cal: 520, protein: 18, mins: 25, meats: [], contains: ['gluten', 'sesame'],
    ingredients: ['4 baked falafel (store-bought or homemade)', '1 whole-wheat pita', '1 tbsp tahini', 'Lettuce, tomato, pickled onion'],
    steps: ['Bake the falafel per the package, about 15 minutes.', 'Warm the pita and fill with falafel and vegetables.', 'Drizzle with tahini thinned with lemon.'],
  },
  {
    id: 'cobb-salad', name: 'Light cobb salad', meals: L, cal: 470, protein: 42, mins: 15, meats: ['chicken'], contains: ['egg', 'milk'],
    ingredients: ['4 oz cooked chicken breast', '1 hard-boiled egg', '¼ avocado', 'Cherry tomatoes', '3 cups romaine', '2 tbsp light ranch'],
    steps: ['Chop everything into bite-size pieces.', 'Arrange in rows over romaine and add dressing.'],
  },
  {
    id: 'salmon-sweet-potato', name: 'Baked salmon, sweet potato and broccoli', meals: D, cal: 560, protein: 38, mins: 30, meats: ['fish'], contains: ['fish'],
    ingredients: ['5 oz salmon fillet', '1 medium sweet potato, cubed', '1½ cups broccoli', '2 tsp olive oil', 'Lemon, garlic, salt'],
    steps: ['Toss sweet potato with half the oil and roast at 425 °F for 15 minutes.', 'Add broccoli and salmon brushed with the rest of the oil, lemon and garlic.', 'Roast 12 more minutes.'],
  },
  {
    id: 'lemon-chicken-rice', name: 'Lemon herb chicken with rice', meals: D, cal: 550, protein: 45, mins: 30, meats: ['chicken'], contains: [],
    ingredients: ['5 oz chicken breast', '¾ cup cooked rice', '1 cup green beans', '1 tsp olive oil', 'Lemon, garlic, thyme'],
    steps: ['Marinate chicken in lemon, garlic and thyme for 10 minutes.', 'Cook in the oil 6 to 7 minutes a side.', 'Steam the green beans and serve with rice.'],
  },
  {
    id: 'turkey-meatball-pasta', name: 'Turkey meatball spaghetti', meals: D, cal: 620, protein: 42, mins: 35, meats: ['turkey'], contains: ['gluten', 'egg', 'milk'],
    ingredients: ['4 oz lean ground turkey', '1 tbsp breadcrumbs + 1 tbsp beaten egg', '2 oz whole-wheat spaghetti', '½ cup marinara', '1 tbsp parmesan'],
    steps: ['Mix turkey, breadcrumbs and egg, roll into 5 meatballs and bake at 400 °F for 18 minutes.', 'Cook the pasta.', 'Warm meatballs in marinara and serve over pasta with parmesan.'],
  },
  {
    id: 'tofu-veggie-stir-fry', name: 'Tofu veggie stir-fry with brown rice', meals: D, cal: 500, protein: 24, mins: 25, meats: [], contains: ['soy', 'gluten'],
    ingredients: ['6 oz firm tofu', '2 cups mixed stir-fry vegetables', '1 tbsp soy sauce (or tamari)', '1 tsp oil, garlic, ginger', '¾ cup cooked brown rice'],
    steps: ['Brown the cubed tofu in the oil and set aside.', 'Stir-fry vegetables with garlic and ginger.', 'Return tofu, add soy sauce and serve over rice.'],
  },
  {
    id: 'beef-tacos', name: 'Lean beef tacos', meals: D, cal: 560, protein: 35, mins: 20, meats: ['beef'], contains: ['milk'],
    ingredients: ['4 oz 93% lean ground beef', '3 corn tortillas', '1 oz shredded cheese', 'Lettuce, salsa', 'Taco seasoning'],
    steps: ['Brown the beef with taco seasoning and a splash of water.', 'Warm the tortillas.', 'Fill with beef, cheese, lettuce and salsa.'],
  },
  {
    id: 'shrimp-fajitas', name: 'Shrimp fajitas', meals: D, cal: 450, protein: 33, mins: 20, meats: ['shellfish'], contains: ['shellfish', 'gluten'],
    ingredients: ['5 oz shrimp', '1 bell pepper and ½ onion, sliced', '2 small flour tortillas', '1 tsp oil', 'Fajita seasoning, lime'],
    steps: ['Cook peppers and onion in the oil for 5 minutes.', 'Add seasoned shrimp and cook 3 minutes until pink.', 'Squeeze lime over and serve in tortillas.'],
  },
  {
    id: 'chickpea-curry', name: 'Chickpea spinach curry with rice', meals: D, cal: 560, protein: 17, mins: 25, meats: [], contains: [],
    ingredients: ['¾ cup chickpeas', '2 cups spinach', '½ cup crushed tomatoes', '¼ cup light coconut milk', '¼ onion, garlic, ginger', '1 tsp curry powder and garam masala', '¾ cup cooked basmati rice'],
    steps: ['Soften onion, garlic and ginger, then add the spices for 30 seconds.', 'Add tomatoes, coconut milk and chickpeas and simmer 10 minutes.', 'Stir in spinach until wilted. Serve over rice.'],
  },
  {
    id: 'chicken-tikka', name: 'Chicken tikka with basmati', meals: D, cal: 580, protein: 46, mins: 35, meats: ['chicken'], contains: ['milk'],
    ingredients: ['5 oz chicken breast, cubed', '3 tbsp plain yogurt', '1 tsp garam masala, cumin, paprika', '¾ cup cooked basmati rice', 'Cucumber and onion salad'],
    steps: ['Marinate chicken in yogurt and spices for at least 15 minutes.', 'Thread on skewers or spread on a tray and broil 10 to 12 minutes.', 'Serve with rice and salad.'],
  },
  {
    id: 'pork-tenderloin', name: 'Pork tenderloin with roasted potatoes', meals: D, cal: 520, protein: 40, mins: 35, meats: ['pork'], contains: [],
    ingredients: ['5 oz pork tenderloin', '1 small potato, cubed', '½ apple, sliced', '2 tsp olive oil', 'Rosemary, garlic'],
    steps: ['Toss potatoes with half the oil and roast at 425 °F for 10 minutes.', 'Rub pork with rosemary, garlic and the rest of the oil and add with the apple.', 'Roast 18 to 20 minutes until 145 °F inside. Rest 5 minutes and slice.'],
  },
  {
    id: 'lamb-kofta', name: 'Lamb kofta with tzatziki', meals: D, cal: 590, protein: 32, mins: 25, meats: ['lamb'], contains: ['milk', 'gluten'],
    ingredients: ['4 oz lean ground lamb', '¼ onion, grated', 'Cumin, coriander, parsley', '¼ cup tzatziki', '½ whole-wheat pita', 'Tomato and cucumber salad'],
    steps: ['Mix lamb, onion and spices and shape onto skewers.', 'Grill or broil 8 to 10 minutes, turning once.', 'Serve with pita, salad and tzatziki.'],
  },
  {
    id: 'stuffed-peppers', name: 'Turkey and rice stuffed peppers', meals: D, cal: 450, protein: 32, mins: 40, meats: ['turkey'], contains: [],
    ingredients: ['2 bell peppers, halved', '4 oz lean ground turkey', '⅓ cup cooked rice', '½ cup marinara', 'Italian seasoning'],
    steps: ['Brown the turkey with seasoning, then mix in rice and half the marinara.', 'Fill the pepper halves and top with the rest of the sauce.', 'Cover and bake at 375 °F for 25 minutes.'],
  },
  {
    id: 'cod-quinoa', name: 'Lemon cod with quinoa and asparagus', meals: D, cal: 430, protein: 38, mins: 25, meats: ['fish'], contains: ['fish'],
    ingredients: ['6 oz cod fillet', '¾ cup cooked quinoa', '8 asparagus spears', '2 tsp olive oil', 'Lemon, dill'],
    steps: ['Lay cod and asparagus on a tray, drizzle with oil, lemon and dill.', 'Bake at 400 °F for 12 to 14 minutes.', 'Serve over quinoa.'],
  },
  {
    id: 'bean-enchiladas', name: 'Black bean sweet potato enchiladas', meals: D, cal: 540, protein: 19, mins: 40, meats: [], contains: ['milk'],
    ingredients: ['3 corn tortillas', '½ cup black beans', '½ cup mashed sweet potato', '½ cup enchilada sauce', '1 oz shredded cheese'],
    steps: ['Mix beans and sweet potato.', 'Fill and roll the tortillas, then place in a small dish.', 'Cover with sauce and cheese and bake at 375 °F for 20 minutes.'],
  },
  {
    id: 'garlic-shrimp-pasta', name: 'Garlic shrimp spaghetti', meals: D, cal: 560, protein: 36, mins: 20, meats: ['shellfish'], contains: ['shellfish', 'gluten'],
    ingredients: ['5 oz shrimp', '2½ oz whole-wheat spaghetti', '1 tbsp olive oil', '3 garlic cloves', '2 cups spinach', 'Chili flakes, lemon'],
    steps: ['Cook the pasta.', 'Sizzle garlic and chili in the oil, add shrimp and cook 3 minutes.', 'Toss with pasta, spinach and lemon.'],
  },
  {
    id: 'sheet-pan-thighs', name: 'Sheet pan chicken thighs and veggies', meals: D, cal: 520, protein: 38, mins: 35, meats: ['chicken'], contains: [],
    ingredients: ['2 boneless skinless chicken thighs (5 oz)', '1 cup broccoli', '1 small potato, cubed', '½ red onion', '2 tsp olive oil', 'Paprika, garlic powder'],
    steps: ['Toss everything with oil and spices on a tray.', 'Roast at 425 °F for 25 minutes, flipping halfway.'],
  },
  {
    id: 'lentil-bolognese', name: 'Lentil bolognese', meals: D, cal: 520, protein: 24, mins: 30, meats: [], contains: ['gluten'],
    ingredients: ['⅓ cup dry lentils', '¾ cup marinara', '2½ oz whole-wheat pasta', '¼ onion and 1 carrot, diced', '1 tsp olive oil'],
    steps: ['Soften onion and carrot in the oil.', 'Add lentils, marinara and 1 cup water and simmer 20 minutes.', 'Serve over the cooked pasta.'],
  },
  {
    id: 'steak-potato', name: 'Sirloin, baked potato and salad', meals: D, cal: 580, protein: 42, mins: 30, meats: ['beef'], contains: [],
    ingredients: ['5 oz sirloin steak', '1 medium baked potato', '2 cups side salad', '1 tsp olive oil + vinegar', 'Salt, pepper, garlic'],
    steps: ['Microwave the potato 6 to 8 minutes until soft.', 'Sear the seasoned steak 4 minutes a side for medium and rest 5 minutes.', 'Serve with the salad.'],
  },
  {
    id: 'mushroom-risotto', name: 'Mushroom parmesan risotto', meals: D, cal: 520, protein: 14, mins: 35, meats: [], contains: ['milk'],
    ingredients: ['⅓ cup arborio rice', '1½ cups mushrooms, sliced', '2 cups hot vegetable broth', '2 tbsp parmesan', '1 tsp butter', '¼ onion'],
    steps: ['Soften the onion in the butter, add rice and stir 1 minute.', 'Add broth a ladle at a time, stirring, for about 20 minutes.', 'Brown the mushrooms separately and stir in with the parmesan.'],
  },
  {
    id: 'tofu-pad-thai', name: 'Tofu pad thai', meals: D, cal: 600, protein: 24, mins: 25, meats: [], contains: ['egg', 'peanut', 'soy', 'gluten'],
    ingredients: ['2 oz rice noodles', '4 oz firm tofu', '1 egg', '1 tbsp soy sauce + 1 tsp brown sugar + lime', '1 cup bean sprouts', '1 tbsp crushed peanuts'],
    steps: ['Soak or cook the noodles.', 'Brown the tofu, push aside and scramble the egg.', 'Add noodles, sauce and sprouts and toss 2 minutes.', 'Top with peanuts and lime.'],
  },
  {
    id: 'chicken-skewers-couscous', name: 'Chicken skewers with couscous', meals: D, cal: 520, protein: 42, mins: 25, meats: ['chicken'], contains: ['gluten'],
    ingredients: ['5 oz chicken breast, cubed', '1 bell pepper and ½ zucchini, chunked', '⅔ cup cooked couscous', '1 tsp olive oil', 'Lemon, oregano, garlic'],
    steps: ['Toss chicken and vegetables with oil, lemon and herbs.', 'Thread onto skewers and grill or broil 10 to 12 minutes.', 'Serve over couscous.'],
  },

  // ---- Snacks ----
  {
    id: 'apple-pb', name: 'Apple with peanut butter', meals: S, cal: 200, protein: 4, mins: 2, meats: [], contains: ['peanut'],
    ingredients: ['1 medium apple, sliced', '1 tbsp peanut butter'], steps: ['Slice and dip.'],
  },
  {
    id: 'hummus-veggies', name: 'Hummus and veggie sticks', meals: S, cal: 160, protein: 6, mins: 5, meats: [], contains: ['sesame'],
    ingredients: ['3 tbsp hummus', 'Carrot, cucumber and pepper sticks'], steps: ['Cut the vegetables and pack with hummus.'],
  },
  {
    id: 'yogurt-berries', name: 'Greek yogurt with berries', meals: S, cal: 150, protein: 17, mins: 2, meats: [], contains: ['milk'],
    ingredients: ['¾ cup nonfat Greek yogurt', '½ cup berries'], steps: ['Top yogurt with berries.'],
  },
  {
    id: 'boiled-eggs', name: 'Two hard-boiled eggs', meals: S, cal: 140, protein: 12, mins: 12, meats: [], contains: ['egg'],
    ingredients: ['2 eggs', 'Salt, pepper or everything seasoning'], steps: ['Boil 10 minutes, cool in ice water and peel. Keeps 5 days in the fridge.'],
  },
  {
    id: 'trail-mix', name: 'Almond trail mix', meals: S, cal: 180, protein: 5, mins: 2, meats: [], contains: ['treenut', 'milk'],
    ingredients: ['1 tbsp almonds', '1 tbsp raisins', '1 tbsp dark chocolate chips', '1 tbsp pumpkin seeds'], steps: ['Mix and portion into small bags.'],
  },
  {
    id: 'edamame', name: 'Salted edamame', meals: S, cal: 190, protein: 17, mins: 5, meats: [], contains: ['soy'],
    ingredients: ['1 cup shelled edamame', 'Sea salt'], steps: ['Microwave or boil 3 to 4 minutes and salt.'],
  },
  {
    id: 'cottage-cucumber', name: 'Cottage cheese and cucumber', meals: S, cal: 120, protein: 14, mins: 2, meats: [], contains: ['milk'],
    ingredients: ['½ cup low-fat cottage cheese', '½ cucumber, sliced', 'Black pepper'], steps: ['Top cottage cheese with cucumber and pepper.'],
  },
  {
    id: 'rice-cake-almond', name: 'Rice cakes with almond butter', meals: S, cal: 170, protein: 5, mins: 2, meats: [], contains: ['treenut'],
    ingredients: ['2 plain rice cakes', '1 tbsp almond butter'], steps: ['Spread and eat.'],
  },
  {
    id: 'roasted-chickpeas', name: 'Crispy roasted chickpeas', meals: S, cal: 180, protein: 8, mins: 30, meats: [], contains: [],
    ingredients: ['½ cup chickpeas, patted dry', '½ tsp olive oil', 'Paprika, salt'], steps: ['Toss with oil and spices.', 'Roast at 400 °F for 25 minutes, shaking once.'],
  },
  {
    id: 'cheese-grapes', name: 'String cheese and grapes', meals: S, cal: 150, protein: 7, mins: 1, meats: [], contains: ['milk'],
    ingredients: ['1 string cheese', '1 cup grapes'], steps: ['Pack together.'],
  },
  {
    id: 'turkey-rollups', name: 'Turkey pickle roll-ups', meals: S, cal: 110, protein: 18, mins: 3, meats: ['turkey'], contains: [],
    ingredients: ['3 oz sliced turkey breast', '2 pickle spears', '1 tsp mustard'], steps: ['Spread mustard on the turkey and roll around the pickles.'],
  },
  {
    id: 'tuna-crackers', name: 'Tuna on whole-grain crackers', meals: S, cal: 200, protein: 22, mins: 3, meats: ['fish'], contains: ['fish', 'gluten'],
    ingredients: ['1 small can light tuna', '6 whole-grain crackers', 'Squeeze of lemon'], steps: ['Season the tuna with lemon and pile on crackers.'],
  },
  {
    id: 'green-smoothie', name: 'Green chia smoothie', meals: S, cal: 190, protein: 9, mins: 3, meats: [], contains: ['soy'],
    ingredients: ['1 cup soy milk', '½ banana', '1 cup spinach', '1 tsp chia seeds'], steps: ['Blend until smooth.'],
  },
  {
    id: 'banana-oat-bites', name: 'Banana oat bites', meals: S, cal: 160, protein: 4, mins: 20, meats: [], contains: [],
    ingredients: ['½ ripe banana', '¼ cup rolled oats', '1 tbsp raisins', 'Cinnamon'], steps: ['Mash and mix everything, form 4 small mounds.', 'Bake at 350 °F for 15 minutes.'],
  },
];
