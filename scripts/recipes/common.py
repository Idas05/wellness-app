from ingredients import I
B, L, D, LD, S, BS = ['breakfast'], ['lunch'], ['dinner'], ['lunch', 'dinner'], ['snack'], ['breakfast', 'snack']
MEATS = {'chicken', 'turkey', 'beef', 'pork', 'lamb', 'fish', 'shellfish'}
ALLERGENS = ['milk', 'egg', 'fish', 'shellfish', 'treenut', 'peanut', 'gluten', 'soy', 'sesame']
RECIPES = []
def R(name, meals, mins, ingredients, steps):
    kcal = p = c = f = 0.0
    tags = set(); lines = []
    for it in ingredients:
        if isinstance(it, str):
            lines.append(it); continue
        key, amt = it
        if key not in I: raise KeyError(f'{name}: unknown ingredient {key}')
        d = I[key]
        if key == 'egg' and amt <= 6:
            g = amt * 50; lines.append(f"{amt} egg{'s' if amt > 1 else ''}")
        else:
            g = amt; lines.append(f"{amt} g {d['name']}")
        kcal += d['kcal'] * g / 100; p += d['p'] * g / 100; c += d['c'] * g / 100; f += d['f'] * g / 100
        tags.update(d['tags'])
    RECIPES.append(dict(name=name, meals=meals, mins=mins, cal=round(kcal / 5) * 5, protein=round(p), carbs=round(c), fat=round(f),
                        meats=[m for m in ['chicken', 'turkey', 'beef', 'pork', 'lamb', 'fish', 'shellfish'] if m in tags],
                        contains=[a for a in ALLERGENS if a in tags], honey='honey' in tags, ingredients=lines, steps=steps))
