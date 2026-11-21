from common import R, B, S, BS

# ---- Overnight oats ----
OATS = [
    ('Blueberry cheesecake overnight oats', [('blueberries', 75), ('cream cheese', 15), ('maple syrup', 8)], 'Top with the blueberries.'),
    ('Peanut butter banana overnight oats', [('banana', 60), ('peanut butter', 16)], 'Top with sliced banana.'),
    ('Apple pie overnight oats', [('apple', 90), ('walnuts', 10), ('maple syrup', 8), 'Cinnamon, nutmeg'], 'Stir in diced apple and spices.'),
    ('Chocolate cherry overnight oats', [('cherries', 80), ('cocoa', 8), ('maple syrup', 10)], 'Stir in cocoa; top with cherries.'),
    ('Mango coconut overnight oats', [('mango', 80), ('coconut flakes', 6), ('lime juice', 5)], 'Top with mango and coconut.'),
    ('Carrot cake overnight oats', [('carrot', 40), ('raisins', 12), ('walnuts', 8), 'Cinnamon, ginger'], 'Stir in grated carrot, raisins and spices.'),
    ('Pumpkin spice overnight oats', [('pumpkin puree', 60), ('pecans', 8), ('maple syrup', 10), 'Pumpkin pie spice'], 'Stir in pumpkin and spice; top with pecans.'),
    ('Strawberry almond overnight oats', [('strawberries', 90), ('almonds', 10), ('honey', 7)], 'Top with sliced strawberries and almonds.'),
    ('Mocha overnight oats', [('cocoa', 6), ('maple syrup', 8), 'Shot of cold espresso or 60 g cold coffee'], 'Use coffee as part of the liquid.'),
    ('Raspberry pistachio overnight oats', [('raspberries', 70), ('pistachios', 10), ('honey', 7)], 'Top with raspberries and chopped pistachios.'),
    ('Tropical pineapple overnight oats', [('pineapple', 80), ('coconut flakes', 5), ('chia', 5)], 'Top with pineapple and coconut.'),
    ('Almond joy overnight oats', [('almond butter', 12), ('coconut flakes', 6), ('chocolate chips', 8)], 'Top with coconut and chocolate chips.'),
]
for name, extra, top in OATS:
    R(name, B, 5, [('rolled oats', 45), ('greek yogurt', 120), ('milk', 120), ('chia', 6)] + extra,
      ['Stir oats, chia, yogurt and milk in a jar.', top, 'Cover and refrigerate overnight. Keeps 3 days.'])

# ---- Egg scrambles and omelettes ----
EGGS = [
    ('Spinach feta omelette', [('spinach', 40), ('feta', 20), ('cherry tomatoes', 60)], 'Wilt the spinach, then add tomatoes and feta.'),
    ('Denver omelette', [('ham', 40), ('bell pepper', 50), ('onion', 30), ('light cheddar', 15)], 'Sauté pepper, onion and ham first.'),
    ('Mushroom swiss scramble', [('mushrooms', 80), ('mozzarella', 20), 'Thyme'], 'Brown the mushrooms with thyme before the eggs.'),
    ('Mexican breakfast scramble', [('black beans', 60), ('salsa', 40), ('queso fresco', 15), ('corn tortilla', 26)], 'Warm the beans, scramble the eggs, top with salsa and cheese; serve with a tortilla.'),
    ('Smoked salmon dill scramble', [('smoked salmon', 40), ('cream cheese', 15), 'Fresh dill, chives'], 'Fold salmon and cream cheese in at the end.'),
    ('Shakshuka for one', [('crushed tomatoes', 150), ('bell pepper', 50), ('onion', 30), ('feta', 15), ('whole wheat bread', 30), 'Cumin, paprika'], 'Simmer tomatoes, pepper, onion and spices 8 minutes, crack in the eggs, cover until set; serve with bread.'),
    ('Veggie egg white omelette', [('bell pepper', 40), ('mushrooms', 40), ('spinach', 30), ('light cheddar', 15), ('whole wheat bread', 30)], 'Use the egg whites; serve with toast.'),
    ('Turkey sausage and pepper scramble', [('turkey sausage', 50), ('bell pepper', 60), ('onion', 30)], 'Brown the sausage with peppers and onion first.'),
    ('Kimchi fried egg rice', [('kimchi', 60), ('white rice', 120), ('green onion', 10), ('sesame oil', 3)], 'Fry rice with kimchi in sesame oil, top with fried eggs and green onion.'),
    ('Tomato basil frittata', [('cherry tomatoes', 80), ('fresh mozzarella', 25), ('basil', 3)], 'Pour eggs over tomatoes in an oven-safe pan, top with mozzarella and bake at 375 °F for 12 minutes.'),
    ('Broccoli cheddar egg muffins', [('broccoli', 60), ('cheddar', 15), ('milk', 30)], 'Whisk eggs with milk, pour into 4 muffin cups over broccoli and cheese, bake at 350 °F for 20 minutes.'),
    ('Green chile cheese omelette', [('jalapeno', 15), ('roasted red peppers', 40), ('light cheddar', 20), ('salsa verde', 30)], 'Fill with peppers and cheese; top with salsa verde.'),
    ('Asparagus goat cheese frittata', [('asparagus', 70), ('goat cheese', 15), ('green onion', 10)], 'Sauté asparagus, pour over eggs, top with goat cheese and bake at 375 °F for 12 minutes.'),
    ('Chorizo-style turkey breakfast hash', [('ground turkey', 70), ('potato', 120), ('bell pepper', 40), ('onion', 30), 'Smoked paprika, cumin, chili powder'], 'Brown the turkey with spices, add diced potato and peppers, cook until crisp, top with fried eggs.'),
]
for name, extra, how in EGGS:
    eggs = [('egg whites', 180)] if 'egg white' in name.lower() else [('egg', 2)]
    R(name, B, 15, eggs + [('olive oil', 4)] + extra,
      ['Whisk the eggs with a pinch of salt and pepper.', how, 'Cook in the oiled pan over medium-low heat until just set.'])

# ---- Toasts ----
TOASTS = [
    ('Avocado egg toast', [('sourdough', 60), ('avocado', 50), ('egg', 1), 'Chili flakes, lemon'], 'Mash avocado on toast and top with a fried or poached egg.'),
    ('Ricotta berry toast', [('sourdough', 60), ('ricotta', 60), ('berries', 70), ('honey', 7)], 'Spread ricotta, top with berries and honey.'),
    ('Peanut butter banana toast', [('whole wheat bread', 60), ('peanut butter', 16), ('banana', 60), 'Cinnamon'], 'Spread peanut butter and layer banana slices.'),
    ('Smoked salmon rye toast', [('rye bread', 60), ('cream cheese', 20), ('smoked salmon', 50), ('cucumber', 40), ('capers', 5)], 'Spread cream cheese, layer salmon, cucumber and capers.'),
    ('Cottage cheese tomato toast', [('sourdough', 60), ('cottage cheese', 110), ('cherry tomatoes', 70), 'Everything bagel seasoning'], 'Spread cottage cheese and top with tomatoes and seasoning.'),
    ('Hummus egg toast', [('whole wheat bread', 60), ('hummus', 30), ('egg', 1), ('cucumber', 40), 'Za\'atar'], 'Spread hummus, add sliced hard-boiled egg and cucumber.'),
    ('Almond butter apple toast', [('whole wheat bread', 60), ('almond butter', 16), ('apple', 60), 'Cinnamon'], 'Spread almond butter and fan thin apple slices on top.'),
    ('White bean smash toast', [('sourdough', 60), ('white beans', 80), ('lemon juice', 5), ('olive oil', 4), ('arugula', 15)], 'Mash beans with lemon and oil, spread, top with arugula.'),
    ('Greek yogurt fig-style toast', [('whole wheat bread', 60), ('greek yogurt 2', 80), ('dates', 15), ('walnuts', 8), ('honey', 5)], 'Spread yogurt, top with chopped dates, walnuts and honey.'),
    ('Caprese breakfast toast', [('sourdough', 60), ('fresh mozzarella', 40), ('tomato', 80), ('basil', 2), ('balsamic', 5)], 'Layer mozzarella and tomato, add basil and a drizzle of balsamic.'),
]
for name, ing, how in TOASTS:
    R(name, B, 7, ing, ['Toast the bread.', how])

# ---- Smoothies (breakfast or snack) ----
SMOOTHIES = [
    ('Strawberry banana protein smoothie', [('strawberries', 120), ('banana', 60), ('whey', 30), ('milk', 240)]),
    ('Peanut butter cup smoothie', [('frozen banana', 80), ('peanut butter', 16), ('chocolate whey', 30), ('almond milk', 240), ('cocoa', 5)]),
    ('Mango lassi smoothie', [('mango', 120), ('greek yogurt', 150), ('milk', 120), 'Pinch of cardamom']),
    ('Blueberry oat smoothie', [('blueberries', 100), ('rolled oats', 25), ('greek yogurt', 120), ('milk', 180)]),
    ('Tropical green smoothie', [('pineapple', 80), ('mango', 60), ('spinach', 30), ('pea protein', 25), ('oat milk', 240)]),
    ('Mocha protein shake', [('chocolate whey', 30), ('frozen banana', 60), ('skim milk', 200), 'Shot of cold espresso']),
    ('Cherry almond smoothie', [('cherries', 120), ('almond butter', 12), ('whey', 25), ('almond milk', 240)]),
    ('Pumpkin pie smoothie', [('pumpkin puree', 80), ('frozen banana', 60), ('greek yogurt', 120), ('milk', 180), 'Pumpkin pie spice']),
    ('Raspberry vanilla kefir smoothie', [('raspberries', 100), ('kefir', 240), ('banana', 50), ('honey', 7)]),
    ('Peach cobbler smoothie', [('peach', 130), ('rolled oats', 20), ('greek yogurt', 120), ('almond milk', 180), 'Cinnamon']),
    ('Chocolate avocado smoothie', [('avocado', 40), ('frozen banana', 60), ('cocoa', 8), ('soy milk', 240), ('dates', 15)]),
    ('Kiwi spinach smoothie', [('kiwi', 100), ('spinach', 30), ('banana', 60), ('skyr', 120), ('almond milk', 120)]),
]
for name, ing in SMOOTHIES:
    R(name, BS, 5, ing + ['Ice'], ['Blend everything until smooth, adding ice to thicken.'])

# ---- Bowls, pancakes and more ----
R('Banana protein pancakes', B, 15, [('banana', 100), ('egg', 2), ('rolled oats', 30), ('whey', 15), ('berries', 60), ('maple syrup', 10)],
  ['Blend banana, eggs, oats and protein into a batter.', 'Cook small pancakes in a nonstick pan, 2 minutes a side.', 'Top with berries and syrup.'])
R('Cottage cheese pancakes', B, 15, [('cottage cheese', 120), ('egg', 2), ('flour', 30), ('blueberries', 60), ('maple syrup', 10)],
  ['Blend cottage cheese, eggs and flour.', 'Cook pancakes over medium heat.', 'Top with blueberries and syrup.'])
R('Whole-wheat buttermilk-style waffles', B, 20, [('whole wheat flour', 50), ('egg', 1), ('milk', 120), ('baking powder', 3), ('butter', 5), ('strawberries', 80), ('greek yogurt', 60)],
  ['Whisk flour, baking powder, egg, milk and melted butter.', 'Cook in a hot waffle iron.', 'Top with yogurt and strawberries.'])
R('Pumpkin oat pancakes', B, 15, [('rolled oats', 40), ('pumpkin puree', 60), ('egg', 1), ('milk', 60), ('baking powder', 2), ('maple syrup', 10), ('pecans', 8), 'Pumpkin pie spice'],
  ['Blend oats into flour, then whisk in everything except pecans and syrup.', 'Cook pancakes 2 minutes a side.', 'Top with pecans and syrup.'])
R('Steel-cut oats with apples and walnuts', B, 30, [('steel-cut oats', 45), ('milk', 120), ('apple', 100), ('walnuts', 12), ('maple syrup', 8), 'Cinnamon'],
  ['Simmer oats in 360 g water and the milk for 25 minutes, stirring now and then.', 'Stir in diced apple and cinnamon for the last 5 minutes.', 'Top with walnuts and syrup.'])
R('Savory miso oatmeal with egg', B, 12, [('rolled oats', 45), ('miso', 8), ('spinach', 30), ('egg', 1), ('green onion', 8), ('sesame oil', 2)],
  ['Cook oats in 240 g water, stir in miso and spinach.', 'Top with a soft-boiled or fried egg, green onion and sesame oil.'])
R('Skyr berry crunch bowl', B, 5, [('skyr', 200), ('berries', 100), ('granola', 25), ('hemp seeds', 8)], ['Spoon skyr into a bowl.', 'Top with berries, granola and hemp seeds.'])
R('Cottage cheese pineapple bowl', B, 5, [('cottage cheese', 200), ('pineapple', 100), ('pumpkin seeds', 10), ('honey', 5)], ['Top cottage cheese with pineapple, seeds and honey.'])
R('Acai-style berry bowl', B, 8, [('berries', 150), ('frozen banana', 60), ('whey', 20), ('almond milk', 80), ('granola', 25), ('coconut flakes', 5)],
  ['Blend frozen berries, banana, protein and a splash of milk until thick.', 'Pour into a bowl and top with granola and coconut.'])
R('Chia pudding with mango', B, 5, [('chia', 25), ('light coconut milk', 120), ('milk', 120), ('mango', 100), ('maple syrup', 8)],
  ['Stir chia, both milks and syrup in a jar.', 'Refrigerate at least 4 hours or overnight.', 'Top with mango.'])
R('Quinoa breakfast bowl', B, 10, [('quinoa', 150), ('milk', 120), ('berries', 80), ('almonds', 12), ('honey', 7), 'Cinnamon'],
  ['Warm cooked quinoa with milk and cinnamon.', 'Top with berries, almonds and honey.'])
R('Breakfast burrito with turkey sausage', B, 15, [('flour tortilla', 60), ('egg', 2), ('turkey sausage', 40), ('potato', 70), ('salsa', 30), ('light cheddar', 15)],
  ['Cook diced potato until tender, then brown the sausage.', 'Scramble the eggs into the pan.', 'Fill the tortilla, add cheese and salsa, roll up.'])
R('Black bean breakfast burrito', B, 12, [('flour tortilla', 60), ('egg', 2), ('black beans', 70), ('bell pepper', 40), ('salsa', 30), ('avocado', 30)],
  ['Sauté peppers, add beans and warm through.', 'Scramble in the eggs.', 'Fill the tortilla with eggs, avocado and salsa.'])
R('Tofu scramble breakfast tacos', B, 15, [('firm tofu', 150), ('corn tortilla', 52), ('spinach', 30), ('salsa', 40), ('nutritional yeast', 5), 'Turmeric, cumin, garlic powder'],
  ['Crumble tofu into a hot pan with spices and nutritional yeast.', 'Cook 6 minutes, then wilt in the spinach.', 'Serve in warm tortillas with salsa.'])
R('Egg and cheese English muffin', B, 8, [('english muffin', 60), ('egg', 1), ('light cheddar', 15), ('turkey bacon', 15)],
  ['Toast the muffin and crisp the turkey bacon.', 'Fry the egg.', 'Stack egg, cheese and bacon on the muffin.'])
R('Lox bagel thin', B, 5, [('bagel thin', 45), ('cream cheese', 20), ('smoked salmon', 45), ('red onion', 10), ('capers', 4), ('tomato', 40)],
  ['Toast the bagel thin.', 'Spread cream cheese and layer salmon, tomato, onion and capers.'])
R('Ham and egg breakfast quesadilla', B, 10, [('flour tortilla', 60), ('egg', 2), ('ham', 40), ('mozzarella', 20), ('salsa', 30)],
  ['Scramble the eggs.', 'Fill half the tortilla with eggs, ham and cheese, fold and toast both sides.', 'Serve with salsa.'])
R('Sweet potato breakfast hash', B, 25, [('sweet potato', 150), ('turkey sausage', 50), ('kale', 30), ('onion', 30), ('egg', 1), ('olive oil', 5)],
  ['Cook diced sweet potato in oil until tender, about 12 minutes.', 'Add sausage and onion and brown, then wilt in the kale.', 'Top with a fried egg.'])
R('Chilaquiles verdes', B, 15, [('corn tortilla', 52), ('salsa verde', 100), ('egg', 2), ('queso fresco', 15), ('light sour cream', 15), ('cilantro', 3)],
  ['Cut tortillas into wedges and bake at 400 °F for 8 minutes until crisp.', 'Simmer the chips in salsa verde for 1 minute.', 'Top with fried eggs, cheese, sour cream and cilantro.'])
R('Japanese-style breakfast plate', B, 15, [('salmon', 80), ('white rice', 120), ('miso', 10), ('silken tofu', 50), ('seaweed', 2), ('cucumber', 50), ('rice vinegar', 5)],
  ['Broil the salmon 8 minutes.', 'Whisk miso into 240 g hot water with cubed tofu and seaweed for soup.', 'Serve with rice and cucumber dressed in rice vinegar.'])
R('Turkish eggs with yogurt', B, 10, [('egg', 2), ('greek yogurt 2', 120), ('butter', 5), ('whole wheat bread', 45), 'Garlic, Aleppo pepper or chili flakes, dill'],
  ['Stir a little grated garlic into the yogurt and spread on a plate.', 'Poach the eggs and set on the yogurt.', 'Melt butter with chili flakes, drizzle over, add dill; serve with bread.'])
R('Congee with ginger and egg', B, 30, [('jasmine rice', 150), ('chicken broth', 400), ('ginger', 8), ('egg', 1), ('green onion', 10), ('soy sauce', 5), ('sesame oil', 2)],
  ['Simmer cooked rice in broth with sliced ginger for 20 minutes until creamy.', 'Top with a soft-boiled egg, green onion, soy sauce and sesame oil.'])
R('French toast with berries', B, 15, [('whole wheat bread', 70), ('egg', 1), ('egg whites', 60), ('milk', 60), ('berries', 80), ('maple syrup', 10), 'Cinnamon, vanilla'],
  ['Whisk egg, whites, milk, cinnamon and vanilla.', 'Dip the bread and cook in a nonstick pan, 3 minutes a side.', 'Top with berries and syrup.'])
R('Huevos rancheros', B, 15, [('corn tortilla', 52), ('egg', 2), ('refried beans', 80), ('salsa', 60), ('avocado', 30), ('queso fresco', 10)],
  ['Warm the tortillas and beans.', 'Fry the eggs.', 'Layer beans and eggs on tortillas, top with salsa, avocado and cheese.'])
R('Protein baked oatmeal cups', B, 30, [('rolled oats', 45), ('whey', 15), ('banana', 50), ('egg whites', 50), ('milk', 60), ('blueberries', 50), ('baking powder', 2)],
  ['Mix everything and divide into 4 muffin cups.', 'Bake at 350 °F for 20 minutes.', 'Keeps 4 days in the fridge.'])
R('Breakfast fried rice', B, 15, [('brown rice', 150), ('egg', 2), ('peas', 40), ('carrot', 30), ('ham', 30), ('soy sauce', 8), ('sesame oil', 3)],
  ['Stir-fry ham, peas and carrot in sesame oil.', 'Push aside and scramble the eggs.', 'Add rice and soy sauce and toss until hot.'])
R('Peanut butter oatmeal with banana', B, 8, [('rolled oats', 45), ('milk', 180), ('peanut butter', 16), ('banana', 60), 'Cinnamon'],
  ['Cook oats in the milk for 4 minutes.', 'Stir in peanut butter and top with banana and cinnamon.'])
R('Bircher muesli', B, 5, [('rolled oats', 40), ('apple', 80), ('greek yogurt', 100), ('milk', 80), ('almonds', 10), ('raisins', 10)],
  ['Grate the apple into the oats.', 'Stir in yogurt, milk and raisins and refrigerate overnight.', 'Top with chopped almonds.'])
R('Veggie breakfast sandwich', B, 10, [('english muffin', 60), ('egg', 1), ('spinach', 20), ('tomato', 40), ('avocado', 30), ('light cheddar', 15)],
  ['Toast the muffin and fry the egg.', 'Stack spinach, tomato, egg, cheese and avocado.'])
R('Polenta with fried eggs and greens', B, 15, [('polenta', 200), ('parmesan', 10), ('egg', 2), ('kale', 40), ('olive oil', 5), 'Garlic, chili flakes'],
  ['Warm polenta with parmesan.', 'Sauté kale with garlic and chili in the oil.', 'Top polenta with kale and fried eggs.'])
R('Tofu breakfast burrito bowl', B, 15, [('firm tofu', 120), ('black beans', 60), ('potato', 100), ('salsa', 40), ('avocado', 30), 'Turmeric, cumin'],
  ['Roast or pan-fry diced potato until crisp.', 'Crumble tofu with spices and cook 6 minutes; warm the beans.', 'Bowl it up with salsa and avocado.'])
