import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { amountText, displayName, type FoodItem, type Serving } from '../lib/foods';
import { colors } from './Screen';

export type PickedFood = { food: FoodItem; serving: Serving; qty: number; calories: number; amount: string };

/** Pick a serving size and how many, see the calories, then add. */
export function FoodDetailSheet({
  food,
  actionLabel,
  onClose,
  onConfirm,
}: {
  food: FoodItem | null;
  actionLabel: string;
  onClose: () => void;
  onConfirm: (p: PickedFood) => void;
}) {
  const [servingIdx, setServingIdx] = useState(0);
  const [qtyText, setQtyText] = useState('1');

  useEffect(() => {
    setServingIdx(0);
    setQtyText(food?.servings[0]?.label === '1 g' ? '100' : '1');
  }, [food]);

  if (!food) return null;
  const serving = food.servings[servingIdx] ?? food.servings[0];
  const qty = parseFloat(qtyText) || 0;
  const calories = Math.round(serving.cal * qty);

  const pickServing = (i: number) => {
    const next = food.servings[i];
    // Switching to grams starts at 100 g; switching away from grams starts at 1 serving.
    if (next.label === '1 g' && serving.label !== '1 g') setQtyText('100');
    else if (next.label !== '1 g' && serving.label === '1 g') setQtyText('1');
    setServingIdx(i);
  };
  const step = (d: number) => {
    const by = serving.label === '1 g' ? 10 * d : 0.5 * d;
    setQtyText(String(Math.max(0, +(qty + by).toFixed(2))));
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <Text style={styles.title}>{food.name}</Text>
          {food.brand ? <Text style={styles.brand}>{food.brand}</Text> : null}

          <View style={styles.calBox}>
            <Text style={styles.calBig}>{calories.toLocaleString()}</Text>
            <Text style={styles.calUnit}>calories</Text>
          </View>

          <Text style={styles.label}>Serving size</Text>
          <ScrollView style={{ maxHeight: 190 }} contentContainerStyle={{ gap: 8 }}>
            {food.servings.map((s, i) => {
              const on = i === servingIdx;
              return (
                <Pressable key={s.label + i} onPress={() => pickServing(i)} style={[styles.option, on && styles.optionOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                  <Text style={[styles.optionText, on && { color: '#fff' }]}>{s.label}</Text>
                  <Text style={[styles.optionCal, on && { color: '#fff' }]}>{s.label === '1 g' ? `${Math.round(s.cal * 100)} cal / 100 g` : `${Math.round(s.cal)} cal`}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>{serving.label === '1 g' ? 'Grams' : 'Number of servings'}</Text>
          <View style={styles.qtyRow}>
            <Pressable onPress={() => step(-1)} style={styles.stepBtn} accessibilityLabel="Less">
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <TextInput
              value={qtyText}
              onChangeText={(t) => setQtyText(t.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              style={styles.qtyInput}
              accessibilityLabel={serving.label === '1 g' ? 'Grams' : 'Number of servings'}
              selectTextOnFocus
            />
            <Pressable onPress={() => step(1)} style={styles.stepBtn} accessibilityLabel="More">
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => onConfirm({ food, serving, qty, calories, amount: amountText(serving, qty) })}
            disabled={qty <= 0}
            style={[styles.button, qty <= 0 && { opacity: 0.4 }]}
            accessibilityLabel={`${actionLabel}: ${displayName(food)}`}
          >
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.secondary}>
            <Text style={styles.secondaryText}>Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { backgroundColor: '#0E1422', borderTopWidth: 1, borderColor: '#24314D', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32, width: '100%', maxWidth: 560 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink },
  brand: { fontSize: 14, color: colors.muted, marginTop: 2 },
  calBox: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 12, marginBottom: 6 },
  calBig: { fontSize: 36, fontWeight: '800', color: colors.ink },
  calUnit: { fontSize: 16, fontWeight: '600', color: colors.muted },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginTop: 14, marginBottom: 8 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: '#151D30', borderWidth: 1, borderColor: colors.line },
  optionOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionText: { flex: 1, minWidth: 0, fontSize: 15, fontWeight: '600', color: colors.ink },
  optionCal: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#151D30', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 24, fontWeight: '700', color: colors.ink },
  qtyInput: { flex: 1, minWidth: 0, backgroundColor: '#151D30', borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 12, fontSize: 18, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  button: { marginTop: 18, backgroundColor: colors.accent, borderRadius: 14, padding: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondary: { marginTop: 6, padding: 10, alignItems: 'center' },
  secondaryText: { fontSize: 15, color: colors.muted, fontWeight: '600' },
});
