import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { card, colors, Screen } from '../../components/Screen';
import { loadProfile, type CalorieProfile } from '../../lib/nutrition';
import { buildWorkoutPlan } from '../../lib/workout';

export default function WorkoutScreen() {
  const [profile, setProfile] = useState<CalorieProfile | null | undefined>(undefined);
  const today = new Date().getDay();
  const [selected, setSelected] = useState(today);

  // Re-read every visit so changes made in the Cal Counter questions show up here.
  useFocusEffect(
    useCallback(() => {
      loadProfile().then(setProfile);
    }, []),
  );

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

        {day.exercises.map((e, i) => (
          <View key={e.name} style={[styles.row, i === 0 && { borderTopWidth: 0 }]}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.exName}>{e.name}</Text>
              {e.note ? <Text style={styles.note}>{e.note}</Text> : null}
            </View>
            <Text style={styles.sets}>{e.sets}</Text>
          </View>
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
          <Text style={styles.muted}>{day.cardio.how}</Text>
        </View>
      ) : null}

      <Pressable onPress={() => router.navigate('/calories')}>
        <Text style={styles.link}>Change my weight or goal ›</Text>
      </Pressable>
    </Screen>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  exName: { fontSize: 16, fontWeight: '600', color: colors.ink },
  note: { fontSize: 13, color: colors.muted, marginTop: 2 },
  sets: { fontSize: 15, fontWeight: '700', color: colors.ink },
  cardio: { backgroundColor: '#EEF3FB' },
  cardioRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  cardioMin: { fontSize: 30, fontWeight: '800', color: colors.ink },
  cardioUnit: { fontSize: 15, fontWeight: '700', color: colors.muted },
  cardioWhat: { fontSize: 17, fontWeight: '700', color: colors.ink, marginLeft: 8, flexShrink: 1 },
});
