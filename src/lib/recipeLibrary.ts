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
  /** Grams, estimated from the ingredients and scaled so protein, carbs and fat add up to the calories. */
  carbs: number;
  fat: number;
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
    id: 'yogurt-parfait', name: 'Greek yogurt berry parfait', meals: B, cal: 330, protein: 25, carbs: 41, fat: 8, mins: 5, meats: [], contains: ['milk'], honey: true,
    ingredients: ['245 g nonfat Greek yogurt', '110 g mixed berries', '30 g granola (gluten-free if needed)', '7 g honey'],
    steps: ['Spoon half the yogurt into a glass or jar.', 'Add half the berries and granola, then repeat the layers.', 'Drizzle with honey. Keeps 2 days in the fridge without the granola.'],
  },
  {
    id: 'veggie-scramble', name: 'Veggie egg scramble with toast', meals: B, cal: 360, protein: 24, carbs: 24, fat: 19, mins: 10, meats: [], contains: ['egg', 'gluten'],
    ingredients: ['3 eggs', '30 g spinach', '60 g bell pepper, diced', 'Olive oil spray', '32 g whole-wheat bread, toasted', 'Salt and pepper'],
    steps: ['Spray a pan and soften the pepper for 2 minutes over medium heat.', 'Add spinach until wilted.', 'Pour in the beaten eggs and stir gently until just set.', 'Serve with the toast.'],
  },
  {
    id: 'pb-overnight-oats', name: 'Peanut butter banana overnight oats', meals: B, cal: 430, protein: 17, carbs: 58, fat: 15, mins: 5, meats: [], contains: ['milk', 'peanut'],
    ingredients: ['40 g rolled oats (certified gluten-free if needed)', '180 g low-fat milk', '16 g peanut butter', '60 g banana, sliced', '4 g chia seeds', 'Pinch of cinnamon'],
    steps: ['Stir oats, milk, chia and cinnamon together in a jar.', 'Swirl in the peanut butter.', 'Refrigerate overnight and top with banana in the morning.'],
  },
  {
    id: 'tofu-burrito', name: 'Tofu scramble breakfast burrito', meals: B, cal: 450, protein: 24, carbs: 48, fat: 18, mins: 15, meats: [], contains: ['soy', 'gluten'],
    ingredients: ['140 g firm tofu, crumbled', '45 g black beans', '32 g salsa', '1 g turmeric', '70 g whole-wheat tortilla', 'Handful of spinach'],
    steps: ['Cook the crumbled tofu with turmeric in a nonstick pan for 5 minutes.', 'Add beans and spinach and heat through.', 'Fill the tortilla, add salsa and roll up. Wrap in foil to meal prep.'],
  },
  {
    id: 'avocado-egg-toast', name: 'Avocado toast with eggs', meals: B, cal: 420, protein: 19, carbs: 35, fat: 23, mins: 10, meats: [], contains: ['gluten', 'egg'],
    ingredients: ['64 g whole-grain bread', '70 g avocado', '2 eggs', 'Chili flakes, lemon, salt'],
    steps: ['Toast the bread.', 'Mash avocado with lemon and salt and spread on the toast.', 'Fry or poach the eggs and set on top. Finish with chili flakes.'],
  },
  {
    id: 'banana-pancakes', name: 'Banana oat protein pancakes', meals: B, cal: 330, protein: 16, carbs: 43, fat: 11, mins: 15, meats: [], contains: ['egg'],
    ingredients: ['120 g ripe banana', '2 eggs', '27 g rolled oats', '1 g cinnamon', '1 g baking powder'],
    steps: ['Blend everything until smooth.', 'Cook small pancakes in a lightly oiled pan, about 2 minutes a side.', 'Top with berries. Freeze extras between parchment.'],
  },
  {
    id: 'turkey-egg-muffin', name: 'Turkey sausage egg muffin', meals: B, cal: 390, protein: 27, carbs: 29, fat: 18, mins: 10, meats: ['turkey'], contains: ['gluten', 'egg', 'milk'],
    ingredients: ['57 g whole-wheat English muffin', '1 egg', '40 g turkey sausage patty', '21 g cheddar'],
    steps: ['Toast the muffin and cook the sausage patty.', 'Fry the egg in the same pan.', 'Stack sausage, egg and cheese in the muffin.'],
  },
  {
    id: 'mango-chia', name: 'Mango chia pudding', meals: B, cal: 300, protein: 8, carbs: 37, fat: 13, mins: 5, meats: [], contains: [],
    ingredients: ['36 g chia seeds', '180 g oat milk', '80 g mango, diced', '2 g vanilla'],
    steps: ['Whisk chia, oat milk and vanilla in a jar.', 'Stir again after 5 minutes, then refrigerate overnight.', 'Top with mango.'],
  },
  {
    id: 'salmon-bagel', name: 'Smoked salmon bagel', meals: B, cal: 330, protein: 20, carbs: 37, fat: 11, mins: 5, meats: ['fish'], contains: ['gluten', 'milk', 'fish'],
    ingredients: ['45 g whole-wheat bagel thin', '30 g light cream cheese', '57 g smoked salmon', 'Cucumber slices, capers, red onion'],
    steps: ['Toast the bagel thin.', 'Spread cream cheese on both halves.', 'Layer salmon, cucumber, onion and capers.'],
  },
  {
    id: 'cottage-pineapple', name: 'Cottage cheese pineapple bowl', meals: B, cal: 280, protein: 28, carbs: 22, fat: 9, mins: 3, meats: [], contains: ['milk', 'treenut'],
    ingredients: ['225 g low-fat cottage cheese', '80 g pineapple chunks', '7 g walnuts, chopped'],
    steps: ['Spoon cottage cheese into a bowl.', 'Top with pineapple and walnuts.'],
  },
  {
    id: 'spinach-feta-omelet', name: 'Spinach and feta omelet', meals: B, cal: 320, protein: 23, carbs: 5, fat: 23, mins: 10, meats: [], contains: ['egg', 'milk'],
    ingredients: ['3 eggs', '30 g spinach', '28 g feta', 'Olive oil spray'],
    steps: ['Wilt the spinach in a sprayed pan and set aside.', 'Pour in beaten eggs and let them set at the edges.', 'Add spinach and feta to one half, fold and cook 1 more minute.'],
  },
  {
    id: 'pb-smoothie', name: 'Peanut butter banana smoothie', meals: B, cal: 420, protein: 18, carbs: 59, fat: 13, mins: 5, meats: [], contains: ['milk', 'peanut'],
    ingredients: ['120 g banana (frozen is best)', '16 g peanut butter', '245 g low-fat milk', '20 g rolled oats', 'Ice'],
    steps: ['Blend everything until smooth.'],
  },
  {
    id: 'chicken-sausage-hash', name: 'Chicken sausage and potato hash', meals: B, cal: 450, protein: 26, carbs: 46, fat: 18, mins: 25, meats: ['chicken'], contains: ['egg'],
    ingredients: ['150 g potato, diced', '85 g chicken sausage, sliced', '60 g bell pepper and 30 g onion, diced', '1 egg', '5 g olive oil', 'Paprika, salt'],
    steps: ['Microwave the diced potato 3 minutes to par-cook.', 'Brown potato, pepper and onion in the oil with paprika for 8 minutes.', 'Add sausage until browned, then fry the egg on top.'],
  },
  {
    id: 'berry-smoothie-bowl', name: 'Berry smoothie bowl', meals: B, cal: 360, protein: 14, carbs: 53, fat: 10, mins: 5, meats: [], contains: ['soy'],
    ingredients: ['140 g frozen mixed berries', '60 g frozen banana', '120 g soy milk', '9 g pumpkin seeds', '10 g rolled oats'],
    steps: ['Blend berries, banana and soy milk until thick.', 'Pour into a bowl and top with seeds and oats.'],
  },
  {
    id: 'shakshuka', name: 'Shakshuka with pita', meals: B, cal: 380, protein: 18, carbs: 41, fat: 16, mins: 20, meats: [], contains: ['egg', 'gluten'],
    ingredients: ['2 eggs', '240 g crushed tomatoes', '30 g onion and 60 g bell pepper, diced', '5 g olive oil', '1 g each cumin and paprika', '32 g whole-wheat pita'],
    steps: ['Soften onion and pepper in the oil, add spices.', 'Add tomatoes and simmer 5 minutes.', 'Make two wells, crack in the eggs, cover and cook until set.', 'Serve with warm pita.'],
  },
  {
    id: 'huevos-rancheros', name: 'Huevos rancheros', meals: B, cal: 450, protein: 20, carbs: 52, fat: 18, mins: 15, meats: [], contains: ['egg'],
    ingredients: ['52 g corn tortillas', '2 eggs', '85 g black beans', '48 g salsa', '35 g avocado'],
    steps: ['Warm the tortillas and beans.', 'Fry the eggs.', 'Top tortillas with beans, eggs, salsa and avocado.'],
  },

  {
    id: 'pb-oatmeal', name: 'Peanut butter banana oatmeal', meals: B, cal: 400, protein: 12, carbs: 57, fat: 14, mins: 8, meats: [], contains: ['peanut'],
    ingredients: ['40 g rolled oats (certified gluten-free if needed)', '240 g water', '16 g peanut butter', '60 g banana, sliced', 'Cinnamon'],
    steps: ['Simmer oats in water for 5 minutes, stirring.', 'Stir in peanut butter and cinnamon.', 'Top with banana.'],
  },
  {
    id: 'apple-oatmeal', name: 'Apple cinnamon oatmeal', meals: B, cal: 350, protein: 12, carbs: 54, fat: 9, mins: 10, meats: [], contains: [],
    ingredients: ['40 g rolled oats (certified gluten-free if needed)', '240 g oat milk', '90 g apple, diced', '9 g pumpkin seeds', '7 g maple syrup', 'Cinnamon'],
    steps: ['Simmer oats, oat milk and apple for 6 minutes.', 'Add cinnamon and maple syrup.', 'Top with pumpkin seeds. Make 4 jars at once and reheat.'],
  },
  {
    id: 'sweet-potato-hash', name: 'Sweet potato black bean hash', meals: B, cal: 380, protein: 13, carbs: 57, fat: 11, mins: 20, meats: [], contains: [],
    ingredients: ['130 g sweet potato, diced', '85 g black beans', '30 g onion and 60 g bell pepper, diced', '9 g olive oil', 'Cumin, smoked paprika', '32 g salsa'],
    steps: ['Cook sweet potato in the oil, covered, for 8 minutes.', 'Add onion, pepper and spices and cook 5 more minutes.', 'Stir in beans and top with salsa.'],
  },
  {
    id: 'chickpea-omelet', name: 'Chickpea flour veggie omelet', meals: B, cal: 320, protein: 16, carbs: 39, fat: 11, mins: 15, meats: [], contains: [],
    ingredients: ['46 g chickpea flour', '120 g water', 'Pinch of turmeric, salt, black salt if you have it', '15 g spinach and 35 g mushrooms', '5 g olive oil'],
    steps: ['Whisk flour, water and spices into a batter and rest 5 minutes.', 'Sauté the vegetables in the oil.', 'Pour the batter over, cook 4 minutes, flip and cook 2 more.'],
  },
  {
    id: 'white-bean-toast', name: 'White bean avocado toast', meals: B, cal: 400, protein: 15, carbs: 62, fat: 10, mins: 5, meats: [], contains: ['gluten'],
    ingredients: ['64 g whole-grain bread', '35 g avocado', '90 g white beans', 'Lemon, chili flakes, salt'],
    steps: ['Toast the bread.', 'Mash beans and avocado with lemon and salt.', 'Spread on toast and finish with chili flakes.'],
  },

  // ---- Lunch and dinner ----
  {
    id: 'lentil-quinoa-salad', name: 'Lentil quinoa salad', meals: LD, cal: 450, protein: 20, carbs: 48, fat: 20, mins: 25, meats: [], contains: [],
    ingredients: ['100 g cooked lentils', '90 g cooked quinoa', 'Cucumber, cherry tomatoes, red onion', '14 g olive oil + lemon juice', 'Parsley, mint'],
    steps: ['Cook lentils and quinoa (or use leftovers) and cool.', 'Chop the vegetables and herbs.', 'Toss everything with oil and lemon. Keeps 4 days.'],
  },
  {
    id: 'stuffed-sweet-potato', name: 'Black bean stuffed sweet potato', meals: LD, cal: 480, protein: 16, carbs: 85, fat: 9, mins: 15, meats: [], contains: [],
    ingredients: ['180 g sweet potato', '85 g black beans', '40 g corn', '48 g salsa', '35 g avocado', 'Cumin, lime'],
    steps: ['Microwave the sweet potato 6 to 8 minutes until soft.', 'Warm beans and corn with cumin.', 'Split the potato, fill and top with salsa, avocado and lime.'],
  },
  {
    id: 'three-bean-chili', name: 'Three-bean veggie chili', meals: LD, cal: 420, protein: 20, carbs: 66, fat: 9, mins: 35, meats: [], contains: [],
    ingredients: ['60 g each kidney, black and pinto beans', '180 g crushed tomatoes', '30 g onion and 60 g bell pepper, diced', '5 g olive oil', 'Chili powder, cumin, garlic'],
    steps: ['Soften onion and pepper in the oil.', 'Add spices, tomatoes and beans.', 'Simmer 20 minutes. Freezes well.'],
  },
  {
    id: 'chickpea-tray-bake', name: 'Roasted veggie and chickpea tray bake', meals: LD, cal: 480, protein: 17, carbs: 53, fat: 22, mins: 35, meats: [], contains: [],
    ingredients: ['125 g chickpeas', '100 g cauliflower', '200 g zucchini and 55 g red onion', '14 g olive oil', 'Cumin, paprika, garlic', 'Lemon'],
    steps: ['Toss everything with the oil and spices on a tray.', 'Roast at 425 °F for 25 minutes.', 'Finish with lemon.'],
  },
  {
    id: 'minestrone', name: 'Minestrone soup', meals: LD, cal: 340, protein: 13, carbs: 55, fat: 7, mins: 35, meats: [], contains: ['gluten'],
    ingredients: ['90 g cannellini beans', '28 g small pasta (dry)', '60 g carrot, 40 g celery and 100 g zucchini, diced', '180 g crushed tomatoes', '480 g vegetable broth', '5 g olive oil, Italian herbs'],
    steps: ['Soften the vegetables in the oil.', 'Add tomatoes, broth and herbs and simmer 15 minutes.', 'Add pasta and beans and cook 10 more minutes.'],
  },
  {
    id: 'grilled-chicken-salad', name: 'Grilled chicken salad', meals: L, cal: 380, protein: 42, carbs: 12, fat: 18, mins: 20, meats: ['chicken'], contains: [],
    ingredients: ['140 g chicken breast (raw)', '90 g mixed greens', '75 g cherry tomatoes', '150 g cucumber', '14 g olive oil + 15 g red wine vinegar', 'Salt, pepper, oregano'],
    steps: ['Season and grill the chicken 6 to 7 minutes a side, then slice.', 'Toss the vegetables with oil and vinegar.', 'Top with chicken. Pack the dressing separately for meal prep.'],
  },
  {
    id: 'turkey-hummus-wrap', name: 'Turkey hummus wrap', meals: L, cal: 420, protein: 34, carbs: 46, fat: 11, mins: 5, meats: ['turkey'], contains: ['gluten', 'sesame'],
    ingredients: ['70 g whole-wheat tortilla', '115 g sliced turkey breast', '30 g hummus', 'Lettuce, tomato, cucumber'],
    steps: ['Spread hummus over the tortilla.', 'Layer turkey and vegetables.', 'Roll tightly and cut in half.'],
  },
  {
    id: 'chickpea-quinoa-bowl', name: 'Chickpea quinoa bowl with tahini', meals: LD, cal: 520, protein: 19, carbs: 70, fat: 18, mins: 20, meats: [], contains: ['sesame'],
    ingredients: ['140 g cooked quinoa', '80 g chickpeas', 'Cucumber, tomato, red onion', '15 g tahini + lemon + water', 'Parsley'],
    steps: ['Cook the quinoa (or use leftover).', 'Chop the vegetables.', 'Whisk tahini with lemon and a splash of water.', 'Assemble and drizzle with the sauce.'],
  },
  {
    id: 'tuna-lettuce-wraps', name: 'Tuna salad lettuce wraps', meals: L, cal: 250, protein: 35, carbs: 12, fat: 7, mins: 5, meats: ['fish'], contains: ['fish', 'milk'],
    ingredients: ['140 g light tuna, drained', '30 g plain Greek yogurt', '40 g celery, diced', '5 g Dijon mustard', '40 g large lettuce leaves'],
    steps: ['Mix tuna, yogurt, celery and mustard.', 'Spoon into lettuce leaves and wrap.'],
  },
  {
    id: 'black-bean-bowl', name: 'Black bean burrito bowl', meals: LD, cal: 540, protein: 17, carbs: 97, fat: 9, mins: 15, meats: [], contains: [],
    ingredients: ['140 g cooked rice', '130 g black beans', '80 g corn', '48 g salsa', '35 g avocado', 'Lime, cumin'],
    steps: ['Warm the beans with cumin.', 'Layer rice, beans and corn.', 'Top with salsa, avocado and lime.'],
  },
  {
    id: 'chicken-burrito-bowl', name: 'Chicken burrito bowl', meals: LD, cal: 600, protein: 48, carbs: 85, fat: 7, mins: 25, meats: ['chicken'], contains: [],
    ingredients: ['140 g chicken breast (raw)', '140 g cooked rice', '85 g black beans', '48 g salsa', 'Shredded lettuce', 'Chili powder, cumin, lime'],
    steps: ['Season the chicken with chili powder and cumin, cook 6 to 7 minutes a side and slice.', 'Warm the beans.', 'Build bowls with rice, beans, chicken, lettuce and salsa.'],
  },
  {
    id: 'lentil-soup', name: 'Hearty lentil soup', meals: LD, cal: 360, protein: 20, carbs: 57, fat: 6, mins: 35, meats: [], contains: [],
    ingredients: ['100 g dry lentils', '60 g carrot, 40 g celery and 30 g onion, diced', '120 g diced tomatoes', '480 g vegetable broth', '5 g olive oil', 'Cumin, thyme'],
    steps: ['Soften the vegetables in the oil for 5 minutes.', 'Add lentils, tomatoes, broth and spices.', 'Simmer 25 minutes until the lentils are tender. Freezes well.'],
  },
  {
    id: 'caprese-sandwich', name: 'Caprese sandwich', meals: L, cal: 480, protein: 20, carbs: 60, fat: 18, mins: 5, meats: [], contains: ['gluten', 'milk'],
    ingredients: ['70 g ciabatta roll', '57 g fresh mozzarella', '120 g tomato, sliced', 'Fresh basil', '7 g balsamic glaze'],
    steps: ['Slice the roll and layer mozzarella, tomato and basil.', 'Drizzle with balsamic.'],
  },
  {
    id: 'shrimp-avocado-salad', name: 'Shrimp avocado salad', meals: L, cal: 340, protein: 32, carbs: 15, fat: 17, mins: 10, meats: ['shellfish'], contains: ['shellfish'],
    ingredients: ['140 g cooked shrimp', '70 g avocado', '60 g greens', 'Cherry tomatoes', 'Lime juice, cilantro'],
    steps: ['Toss shrimp with lime and cilantro.', 'Arrange over greens with avocado and tomatoes.'],
  },
  {
    id: 'beef-stir-fry', name: 'Beef and veggie stir-fry', meals: LD, cal: 560, protein: 40, carbs: 60, fat: 18, mins: 20, meats: ['beef'], contains: ['soy', 'gluten'],
    ingredients: ['140 g lean sirloin (raw), sliced thin', '90 g broccoli', '60 g bell pepper', '16 g soy sauce (or tamari for gluten-free)', '5 g oil, garlic, ginger', '140 g cooked rice'],
    steps: ['Sear the beef in hot oil for 2 minutes and set aside.', 'Stir-fry the vegetables with garlic and ginger for 4 minutes.', 'Return the beef, add soy sauce and toss. Serve over rice.'],
  },
  {
    id: 'teriyaki-tofu-bowl', name: 'Teriyaki tofu bowl', meals: LD, cal: 520, protein: 24, carbs: 62, fat: 20, mins: 25, meats: [], contains: ['soy', 'gluten', 'sesame'],
    ingredients: ['170 g firm tofu, cubed', '90 g broccoli', '140 g cooked rice', '36 g teriyaki sauce', '3 g sesame seeds'],
    steps: ['Pan-fry or air-fry the tofu until golden, about 12 minutes.', 'Steam the broccoli.', 'Toss tofu in teriyaki and serve over rice with broccoli and sesame.'],
  },
  {
    id: 'med-salmon-salad', name: 'Mediterranean salmon salad', meals: LD, cal: 470, protein: 38, carbs: 13, fat: 30, mins: 20, meats: ['fish'], contains: ['fish', 'milk'],
    ingredients: ['140 g salmon fillet (raw)', '90 g greens', '20 g olives', '150 g cucumber', '28 g feta', 'Lemon juice, oregano'],
    steps: ['Bake the salmon at 400 °F for 12 minutes.', 'Toss the salad with lemon and oregano.', 'Top with flaked salmon and feta.'],
  },
  {
    id: 'egg-salad-sandwich', name: 'Greek yogurt egg salad sandwich', meals: L, cal: 390, protein: 22, carbs: 39, fat: 16, mins: 15, meats: [], contains: ['egg', 'milk', 'gluten'],
    ingredients: ['2 hard-boiled eggs', '30 g plain Greek yogurt', '5 g mustard', '64 g whole-wheat bread', 'Lettuce'],
    steps: ['Chop the eggs and mix with yogurt and mustard.', 'Spread on bread with lettuce.'],
  },
  {
    id: 'chicken-caesar-wrap', name: 'Chicken caesar wrap', meals: L, cal: 480, protein: 38, carbs: 45, fat: 16, mins: 10, meats: ['chicken'], contains: ['gluten', 'milk', 'egg', 'fish'],
    ingredients: ['115 g cooked chicken breast', '70 g flour tortilla', '95 g romaine, chopped', '5 g parmesan', '22 g light caesar dressing'],
    steps: ['Toss romaine with dressing and parmesan.', 'Add chicken, wrap tightly and slice.'],
  },
  {
    id: 'peanut-noodle-salad', name: 'Peanut noodle salad', meals: LD, cal: 520, protein: 18, carbs: 71, fat: 18, mins: 15, meats: [], contains: ['peanut', 'soy', 'gluten'],
    ingredients: ['57 g rice noodles (dry)', '24 g peanut butter', '16 g soy sauce, 5 g lime juice, 6 g sriracha', '70 g shredded cabbage and carrot', '75 g shelled edamame'],
    steps: ['Cook and rinse the noodles under cold water.', 'Whisk peanut butter, soy, lime and sriracha with a splash of hot water.', 'Toss with noodles, vegetables and edamame. Good cold.'],
  },
  {
    id: 'turkey-chili', name: 'Turkey bean chili', meals: LD, cal: 420, protein: 36, carbs: 34, fat: 15, mins: 35, meats: ['turkey'], contains: [],
    ingredients: ['115 g lean ground turkey (raw)', '90 g kidney beans', '180 g crushed tomatoes', '30 g onion, diced', '5 g oil', 'Chili powder, cumin, garlic'],
    steps: ['Brown the turkey and onion in the oil.', 'Add spices, tomatoes and beans.', 'Simmer 20 minutes. Freezes well in single portions.'],
  },
  {
    id: 'falafel-pita', name: 'Baked falafel pita', meals: L, cal: 520, protein: 18, carbs: 62, fat: 22, mins: 25, meats: [], contains: ['gluten', 'sesame'],
    ingredients: ['70 g baked falafel, about 4 (store-bought or homemade)', '64 g whole-wheat pita', '15 g tahini', 'Lettuce, tomato, pickled onion'],
    steps: ['Bake the falafel per the package, about 15 minutes.', 'Warm the pita and fill with falafel and vegetables.', 'Drizzle with tahini thinned with lemon.'],
  },
  {
    id: 'cobb-salad', name: 'Light cobb salad', meals: L, cal: 470, protein: 42, carbs: 16, fat: 26, mins: 15, meats: ['chicken'], contains: ['egg', 'milk'],
    ingredients: ['115 g cooked chicken breast', '1 hard-boiled egg', '35 g avocado', 'Cherry tomatoes', '140 g romaine', '30 g light ranch'],
    steps: ['Chop everything into bite-size pieces.', 'Arrange in rows over romaine and add dressing.'],
  },
  {
    id: 'salmon-sweet-potato', name: 'Baked salmon, sweet potato and broccoli', meals: D, cal: 560, protein: 38, carbs: 39, fat: 28, mins: 30, meats: ['fish'], contains: ['fish'],
    ingredients: ['140 g salmon fillet (raw)', '150 g sweet potato, cubed', '135 g broccoli', '9 g olive oil', 'Lemon, garlic, salt'],
    steps: ['Toss sweet potato with half the oil and roast at 425 °F for 15 minutes.', 'Add broccoli and salmon brushed with the rest of the oil, lemon and garlic.', 'Roast 12 more minutes.'],
  },
  {
    id: 'lemon-chicken-rice', name: 'Lemon herb chicken with rice', meals: D, cal: 550, protein: 45, carbs: 67, fat: 11, mins: 30, meats: ['chicken'], contains: [],
    ingredients: ['140 g chicken breast (raw)', '140 g cooked rice', '110 g green beans', '5 g olive oil', 'Lemon, garlic, thyme'],
    steps: ['Marinate chicken in lemon, garlic and thyme for 10 minutes.', 'Cook in the oil 6 to 7 minutes a side.', 'Steam the green beans and serve with rice.'],
  },
  {
    id: 'turkey-meatball-pasta', name: 'Turkey meatball spaghetti', meals: D, cal: 620, protein: 42, carbs: 68, fat: 20, mins: 35, meats: ['turkey'], contains: ['gluten', 'egg', 'milk'],
    ingredients: ['115 g lean ground turkey (raw)', '7 g breadcrumbs + 15 g beaten egg', '57 g whole-wheat spaghetti (dry)', '125 g marinara', '5 g parmesan'],
    steps: ['Mix turkey, breadcrumbs and egg, roll into 5 meatballs and bake at 400 °F for 18 minutes.', 'Cook the pasta.', 'Warm meatballs in marinara and serve over pasta with parmesan.'],
  },
  {
    id: 'tofu-veggie-stir-fry', name: 'Tofu veggie stir-fry with brown rice', meals: D, cal: 500, protein: 24, carbs: 55, fat: 20, mins: 25, meats: [], contains: ['soy', 'gluten'],
    ingredients: ['170 g firm tofu', '180 g mixed stir-fry vegetables', '16 g soy sauce (or tamari)', '5 g oil, garlic, ginger', '145 g cooked brown rice'],
    steps: ['Brown the cubed tofu in the oil and set aside.', 'Stir-fry vegetables with garlic and ginger.', 'Return tofu, add soy sauce and serve over rice.'],
  },
  {
    id: 'beef-tacos', name: 'Lean beef tacos', meals: D, cal: 560, protein: 35, carbs: 45, fat: 27, mins: 20, meats: ['beef'], contains: ['milk'],
    ingredients: ['115 g 93% lean ground beef (raw)', '78 g corn tortillas', '28 g shredded cheese', 'Lettuce, salsa', 'Taco seasoning'],
    steps: ['Brown the beef with taco seasoning and a splash of water.', 'Warm the tortillas.', 'Fill with beef, cheese, lettuce and salsa.'],
  },
  {
    id: 'shrimp-fajitas', name: 'Shrimp fajitas', meals: D, cal: 450, protein: 33, carbs: 51, fat: 13, mins: 20, meats: ['shellfish'], contains: ['shellfish', 'gluten'],
    ingredients: ['140 g shrimp (raw)', '120 g bell pepper and 55 g onion, sliced', '60 g small flour tortillas', '5 g oil', 'Fajita seasoning, lime'],
    steps: ['Cook peppers and onion in the oil for 5 minutes.', 'Add seasoned shrimp and cook 3 minutes until pink.', 'Squeeze lime over and serve in tortillas.'],
  },
  {
    id: 'chickpea-curry', name: 'Chickpea spinach curry with rice', meals: D, cal: 560, protein: 17, carbs: 98, fat: 11, mins: 25, meats: [], contains: [],
    ingredients: ['125 g chickpeas', '60 g spinach', '120 g crushed tomatoes', '60 g light coconut milk', '30 g onion, garlic, ginger', '2 g each curry powder and garam masala', '140 g cooked basmati rice'],
    steps: ['Soften onion, garlic and ginger, then add the spices for 30 seconds.', 'Add tomatoes, coconut milk and chickpeas and simmer 10 minutes.', 'Stir in spinach until wilted. Serve over rice.'],
  },
  {
    id: 'chicken-tikka', name: 'Chicken tikka with basmati', meals: D, cal: 580, protein: 46, carbs: 76, fat: 10, mins: 35, meats: ['chicken'], contains: ['milk'],
    ingredients: ['140 g chicken breast (raw), cubed', '45 g plain yogurt', '2 g each garam masala, cumin and paprika', '140 g cooked basmati rice', 'Cucumber and onion salad'],
    steps: ['Marinate chicken in yogurt and spices for at least 15 minutes.', 'Thread on skewers or spread on a tray and broil 10 to 12 minutes.', 'Serve with rice and salad.'],
  },
  {
    id: 'pork-tenderloin', name: 'Pork tenderloin with roasted potatoes', meals: D, cal: 520, protein: 40, carbs: 49, fat: 18, mins: 35, meats: ['pork'], contains: [],
    ingredients: ['140 g pork tenderloin (raw)', '150 g potato, cubed', '90 g apple, sliced', '9 g olive oil', 'Rosemary, garlic'],
    steps: ['Toss potatoes with half the oil and roast at 425 °F for 10 minutes.', 'Rub pork with rosemary, garlic and the rest of the oil and add with the apple.', 'Roast 18 to 20 minutes until 145 °F inside. Rest 5 minutes and slice.'],
  },
  {
    id: 'lamb-kofta', name: 'Lamb kofta with tzatziki', meals: D, cal: 590, protein: 32, carbs: 37, fat: 35, mins: 25, meats: ['lamb'], contains: ['milk', 'gluten'],
    ingredients: ['115 g lean ground lamb (raw)', '30 g onion, grated', 'Cumin, coriander, parsley', '60 g tzatziki', '32 g whole-wheat pita', 'Tomato and cucumber salad'],
    steps: ['Mix lamb, onion and spices and shape onto skewers.', 'Grill or broil 8 to 10 minutes, turning once.', 'Serve with pita, salad and tzatziki.'],
  },
  {
    id: 'stuffed-peppers', name: 'Turkey and rice stuffed peppers', meals: D, cal: 450, protein: 32, carbs: 48, fat: 15, mins: 40, meats: ['turkey'], contains: [],
    ingredients: ['240 g bell peppers, halved', '115 g lean ground turkey (raw)', '60 g cooked rice', '125 g marinara', 'Italian seasoning'],
    steps: ['Brown the turkey with seasoning, then mix in rice and half the marinara.', 'Fill the pepper halves and top with the rest of the sauce.', 'Cover and bake at 375 °F for 25 minutes.'],
  },
  {
    id: 'cod-quinoa', name: 'Lemon cod with quinoa and asparagus', meals: D, cal: 430, protein: 38, carbs: 38, fat: 14, mins: 25, meats: ['fish'], contains: ['fish'],
    ingredients: ['170 g cod fillet (raw)', '140 g cooked quinoa', '120 g asparagus', '9 g olive oil', 'Lemon, dill'],
    steps: ['Lay cod and asparagus on a tray, drizzle with oil, lemon and dill.', 'Bake at 400 °F for 12 to 14 minutes.', 'Serve over quinoa.'],
  },
  {
    id: 'bean-enchiladas', name: 'Black bean sweet potato enchiladas', meals: D, cal: 540, protein: 19, carbs: 88, fat: 13, mins: 40, meats: [], contains: ['milk'],
    ingredients: ['78 g corn tortillas', '85 g black beans', '120 g mashed sweet potato', '120 g enchilada sauce', '28 g shredded cheese'],
    steps: ['Mix beans and sweet potato.', 'Fill and roll the tortillas, then place in a small dish.', 'Cover with sauce and cheese and bake at 375 °F for 20 minutes.'],
  },
  {
    id: 'garlic-shrimp-pasta', name: 'Garlic shrimp spaghetti', meals: D, cal: 560, protein: 36, carbs: 63, fat: 18, mins: 20, meats: ['shellfish'], contains: ['shellfish', 'gluten'],
    ingredients: ['140 g shrimp (raw)', '70 g whole-wheat spaghetti (dry)', '14 g olive oil', '9 g garlic', '60 g spinach', 'Chili flakes, lemon'],
    steps: ['Cook the pasta.', 'Sizzle garlic and chili in the oil, add shrimp and cook 3 minutes.', 'Toss with pasta, spinach and lemon.'],
  },
  {
    id: 'sheet-pan-thighs', name: 'Sheet pan chicken thighs and veggies', meals: D, cal: 520, protein: 38, carbs: 40, fat: 23, mins: 35, meats: ['chicken'], contains: [],
    ingredients: ['140 g boneless skinless chicken thighs (raw)', '90 g broccoli', '150 g potato, cubed', '55 g red onion', '9 g olive oil', 'Paprika, garlic powder'],
    steps: ['Toss everything with oil and spices on a tray.', 'Roast at 425 °F for 25 minutes, flipping halfway.'],
  },
  {
    id: 'lentil-bolognese', name: 'Lentil bolognese', meals: D, cal: 520, protein: 24, carbs: 87, fat: 8, mins: 30, meats: [], contains: ['gluten'],
    ingredients: ['65 g dry lentils', '190 g marinara', '70 g whole-wheat pasta (dry)', '30 g onion and 60 g carrot, diced', '5 g olive oil', '240 g water'],
    steps: ['Soften onion and carrot in the oil.', 'Add lentils, marinara and the water and simmer 20 minutes.', 'Serve over the cooked pasta.'],
  },
  {
    id: 'steak-potato', name: 'Sirloin, baked potato and salad', meals: D, cal: 580, protein: 42, carbs: 53, fat: 22, mins: 30, meats: ['beef'], contains: [],
    ingredients: ['140 g sirloin steak (raw)', '175 g potato', '85 g side salad', '5 g olive oil + vinegar', 'Salt, pepper, garlic'],
    steps: ['Microwave the potato 6 to 8 minutes until soft.', 'Sear the seasoned steak 4 minutes a side for medium and rest 5 minutes.', 'Serve with the salad.'],
  },
  {
    id: 'mushroom-risotto', name: 'Mushroom parmesan risotto', meals: D, cal: 520, protein: 14, carbs: 88, fat: 13, mins: 35, meats: [], contains: ['milk'],
    ingredients: ['65 g arborio rice (dry)', '105 g mushrooms, sliced', '480 g hot vegetable broth', '10 g parmesan', '5 g butter', '30 g onion'],
    steps: ['Soften the onion in the butter, add rice and stir 1 minute.', 'Add broth a ladle at a time, stirring, for about 20 minutes.', 'Brown the mushrooms separately and stir in with the parmesan.'],
  },
  {
    id: 'tofu-pad-thai', name: 'Tofu pad thai', meals: D, cal: 600, protein: 24, carbs: 73, fat: 24, mins: 25, meats: [], contains: ['egg', 'peanut', 'soy', 'gluten'],
    ingredients: ['57 g rice noodles (dry)', '115 g firm tofu', '1 egg', '16 g soy sauce + 4 g brown sugar + lime', '105 g bean sprouts', '9 g peanuts, crushed'],
    steps: ['Soak or cook the noodles.', 'Brown the tofu, push aside and scramble the egg.', 'Add noodles, sauce and sprouts and toss 2 minutes.', 'Top with peanuts and lime.'],
  },
  {
    id: 'chicken-skewers-couscous', name: 'Chicken skewers with couscous', meals: D, cal: 520, protein: 42, carbs: 54, fat: 15, mins: 25, meats: ['chicken'], contains: ['gluten'],
    ingredients: ['140 g chicken breast (raw), cubed', '120 g bell pepper and 100 g zucchini, chunked', '105 g cooked couscous', '5 g olive oil', 'Lemon, oregano, garlic'],
    steps: ['Toss chicken and vegetables with oil, lemon and herbs.', 'Thread onto skewers and grill or broil 10 to 12 minutes.', 'Serve over couscous.'],
  },

  // ---- Snacks ----
  {
    id: 'apple-pb', name: 'Apple with peanut butter', meals: S, cal: 200, protein: 4, carbs: 28, fat: 8, mins: 2, meats: [], contains: ['peanut'],
    ingredients: ['180 g apple, sliced', '16 g peanut butter'], steps: ['Slice and dip.'],
  },
  {
    id: 'hummus-veggies', name: 'Hummus and veggie sticks', meals: S, cal: 160, protein: 6, carbs: 13, fat: 9, mins: 5, meats: [], contains: ['sesame'],
    ingredients: ['45 g hummus', 'Carrot, cucumber and pepper sticks'], steps: ['Cut the vegetables and pack with hummus.'],
  },
  {
    id: 'yogurt-berries', name: 'Greek yogurt with berries', meals: S, cal: 150, protein: 17, carbs: 16, fat: 2, mins: 2, meats: [], contains: ['milk'],
    ingredients: ['170 g nonfat Greek yogurt', '75 g berries'], steps: ['Top yogurt with berries.'],
  },
  {
    id: 'boiled-eggs', name: 'Two hard-boiled eggs', meals: S, cal: 140, protein: 12, carbs: 1, fat: 10, mins: 12, meats: [], contains: ['egg'],
    ingredients: ['2 eggs', 'Salt, pepper or everything seasoning'], steps: ['Boil 10 minutes, cool in ice water and peel. Keeps 5 days in the fridge.'],
  },
  {
    id: 'trail-mix', name: 'Almond trail mix', meals: S, cal: 180, protein: 5, carbs: 15, fat: 11, mins: 2, meats: [], contains: ['treenut', 'milk'],
    ingredients: ['9 g almonds', '9 g raisins', '11 g dark chocolate chips', '9 g pumpkin seeds'], steps: ['Mix and portion into small bags.'],
  },
  {
    id: 'edamame', name: 'Salted edamame', meals: S, cal: 190, protein: 17, carbs: 14, fat: 8, mins: 5, meats: [], contains: ['soy'],
    ingredients: ['150 g shelled edamame', 'Sea salt'], steps: ['Microwave or boil 3 to 4 minutes and salt.'],
  },
  {
    id: 'cottage-cucumber', name: 'Cottage cheese and cucumber', meals: S, cal: 120, protein: 14, carbs: 11, fat: 2, mins: 2, meats: [], contains: ['milk'],
    ingredients: ['113 g low-fat cottage cheese', '150 g cucumber, sliced', 'Black pepper'], steps: ['Top cottage cheese with cucumber and pepper.'],
  },
  {
    id: 'rice-cake-almond', name: 'Rice cakes with almond butter', meals: S, cal: 170, protein: 5, carbs: 12, fat: 11, mins: 2, meats: [], contains: ['treenut'],
    ingredients: ['18 g plain rice cakes', '16 g almond butter'], steps: ['Spread and eat.'],
  },
  {
    id: 'roasted-chickpeas', name: 'Crispy roasted chickpeas', meals: S, cal: 180, protein: 8, carbs: 24, fat: 6, mins: 30, meats: [], contains: [],
    ingredients: ['80 g chickpeas, patted dry', '2 g olive oil', 'Paprika, salt'], steps: ['Toss with oil and spices.', 'Roast at 400 °F for 25 minutes, shaking once.'],
  },
  {
    id: 'cheese-grapes', name: 'String cheese and grapes', meals: S, cal: 150, protein: 7, carbs: 21, fat: 4, mins: 1, meats: [], contains: ['milk'],
    ingredients: ['28 g string cheese', '150 g grapes'], steps: ['Pack together.'],
  },
  {
    id: 'turkey-rollups', name: 'Turkey pickle roll-ups', meals: S, cal: 110, protein: 18, carbs: 5, fat: 2, mins: 3, meats: ['turkey'], contains: [],
    ingredients: ['85 g sliced turkey breast', '70 g pickle spears', '5 g mustard'], steps: ['Spread mustard on the turkey and roll around the pickles.'],
  },
  {
    id: 'tuna-crackers', name: 'Tuna on whole-grain crackers', meals: S, cal: 200, protein: 22, carbs: 19, fat: 4, mins: 3, meats: ['fish'], contains: ['fish', 'gluten'],
    ingredients: ['85 g light tuna, drained', '28 g whole-grain crackers', 'Squeeze of lemon'], steps: ['Season the tuna with lemon and pile on crackers.'],
  },
  {
    id: 'green-smoothie', name: 'Green chia smoothie', meals: S, cal: 190, protein: 9, carbs: 24, fat: 6, mins: 3, meats: [], contains: ['soy'],
    ingredients: ['240 g soy milk', '60 g banana', '30 g spinach', '4 g chia seeds'], steps: ['Blend until smooth.'],
  },
  {
    id: 'banana-oat-bites', name: 'Banana oat bites', meals: S, cal: 160, protein: 4, carbs: 33, fat: 1, mins: 20, meats: [], contains: [],
    ingredients: ['60 g ripe banana', '20 g rolled oats', '9 g raisins', 'Cinnamon'], steps: ['Mash and mix everything, form 4 small mounds.', 'Bake at 350 °F for 15 minutes.'],
  },
];
