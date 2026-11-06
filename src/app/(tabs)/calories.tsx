import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BarcodeScanner } from '../../components/BarcodeScanner';
import { card, colors, Screen } from '../../components/Screen';
import {
  ACTIVITY_LEVELS,
  calculatePlan,
  getActivity,
  loadDay,
  loadProfile,
  saveDay,
  saveProfile,
  todayKey,
  type ActivityLevel,
  type CalorieProfile,
  type FoodEntry,
  type Sex,
} from '../../lib/nutrition';
import { newId } from '../../lib/reminders';

export default function CaloriesScreen() {
  const [profile, setProfile] = useState<CalorieProfile | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [day, setDay] = useState(todayKey());
  const [foods, setFoods] = useState<FoodEntry[]>([]);

  useEffect(() => {
    loadProfile().then(setProfile);
  }, []);

  // A new day starts with an empty bar.
  useFocusEffect(
    useCallback(() => {
      const today = todayKey();
      setDay(today);
      loadDay(today).then(setFoods);
    }, []),
  );

  if (profile === undefined) return <Screen title="Cal Counter">{null}</Screen>;

  // Profiles saved before the activity question existed get asked once more.
  if (!profile || editing || !profile.activity) {
    return (
      <Screen title="Cal Counter" subtitle="A few questions to work out your daily calories">
        <Questionnaire
          initial={profile}
          onCancel={profile?.activity ? () => setEditing(false) : undefined}
          onDone={async (p) => {
            await saveProfile(p);
            setProfile(p);
            setEditing(false);
          }}
        />
      </Screen>
    );
  }

  const plan = calculatePlan(profile);
  const eaten = foods.reduce((s, f) => s + f.calories, 0);

  const updateFoods = async (next: FoodEntry[]) => {
    setFoods(next);
    await saveDay(day, next);
  };

  return (
    <Screen title="Cal Counter" subtitle="Today" pinned={<CalorieBar eaten={eaten} goal={plan.dailyCalories} />}>
      <AddFood onAdd={(f) => updateFoods([...foods, f])} />

      <View style={card.box}>
        <Text style={card.heading}>Eaten today</Text>
        {foods.length === 0 ? (
          <Text style={styles.muted}>Nothing yet. Add your first food above.</Text>
        ) : (
          foods.map((f) => (
            <View key={f.id} style={styles.foodRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodName}>{f.name}</Text>
                <Text style={styles.muted}>
                  {new Date(f.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.foodCal}>{f.calories} cal</Text>
              <Pressable
                onPress={() => updateFoods(foods.filter((x) => x.id !== f.id))}
                accessibilityLabel={`Remove ${f.name}`}
                hitSlop={10}
                style={{ paddingLeft: 12 }}
              >
                <Text style={styles.remove}>✕</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <View style={card.box}>
        <Text style={card.heading}>Your plan</Text>
        <Text style={styles.body}>
          {plan.goal === 'lose'
            ? `Eat about ${plan.dailyCalories.toLocaleString()} calories a day to go from ${profile.weightLb} to ${profile.goalWeightLb} lb.`
            : plan.goal === 'gain'
              ? `Eat about ${plan.dailyCalories.toLocaleString()} calories a day to go from ${profile.weightLb} to ${profile.goalWeightLb} lb.`
              : `Eat about ${plan.dailyCalories.toLocaleString()} calories a day to stay at ${profile.weightLb} lb.`}
        </Text>
        {plan.weeksToGoal ? (
          <Text style={styles.muted}>At this pace, you'd reach your goal in about {plan.weeksToGoal} weeks.</Text>
        ) : null}
        <Text style={styles.small}>
          Based on your age, height, sex, weight and {getActivity(profile.activity).label.toLowerCase()}. Your body burns
          about{' '}
          {plan.maintenance.toLocaleString()} calories a day.
        </Text>
        <Pressable onPress={() => setEditing(true)}>
          <Text style={styles.link}>Update my details ›</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function CalorieBar({ eaten, goal }: { eaten: number; goal: number }) {
  const pct = goal > 0 ? eaten / goal : 0;
  const over = eaten > goal;
  const left = goal - eaten;
  return (
    <View style={[card.box, styles.barCard]}>
      <View style={styles.barTop}>
        <Text style={styles.barBig}>
          {eaten.toLocaleString()}
          <Text style={styles.barOf}> / {goal.toLocaleString()} cal</Text>
        </Text>
        <Text style={[styles.barLeft, over && { color: '#C0392B' }]}>
          {over ? `${(-left).toLocaleString()} over` : `${left.toLocaleString()} left`}
        </Text>
      </View>
      <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: goal, now: eaten }}>
        <View
          style={[styles.fill, { width: `${Math.min(pct, 1) * 100}%`, backgroundColor: over ? '#F29E6D' : '#5BBF7A' }]}
        />
      </View>
    </View>
  );
}

function AddFood({ onAdd }: { onAdd: (f: FoodEntry) => void }) {
  const [name, setName] = useState('');
  const [cal, setCal] = useState('');
  const [scanning, setScanning] = useState(false);
  const calories = parseInt(cal, 10);
  const ok = name.trim().length > 0 && calories > 0 && calories < 10000;
  const add = () => {
    if (!ok) return;
    onAdd({ id: newId(), name: name.trim(), calories, at: new Date().toISOString() });
    setName('');
    setCal('');
  };
  return (
    <View style={card.box}>
      <Text style={card.heading}>Add food</Text>
      <Pressable onPress={() => setScanning(true)} style={styles.scanButton}>
        <Text style={styles.scanText}>📷  Scan a barcode</Text>
      </Pressable>
      <Text style={styles.or}>or type it in</Text>
      <View style={styles.addRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="What did you eat?"
          placeholderTextColor="#9A948C"
          style={[styles.input, { flex: 1 }]}
          returnKeyType="next"
        />
        <TextInput
          value={cal}
          onChangeText={(t) => setCal(t.replace(/[^0-9]/g, ''))}
          placeholder="Cal"
          placeholderTextColor="#9A948C"
          keyboardType="number-pad"
          style={[styles.input, { width: 80 }]}
          onSubmitEditing={add}
        />
      </View>
      <Pressable onPress={add} disabled={!ok} style={[styles.button, !ok && { opacity: 0.4 }]}>
        <Text style={styles.buttonText}>Add</Text>
      </Pressable>
      <BarcodeScanner
        visible={scanning}
        onClose={() => setScanning(false)}
        onAdd={(foodName, foodCalories) => {
          setScanning(false);
          onAdd({ id: newId(), name: foodName, calories: foodCalories, at: new Date().toISOString() });
        }}
      />
    </View>
  );
}

function Questionnaire({
  initial,
  onDone,
  onCancel,
}: {
  initial: CalorieProfile | null;
  onDone: (p: CalorieProfile) => void;
  onCancel?: () => void;
}) {
  const [age, setAge] = useState(initial ? String(initial.age) : '');
  const [feet, setFeet] = useState(initial ? String(Math.floor(initial.heightIn / 12)) : '');
  const [inches, setInches] = useState(initial ? String(initial.heightIn % 12) : '');
  const [sex, setSex] = useState<Sex | null>(initial?.sex ?? null);
  const [weight, setWeight] = useState(initial ? String(initial.weightLb) : '');
  const [goal, setGoal] = useState(initial ? String(initial.goalWeightLb) : '');
  const [activity, setActivity] = useState<ActivityLevel | null>(initial?.activity ?? null);

  const num = (s: string) => parseFloat(s);
  const heightIn = num(feet) * 12 + (num(inches) || 0);
  const problems: string[] = [];
  if (!(num(age) >= 13 && num(age) <= 100)) problems.push('age (13 to 100)');
  if (!(heightIn >= 48 && heightIn <= 90)) problems.push('height');
  if (!sex) problems.push('sex');
  if (!(num(weight) >= 70 && num(weight) <= 600)) problems.push('weight');
  if (!(num(goal) >= 70 && num(goal) <= 600)) problems.push('goal weight');
  if (!activity) problems.push('daily activity');
  const ok = problems.length === 0;

  const digits = (set: (s: string) => void, decimal = false) => (t: string) =>
    set(t.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, ''));

  return (
    <View style={card.box}>
      <Field label="Age">
        <TextInput value={age} onChangeText={digits(setAge)} keyboardType="number-pad" placeholder="e.g. 20" placeholderTextColor="#9A948C" style={styles.input} />
      </Field>

      <Field label="Height">
        <View style={styles.addRow}>
          <View style={styles.unitBox}>
            <TextInput value={feet} onChangeText={digits(setFeet)} keyboardType="number-pad" placeholder="5" placeholderTextColor="#9A948C" style={[styles.input, { flex: 1 }]} />
            <Text style={styles.unit}>ft</Text>
          </View>
          <View style={styles.unitBox}>
            <TextInput value={inches} onChangeText={digits(setInches)} keyboardType="number-pad" placeholder="10" placeholderTextColor="#9A948C" style={[styles.input, { flex: 1 }]} />
            <Text style={styles.unit}>in</Text>
          </View>
        </View>
      </Field>

      <Field label="Sex">
        <View style={styles.addRow}>
          {(['male', 'female'] as const).map((s) => (
            <Pressable key={s} onPress={() => setSex(s)} style={[styles.chip, sex === s && styles.chipOn]}>
              <Text style={[styles.chipText, sex === s && { color: '#fff' }]}>{s === 'male' ? 'Male' : 'Female'}</Text>
            </Pressable>
          ))}
        </View>
      </Field>

      <Field label="Weight">
        <View style={styles.unitBox}>
          <TextInput value={weight} onChangeText={digits(setWeight, true)} keyboardType="decimal-pad" placeholder="e.g. 180" placeholderTextColor="#9A948C" style={[styles.input, { flex: 1 }]} />
          <Text style={styles.unit}>lb</Text>
        </View>
      </Field>

      <Field label="Goal weight">
        <View style={styles.unitBox}>
          <TextInput value={goal} onChangeText={digits(setGoal, true)} keyboardType="decimal-pad" placeholder="e.g. 165" placeholderTextColor="#9A948C" style={[styles.input, { flex: 1 }]} />
          <Text style={styles.unit}>lb</Text>
        </View>
      </Field>

      <Field label="Daily activity">
        {ACTIVITY_LEVELS.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => setActivity(a.id)}
            style={[styles.option, activity === a.id && styles.chipOn]}
            accessibilityRole="radio"
            accessibilityState={{ selected: activity === a.id }}
          >
            <Text style={[styles.chipText, activity === a.id && { color: '#fff' }]}>{a.label}</Text>
            <Text style={[styles.optionHint, activity === a.id && { color: 'rgba(255,255,255,0.75)' }]}>{a.hint}</Text>
          </Pressable>
        ))}
      </Field>

      <Pressable
        disabled={!ok}
        style={[styles.button, { marginTop: 20 }, !ok && { opacity: 0.4 }]}
        onPress={() =>
          sex &&
          activity &&
          onDone({
            activity,
            age: Math.round(num(age)),
            heightIn: Math.round(heightIn),
            sex,
            weightLb: Math.round(num(weight)),
            goalWeightLb: Math.round(num(goal)),
          })
        }
      >
        <Text style={styles.buttonText}>Work out my calories</Text>
      </Pressable>
      {onCancel && (
        <Pressable onPress={onCancel} style={{ padding: 12, alignItems: 'center' }}>
          <Text style={[styles.muted, { fontWeight: '600' }]}>Cancel</Text>
        </Pressable>
      )}
    </View>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 16, color: colors.ink, lineHeight: 22 },
  muted: { fontSize: 14, color: colors.muted, marginTop: 4 },
  small: { fontSize: 13, color: colors.muted, marginTop: 10, lineHeight: 18 },
  link: { color: '#2B6CB0', fontWeight: '700', fontSize: 14, marginTop: 12 },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginBottom: 6 },
  input: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    fontSize: 16,
    color: colors.ink,
    minWidth: 0,
  },
  addRow: { flexDirection: 'row', gap: 10 },
  unitBox: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  unit: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  chip: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bg, alignItems: 'center' },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  option: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    marginBottom: 8,
  },
  optionHint: { fontSize: 13, color: colors.muted, marginTop: 2 },
  chipText: { fontSize: 16, fontWeight: '600', color: colors.ink },
  button: { marginTop: 12, backgroundColor: colors.ink, borderRadius: 14, padding: 14, alignItems: 'center' },
  scanButton: { backgroundColor: colors.ink, borderRadius: 14, padding: 16, alignItems: 'center' },
  scanText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  or: { textAlign: 'center', color: colors.muted, fontSize: 13, marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  barCard: { marginBottom: 6, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  barTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  barBig: { fontSize: 26, fontWeight: '800', color: colors.ink },
  barOf: { fontSize: 15, fontWeight: '600', color: colors.muted },
  barLeft: { fontSize: 15, fontWeight: '700', color: '#3E8E5A' },
  track: { height: 16, borderRadius: 8, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 8 },
  foodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  foodName: { fontSize: 16, fontWeight: '600', color: colors.ink },
  foodCal: { fontSize: 15, fontWeight: '700', color: colors.ink },
  remove: { fontSize: 16, color: colors.muted },
});
