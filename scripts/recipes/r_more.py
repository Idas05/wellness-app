from common import R, L, D, LD, S

# ---- Sheet-pan and oven dinners ----
SHEET = [
    ('Sheet-pan chicken fajitas', [('chicken breast', 140), ('bell pepper', 100), ('onion', 60), ('flour tortilla', 60), ('salsa', 40), ('greek yogurt', 30)], 'Toss chicken strips, peppers and onion with oil and fajita seasoning; roast 20 minutes. Serve in tortillas with salsa and yogurt.', 'Fajita seasoning'),
    ('Lemon herb chicken with potatoes and green beans', [('chicken breast', 140), ('baby potatoes', 180), ('green beans', 100), ('lemon juice', 10)], 'Roast halved potatoes 15 minutes, add chicken and green beans with lemon and herbs and roast 18 more.', 'Garlic, rosemary, thyme'),
    ('Honey mustard salmon with Brussels sprouts', [('salmon', 130), ('brussels sprouts', 150), ('sweet potato', 120), ('dijon', 10), ('honey', 8)], 'Roast sweet potato and sprouts 15 minutes, add salmon brushed with honey mustard and roast 12 more.', 'Garlic'),
    ('Sausage, peppers and potatoes', [('turkey sausage', 100), ('bell pepper', 100), ('onion', 50), ('baby potatoes', 150)], 'Roast everything together 30 minutes, tossing halfway.', 'Italian seasoning'),
    ('Greek chicken with chickpeas and zucchini', [('chicken thigh', 130), ('chickpeas', 100), ('zucchini', 100), ('red onion', 30), ('feta', 15), ('tzatziki', 30)], 'Toss everything except feta and tzatziki with oil, lemon and oregano; roast 25 minutes. Top with feta and tzatziki.', 'Oregano, lemon, garlic'),
    ('Pork tenderloin with apples and squash', [('pork tenderloin', 140), ('apple', 100), ('butternut squash', 150), ('maple syrup', 8)], 'Roast squash 15 minutes, add seared pork and apple wedges and roast until the pork reaches 145 °F, about 18 minutes.', 'Sage, thyme'),
    ('Cod with tomatoes, olives and couscous', [('cod', 160), ('cherry tomatoes', 120), ('olives', 20), ('capers', 6), ('couscous', 150)], 'Roast tomatoes, olives and capers 10 minutes, nestle in the cod and roast 12 more. Serve over couscous.', 'Garlic, basil'),
    ('Teriyaki tofu with broccoli and rice', [('firm tofu', 170), ('broccoli', 130), ('teriyaki', 25), ('white rice', 150), ('sesame seeds', 3)], 'Roast tofu cubes and broccoli 25 minutes, toss with teriyaki for the last 5.', 'Garlic, ginger'),
    ('Shrimp boil sheet pan', [('shrimp', 150), ('baby potatoes', 150), ('corn', 80), ('turkey sausage', 40), ('butter', 6)], 'Roast potatoes and sausage 20 minutes, add corn and shrimp with melted butter and Old Bay and roast 8 more.', 'Old Bay seasoning, lemon'),
    ('Balsamic chicken with roasted vegetables', [('chicken breast', 140), ('zucchini', 80), ('bell pepper', 60), ('red onion', 40), ('cherry tomatoes', 60), ('balsamic', 15), ('quinoa', 120)], 'Toss chicken and vegetables with balsamic, oil and herbs; roast 22 minutes. Serve over quinoa.', 'Italian herbs, garlic'),
    ('Moroccan spiced chicken thighs with carrots', [('chicken thigh', 140), ('carrot', 150), ('chickpeas', 80), ('couscous', 120), ('greek yogurt', 40)], 'Rub chicken with spices, roast with carrots and chickpeas 25 minutes. Serve over couscous with yogurt.', 'Cumin, coriander, cinnamon, paprika'),
    ('Steak, potatoes and asparagus', [('sirloin', 140), ('baby potatoes', 170), ('asparagus', 120)], 'Roast potatoes 20 minutes, add asparagus; sear the steak 4 minutes a side and rest before slicing.', 'Garlic, rosemary'),
    ('Pesto salmon with cherry tomatoes', [('salmon', 130), ('pesto', 15), ('cherry tomatoes', 100), ('green beans', 100), ('farro', 120)], 'Spread pesto on salmon, roast with tomatoes and green beans 14 minutes. Serve over farro.', 'Lemon'),
    ('BBQ chicken with sweet potato wedges', [('chicken breast', 140), ('bbq sauce', 25), ('sweet potato', 180), ('coleslaw mix', 60), ('light mayo', 10)], 'Roast wedges 15 minutes, add chicken brushed with BBQ sauce and roast 20 more. Serve with quick slaw.', 'Smoked paprika'),
    ('Stuffed bell peppers with turkey and rice', [('ground turkey', 110), ('bell pepper', 180), ('brown rice', 100), ('diced tomatoes', 100), ('mozzarella', 20)], 'Brown turkey, mix with rice and tomatoes, stuff halved peppers, top with cheese, cover and bake 30 minutes.', 'Italian seasoning, garlic'),
    ('Eggplant parmesan (baked)', [('eggplant', 250), ('panko', 25), ('egg', 1), ('marinara', 120), ('mozzarella', 35), ('parmesan', 10), ('pasta', 40)], 'Dip eggplant slices in egg and panko, bake 20 minutes, layer with marinara and cheese and bake 15 more. Serve with pasta.', 'Basil, garlic'),
    ('Chicken enchiladas', [('rotisserie chicken', 110), ('corn tortilla', 78), ('enchilada sauce', 120), ('black beans', 60), ('light cheddar', 25), ('light sour cream', 15)], 'Fill tortillas with chicken and beans, roll, cover with sauce and cheese and bake 20 minutes.', 'Cumin'),
    ('Spaghetti squash with turkey meatballs', [('spaghetti squash', 300), ('ground turkey', 120), ('panko', 15), ('egg', 1), ('marinara', 130), ('parmesan', 10)], 'Roast halved squash cut-side down 35 minutes; bake meatballs 18 minutes; warm in marinara and serve over the squash strands.', 'Garlic, Italian seasoning'),
    ('Crispy baked chicken tenders with slaw', [('chicken breast', 150), ('panko', 30), ('egg', 1), ('coleslaw mix', 80), ('greek yogurt', 30), ('baby potatoes', 120)], 'Dip chicken in egg and panko, bake on a rack 18 minutes; roast potatoes alongside. Serve with yogurt slaw.', 'Paprika, garlic powder'),
    ('Halloumi and vegetable tray bake', [('halloumi', 70), ('zucchini', 80), ('bell pepper', 80), ('red onion', 40), ('chickpeas', 100), ('lemon juice', 8)], 'Roast vegetables and chickpeas 20 minutes, add sliced halloumi and roast 10 more.', 'Oregano, mint'),
    ('Jerk chicken with rice and peas', [('chicken thigh', 140), ('brown rice', 130), ('kidney beans', 60), ('light coconut milk', 40), ('mango', 60)], 'Rub chicken with jerk seasoning and roast 25 minutes; warm rice with beans and coconut milk. Serve with mango.', 'Jerk seasoning, thyme'),
    ('Tandoori salmon with cauliflower', [('salmon', 130), ('greek yogurt', 40), ('cauliflower', 150), ('basmati rice', 120)], 'Coat salmon in yogurt and tandoori spice, roast with spiced cauliflower 15 minutes. Serve with rice.', 'Tandoori masala, lemon'),
]
for name, ing, how, season in SHEET:
    R(name, D, 35, ing + [('olive oil', 6), season], ['Heat the oven to 425 °F and line a sheet pan.', how, 'Leftovers keep 3 days.'])

# ---- Salads ----
SALADS = [
    ('Chicken Caesar salad', [('chicken breast', 130), ('romaine', 120), ('parmesan', 10), ('caesar dressing', 25), ('sourdough', 25)], 'Grill the chicken; toast bread cubes into croutons.'),
    ('Cobb salad with turkey', [('turkey breast slices', 90), ('romaine', 100), ('egg', 1), ('avocado', 40), ('cherry tomatoes', 60), ('turkey bacon', 15), ('ranch', 20)], 'Hard-boil the egg and crisp the bacon.'),
    ('Asian chicken crunch salad', [('chicken breast', 120), ('cabbage', 80), ('red cabbage', 40), ('carrot', 40), ('edamame', 40), ('almonds', 10), ('peanut sauce', 20)], 'Cook and shred the chicken.'),
    ('Greek salad with grilled chicken', [('chicken breast', 120), ('romaine', 80), ('cucumber', 80), ('tomato', 80), ('red onion', 15), ('olives', 15), ('feta', 20), ('olive oil', 6), ('lemon juice', 10)], 'Grill the chicken with oregano.'),
    ('Tuna nicoise salad', [('canned tuna', 110), ('baby potatoes', 120), ('green beans', 80), ('egg', 1), ('olives', 12), ('mixed greens', 50), ('dijon', 5), ('olive oil', 6)], 'Boil potatoes, green beans and the egg.'),
    ('Southwest black bean salad', [('black beans', 120), ('corn', 60), ('romaine', 80), ('cherry tomatoes', 60), ('avocado', 40), ('salsa', 40), ('lime juice', 10), ('corn tortilla', 13)], 'Bake tortilla strips until crisp.'),
    ('Salmon quinoa salad with lemon', [('salmon', 110), ('quinoa', 120), ('arugula', 40), ('cucumber', 60), ('lemon juice', 10), ('olive oil', 5), 'Dill'], 'Bake the salmon at 400 °F for 12 minutes.'),
    ('Steak salad with goat cheese', [('sirloin', 120), ('mixed greens', 80), ('cherry tomatoes', 60), ('red onion', 15), ('goat cheese', 15), ('balsamic', 10), ('olive oil', 5)], 'Sear and slice the steak.'),
    ('Shrimp avocado citrus salad', [('shrimp', 140), ('avocado', 50), ('orange', 80), ('mixed greens', 60), ('red onion', 10), ('lime juice', 10), ('olive oil', 4)], 'Sear the shrimp 2 minutes a side.'),
    ('Lentil feta salad', [('lentils', 160), ('cucumber', 60), ('cherry tomatoes', 60), ('red onion', 15), ('feta', 25), ('parsley', 5), ('lemon juice', 10), ('olive oil', 6)], 'Cook and cool the lentils.'),
    ('Chickpea smash sandwich', [('chickpeas', 130), ('light mayo', 12), ('celery', 30), ('dijon', 5), ('whole wheat bread', 60), ('romaine', 20)], 'Mash chickpeas with mayo, mustard and celery.'),
    ('Kale caesar with crispy chickpeas', [('kale', 80), ('chickpeas', 120), ('parmesan', 12), ('caesar dressing', 20), ('lemon juice', 5)], 'Roast chickpeas at 425 °F for 20 minutes until crisp; massage the kale with dressing.'),
    ('Thai beef salad', [('flank steak', 120), ('mixed greens', 60), ('cucumber', 60), ('red onion', 15), ('mint', 3), ('cilantro', 3), ('lime juice', 12), ('fish sauce', 6), ('rice noodles', 30)], 'Grill steak and slice thin; soak the noodles.'),
    ('Chicken, apple and walnut salad', [('chicken breast', 120), ('apple', 90), ('walnuts', 12), ('mixed greens', 60), ('celery', 30), ('greek yogurt', 40), ('dijon', 5)], 'Cook and dice the chicken.'),
    ('Mediterranean farro salad', [('farro', 150), ('chickpeas', 80), ('cucumber', 60), ('roasted red peppers', 40), ('feta', 20), ('olives', 12), ('lemon juice', 10), ('olive oil', 6)], 'Cook and cool the farro.'),
    ('Caprese chicken salad', [('chicken breast', 120), ('fresh mozzarella', 35), ('tomato', 100), ('arugula', 40), ('basil', 3), ('balsamic', 10), ('olive oil', 4)], 'Grill and slice the chicken.'),
    ('Edamame soba salad', [('soba', 55), ('edamame', 80), ('carrot', 40), ('cucumber', 60), ('red cabbage', 30), ('soy sauce', 8), ('rice vinegar', 6), ('sesame oil', 4)], 'Cook soba and rinse cold.'),
    ('Taco salad with turkey', [('ground turkey', 110), ('romaine', 100), ('black beans', 60), ('tomato', 60), ('light cheddar', 15), ('salsa', 40), ('greek yogurt', 30), ('corn tortilla', 13)], 'Brown turkey with taco seasoning; bake tortilla strips.'),
    ('Fattoush with chicken', [('chicken breast', 120), ('romaine', 70), ('cucumber', 70), ('tomato', 70), ('radish', 30), ('pita', 30), ('mint', 3), ('lemon juice', 12), ('olive oil', 6), 'Sumac'], 'Grill the chicken; toast pita into chips.'),
    ('Warm roasted vegetable and halloumi salad', [('halloumi', 60), ('butternut squash', 150), ('arugula', 40), ('chickpeas', 80), ('balsamic', 8), ('olive oil', 5)], 'Roast squash and chickpeas at 425 °F for 25 minutes; sear halloumi slices.'),
    ('Crab and avocado salad', [('crab', 110), ('avocado', 50), ('mixed greens', 60), ('cucumber', 60), ('lime juice', 10), ('light mayo', 10), ('crackers', 20)], 'Fold crab with mayo and lime.'),
    ('Tofu sesame crunch salad', [('firm tofu', 150), ('cabbage', 80), ('edamame', 40), ('carrot', 40), ('sesame seeds', 5), ('rice vinegar', 8), ('soy sauce', 8), ('sesame oil', 4)], 'Bake tofu cubes at 425 °F for 25 minutes.'),
]
for name, ing, prep in SALADS:
    R(name, L if 'sandwich' not in name.lower() else L, 20, ing, [prep, 'Toss everything else together in a big bowl.', 'Add the dressing just before eating so it stays crisp.'])

# ---- Sandwiches, wraps, burgers ----
SANDWICHES = [
    ('Turkey avocado club', [('whole wheat bread', 80), ('turkey breast slices', 100), ('avocado', 40), ('turkey bacon', 15), ('tomato', 50), ('romaine', 20), ('light mayo', 8)], L),
    ('Chicken shawarma wrap', [('flour tortilla', 60), ('chicken thigh', 120), ('tzatziki', 30), ('cucumber', 40), ('tomato', 40), ('red onion', 10), 'Cumin, paprika, turmeric, garlic'], LD),
    ('Buffalo chicken wrap', [('flour tortilla', 60), ('chicken breast', 120), ('buffalo sauce', 20), ('romaine', 40), ('celery', 20), ('ranch', 15)], L),
    ('Tuna melt', [('whole wheat bread', 70), ('canned tuna', 100), ('light mayo', 10), ('celery', 20), ('light cheddar', 20)], L),
    ('Roast beef and horseradish sandwich', [('rye bread', 70), ('roast beef slices', 100), ('arugula', 15), ('tomato', 40), ('light mayo', 8), 'Horseradish'], L),
    ('Caprese pesto panini', [('ciabatta', 80), ('fresh mozzarella', 40), ('tomato', 60), ('pesto', 10), ('spinach', 20)], L),
    ('Falafel pita with tahini', [('pita', 60), ('falafel', 80), ('cucumber', 40), ('tomato', 40), ('tahini', 10), ('lemon juice', 5), ('romaine', 20)], LD),
    ('Banh mi-style chicken sandwich', [('baguette', 75), ('chicken breast', 110), ('carrot', 30), ('cucumber', 30), ('jalapeno', 8), ('cilantro', 3), ('light mayo', 8), ('sriracha', 5), ('rice vinegar', 10)], L),
    ('Grilled chicken pesto sandwich', [('ciabatta', 80), ('chicken breast', 120), ('pesto', 12), ('roasted red peppers', 40), ('arugula', 15)], L),
    ('Hummus veggie wrap', [('flour tortilla', 60), ('hummus', 50), ('cucumber', 50), ('roasted red peppers', 40), ('spinach', 25), ('feta', 15), ('carrot', 30)], L),
    ('Egg salad on rye', [('rye bread', 60), ('egg', 3), ('greek yogurt', 30), ('dijon', 5), ('celery', 20), ('romaine', 20)], L),
    ('Turkey, apple and goat cheese sandwich', [('sourdough', 70), ('turkey breast slices', 90), ('apple', 50), ('goat cheese', 20), ('arugula', 15), ('dijon', 5)], L),
    ('Chicken Caesar wrap with kale', [('flour tortilla', 60), ('chicken breast', 110), ('kale', 40), ('parmesan', 8), ('caesar dressing', 15)], L),
    ('Philly cheesesteak (lighter)', [('ciabatta', 80), ('sirloin', 110), ('bell pepper', 60), ('onion', 50), ('mozzarella', 25)], LD),
    ('Salmon burger with dill yogurt', [('burger bun', 60), ('canned salmon', 120), ('egg', 1), ('panko', 15), ('greek yogurt', 30), ('romaine', 20), ('tomato', 40), 'Dill, lemon'], LD),
    ('Black bean burger', [('burger bun', 60), ('black beans', 130), ('panko', 20), ('egg', 1), ('salsa', 30), ('avocado', 30), ('romaine', 20), 'Cumin, garlic'], LD),
    ('Turkey burger with sweet potato fries', [('burger bun', 60), ('ground turkey', 130), ('sweet potato', 150), ('tomato', 40), ('romaine', 20), ('ketchup', 15), ('olive oil', 5)], D),
    ('Lean beef burger with side salad', [('burger bun', 60), ('lean ground beef', 130), ('light cheddar', 15), ('tomato', 40), ('mixed greens', 50), ('pickles', 20), ('vinaigrette', 10)], D),
    ('Greek turkey pita burger', [('pita', 60), ('ground turkey', 120), ('feta', 15), ('spinach', 20), ('tzatziki', 30), ('cucumber', 40), 'Oregano, garlic'], LD),
    ('Chicken quesadilla', [('flour tortilla', 60), ('rotisserie chicken', 90), ('light cheddar', 25), ('bell pepper', 40), ('salsa', 40), ('greek yogurt', 30)], LD),
    ('Bean and cheese burrito', [('flour tortilla', 70), ('refried beans', 120), ('brown rice', 80), ('light cheddar', 20), ('salsa', 40)], LD),
    ('Korean BBQ chicken lettuce wraps', [('ground chicken', 130), ('gochujang', 12), ('soy sauce', 8), ('romaine', 60), ('carrot', 30), ('cucumber', 40), ('white rice', 100), ('sesame seeds', 3)], LD),
    ('Tofu banh mi', [('baguette', 75), ('firm tofu', 130), ('carrot', 30), ('cucumber', 30), ('cilantro', 3), ('sriracha', 5), ('light mayo', 8), ('soy sauce', 8), ('rice vinegar', 10)], L),
    ('Chicken gyro plate', [('chicken thigh', 130), ('pita', 60), ('tzatziki', 40), ('tomato', 50), ('cucumber', 50), ('red onion', 15), 'Oregano, garlic, lemon'], D),
    ('Cuban-style pork sandwich', [('ciabatta', 80), ('pork tenderloin', 100), ('ham', 25), ('mozzarella', 20), ('pickles', 25), ('mustard', 8)], L),
    ('Mediterranean tuna wrap', [('flour tortilla', 60), ('canned tuna', 100), ('olives', 12), ('roasted red peppers', 40), ('arugula', 20), ('hummus', 25), ('lemon juice', 5)], L),
]
for name, ing, meals in SANDWICHES:
    R(name, meals, 15, ing, ['Cook or warm any protein that needs it, seasoning well.', 'Layer everything onto the bread or wrap.', 'Toast or press if you like; slice and serve.'])

# ---- More dinners from around the world ----
R('Chicken souvlaki with rice', D, 30, [('chicken breast', 140), ('basmati rice', 150), ('tzatziki', 40), ('tomato', 60), ('cucumber', 60), ('lemon juice', 10), ('olive oil', 6), 'Oregano, garlic'],
  ['Marinate chicken cubes in lemon, oil, garlic and oregano for 15 minutes.', 'Thread on skewers and grill or broil 10–12 minutes, turning.', 'Serve with rice, salad and tzatziki.'])
R('Beef kofta with tabbouleh', D, 30, [('lean ground beef', 120), ('bulgur', 120), ('parsley', 15), ('tomato', 60), ('cucumber', 50), ('lemon juice', 12), ('olive oil', 5), ('greek yogurt', 40), 'Cumin, coriander, cinnamon, garlic'],
  ['Mix beef with spices and garlic, shape onto skewers and grill 8 minutes.', 'Toss bulgur with chopped parsley, tomato, cucumber, lemon and oil.', 'Serve with yogurt.'])
R('Cuban black beans and rice with pork', D, 30, [('pork loin chop', 120), ('black beans', 120), ('white rice', 130), ('onion', 40), ('bell pepper', 40), ('lime juice', 10), 'Cumin, oregano, garlic'],
  ['Sear the pork chop with cumin and garlic, 4 minutes a side.', 'Sauté onion and pepper, add beans and simmer 10 minutes.', 'Serve with rice and lime.'])
R('Chicken marsala with mushrooms', D, 30, [('chicken breast', 140), ('mushrooms', 120), ('broth', 120), ('flour', 10), ('butter', 6), ('whole wheat pasta', 55), 'Marsala wine or extra broth, thyme'],
  ['Dredge thin chicken in flour and sear in butter, 3 minutes a side.', 'Brown mushrooms, add wine and broth and reduce by half.', 'Return chicken to the sauce; serve with pasta.'])
R('Shrimp and grits', D, 25, [('shrimp', 150), ('cornmeal', 45), ('milk', 150), ('light cheddar', 20), ('turkey bacon', 15), ('bell pepper', 40), ('green onion', 10), 'Cajun seasoning, garlic'],
  ['Whisk cornmeal into 200 g simmering water and the milk; cook 10 minutes, stir in cheese.', 'Crisp the bacon, then sauté pepper, garlic and Cajun-seasoned shrimp.', 'Spoon over the grits and top with green onion.'])
R('Paella with chicken and shrimp', D, 40, [('chicken thigh', 90), ('shrimp', 80), ('white rice', 150), ('chicken broth', 150), ('peas', 40), ('bell pepper', 50), ('diced tomatoes', 60), ('olive oil', 6), 'Smoked paprika, saffron or turmeric, garlic'],
  ['Brown chicken in oil with garlic and paprika.', 'Add pepper, tomatoes, rice, saffron and broth and simmer 12 minutes without stirring.', 'Tuck in shrimp and peas, cover 6 minutes.'])
R('Lemon caper chicken piccata', D, 25, [('chicken breast', 140), ('flour', 10), ('butter', 6), ('olive oil', 4), ('lemon juice', 15), ('capers', 8), ('broth', 80), ('whole wheat pasta', 55), ('spinach', 40)],
  ['Pound chicken thin, dredge in flour and sear 3 minutes a side.', 'Add broth, lemon and capers to the pan and reduce, then swirl in butter.', 'Serve over pasta with wilted spinach.'])
R('Turkey shepherd\'s pie', D, 45, [('ground turkey', 130), ('potato', 200), ('milk', 50), ('peas', 40), ('carrot', 50), ('onion', 40), ('tomato paste', 10), ('broth', 80), 'Thyme, Worcestershire'],
  ['Boil and mash potatoes with milk.', 'Brown turkey with onion and carrot, add tomato paste, broth, peas and thyme and simmer 8 minutes.', 'Top with mash and bake at 400 °F for 20 minutes.'])
R('Chicken pot pie skillet', D, 35, [('chicken breast', 120), ('milk', 150), ('flour', 12), ('peas', 40), ('carrot', 50), ('celery', 30), ('butter', 5), ('english muffin', 30), 'Thyme'],
  ['Cook diced chicken and vegetables in butter, stir in flour, then milk, and simmer until thick.', 'Top with torn muffin pieces and bake at 400 °F for 12 minutes.'])
R('Teriyaki salmon with soba', D, 25, [('salmon', 130), ('soba', 55), ('teriyaki', 20), ('snap peas', 80), ('green onion', 8), ('sesame seeds', 3)],
  ['Brush salmon with teriyaki and bake at 400 °F for 12 minutes.', 'Cook soba and blanch snap peas in the same pot.', 'Toss noodles with the rest of the teriyaki; top with salmon, sesame and green onion.'])
R('Miso glazed cod with bok choy', D, 25, [('cod', 170), ('miso', 15), ('honey', 6), ('bok choy', 150), ('brown rice', 140), ('sesame oil', 3)],
  ['Spread cod with miso and honey; broil 8–10 minutes.', 'Sauté bok choy in sesame oil.', 'Serve with rice.'])
R('Chicken katsu with cabbage', D, 30, [('chicken breast', 140), ('panko', 30), ('egg', 1), ('cabbage', 80), ('white rice', 150), ('ketchup', 10), ('soy sauce', 5), ('olive oil', 6)],
  ['Dip chicken in egg and panko and bake on an oiled rack at 425 °F for 18 minutes.', 'Mix ketchup and soy for a quick katsu sauce.', 'Serve with shredded cabbage and rice.'])
R('Ratatouille with white beans', D, 45, [('eggplant', 120), ('zucchini', 100), ('bell pepper', 80), ('crushed tomatoes', 150), ('white beans', 120), ('olive oil', 8), ('sourdough', 40), 'Garlic, thyme, basil'],
  ['Sauté the vegetables in oil with garlic in batches until browned.', 'Add tomatoes, beans and herbs and simmer 20 minutes.', 'Serve with bread.'])
R('Stuffed sweet potato with chili', D, 45, [('sweet potato', 250), ('lean ground beef', 90), ('kidney beans', 60), ('diced tomatoes', 80), ('light cheddar', 15), ('greek yogurt', 30), 'Chili powder, cumin'],
  ['Bake the sweet potato at 425 °F for 40 minutes.', 'Brown beef with spices, add beans and tomatoes and simmer 15 minutes.', 'Split the potato and fill with chili, cheese and yogurt.'])
R('Pork carnitas burrito bowl', D, 30, [('pork tenderloin', 130), ('brown rice', 130), ('pinto beans', 70), ('salsa', 50), ('romaine', 30), ('lime juice', 10), ('orange', 40), 'Cumin, oregano, garlic'],
  ['Cube pork and simmer with orange juice, lime, garlic and spices until the liquid cooks off, then crisp in the pan.', 'Bowl with rice, beans, lettuce and salsa.'])
R('Chicken satay with peanut sauce', D, 30, [('chicken breast', 140), ('peanut sauce', 25), ('jasmine rice', 150), ('cucumber', 70), ('lime juice', 8), 'Curry powder, garlic'],
  ['Marinate chicken strips in curry powder, garlic and a little peanut sauce.', 'Skewer and grill or broil 8–10 minutes.', 'Serve with rice, cucumber and the rest of the sauce.'])
R('Lamb kebabs with couscous', D, 30, [('ground lamb', 90), ('couscous', 150), ('greek yogurt', 50), ('cucumber', 50), ('mint', 3), ('red onion', 15), 'Cumin, coriander, garlic'],
  ['Mix lamb with spices and garlic, shape on skewers and grill 8 minutes.', 'Fluff couscous; stir mint and cucumber into the yogurt.', 'Serve together with onion.'])
R('Seared scallops with risotto-style farro', D, 35, [('scallops', 150), ('farro', 150), ('broth', 150), ('parmesan', 10), ('peas', 50), ('butter', 6), ('lemon juice', 8)],
  ['Simmer cooked farro in broth with peas until creamy, then stir in parmesan.', 'Pat scallops dry and sear in butter 2 minutes a side.', 'Serve over the farro with lemon.'])
R('Turkey meatloaf with green beans', D, 55, [('ground turkey', 140), ('panko', 15), ('egg', 1), ('ketchup', 15), ('onion', 30), ('green beans', 120), ('baby potatoes', 130), 'Worcestershire, garlic'],
  ['Mix turkey, panko, egg, onion and Worcestershire; shape into a mini loaf and top with ketchup.', 'Bake at 375 °F for 40 minutes with potatoes alongside.', 'Steam green beans.'])
R('Vegetable lasagna roll-ups', D, 45, [('pasta', 60), ('ricotta', 90), ('spinach', 50), ('zucchini', 60), ('marinara', 120), ('mozzarella', 30)],
  ['Cook lasagna noodles.', 'Spread with ricotta, spinach and grated zucchini and roll up.', 'Set in marinara, top with mozzarella and bake at 375 °F for 25 minutes.'])
R('Homemade margherita pizza', D, 25, [('pizza dough', 120), ('pizza sauce', 60), ('fresh mozzarella', 50), ('basil', 3), ('mixed greens', 50), ('vinaigrette', 10)],
  ['Stretch the dough thin on a hot sheet pan.', 'Top with sauce and mozzarella and bake at 475 °F for 10–12 minutes.', 'Add basil; serve with a side salad.'])
R('Chicken pesto flatbread', D, 20, [('naan', 90), ('rotisserie chicken', 80), ('pesto', 12), ('mozzarella', 25), ('cherry tomatoes', 60), ('arugula', 20)],
  ['Spread pesto on the naan, add chicken, tomatoes and cheese.', 'Bake at 450 °F for 8 minutes.', 'Top with arugula.'])
R('Turkey pepperoni pizza', D, 25, [('pizza dough', 120), ('pizza sauce', 60), ('mozzarella', 40), ('pepperoni', 25), ('bell pepper', 40), ('mushrooms', 40)],
  ['Stretch dough, top with sauce, cheese, pepperoni and vegetables.', 'Bake at 475 °F for 10–12 minutes.'])
R('Tofu and vegetable dumplings', D, 40, [('wonton wrappers', 60), ('firm tofu', 100), ('cabbage', 60), ('mushrooms', 40), ('soy sauce', 10), ('sesame oil', 4), ('ginger', 4), ('rice vinegar', 5)],
  ['Mix crumbled tofu, finely chopped cabbage and mushrooms, ginger, half the soy and sesame oil.', 'Fill wrappers, seal with water and steam 8 minutes or pan-fry then steam.', 'Dip in soy and rice vinegar.'])
R('Pork and cabbage dumplings', D, 40, [('wonton wrappers', 60), ('pork tenderloin', 100), ('cabbage', 60), ('green onion', 10), ('soy sauce', 10), ('sesame oil', 3), ('ginger', 4), ('rice vinegar', 5)],
  ['Finely chop the pork, mix with cabbage, green onion, ginger, soy and sesame oil.', 'Fill wrappers and steam 10 minutes.', 'Dip in soy and vinegar.'])
R('Chicken burrito skillet', D, 30, [('chicken breast', 120), ('brown rice', 120), ('black beans', 70), ('corn', 40), ('salsa', 60), ('light cheddar', 20), ('broth', 80), 'Cumin, chili powder'],
  ['Brown diced chicken with spices.', 'Add rice, beans, corn, salsa and broth and simmer 5 minutes.', 'Top with cheese and cover until melted.'])
R('Ethiopian-style lentil stew (misir wot)', D, 40, [('red lentils', 70), ('onion', 60), ('tomato paste', 15), ('olive oil', 6), ('brown rice', 120), ('spinach', 40), 'Berbere spice, garlic, ginger'],
  ['Cook onion slowly in oil until soft, add garlic, ginger, berbere and tomato paste.', 'Add lentils and 400 g water and simmer 25 minutes.', 'Serve with rice and sautéed spinach.'])
R('Mapo tofu with rice', D, 25, [('silken tofu', 200), ('ground turkey', 60), ('chili crisp', 8), ('soy sauce', 8), ('broth', 100), ('green onion', 10), ('white rice', 150), 'Garlic, ginger, Szechuan pepper, cornstarch'],
  ['Brown turkey with garlic, ginger and chili crisp.', 'Add broth and soy, slide in tofu cubes and simmer 5 minutes; thicken with cornstarch.', 'Top with green onion; serve with rice.'])
R('Chicken adobo with rice', D, 40, [('chicken thigh', 140), ('soy sauce', 15), ('vinegar', 20), ('white rice', 150), ('green beans', 80), 'Garlic, bay leaf, peppercorns'],
  ['Simmer chicken with soy, vinegar, garlic, bay leaf and pepper for 30 minutes.', 'Uncover and reduce the sauce until glossy.', 'Serve with rice and green beans.'])
R('Peruvian-style roast chicken with green sauce', D, 40, [('chicken thigh', 140), ('baby potatoes', 150), ('greek yogurt', 30), ('cilantro', 8), ('jalapeno', 8), ('lime juice', 10), ('olive oil', 5), 'Cumin, paprika, garlic'],
  ['Rub chicken with spices and roast with potatoes at 425 °F for 30 minutes.', 'Blend yogurt, cilantro, jalapeño and lime into a green sauce.', 'Serve together.'])
R('Lemongrass pork vermicelli bowl', D, 30, [('pork tenderloin', 120), ('rice noodles', 55), ('romaine', 40), ('cucumber', 50), ('carrot', 30), ('mint', 3), ('peanuts', 10), ('fish sauce', 8), ('lime juice', 10), ('brown sugar', 5), 'Lemongrass, garlic'],
  ['Marinate sliced pork in lemongrass, garlic, half the fish sauce and sugar; sear until caramelized.', 'Soak noodles; mix the rest of the fish sauce with lime, sugar and water for dressing.', 'Bowl with herbs, vegetables, peanuts and dressing.'])
R('Shakshuka with chickpeas and feta', D, 25, [('egg', 2), ('chickpeas', 100), ('crushed tomatoes', 200), ('bell pepper', 60), ('onion', 40), ('feta', 20), ('pita', 45), ('olive oil', 5), 'Cumin, paprika, garlic'],
  ['Sauté onion and pepper with spices, add tomatoes and chickpeas and simmer 10 minutes.', 'Make wells, crack in the eggs, cover until set.', 'Top with feta; serve with pita.'])
R('Coconut lime chicken with rice', D, 30, [('chicken breast', 140), ('light coconut milk', 100), ('lime juice', 15), ('jasmine rice', 150), ('spinach', 40), ('cilantro', 3), 'Garlic, ginger'],
  ['Sear the chicken.', 'Add coconut milk, lime, garlic and ginger and simmer 10 minutes.', 'Wilt in spinach; serve over rice with cilantro.'])
R('Hawaiian chicken skewers', D, 30, [('chicken breast', 140), ('pineapple', 100), ('bell pepper', 60), ('teriyaki', 20), ('white rice', 140)],
  ['Thread chicken, pineapple and pepper onto skewers.', 'Grill or broil 12 minutes, brushing with teriyaki.', 'Serve over rice.'])
R('Cajun salmon with dirty rice', D, 30, [('salmon', 130), ('brown rice', 140), ('ground turkey', 40), ('bell pepper', 40), ('celery', 20), ('onion', 30), 'Cajun seasoning'],
  ['Rub salmon with Cajun seasoning and bake at 400 °F for 12 minutes.', 'Brown turkey with the vegetables and seasoning, then stir in the rice.', 'Serve together.'])
R('Garlic butter steak bites with cauliflower mash', D, 25, [('sirloin', 140), ('cauliflower', 250), ('butter', 8), ('milk', 30), ('parmesan', 10), ('green beans', 80), 'Garlic, thyme'],
  ['Steam cauliflower and mash with milk and parmesan.', 'Sear steak cubes in a hot pan, add butter, garlic and thyme for the last minute.', 'Serve with green beans.'])
R('Baked falafel bowl', LD, 30, [('falafel', 100), ('quinoa', 120), ('cucumber', 60), ('cherry tomatoes', 60), ('tahini', 12), ('lemon juice', 8), ('red cabbage', 30)],
  ['Warm the falafel in the oven.', 'Bowl quinoa with vegetables.', 'Drizzle with tahini thinned with lemon and water.'])
R('Seitan cheesesteak', D, 20, [('seitan', 80), ('ciabatta', 80), ('bell pepper', 60), ('onion', 50), ('mozzarella', 20), ('olive oil', 5)],
  ['Slice seitan thin and sear with peppers and onion in the oil.', 'Pile into the roll and top with cheese; toast until melted.'])
