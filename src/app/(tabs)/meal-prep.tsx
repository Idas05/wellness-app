import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { card, colors, Screen } from '../../components/Screen';
import {
  ALLERGENS,
  DIETS,
  loadPrefs,
  matchRecipes,
  mealBudget,
  mealNow,
  scaleIngredient,
  savePrefs,
  freshFirst,
  loadSeen,
  markSeen,
  shuffle,
  type AllergenId,
  type DietId,
  type DietPrefs,
  type Suggestion,
} from '../../lib/mealPrep';
import { calculatePlan, loadDay, loadProfile, MEALS, mealOf, saveDay, todayKey, type CalorieProfile, type FoodEntry, type MealId } from '../../lib/nutrition';
import { RECIPE_LIBRARY } from '../../lib/recipeLibrary';
import { newId } from '../../lib/reminders';

const PAGE = 3;
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

  useFocusEffect(
    useCallback(() => {
      setVisit((v) => v + 1);
      loadPrefs().then(setPrefs);
      loadProfile().then(setProfile);
      loadDay(todayKey()).then(setFoods);
    }, []),
  );

  const daily = profile ? calculatePlan(profile).dailyCalories : DEFAULT_DAILY;
  const eatenToday = foods.reduce((s, f) => s + f.calories, 0);
  const loggedForMeal = foods.filter((f) => mealOf(f) === meal).reduce((s, f) => s + f.calories, 0);
  const budget = mealBudget(daily, meal, loggedForMeal, eatenToday);
  const mealLabel = MEALS.find((m) => m.id === meal)!.label;
  const noun = meal === 'snack' ? 'snack' : mealLabel.toLowerCase();

  const matches = useMemo(() => (prefs ? matchRecipes(RECIPE_LIBRARY, meal, budget.target, prefs) : []), [prefs, meal, budget.target]);

  // Every visit, and whenever what we're matching against changes: recipes you haven't seen yet come first.
  useEffect(() => {
    let live = true;
    loadSeen().then((seen) => {
      if (!live) return;
      setOrder(freshFirst(matches, seen[meal]));
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
    // Skip the moment between switching meals and the new list arriving.
    if (ids.length && ids.every((id) => matchIds.includes(id))) markSeen(meal, ids, matchIds);
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
    const entry: FoodEntry = { id: newId(), name: `${s.recipe.name} · 1 serving`, calories: s.calories, at: new Date().toISOString(), meal };
    // The log updates, but the suggestions stay put until you come back, so the ✓ doesn't vanish.
    await saveDay(day, [...current, entry]);
    setLogged(s.recipe.id);
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
    <Screen title="Meal Prep" subtitle="Recipes that fit your calories and diet">
      <View style={styles.meals}>
        {MEALS.map((m) => (
          <Pressable key={m.id} onPress={() => setMeal(m.id)} style={[styles.chip, meal === m.id && styles.chipOn]} accessibilityRole="radio" accessibilityState={{ selected: meal === m.id }}>
            <Text style={[styles.chipText, meal === m.id && { color: '#fff' }]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={card.box}>
        <Text style={card.heading}>{mealLabel} target</Text>
        <Text style={styles.big}>{budget.target.toLocaleString()} cal</Text>
        <Text style={styles.body}>
          {budget.light
            ? `You've used up your ${noun} calories for today, so these are light ideas.`
            : budget.logged > 0
              ? `${noun[0].toUpperCase() + noun.slice(1)} gets about ${budget.share.toLocaleString()} of your ${daily.toLocaleString()} cal. You've already logged ${budget.logged.toLocaleString()} for it, so this is what's left.`
              : budget.target < budget.share
                ? `${noun[0].toUpperCase() + noun.slice(1)} would get about ${budget.share.toLocaleString()} cal, but you only have ${budget.leftToday.toLocaleString()} left today.`
                : `About ${Math.round((budget.share / daily) * 100)}% of your ${daily.toLocaleString()} cal day. Nothing logged for ${noun} yet.`}
        </Text>
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
            No {noun} recipes match all of your restrictions at {budget.target.toLocaleString()} cal. Try another meal, or edit your restrictions.
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
        {s.calories.toLocaleString()} cal · {Math.round(r.protein * s.portion)} g protein · {r.mins} min
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
  meals: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  chip: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  big: { fontSize: 30, fontWeight: '800', color: colors.ink },
  body: { fontSize: 15, color: colors.ink, lineHeight: 21, marginTop: 4 },
  muted: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  link: { color: '#2B6CB0', fontWeight: '700', fontSize: 14 },
  prefRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
  recipeName: { fontSize: 18, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 14, fontWeight: '600', color: colors.ink, marginTop: 4 },
  portion: { fontSize: 13, color: colors.muted, marginTop: 2 },
  sub: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginBottom: 4 },
  li: { fontSize: 15, color: colors.ink, lineHeight: 22 },
  cardButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  lightButton: { backgroundColor: colors.bg, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  lightText: { fontSize: 15, fontWeight: '700', color: colors.ink },
  darkButton: { backgroundColor: colors.ink, borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  darkText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  refresh: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.line, paddingVertical: 15, alignItems: 'center', marginBottom: 8 },
  refreshText: { fontSize: 16, fontWeight: '700', color: colors.ink },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pick: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff' },
  pickText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  pickHint: { fontSize: 11, color: colors.muted, marginTop: 1 },
  cancel: { fontSize: 15, color: colors.muted, fontWeight: '600' },
});
