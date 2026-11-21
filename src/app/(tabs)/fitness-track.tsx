import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CopyRow } from '../../components/AppleWatchSetup';
import { card, colors, Screen } from '../../components/Screen';
import { EXERCISE_GOAL, fetchFitnessDays, STEP_GOAL, type FitnessDay } from '../../lib/fitness';
import { todayKey } from '../../lib/nutrition';
import { getOrCreateToken } from '../../lib/sleep';
import { useApp } from '../../lib/store';

const ENDPOINT = `${process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''}/rest/v1/rpc/ingest_fitness`;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const GUIDE = 'https://github.com/Idas05/wellness-app/blob/main/docs/apple-watch-fitness.md';

const fmt = (n: number | null | undefined, digits = 0) => (n == null ? '–' : n.toLocaleString(undefined, { maximumFractionDigits: digits }));

function dayLabel(day: string, long = false): string {
  if (day === todayKey()) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (day === todayKey(yesterday)) return 'Yesterday';
  const d = new Date(`${day}T12:00:00`);
  return d.toLocaleDateString([], long ? { weekday: 'long', month: 'short', day: 'numeric' } : { weekday: 'short' });
}

export default function FitnessTrackScreen() {
  const { userEmail, setAuthOpen, syncTick } = useApp();
  const [days, setDays] = useState<FitnessDay[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setDays(await fetchFitnessDays());
      setError(null);
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      setError(/fitness_days/.test(msg) ? 'Fitness storage isn’t set up yet. Run supabase/fitness.sql in Supabase once.' : msg);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, userEmail, syncTick]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const latest = days[0];
  const week = days.slice(0, 7).reverse();
  const maxSteps = Math.max(STEP_GOAL, ...week.map((d) => d.steps ?? 0));

  return (
    <Screen title="Fitness Track" subtitle="Your activity from Apple Watch" refreshing={refreshing} onRefresh={onRefresh}>
      {error ? (
        <View style={[card.box, styles.banner]}>
          <Text style={styles.bannerText}>{error}</Text>
        </View>
      ) : null}

      {latest ? (
        <>
          <View style={card.box}>
            <Text style={card.heading}>{dayLabel(latest.day, true)}</Text>
            <Text style={styles.big}>{fmt(latest.steps)}</Text>
            <Text style={styles.bigUnit}>steps</Text>
            <Goal label="Steps" value={latest.steps} goal={STEP_GOAL} unit="" color="#3B82F6" />
            <Goal label="Exercise" value={latest.exercise_min} goal={EXERCISE_GOAL} unit=" min" color="#22D3EE" />

            <View style={styles.grid}>
              <Stat label="Active calories" value={fmt(latest.active_cal)} unit="cal" />
              <Stat label="Distance" value={fmt(latest.distance_mi, 2)} unit="mi" />
              <Stat label="Flights climbed" value={fmt(latest.flights)} />
              <Stat label="Resting heart rate" value={fmt(latest.resting_hr)} unit="bpm" />
              <Stat label="Heart rate variability" value={fmt(latest.hrv_ms)} unit="ms" />
              <Stat label="Cardio fitness" value={fmt(latest.vo2max, 1)} unit="VO₂ max" />
            </View>
          </View>

          {week.length > 1 ? (
            <View style={card.box}>
              <Text style={card.heading}>Steps, last {week.length} days</Text>
              <View style={styles.chart}>
                {week.map((d) => {
                  const h = Math.max(4, ((d.steps ?? 0) / maxSteps) * 120);
                  const hit = (d.steps ?? 0) >= STEP_GOAL;
                  return (
                    <View key={d.day} style={styles.barCol}>
                      <Text style={styles.barValue}>{d.steps == null ? '' : d.steps >= 1000 ? `${(d.steps / 1000).toFixed(1)}k` : d.steps}</Text>
                      <View style={[styles.bar, { height: h, backgroundColor: hit ? '#3B82F6' : '#24314D' }]} />
                      <Text style={styles.barLabel}>{d.day === todayKey() ? 'Today' : new Date(`${d.day}T12:00:00`).toLocaleDateString([], { weekday: 'short' })}</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.muted}>Green days hit {STEP_GOAL.toLocaleString()} steps.</Text>
            </View>
          ) : null}
        </>
      ) : !error ? (
        <View style={card.box}>
          <Text style={styles.emptyTitle}>No fitness data yet</Text>
          <Text style={styles.body}>
            {userEmail
              ? 'Set up the free iPhone Shortcut below once, and your Apple Watch steps, calories, exercise and heart data show up here.'
              : 'Sign in, then set up the free iPhone Shortcut below to bring in your Apple Watch activity.'}
          </Text>
        </View>
      ) : null}

      <FitnessSetup hasData={days.length > 0} count={days.length} onCheck={onRefresh} signedIn={!!userEmail} onSignIn={() => setAuthOpen(true)} />
    </Screen>
  );
}

function Goal({ label, value, goal, unit, color }: { label: string; value: number | null; goal: number; unit: string; color: string }) {
  const pct = Math.min(1, (value ?? 0) / goal);
  return (
    <View style={{ marginTop: 12 }}>
      <View style={styles.goalHead}>
        <Text style={styles.goalLabel}>{label}</Text>
        <Text style={styles.goalValue}>
          {fmt(value)}
          {unit} / {goal.toLocaleString()}
          {unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value}
        {unit && value !== '–' ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

/** The values the iPhone Shortcut needs. Folds away once data arrives. */
function FitnessSetup({ hasData, count, onCheck, signedIn, onSignIn }: { hasData: boolean; count: number; onCheck: () => void; signedIn: boolean; onSignIn: () => void }) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setToken(null);
    setTokenError(null);
    if (!signedIn) return;
    getOrCreateToken()
      .then(setToken)
      .catch((e) => setTokenError(/sleep_tokens/.test(String(e?.message)) ? 'Run supabase/fitness.sql in Supabase once to finish setup.' : String(e?.message ?? e)));
  }, [signedIn]);

  const copy = async (label: string, value: string) => {
    await Clipboard.setStringAsync(value);
    setCopied(label);
    setTimeout(() => setCopied((c) => (c === label ? null : c)), 2000);
  };

  return (
    <View style={card.box}>
      <Text style={card.heading}>⌚ Connect Apple Watch</Text>
      {!signedIn ? (
        <>
          <Text style={styles.body}>Sign in first, then come back here to connect your Apple Watch.</Text>
          <Pressable style={styles.button} onPress={onSignIn}>
            <Text style={styles.buttonText}>Sign in</Text>
          </Pressable>
        </>
      ) : tokenError ? (
        <Text style={[styles.body, { color: '#FCA5A5' }]}>{tokenError}</Text>
      ) : hasData && !open ? (
        <>
          <Text style={styles.body}>Connected. {count} day(s) received.</Text>
          <Pressable onPress={() => setOpen(true)}>
            <Text style={[styles.small, styles.link]}>Show setup details ›</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.body}>
            A free iPhone Shortcut reads today’s activity from the Health app and sends it here. Build it once with these three values (tap to copy). If you
            already made the sleep Shortcut, your code is the same.
          </Text>
          <CopyRow label="Your code" value={token ?? 'Loading…'} copied={copied} onCopy={copy} disabled={!token} />
          <CopyRow label="Web address" value={ENDPOINT} copied={copied} onCopy={copy} />
          <CopyRow label="Key" value={KEY} copied={copied} onCopy={copy} />
          <Text style={styles.small}>Keep your code private, like a password.</Text>
          <Pressable onPress={() => Linking.openURL(GUIDE)}>
            <Text style={[styles.small, styles.link]}>Open the step-by-step Shortcut guide ›</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.buttonLight]} onPress={onCheck}>
            <Text style={[styles.buttonText, { color: colors.ink }]}>Check for new fitness data</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#2A1418' },
  bannerText: { color: '#FCA5A5', fontSize: 14, fontWeight: '600' },
  big: { fontSize: 44, fontWeight: '800', color: colors.ink, lineHeight: 48 },
  bigUnit: { fontSize: 15, fontWeight: '600', color: colors.muted },
  goalHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalLabel: { fontSize: 14, fontWeight: '700', color: colors.ink },
  goalValue: { fontSize: 13, fontWeight: '600', color: colors.muted },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, marginHorizontal: -4 },
  stat: { width: '50%', padding: 4 },
  statLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.ink, marginTop: 2, marginBottom: 10 },
  statUnit: { fontSize: 13, fontWeight: '600', color: colors.muted },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, marginBottom: 8 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 22, borderRadius: 6 },
  barValue: { fontSize: 11, color: colors.muted, marginBottom: 4 },
  barLabel: { fontSize: 12, fontWeight: '600', color: colors.muted, marginTop: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  body: { fontSize: 15, color: colors.ink, lineHeight: 21 },
  muted: { fontSize: 13, color: colors.muted },
  small: { fontSize: 13, color: colors.muted, marginTop: 10 },
  link: { color: '#60A5FA', fontWeight: '700' },
  button: { marginTop: 14, backgroundColor: colors.accent, borderRadius: 14, padding: 14, alignItems: 'center' },
  buttonLight: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
