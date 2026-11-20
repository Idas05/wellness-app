import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FoodDetailSheet, type PickedFood } from '../components/FoodDetailSheet';
import { FoodSearch } from '../components/FoodSearch';
import { card, colors, Screen } from '../components/Screen';
import { displayName, type FoodItem } from '../lib/foods';
import { deleteRecipe, loadRecipes, recipeTotal, saveRecipe, type Ingredient } from '../lib/recipes';
import { newId } from '../lib/reminders';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id?: string; meal?: string }>();
  const [name, setName] = useState('');
  const [servings, setServings] = useState('1');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<FoodItem | null>(null);
  const [manualName, setManualName] = useState('');
  const [manualCal, setManualCal] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadRecipes().then((list) => {
      const r = list.find((x) => x.id === id);
      if (!r) return;
      setName(r.name);
      setServings(String(r.servings));
      setIngredients(r.ingredients);
    });
  }, [id]);

  const n = Math.max(1, parseFloat(servings) || 1);
  const total = recipeTotal({ ingredients });
  const each = Math.round(total / n);
  const back = () => (router.canGoBack() ? router.back() : router.navigate('/calories'));

  const addIngredient = (p: PickedFood) => {
    setPicked(null);
    setSearching(false);
    setIngredients((xs) => [...xs, { id: newId(), name: displayName(p.food), amount: p.amount, cal: p.calories }]);
  };

  const addManual = () => {
    const cal = parseInt(manualCal, 10);
    if (!manualName.trim() || !(cal >= 0)) return;
    setIngredients((xs) => [...xs, { id: newId(), name: manualName.trim(), amount: '', cal }]);
    setManualName('');
    setManualCal('');
    setSearching(false);
  };

  const save = async () => {
    if (!name.trim()) return setError('Give your recipe a name.');
    if (!ingredients.length) return setError('Add at least one ingredient.');
    await saveRecipe({ id: id || newId(), name: name.trim(), servings: n, ingredients, updatedAt: new Date().toISOString() });
    back();
  };

  const remove = async () => {
    if (!id) return back();
    const ok = Platform.OS === 'web' ? window.confirm(`Delete ${name || 'this recipe'}?`) : true;
    if (!ok) return;
    await deleteRecipe(id);
    back();
  };

  return (
    <Screen title={id ? 'Edit recipe' : 'Add recipe'} subtitle="Saved recipes show up under My recipes">
      <Pressable onPress={back} style={styles.back} accessibilityRole="link">
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <View style={card.box}>
        <Text style={styles.label}>Recipe name</Text>
        <TextInput value={name} onChangeText={(t) => (setName(t), setError(null))} placeholder="e.g. Chicken burrito bowl" placeholderTextColor="#5B6680" style={styles.input} accessibilityLabel="Recipe name" />
        <Text style={[styles.label, { marginTop: 14 }]}>Makes how many servings?</Text>
        <TextInput value={servings} onChangeText={(t) => setServings(t.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" style={[styles.input, { width: 100 }]} accessibilityLabel="Servings" />
      </View>

      <View style={card.box}>
        <Text style={card.heading}>Ingredients</Text>
        {ingredients.length === 0 ? <Text style={styles.muted}>Search for each ingredient and how much you used.</Text> : null}
        {ingredients.map((x, i) => (
          <View key={x.id} style={[styles.ingRow, i === 0 && { borderTopWidth: 0 }]}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.ingName}>{x.name}</Text>
              {x.amount ? <Text style={styles.muted}>{x.amount}</Text> : null}
            </View>
            <Text style={styles.ingCal}>{x.cal} cal</Text>
            <Pressable onPress={() => setIngredients((xs) => xs.filter((y) => y.id !== x.id))} hitSlop={10} accessibilityLabel={`Remove ${x.name}`}>
              <Text style={styles.remove}>✕</Text>
            </Pressable>
          </View>
        ))}
        <Pressable onPress={() => setSearching(true)} style={styles.lightButton} accessibilityRole="button">
          <Text style={styles.lightText}>+ Add ingredient</Text>
        </Pressable>
      </View>

      <View style={[card.box, styles.totals]}>
        <View>
          <Text style={styles.totalBig}>{each.toLocaleString()} cal</Text>
          <Text style={styles.muted}>per serving</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.totalSmall}>{total.toLocaleString()} cal</Text>
          <Text style={styles.muted}>whole recipe</Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={save} style={styles.button} accessibilityRole="button">
        <Text style={styles.buttonText}>Save recipe</Text>
      </Pressable>
      {id ? (
        <Pressable onPress={remove} style={{ padding: 12, alignItems: 'center' }}>
          <Text style={[styles.secondaryText, { color: '#F87171' }]}>Delete recipe</Text>
        </Pressable>
      ) : null}

      <Modal visible={searching} animationType="slide" onRequestClose={() => setSearching(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Add ingredient</Text>
              <Pressable onPress={() => setSearching(false)} hitSlop={10}>
                <Text style={styles.backText}>Done</Text>
              </Pressable>
            </View>
            <FoodSearch
              onPick={setPicked}
              autoFocus
              whenEmpty={
                <View style={card.box}>
                  <Text style={card.heading}>Or enter it yourself</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TextInput value={manualName} onChangeText={setManualName} placeholder="Ingredient" placeholderTextColor="#5B6680" style={[styles.input, { flex: 1, minWidth: 0 }]} />
                    <TextInput value={manualCal} onChangeText={(t) => setManualCal(t.replace(/[^0-9]/g, ''))} placeholder="Cal" placeholderTextColor="#5B6680" keyboardType="number-pad" style={[styles.input, { width: 80 }]} />
                  </View>
                  <Pressable onPress={addManual} style={[styles.lightButton, { marginTop: 10 }]}>
                    <Text style={styles.lightText}>Add</Text>
                  </Pressable>
                </View>
              }
            />
          </ScrollView>
          <FoodDetailSheet food={picked} actionLabel="Add to recipe" onClose={() => setPicked(null)} onConfirm={addIngredient} />
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: 12, alignSelf: 'flex-start' },
  backText: { color: '#60A5FA', fontWeight: '700', fontSize: 15 },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginBottom: 6 },
  input: { backgroundColor: '#151D30', borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 12, fontSize: 16, color: colors.ink },
  muted: { fontSize: 13, color: colors.muted, marginTop: 2 },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.line },
  ingName: { fontSize: 15, fontWeight: '600', color: colors.ink },
  ingCal: { fontSize: 15, fontWeight: '700', color: colors.ink },
  remove: { fontSize: 15, color: colors.muted, paddingLeft: 6 },
  lightButton: { marginTop: 12, backgroundColor: colors.bg, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  lightText: { fontSize: 15, fontWeight: '700', color: colors.ink },
  totals: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalBig: { fontSize: 26, fontWeight: '800', color: colors.ink },
  totalSmall: { fontSize: 17, fontWeight: '700', color: colors.ink },
  error: { color: '#F87171', fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  button: { backgroundColor: colors.accent, borderRadius: 14, padding: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryText: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  modalBody: { padding: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: colors.ink },
});
