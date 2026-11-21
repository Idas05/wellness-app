import re, json, sys
sys.path.insert(0, sys.argv[1])
from common import RECIPES
import r_breakfast, r_bowls, r_mains, r_more, r_snacks
base = open(sys.argv[2]).read()
ids = set(re.findall(r"id: '([^']+)'", base)); names = {n.lower() for n in re.findall(r"name: '((?:[^'\\]|\\.)*)'", base)}
def slug(n): return re.sub(r'[^a-z0-9]+', '-', n.lower()).strip('-')
out, seen, dup = [], set(), []
for r in RECIPES:
    sid = slug(r['name'])
    if r['name'].lower() in names or sid in seen: dup.append(r['name']); continue
    if sid in ids: sid += '-2'
    seen.add(sid); r['id'] = sid; out.append(r)
def js(s): return json.dumps(s, ensure_ascii=False).replace("\\'", "'")
MEAL = {('breakfast',): 'B', ('lunch',): 'L', ('dinner',): 'D', ('lunch', 'dinner'): 'LD', ('snack',): 'S', ('breakfast', 'snack'): 'BS'}
lines = ["import type { MealId } from './nutrition';", "import type { LibraryRecipe } from './recipeLibrary';", "",
 "// Generated: calories and macros come from each ingredient's grams (standard USDA-style values per 100 g),",
 "// and meats and allergens come from the ingredients, so diet filters can't drift from the recipe.", "",
 "const B: MealId[] = ['breakfast'];", "const L: MealId[] = ['lunch'];", "const D: MealId[] = ['dinner'];", "const LD: MealId[] = ['lunch', 'dinner'];", "const S: MealId[] = ['snack'];", "const BS: MealId[] = ['breakfast', 'snack'];", "",
 "export const MORE_RECIPES: LibraryRecipe[] = ["]
for r in out:
    honey = ', honey: true' if r['honey'] else ''
    lines.append(f"  {{ id: {js(r['id'])}, name: {js(r['name'])}, meals: {MEAL[tuple(r['meals'])]}, cal: {r['cal']}, protein: {r['protein']}, carbs: {r['carbs']}, fat: {r['fat']}, mins: {r['mins']}, meats: {js(r['meats'])}, contains: {js(r['contains'])}{honey},")
    lines.append(f"    ingredients: {js(r['ingredients'])},")
    lines.append(f"    steps: {js(r['steps'])} }},")
lines.append("];")
open(sys.argv[3], 'w').write('\n'.join(lines) + '\n')
from collections import Counter
cnt = Counter(m for r in out for m in r['meals'])
print('recipes', len(out), dict(cnt), 'skipped dups', dup)
for r in sorted(out, key=lambda r: r['cal']):
    pass
print('cal range by meal:')
for m in ['breakfast','lunch','dinner','snack']:
    cs = sorted(r['cal'] for r in out if m in r['meals']); print(' ', m, cs[0], cs[len(cs)//2], cs[-1])
