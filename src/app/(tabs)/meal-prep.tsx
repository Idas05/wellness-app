import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EatOut } from '../../components/EatOut';
import { SyncNotice } from '../../components/SyncNotice';
import { card, colors, Screen } from '../../components/Screen';
import { useApp } from '../../lib/store';
import { macroGoals, sumMacros } from '../../lib/macros';
import type { RestaurantMeal } from '../../lib/restaurants';
import {
  ALLERGENS,
  DIETS,
  loadPrefs,
  matchRecipes,
  cutoffLabel,
  MEAL_CUTOFF,
  mealBudget,
  mealNow,
  scaleIngredient,
  savePrefs,
  freshFirst,
  loadLogged,
  loadSeen,
  markLogged,
  markSeen,
  onBreak,
  LOGGED_BREAK_DAYS,
  shuffle,
  type AllergenId,
  type Budget,
  type DietId,
  type DietPrefs,
  type Suggestion,
} from '../../lib/mealPrep';
import { calculatePlan, loadDay, loadProfile, MEALS, mealOf, recentFoodNames, saveDay, todayKey, type CalorieProfile, type FoodEntry, type MealId } from '../../lib/nutrition';
import { RECIPE_LIBRARY } from '../../lib/recipeLibrary';
import { newId } from '../../lib/reminders';

const PAGE = 3;

const cap = (t: string) => t[0].toUpperCase() + t.slice(1);
const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

function mealNote(b: Budget, meal: MealId, noun: string, daily: number, nounOf: (m: MealId) => string): string {
  if (b.closed) {
    const ended = `${cap(noun)} ended at ${cutoffLabel(MEAL_CUTOFF[meal]!)}`;
    return b.movedOut > 0 && b.movedTo
      ? `${ended}, so the ${b.movedOut.toLocaleString()} cal it didn't use moved to ${nounOf(b.movedTo)}. These are light ideas if you still want something.`
      : `${ended}. These are light ideas if you still want something.`;
  }
  const extra = b.carried > 0 ? `, plus ${Math.round(b.carried).toLocaleString()} left over from ${list(b.carriedFrom.map(nounOf))}` : '';
  if (b.light) return `You've used up your ${noun} calories for today, so these are light ideas.`;
  if (b.logged > 0) return `${cap(noun)} gets about ${b.share.toLocaleString()} of your ${daily.toLocaleString()} cal${extra}. You've already logged ${b.logged.toLocaleString()} for it, so this is what's left.`;
  if (b.target < b.share + b.carried) return `${cap(noun)} would get about ${Math.round(b.share + b.carried).toLocaleString()} cal${extra ? ` (its ${b.share.toLocaleString()}${extra})` : ''}, but you only have ${b.leftToday.toLocaleString()} left today.`;
  if (b.carried > 0) return `${cap(noun)} gets about ${b.share.toLocaleString()} of your ${daily.toLocaleString()} cal${extra}.`;
  return `About ${Math.round((b.share / daily) * 100)}% of your ${daily.toLocaleString()} cal day. Nothing logged for ${noun} yet.`;
}
const DEFAULT_DAILY = 2000;

export default function MealPrepScreen() {
  const [prefs, setPrefs] = useState<DietPrefs | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<CalorieProfile | null>(null);
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [meal, setMeal] = useState<MealId>(mealNow());
  const [order, setOrder] = useState<Suggestion[]>([]);
  const [page, setPage] = useState(0);
  const [logged, setLogged] = useState<string | null>(null);
  const [visit, setVisit] = useState(0);
  const [mode, setMode] = useState<'home' | 'out'>('home');

  useFocusEffect(
    useCallback(() => {
      setVisit((v) => v + 1);
      // Each visit opens on the meal the clock is at, so a meal that's over hands off to the next one.
      setMeal(mealNow());
      loadPrefs().then(setPrefs);
      loadProfile().then(setProfile);
      loadDay(todayKey()).then(setFoods);
    }, []),
  );

  // A change on the other device: refresh the numbers, but keep the recipes and meal you're looking at.
  const { syncTick } = useApp();
  useEffect(() => {
    if (!syncTick) return;
    loadPrefs().then(setPrefs);
    loadProfile().then(setProfile);
    loadDay(todayKey()).then(setFoods);
  }, [syncTick]);

  const daily = profile ? calculatePlan(profile).dailyCalories : DEFAULT_DAILY;
  const eatenToday = foods.reduce((s, f) => s + f.calories, 0);
  const loggedByMeal = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 } as Record<MealId, number>;
  for (const f of foods) loggedByMeal[mealOf(f)] += f.calories;
  const budget = mealBudget(daily, meal, loggedByMeal, eatenToday);
  const mealLabel = MEALS.find((m) => m.id === meal)!.label;
  const noun = meal === 'snack' ? 'snack' : mealLabel.toLowerCase();
  const nounOf = (m: MealId) => (m === 'snack' ? 'snacks' : MEALS.find((x) => x.id === m)!.label.toLowerCase());

  const matches = useMemo(() => (prefs ? matchRecipes(RECIPE_LIBRARY, meal, budget.recipeTarget, prefs) : []), [prefs, meal, budget.recipeTarget]);

  // Every visit, and whenever what we're matching against changes: recipes you logged this week are left out,
  // and the rest come in order of how long ago you last saw them, so each visit opens on new ones.
  useEffect(() => {
    let live = true;
    Promise.all([loadSeen(), loadLogged(), recentFoodNames(LOGGED_BREAK_DAYS)]).then(([seen, loggedAt, names]) => {
      if (!live) return;
      const resting = onBreak(loggedAt, names, RECIPE_LIBRARY);
      const pool = matches.filter((m) => !resting.has(m.recipe.id));
      setOrder(freshFirst(pool.length ? pool : matches, seen));
      setPage(0);
      setLogged(null);
    });
    return () => {
      live = false;
    };
  }, [matches, visit]);

  const pages = Math.max(1, Math.ceil(order.length / PAGE));
  const shown = order.slice(page * PAGE, page * PAGE + PAGE);
  const shownKey = shown.map((s) => s.recipe.id).join(',');

  // Remember what's been shown, so next time (on this device or the other) brings new ones.
  useEffect(() => {
    const ids = shownKey ? shownKey.split(',') : [];
    const matchIds = matches.map((m) => m.recipe.id);
    // Skip the moment between switching meals and the new list arriving, and only count recipes that stayed
    // on screen for a moment, so a list that's replaced while your food log loads doesn't use up fresh ones.
    if (!ids.length || !ids.every((id) => matchIds.includes(id))) return;
    const t = setTimeout(() => markSeen(ids), 1500);
    return () => clearTimeout(t);
  }, [shownKey]);

  const refresh = () => {
    setLogged(null);
    if (page + 1 < pages) setPage(page + 1);
    else {
      // Seen them all: reshuffle, keeping the ones on screen from coming straight back.
      const onScreen = new Set(shown.map((s) => s.recipe.id));
      const next = shuffle(order);
      next.sort((a, b) => Number(onScreen.has(a.recipe.id)) - Number(onScreen.has(b.recipe.id)));
      setOrder(next);
      setPage(0);
    }
  };

  const logIt = async (s: Suggestion) => {
    const day = todayKey();
    const current = await loadDay(day);
    const entry: FoodEntry = { id: newId(), name: `${s.recipe.name} · 1 serving`, calories: s.calories, protein: Math.round(s.recipe.protein * s.portion), carbs: Math.round(s.recipe.carbs * s.portion), fat: Math.round(s.recipe.fat * s.portion), at: new Date().toISOString(), meal };
    // The log updates, but the suggestions stay put until you come back, so the ✓ doesn't vanish.
    await saveDay(day, [...current, entry]);
    await markLogged(s.recipe.id);
    setLogged(s.recipe.id);
  };

  const logOut = async (m: RestaurantMeal) => {
    const day = todayKey();
    const current = await loadDay(day);
    const entry: FoodEntry = { id: newId(), name: `${m.place} ${m.name}`, calories: m.cal, protein: m.protein, carbs: m.carbs, fat: m.fat, at: new Date().toISOString(), meal };
    await saveDay(day, [...current, entry]);
    setFoods([...current, entry]);
  };

  if (prefs === undefined) return <Screen title="Meal Prep">{null}</Screen>;

  if (prefs === null || editing) {
    return (
      <Screen title="Meal Prep" subtitle="First, a couple of questions">
        <PrefsForm
          initial={prefs}
          onCancel={prefs ? () => setEditing(false) : undefined}
          onDone={async (p) => {
            await savePrefs(p);
            setPrefs(p);
            setEditing(false);
          }}
        />
      </Screen>
    );
  }

  // Halal and kosher are about how the meat is sourced too, which a recipe can't check.
  const certified = [prefs.diets.includes('halal') && 'halal', prefs.diets.includes('kosher') && 'kosher'].filter(Boolean).join(' or ');
  const prefLabels = [...prefs.diets.map((d) => DIETS.find((x) => x.id === d)!.label), ...prefs.allergies.map((a) => `No ${ALLERGENS.find((x) => x.id === a)!.label.toLowerCase()}`)];

  return (
    <Screen title="Meal Prep" subtitle={mode === 'home' ? 'Recipes that fit your calories and diet' : 'Restaurant meals that fit your day'}>
      <SyncNotice />
      <View style={styles.modes}>
        {(['home', 'out'] as const).map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={[styles.mode, mode === m && styles.modeOn]} accessibilityRole="tab" accessibilityState={{ selected: mode === m }}>
            <Text style={[styles.modeText, mode === m && { color: '#fff' }]}>{m === 'home' ? '🍳  Cook at home' : '🍔  Eat out'}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.meals}>
        {MEALS.map((m) => (
          <Pressable key={m.id} onPress={() => setMeal(m.id)} style={[styles.chip, meal === m.id && styles.chipOn]} accessibilityRole="radio" accessibilityState={{ selected: meal === m.id }}>
            <Text style={[styles.chipText, meal === m.id && { color: '#fff' }]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      {mode === 'out' ? (
        <EatOut
          prefs={prefs}
          calLeft={daily - eatenToday}
          proteinLeft={profile ? macroGoals(calculatePlan(profile), profile).protein - sumMacros(foods).protein : null}
          breakfast={meal === 'breakfast'}
          mealLabel={mealLabel}
          onLog={logOut}
        />
      ) : (
        <>
      <View style={card.box}>
        <Text style={card.heading}>{mealLabel} target</Text>
        <Text style={styles.big}>{budget.target.toLocaleString()} cal</Text>
        <Text style={styles.body}>
          {mealNote(budget, meal, noun, daily, nounOf)}
        </Text>
        {budget.recipeTarget < budget.target ? (
          <Text style={[styles.body, { marginTop: 6 }]}>
            That's more than one plate, so these recipes are about {budget.recipeTarget.toLocaleString()} cal. Add a snack or a side for the rest.
          </Text>
        ) : null}
        {!profile ? (
          <Pressable onPress={() => router.navigate('/calories')} accessibilityRole="link" style={{ marginTop: 8 }}>
            <Text style={styles.link}>Using 2,000 cal a day. Set your goal in Cal Counter ›</Text>
          </Pressable>
        ) : null}
        <View style={styles.prefRow}>
          <Text style={[styles.muted, { flex: 1 }]}>{prefLabels.length ? prefLabels.join(' · ') : 'No dietary restrictions'}</Text>
          <Pressable onPress={() => setEditing(true)} hitSlop={8} accessibilityRole="link">
            <Text style={styles.link}>Edit</Text>
          </Pressable>
        </View>
      </View>

      {shown.length === 0 ? (
        <View style={card.box}>
          <Text style={styles.body}>
            No {noun} recipes match all of your restrictions at {budget.recipeTarget.toLocaleString()} cal. Try another meal, or edit your restrictions.
          </Text>
        </View>
      ) : (
        shown.map((s) => <RecipeCard key={s.recipe.id} s={s} certified={certified} mealLabel={mealLabel} logged={logged === s.recipe.id} onLog={() => logIt(s)} />)
      )}

      {order.length > 0 ? (
        <>
          <Pressable onPress={refresh} style={styles.refresh} accessibilityRole="button" accessibilityLabel="Refresh recipes">
            <Text style={styles.refreshText}>↻  Show me different recipes</Text>
          </Pressable>
          <Text style={[styles.muted, { textAlign: 'center' }]}>
            {order.length <= PAGE ? `That's every ${noun} recipe that fits right now.` : `${order.length} ${noun} recipes fit · showing set ${page + 1} of ${pages}`}
          </Text>
        </>
      ) : null}
        </>
      )}
    </Screen>
  );
}

function RecipeCard({ s, certified, mealLabel, logged, onLog }: { s: Suggestion; certified: string; mealLabel: string; logged: boolean; onLog: () => void }) {
  const [open, setOpen] = useState(false);
  const r = s.recipe;
  return (
    <View style={card.box}>
      <Text style={styles.recipeName}>{r.name}</Text>
      <Text style={styles.meta}>
        {s.calories.toLocaleString()} cal · {Math.round(r.protein * s.portion)} g protein · {Math.round(r.carbs * s.portion)} g carbs ·{' '}
        {Math.round(r.fat * s.portion)} g fat · {r.mins} min
      </Text>
      <Text style={styles.portion}>Makes 1 serving, sized to your target</Text>
      {certified && r.meats.some((m) => m !== 'fish' && m !== 'shellfish') ? <Text style={styles.portion}>Use {certified}-certified {r.meats[0]}.</Text> : null}

      {open ? (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.sub}>Ingredients</Text>
          {r.ingredients.map((x) => (
            <Text key={x} style={styles.li}>
              • {scaleIngredient(x, s.portion)}
            </Text>
          ))}
          <Text style={[styles.sub, { marginTop: 10 }]}>Steps</Text>
          {r.steps.map((x, i) => (
            <Text key={i} style={styles.li}>
              {i + 1}. {x}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.cardButtons}>
        <Pressable onPress={() => setOpen(!open)} style={[styles.lightButton, { flex: 1 }]} accessibilityRole="button">
          <Text style={styles.lightText}>{open ? 'Hide recipe' : 'Show recipe'}</Text>
        </Pressable>
        <Pressable onPress={onLog} disabled={logged} style={[styles.darkButton, { flex: 1 }, logged && { opacity: 0.6 }]} accessibilityRole="button" accessibilityLabel={`Log ${r.name} to ${mealLabel}`}>
          <Text style={styles.darkText}>{logged ? 'Logged ✓' : `Log to ${mealLabel}`}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PrefsForm({ initial, onDone, onCancel }: { initial: DietPrefs | null; onDone: (p: DietPrefs) => void; onCancel?: () => void }) {
  const [diets, setDiets] = useState<DietId[]>(initial?.diets ?? []);
  const [allergies, setAllergies] = useState<AllergenId[]>(initial?.allergies ?? []);
  const toggle = <T,>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

  return (
    <>
      <View style={card.box}>
        <Text style={card.heading}>Religious or lifestyle diet</Text>
        <Text style={[styles.muted, { marginBottom: 10 }]}>Pick any that apply.</Text>
        <View style={styles.wrap}>
          {DIETS.map((d) => {
            const on = diets.includes(d.id);
            return (
              <Pressable key={d.id} onPress={() => setDiets(toggle(diets, d.id))} style={[styles.pick, on && styles.chipOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                <Text style={[styles.pickText, on && { color: '#fff' }]}>{d.label}</Text>
                {d.hint ? <Text style={[styles.pickHint, on && { color: 'rgba(255,255,255,0.75)' }]}>{d.hint}</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={card.box}>
        <Text style={card.heading}>Allergies</Text>
        <Text style={[styles.muted, { marginBottom: 10 }]}>Recipes with these are never shown.</Text>
        <View style={styles.wrap}>
          {ALLERGENS.map((a) => {
            const on = allergies.includes(a.id);
            return (
              <Pressable key={a.id} onPress={() => setAllergies(toggle(allergies, a.id))} style={[styles.pick, on && styles.chipOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                <Text style={[styles.pickText, on && { color: '#fff' }]}>{a.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable onPress={() => onDone({ diets, allergies })} style={styles.darkButton} accessibilityRole="button">
        <Text style={styles.darkText}>{diets.length || allergies.length ? 'Save and find recipes' : 'None of these, find recipes'}</Text>
      </Pressable>
      {onCancel ? (
        <Pressable onPress={onCancel} style={{ padding: 12, alignItems: 'center' }}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  modes: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 4, marginBottom: 12 },
  mode: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modeOn: { backgroundColor: colors.accent },
  modeText: { fontSize: 15, fontWeight: '700', color: colors.muted },
  meals: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  chip: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  big: { fontSize: 30, fontWeight: '800', color: colors.ink },
  body: { fontSize: 15, color: colors.ink, lineHeight: 21, marginTop: 4 },
  muted: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  link: { color: '#60A5FA', fontWeight: '700', fontSize: 14 },
  prefRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
  recipeName: { fontSize: 18, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 14, fontWeight: '600', color: colors.ink, marginTop: 4 },
  portion: { fontSize: 13, color: colors.muted, marginTop: 2 },
  sub: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginBottom: 4 },
  li: { fontSize: 15, color: colors.ink, lineHeight: 22 },
  cardButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  lightButton: { backgroundColor: colors.bg, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  lightText: { fontSize: 15, fontWeight: '700', color: colors.ink },
  darkButton: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  darkText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  refresh: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.line, paddingVertical: 15, alignItems: 'center', marginBottom: 8 },
  refreshText: { fontSize: 16, fontWeight: '700', color: colors.ink },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pick: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: '#151D30' },
  pickText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  pickHint: { fontSize: 11, color: colors.muted, marginTop: 1 },
  cancel: { fontSize: 15, color: colors.muted, fontWeight: '600' },
});
