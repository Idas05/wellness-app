import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { FoodDetailSheet, type PickedFood } from '../components/FoodDetailSheet';
import { FoodRow, FoodSearch } from '../components/FoodSearch';
import { card, colors, Screen } from '../components/Screen';
import { displayName, loadRecent, recentToItem, rememberFood, type FoodItem, type RecentFood } from '../lib/foods';
import { roundMacros, scaleMacros, type Macros } from '../lib/macros';
import { loadDay, MEALS, saveDay, todayKey, type MealId } from '../lib/nutrition';
import { loadRecipes, macrosPerServing, perServing, type Recipe } from '../lib/recipes';
import { newId } from '../lib/reminders';

const isMeal = (m: unknown): m is MealId => MEALS.some((x) => x.id === m);

function recipeItem(r: Recipe): FoodItem {
  return { id: `recipe-${r.id}`, name: r.name, source: 'recipe', servings: [{ label: '1 serving', cal: perServing(r), m: macrosPerServing(r) }] };
}

export default function AddFoodScreen() {
  const params = useLocalSearchParams<{ meal?: string }>();
  const [meal, setMeal] = useState<MealId>(isMeal(params.meal) ? params.meal : 'snack');
  const [tab, setTab] = useState<'recent' | 'recipes'>('recent');
  const [recent, setRecent] = useState<RecentFood[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [picked, setPicked] = useState<FoodItem | null>(null);
  const [scanning, setScanning] = useState(false);
  const [quick, setQuick] = useState(false);
  const mealLabel = MEALS.find((m) => m.id === meal)!.label;

  useFocusEffect(
    useCallback(() => {
      loadRecent().then(setRecent);
      loadRecipes().then(setRecipes);
    }, []),
  );

  const close = () => (router.canGoBack() ? router.back() : router.navigate('/calories'));

  const addEntry = async (name: string, calories: number, macros?: Macros) => {
    const day = todayKey();
    const foods = await loadDay(day);
    await saveDay(day, [...foods, { id: newId(), name, calories, ...(macros ? roundMacros(macros) : {}), at: new Date().toISOString(), meal }]);
    close();
  };

  const confirm = async (p: PickedFood) => {
    setPicked(null);
    if (p.food.source !== 'recipe') {
      await rememberFood({ name: p.food.name, brand: p.food.brand, serving: p.serving, qty: p.qty, servings: p.food.servings });
    }
    await addEntry(`${displayName(p.food)} · ${p.amount}`, p.calories, p.macros);
  };

  return (
    <Screen title="Add Food" subtitle={`Adding to ${mealLabel}`}>
      <Pressable onPress={close} style={styles.back} accessibilityRole="link">
        <Text style={styles.backText}>‹ Cal Counter</Text>
      </Pressable>

      <View style={styles.meals}>
        {MEALS.map((m) => (
          <Pressable key={m.id} onPress={() => setMeal(m.id)} style={[styles.mealChip, meal === m.id && styles.chipOn]} accessibilityRole="radio" accessibilityState={{ selected: meal === m.id }}>
            <Text style={[styles.mealText, meal === m.id && { color: '#fff' }]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => router.push({ pathname: '/recipe', params: { meal } })} style={styles.recipeBtn} accessibilityRole="button">
        <Text style={styles.recipeIcon}>＋</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.recipeTitle}>Add recipe</Text>
          <Text style={styles.recipeSub}>Build a meal from its ingredients and save it</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </Pressable>

      <View style={styles.tiles}>
        <Pressable onPress={() => setScanning(true)} style={styles.tile} accessibilityRole="button">
          <Text style={styles.tileIcon}>▥</Text>
          <Text style={styles.tileText}>Scan a barcode</Text>
        </Pressable>
        <Pressable onPress={() => setQuick(true)} style={styles.tile} accessibilityRole="button">
          <Text style={styles.tileIcon}>⚡</Text>
          <Text style={styles.tileText}>Quick add</Text>
        </Pressable>
      </View>

      <FoodSearch
        onPick={setPicked}
        whenEmpty={
          <>
            <View style={styles.tabs}>
              {(['recent', 'recipes'] as const).map((t) => (
                <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === t }}>
                  <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>{t === 'recent' ? 'Recent' : 'My recipes'}</Text>
                </Pressable>
              ))}
            </View>
            <View style={card.box}>
              {tab === 'recent' ? (
                recent.length ? (
                  recent.map((r, i) => {
                    const item = recentToItem(r);
                    return (
                      <FoodRow
                        key={`${r.brand ?? ''}${r.name}`}
                        food={{ ...item, servings: [{ label: `${r.qty === 1 ? '' : `${+r.qty.toFixed(2)} × `}${r.serving.label}`, cal: r.serving.cal * r.qty, m: r.serving.m && scaleMacros(r.serving.m, r.qty) }, ...item.servings] }}
                        first={i === 0}
                        onPress={() => setPicked(item)}
                      />
                    );
                  })
                ) : (
                  <Text style={styles.muted}>Foods you add will show up here so you can add them again in one tap.</Text>
                )
              ) : recipes.length ? (
                recipes.map((r, i) => (
                  <View key={r.id}>
                    <FoodRow food={recipeItem(r)} first={i === 0} onPress={() => setPicked(recipeItem(r))} />
                    <Pressable onPress={() => router.push({ pathname: '/recipe', params: { id: r.id, meal } })} style={styles.editLink}>
                      <Text style={styles.link}>Edit recipe</Text>
                    </Pressable>
                  </View>
                ))
              ) : (
                <Text style={styles.muted}>No recipes yet. Tap “Add recipe” above to build one.</Text>
              )}
            </View>
          </>
        }
      />

      <FoodDetailSheet food={picked} actionLabel={`Add to ${mealLabel}`} onClose={() => setPicked(null)} onConfirm={confirm} />

      <BarcodeScanner
        visible={scanning}
        onClose={() => setScanning(false)}
        onAdd={(name, calories, macros) => {
          setScanning(false);
          addEntry(name, calories, macros);
        }}
      />

      <QuickAdd visible={quick} mealLabel={mealLabel} onClose={() => setQuick(false)} onAdd={(n, c, m) => (setQuick(false), addEntry(n, c, m))} />
    </Screen>
  );
}

function QuickAdd({ visible, mealLabel, onClose, onAdd }: { visible: boolean; mealLabel: string; onClose: () => void; onAdd: (name: string, cal: number, macros?: Macros) => void }) {
  const [name, setName] = useState('');
  const [cal, setCal] = useState('');
  const [mac, setMac] = useState({ protein: '', carbs: '', fat: '' });
  const calories = parseInt(cal, 10);
  const ok = calories > 0 && calories < 10000;
  const add = () => {
    if (!ok) return;
    const g = (t: string) => parseFloat(t) || 0;
    const any = mac.protein || mac.carbs || mac.fat;
    onAdd(name.trim() || 'Quick add', calories, any ? { protein: g(mac.protein), fat: g(mac.fat), carbs: g(mac.carbs) } : undefined);
    setName('');
    setCal('');
    setMac({ protein: '', carbs: '', fat: '' });
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Quick add</Text>
          <Text style={styles.muted}>Already know the calories? Add them straight to {mealLabel}.</Text>
          <TextInput value={name} onChangeText={setName} placeholder="What did you eat? (optional)" placeholderTextColor="#5B6680" style={[styles.input, { marginTop: 14 }]} />
          <TextInput
            value={cal}
            onChangeText={(t) => setCal(t.replace(/[^0-9]/g, ''))}
            placeholder="Calories"
            placeholderTextColor="#5B6680"
            keyboardType="number-pad"
            style={[styles.input, { marginTop: 10 }]}
            onSubmitEditing={add}
          />
          <Text style={[styles.muted, { marginTop: 12 }]}>Protein, carbs and fat in grams (optional)</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
            {(['protein', 'carbs', 'fat'] as const).map((k) => (
              <TextInput
                key={k}
                value={mac[k]}
                onChangeText={(t) => setMac((m) => ({ ...m, [k]: t.replace(/[^0-9.]/g, '') }))}
                placeholder={k[0].toUpperCase() + k.slice(1)}
                placeholderTextColor="#5B6680"
                keyboardType="decimal-pad"
                style={[styles.input, { flex: 1, minWidth: 0 }]}
                accessibilityLabel={`${k} grams`}
              />
            ))}
          </View>
          <Pressable onPress={add} disabled={!ok} style={[styles.button, !ok && { opacity: 0.4 }]}>
            <Text style={styles.buttonText}>Add {ok ? `${calories} cal` : ''}</Text>
          </Pressable>
          <Pressable onPress={onClose} style={{ padding: 10, alignItems: 'center' }}>
            <Text style={styles.secondaryText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: 12, alignSelf: 'flex-start' },
  backText: { color: '#60A5FA', fontWeight: '700', fontSize: 15 },
  meals: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  mealChip: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  mealText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  recipeBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.accent, borderRadius: 16, padding: 16, marginBottom: 10 },
  recipeIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },
  recipeTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  recipeSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  chev: { fontSize: 24, color: '#fff' },
  tiles: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  tile: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.line, paddingVertical: 14 },
  tileIcon: { fontSize: 16, color: colors.ink },
  tileText: { fontSize: 15, fontWeight: '700', color: colors.ink },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.line, marginBottom: 12 },
  tab: { paddingVertical: 10, paddingHorizontal: 4, marginRight: 22, borderBottomWidth: 3, borderBottomColor: 'transparent', marginBottom: -1 },
  tabOn: { borderBottomColor: colors.ink },
  tabText: { fontSize: 15, fontWeight: '700', color: colors.muted },
  tabTextOn: { color: colors.ink },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  editLink: { alignSelf: 'flex-start', marginTop: -6, marginBottom: 8 },
  link: { color: '#60A5FA', fontWeight: '700', fontSize: 13 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { backgroundColor: '#0E1422', borderTopWidth: 1, borderColor: '#24314D', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32, width: '100%', maxWidth: 560 },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: 4 },
  input: { backgroundColor: '#151D30', borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 12, fontSize: 16, color: colors.ink },
  button: { marginTop: 14, backgroundColor: colors.accent, borderRadius: 14, padding: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryText: { fontSize: 15, color: colors.muted, fontWeight: '600' },
});
