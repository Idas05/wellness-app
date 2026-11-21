from common import R, L, D, LD

# ---- Grain bowls: one protein, one cuisine ----
PROTEINS = {
    'chicken': ([('chicken breast', 140)], 'chicken'),
    'tofu': ([('firm tofu', 170)], 'tofu'),
    'shrimp': ([('shrimp', 150)], 'shrimp'),
    'steak': ([('flank steak', 130)], 'steak'),
    'salmon': ([('salmon', 120)], 'salmon'),
    'chickpea': ([('chickpeas', 150)], 'chickpeas'),
    'turkey': ([('ground turkey', 130)], 'turkey'),
    'tempeh': ([('tempeh', 110)], 'tempeh'),
}
STYLES = {
    'Korean bibimbap': dict(base=[('white rice', 150)], veg=[('spinach', 40), ('carrot', 40), ('bean sprouts', 40), ('kimchi', 40)], sauce=[('gochujang', 15), ('sesame oil', 4), ('soy sauce', 6)], season='Garlic', how='Cook the {p} with half the gochujang, soy and garlic; arrange over rice with the vegetables and kimchi, then drizzle with the rest mixed with sesame oil.', mins=25),
    'Greek': dict(base=[('quinoa', 150)], veg=[('cucumber', 70), ('cherry tomatoes', 70), ('red onion', 15), ('olives', 15)], sauce=[('tzatziki', 40), ('lemon juice', 10), ('olive oil', 4)], season='Oregano, garlic', how='Season the {p} with oregano, garlic, lemon and oil and cook; serve over quinoa with the vegetables and tzatziki.', mins=25),
    'Thai peanut': dict(base=[('brown rice', 150)], veg=[('red cabbage', 50), ('carrot', 40), ('edamame', 30), ('cilantro', 3)], sauce=[('peanut sauce', 25), ('lime juice', 10)], season='Garlic, ginger', how='Cook the {p} with garlic and ginger; serve over rice with the slaw and edamame, drizzled with peanut sauce thinned with lime.', mins=25),
    'Teriyaki': dict(base=[('white rice', 150)], veg=[('broccoli', 90), ('carrot', 30), ('green onion', 8)], sauce=[('teriyaki', 25), ('sesame seeds', 3)], season='Garlic, ginger', how='Cook the {p} and steam the broccoli and carrot; toss the {p} in teriyaki and serve over rice with sesame and green onion.', mins=25),
    'Burrito': dict(base=[('brown rice', 130)], veg=[('black beans', 60), ('corn', 40), ('romaine', 30), ('salsa', 50)], sauce=[('avocado', 30), ('lime juice', 8)], season='Cumin, chili powder, garlic powder', how='Season the {p} with cumin, chili and garlic and cook; serve over rice with beans, corn, lettuce, salsa and avocado.', mins=25),
    'Mediterranean': dict(base=[('farro', 140)], veg=[('roasted red peppers', 50), ('artichoke hearts', 50), ('arugula', 20), ('feta', 15)], sauce=[('hummus', 25), ('lemon juice', 10), ('olive oil', 4)], season='Za\'atar or oregano', how='Season and cook the {p}; serve over farro with peppers, artichokes, arugula, feta and hummus.', mins=30),
    'Cajun': dict(base=[('brown rice', 140)], veg=[('bell pepper', 60), ('onion', 40), ('celery', 30), ('corn', 30)], sauce=[('olive oil', 6), ('hot sauce', 5)], season='Cajun seasoning', how='Toss the {p} and vegetables with Cajun seasoning and oil; cook until charred and serve over rice with hot sauce.', mins=25),
    'Tikka': dict(base=[('basmati rice', 150)], veg=[('cauliflower', 80), ('spinach', 30), ('red onion', 15), ('cilantro', 3)], sauce=[('tikka paste', 15), ('greek yogurt', 50)], season='Lemon', how='Coat the {p} and cauliflower in tikka paste mixed with half the yogurt; roast at 425 °F for 18 minutes. Serve over rice with spinach, onion and the rest of the yogurt.', mins=30),
    'Poke-style': dict(base=[('sushi rice', 150)], veg=[('cucumber', 60), ('edamame', 30), ('avocado', 30), ('seaweed', 2)], sauce=[('soy sauce', 10), ('rice vinegar', 5), ('sesame oil', 3), ('sriracha', 5)], season='Green onion, sesame seeds', how='Sear or cook the {p} and toss with soy, vinegar, sesame oil and sriracha; serve over rice with cucumber, edamame, avocado and nori.', mins=20),
    'Harissa': dict(base=[('couscous', 150)], veg=[('zucchini', 80), ('carrot', 50), ('chickpeas', 40), ('mint', 2)], sauce=[('harissa', 12), ('greek yogurt', 40), ('lemon juice', 8)], season='Cumin', how='Rub the {p} and vegetables with harissa and roast at 425 °F for 18 minutes; serve over couscous with yogurt, lemon and mint.', mins=30),
    'Jerk': dict(base=[('brown rice', 130)], veg=[('kidney beans', 50), ('mango', 60), ('red onion', 15), ('cabbage', 40)], sauce=[('jerk seasoning', 8), ('lime juice', 10), ('olive oil', 4)], season='Thyme', how='Rub the {p} with jerk seasoning and oil and cook; serve over rice and beans with mango salsa and cabbage.', mins=25),
    'Miso ginger': dict(base=[('brown rice', 140)], veg=[('bok choy', 90), ('mushrooms', 60), ('carrot', 30)], sauce=[('miso', 12), ('rice vinegar', 6), ('honey', 5), ('sesame oil', 3)], season='Ginger, garlic', how='Glaze the {p} with miso, vinegar, honey and ginger and roast at 425 °F; sauté bok choy and mushrooms and serve over rice.', mins=25),
}
SKIP = {('chickpea', 'Poke-style'), ('chickpea', 'Teriyaki'), ('tempeh', 'Greek'), ('tempeh', 'Burrito'), ('steak', 'Harissa'), ('salmon', 'Cajun'),
        ('turkey', 'Poke-style'), ('turkey', 'Tikka'), ('tempeh', 'Jerk'), ('chickpea', 'Harissa'), ('tempeh', 'Cajun'), ('steak', 'Miso ginger'),
        ('turkey', 'Greek'), ('salmon', 'Burrito'), ('shrimp', 'Tikka'), ('tofu', 'Burrito')}
for sname, st in STYLES.items():
    for pkey, (ping, pword) in PROTEINS.items():
        if (pkey, sname) in SKIP:
            continue
        noun = {'chicken': 'chicken', 'tofu': 'tofu', 'shrimp': 'shrimp', 'steak': 'steak', 'salmon': 'salmon', 'chickpea': 'chickpea', 'turkey': 'turkey', 'tempeh': 'tempeh'}[pkey]
        name = f'{sname} {noun} bowl'
        if sname == 'Korean bibimbap':
            name = f'{noun.capitalize()} bibimbap'
        if sname == 'Burrito':
            name = f'{noun.capitalize()} burrito bowl'
        veg = st['veg']
        if pkey == 'chickpea':
            veg = [v for v in veg if v[0] != 'chickpeas']
        R(name, LD, st['mins'], ping + st['base'] + veg + st['sauce'] + [st['season']],
          ['Cook the grain if it isn\'t ready.', st['how'].format(p=pword), 'Keeps 3–4 days in the fridge; pack sauce separately.'])

# ---- Tacos ----
TACOS = [
    ('Baja fish tacos', [('cod', 140), ('cabbage', 50), ('light sour cream', 20), ('lime juice', 10), ('salsa', 30), 'Chili powder, cumin'], 'Season and pan-sear the cod 3 minutes a side, then flake.', ['fish']),
    ('Chicken tinga tacos', [('chicken breast', 130), ('crushed tomatoes', 80), ('onion', 40), ('queso fresco', 15), ('cilantro', 3), 'Chipotle in adobo, garlic'], 'Simmer chicken in tomatoes, onion and chipotle for 20 minutes, then shred.', []),
    ('Carne asada tacos', [('flank steak', 130), ('onion', 30), ('cilantro', 4), ('salsa verde', 40), ('lime juice', 10), 'Cumin, garlic'], 'Marinate steak in lime, garlic and cumin, grill 4 minutes a side and slice thin.', []),
    ('Shrimp tacos with mango salsa', [('shrimp', 140), ('mango', 70), ('red onion', 15), ('cabbage', 40), ('jalapeno', 8), ('lime juice', 10), 'Chili powder'], 'Season and sear the shrimp 2 minutes a side.', []),
    ('Black bean sweet potato tacos', [('black beans', 100), ('sweet potato', 120), ('avocado', 40), ('red cabbage', 40), ('lime juice', 8), 'Cumin, smoked paprika'], 'Roast cubed sweet potato with spices at 425 °F for 20 minutes; warm the beans.', []),
    ('Classic turkey tacos', [('ground turkey', 130), ('romaine', 40), ('tomato', 50), ('light cheddar', 15), ('salsa', 40), 'Taco seasoning'], 'Brown the turkey with taco seasoning and a splash of water.', []),
    ('Al pastor-style pork tacos', [('pork tenderloin', 130), ('pineapple', 60), ('onion', 30), ('cilantro', 3), ('lime juice', 8), 'Chili powder, cumin, oregano'], 'Rub pork with spices, sear, then slice and toss with charred pineapple.', []),
    ('Crispy tofu tacos with slaw', [('firm tofu', 150), ('coleslaw mix', 60), ('sriracha', 8), ('light mayo', 10), ('lime juice', 8), 'Cornstarch, chili powder'], 'Cube tofu, dust with cornstarch and chili, and pan-fry until crisp.', []),
    ('Chipotle salmon tacos', [('salmon', 120), ('cabbage', 50), ('avocado', 30), ('greek yogurt', 30), ('lime juice', 8), 'Chipotle powder'], 'Rub salmon with chipotle and bake at 400 °F for 12 minutes, then flake.', []),
    ('Mushroom and poblano tacos', [('mushrooms', 150), ('bell pepper', 70), ('onion', 40), ('queso fresco', 20), ('black beans', 60), 'Cumin, oregano'], 'Sauté mushrooms, peppers and onion with spices until browned; warm the beans.', []),
]
for name, ing, how, _ in TACOS:
    R(name, LD, 25, [('corn tortilla', 78), ('olive oil', 4)] + ing, [how, 'Warm the tortillas in a dry pan.', 'Fill and top with the rest.'])
