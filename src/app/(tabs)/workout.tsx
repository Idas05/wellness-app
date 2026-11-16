import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { card, colors, Screen } from '../../components/Screen';
import { loadProfile, todayKey, type CalorieProfile } from '../../lib/nutrition';
import {
  buildWorkoutPlan,
  isFilled,
  loadHistory,
  loadLastTimes,
  loadWorkoutDay,
  lockExercise,
  saveWorkoutDay,
  setCount,
  type Exercise,
  type HistoryEntry,
  type LoggedSet,
} from '../../lib/workout';

export default function WorkoutScreen() {
  const [profile, setProfile] = useState<CalorieProfile | null | undefined>(undefined);
  const today = new Date().getDay();
  const [selected, setSelected] = useState(today);
  const [date, setDate] = useState(todayKey());
  const [log, setLog] = useState<Record<string, LoggedSet[]>>({});
  const [lastTimes, setLastTimes] = useState<Record<string, { date: string; sets: LoggedSet[] }>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Re-read every visit so changes made in the Cal Counter questions show up here.
  useFocusEffect(
    useCallback(() => {
      const d = todayKey();
      setDate(d);
      loadProfile().then(setProfile);
      loadWorkoutDay(d).then(setLog);
      loadLastTimes(d).then(setLastTimes);
      loadHistory().then(setHistory);
    }, []),
  );

  const updateSets = (name: string, sets: LoggedSet[]) => {
    setLog((prev) => {
      const next = { ...prev, [name]: sets };
      saveWorkoutDay(date, next);
      return next;
    });
  };

  const lock = (dayTitle: string, name: string, sets: LoggedSet[]) => {
    const go = async () => {
      setHistory(await lockExercise(date, dayTitle, name, sets));
      setOpen(null);
    };
    const msg = `${name}: ${summary(sets)}. You won't be able to change it after this.`;
    if (Platform.OS === 'web') {
      if (window.confirm(`Set in stone?\n\n${msg}`)) go();
    } else {
      Alert.alert('Set in stone?', msg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Set in stone', onPress: go },
      ]);
    }
  };
  const lockedToday = new Set(history.filter((h) => h.date === date).map((h) => h.exercise));

  if (profile === undefined) return <Screen title="Workout">{null}</Screen>;

  if (!profile || !profile.activity) {
    return (
      <Screen title="Workout" subtitle="Push, pull, legs with cardio after">
        <View style={card.box}>
          <Text style={styles.body}>
            Your workout plan is built from your weight and goal weight. Answer the questions in Cal Counter first.
          </Text>
          <Pressable onPress={() => router.navigate('/calories')} style={styles.button}>
            <Text style={styles.buttonText}>Go to Cal Counter</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const plan = buildWorkoutPlan(profile);
  const day = plan.days[selected];

  return (
    <Screen title="Workout" subtitle="Push, pull, legs with cardio after">
      <View style={card.box}>
        <Text style={card.heading}>Your plan</Text>
        <Text style={styles.body}>{plan.summary}</Text>
        <Text style={styles.small}>
          6 days a week. {plan.repStyle}. Rest {plan.rest} between sets. {plan.cardioMinutes} minutes of cardio after
          every workout.
        </Text>
      </View>

      <View style={styles.week}>
        {plan.days.map((d) => {
          const on = d.weekday === selected;
          return (
            <Pressable
              key={d.weekday}
              onPress={() => setSelected(d.weekday)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${d.short} ${d.title}`}
              style={[styles.dayChip, on && styles.dayChipOn]}
            >
              <Text style={[styles.dayShort, on && styles.onText]}>{d.short}</Text>
              <Text style={[styles.dayTitle, on && styles.onText]}>{d.title}</Text>
              {d.weekday === today ? <View style={[styles.dot, on && { backgroundColor: '#fff' }]} /> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={card.box}>
        <Text style={card.heading}>{selected === today ? 'Today' : day.short}</Text>
        <Text style={styles.dayHeading}>{day.title === 'Rest' ? 'Rest day' : `${day.title} day`}</Text>
        <Text style={styles.muted}>{day.focus}</Text>

        {day.exercises.length > 0 ? (
          <Text style={styles.hint}>
            Tap an exercise to log your weight and reps. Sets are saved to today.
          </Text>
        ) : null}

        {day.exercises.map((e, i) => (
          <ExerciseRow
            key={e.name}
            first={i === 0}
            exercise={e}
            canLog
            open={open === e.name}
            onToggle={() => setOpen((o) => (o === e.name ? null : e.name))}
            sets={log[e.name]}
            last={lastTimes[e.name]}
            onChange={(sets) => updateSets(e.name, sets)}
            locked={lockedToday.has(e.name)}
            onLock={(sets) => lock(day.title, e.name, sets)}
          />
        ))}

        {day.title === 'Rest' ? (
          <Text style={[styles.body, { marginTop: 12 }]}>No lifting or cardio today. A 20–30 minute walk is a nice extra.</Text>
        ) : null}
      </View>

      {day.cardio ? (
        <View style={[card.box, styles.cardio]}>
          <Text style={card.heading}>Cardio after</Text>
          <View style={styles.cardioRow}>
            <Text style={styles.cardioMin}>{day.cardio.minutes}</Text>
            <Text style={styles.cardioUnit}>min</Text>
            <Text style={styles.cardioWhat}>{day.cardio.what}</Text>
          </View>
          <Text style={styles.cardioSetting}>{day.cardio.setting}</Text>
          <Text style={styles.muted}>{day.cardio.how}</Text>
        </View>
      ) : null}

      <View style={card.box}>
        <Text style={card.heading}>Progress</Text>
        <Text style={styles.body}>
          {history.length
            ? `${history.length} exercise${history.length === 1 ? '' : 's'} set in stone over ${new Set(history.map((h) => h.date)).size} day${new Set(history.map((h) => h.date)).size === 1 ? '' : 's'}.`
            : 'Log an exercise and tap "Set in stone" to start your progress spreadsheet.'}
        </Text>
        <Pressable onPress={() => router.push('/progress')} style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>Open progress spreadsheet</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.navigate('/calories')}>
        <Text style={styles.link}>Change my weight or goal ›</Text>
      </Pressable>
    </Screen>
  );
}

function summary(sets: LoggedSet[]): string {
  return sets
    .filter(isFilled)
    .map((s) => `${s.weight || '–'}×${s.reps || '–'}`)
    .join(', ');
}

function shortDate(d: string): string {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function ExerciseRow({
  exercise,
  first,
  canLog,
  open,
  onToggle,
  sets,
  last,
  onChange,
  locked,
  onLock,
}: {
  exercise: Exercise;
  first: boolean;
  canLog: boolean;
  open: boolean;
  onToggle: () => void;
  sets: LoggedSet[] | undefined;
  last: { date: string; sets: LoggedSet[] } | undefined;
  onChange: (sets: LoggedSet[]) => void;
  locked: boolean;
  onLock: (sets: LoggedSet[]) => void;
}) {
  const count = setCount(exercise.sets);
  const rows: LoggedSet[] = sets && sets.length ? sets : Array.from({ length: count }, () => ({ weight: '', reps: '' }));
  const shownRows = locked ? rows.filter(isFilled) : rows;
  const doneCount = rows.filter(isFilled).length;

  const edit = (i: number, field: keyof LoggedSet, value: string) => {
    const next = rows.map((r, j) => (j === i ? { ...r, [field]: value.replace(/[^0-9.]/g, '') } : r));
    onChange(next);
  };

  return (
    <View style={[styles.exBlock, first && { borderTopWidth: 0 }]}>
      <Pressable
        onPress={canLog ? onToggle : undefined}
        accessibilityRole={canLog ? 'button' : undefined}
        accessibilityLabel={canLog ? `Log ${exercise.name}` : exercise.name}
        style={styles.row}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.exName}>{exercise.name}</Text>
          {exercise.note ? <Text style={styles.note}>{exercise.note}</Text> : null}
          {locked && !open ? (
            <Text style={styles.logged}>Set in stone: {summary(rows)}</Text>
          ) : canLog && doneCount > 0 && !open ? (
            <Text style={styles.loggedDraft}>Logged: {summary(rows)}</Text>
          ) : last ? (
            <Text style={styles.note}>
              Last time: {summary(last.sets)} ({shortDate(last.date)})
            </Text>
          ) : null}
        </View>
        <Text style={styles.sets}>{exercise.sets}</Text>
        {locked ? <Text style={styles.chev}>✓</Text> : canLog ? <Text style={styles.chev}>{open ? '▾' : '▸'}</Text> : null}
      </Pressable>

      {open ? (
        <View style={styles.logBox}>
          <View style={styles.logHead}>
            <Text style={[styles.logLabel, { width: 44 }]}>Set</Text>
            <Text style={[styles.logLabel, { flex: 1 }]}>Weight (lb)</Text>
            <Text style={[styles.logLabel, { flex: 1 }]}>Reps</Text>
          </View>
          {shownRows.map((r, i) => (
            <View key={i} style={styles.logRow}>
              <Text style={styles.setNum}>{i + 1}</Text>
              <TextInput
                value={r.weight}
                onChangeText={(t) => edit(i, 'weight', t)}
                editable={!locked}
                placeholder={last?.sets[i]?.weight || 'lb'}
                placeholderTextColor="#B5AEA5"
                keyboardType="decimal-pad"
                accessibilityLabel={`Set ${i + 1} weight`}
                style={[styles.logInput, locked && styles.logInputLocked]}
              />
              <TextInput
                value={r.reps}
                onChangeText={(t) => edit(i, 'reps', t)}
                editable={!locked}
                placeholder={last?.sets[i]?.reps || 'reps'}
                placeholderTextColor="#B5AEA5"
                keyboardType="number-pad"
                accessibilityLabel={`Set ${i + 1} reps`}
                style={[styles.logInput, locked && styles.logInputLocked]}
              />
            </View>
          ))}
          {locked ? (
            <View style={styles.logActions}>
              <Text style={[styles.logged, { flex: 1, alignSelf: 'center' }]}>Set in stone. Saved to your progress.</Text>
              <Pressable onPress={onToggle} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>Close</Text>
              </Pressable>
            </View>
          ) : (
          <View style={styles.logActions}>
            <Pressable onPress={() => onChange([...rows, { weight: rows[rows.length - 1]?.weight ?? '', reps: '' }])} style={styles.smallBtn}>
              <Text style={styles.smallBtnText}>+ Add set</Text>
            </Pressable>
            {rows.length > 1 ? (
              <Pressable onPress={() => onChange(rows.slice(0, -1))} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>Remove set</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => onLock(rows)}
              disabled={doneCount === 0}
              accessibilityLabel={`Set ${exercise.name} in stone`}
              style={[styles.smallBtn, styles.doneBtn, doneCount === 0 && { opacity: 0.4 }]}
            >
              <Text style={[styles.smallBtnText, { color: '#fff' }]}>Set in stone</Text>
            </Pressable>
          </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 16, color: colors.ink, lineHeight: 22 },
  muted: { fontSize: 14, color: colors.muted, marginTop: 4 },
  small: { fontSize: 13, color: colors.muted, marginTop: 10, lineHeight: 18 },
  link: { color: '#2B6CB0', fontWeight: '700', fontSize: 14, marginBottom: 12 },
  button: { marginTop: 14, backgroundColor: colors.ink, borderRadius: 14, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  week: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  dayChip: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dayChipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  dayShort: { fontSize: 12, fontWeight: '600', color: colors.muted },
  dayTitle: { fontSize: 13, fontWeight: '700', color: colors.ink, marginTop: 2 },
  onText: { color: '#fff' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.ink, marginTop: 4 },
  dayHeading: { fontSize: 22, fontWeight: '800', color: colors.ink },
  hint: { fontSize: 13, color: colors.muted, marginTop: 8, marginBottom: 2 },
  exBlock: { borderTopWidth: 1, borderTopColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  chev: { fontSize: 14, color: colors.muted, width: 14 },
  loggedDraft: { fontSize: 13, color: colors.muted, fontWeight: '600', marginTop: 3 },
  logInputLocked: { backgroundColor: colors.line, color: colors.ink },
  logged: { fontSize: 13, color: '#3E8E5A', fontWeight: '600', marginTop: 3 },
  logBox: { backgroundColor: colors.bg, borderRadius: 14, padding: 12, marginBottom: 12 },
  logHead: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  logLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  setNum: { width: 44, fontSize: 16, fontWeight: '700', color: colors.ink },
  logInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.ink,
  },
  logActions: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  smallBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  doneBtn: { backgroundColor: colors.ink, borderColor: colors.ink, marginLeft: 'auto' },
  smallBtnText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  exName: { fontSize: 16, fontWeight: '600', color: colors.ink },
  note: { fontSize: 13, color: colors.muted, marginTop: 2 },
  sets: { fontSize: 15, fontWeight: '700', color: colors.ink },
  cardio: { backgroundColor: '#EEF3FB' },
  cardioRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  cardioMin: { fontSize: 30, fontWeight: '800', color: colors.ink },
  cardioUnit: { fontSize: 15, fontWeight: '700', color: colors.muted },
  cardioSetting: { fontSize: 15, fontWeight: '700', color: '#2B6CB0', marginTop: 2 },
  cardioWhat: { fontSize: 17, fontWeight: '700', color: colors.ink, marginLeft: 8, flexShrink: 1 },
});
