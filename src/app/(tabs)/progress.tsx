import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { card, colors, Screen } from '../../components/Screen';
import { formatClock, formatMinutes, scoreColor, scoreLabel, sleepScore, type SleepNight } from '../../lib/sleep';
import { useApp } from '../../lib/store';

const STAGES = [
  { key: 'deep_min', label: 'Deep', color: '#5B6BD6' },
  { key: 'core_min', label: 'Core', color: '#8E9BEF' },
  { key: 'rem_min', label: 'REM', color: '#6EC6E8' },
  { key: 'awake_min', label: 'Awake', color: '#F29E6D' },
] as const;

function nightLabel(n: SleepNight) {
  // n.night is YYYY-MM-DD; build a local date so the weekday is right.
  const [y, m, d] = n.night.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], { weekday: 'short' });
}

export default function ProgressScreen() {
  const router = useRouter();
  const { sleep, sleepError, refreshSleep, userEmail } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshSleep();
    }, [refreshSleep]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshSleep();
    setRefreshing(false);
  };

  const last = sleep[0];
  const score = last ? sleepScore(last, sleep) : null;
  const week = sleep.slice(0, 7).reverse();
  const stageTotal = last ? STAGES.reduce((s, st) => s + last[st.key], 0) : 0;

  return (
    <Screen title="Progress" subtitle="Sleep score from your Apple Watch" refreshing={refreshing} onRefresh={onRefresh}>
      {sleepError && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Couldn't load sleep: {sleepError}</Text>
        </View>
      )}

      {!last || !score ? (
        <View style={card.box}>
          <Text style={styles.emptyTitle}>No sleep data yet</Text>
          <Text style={styles.muted}>
            {userEmail
              ? 'Set up the free iPhone Shortcut once, and your Apple Watch sleep shows up here every morning.'
              : 'Sign in first, then set up the free iPhone Shortcut to bring in your Apple Watch sleep.'}
          </Text>
          <Pressable style={styles.button} onPress={() => router.navigate('/more')}>
            <Text style={styles.buttonText}>{userEmail ? 'Connect Apple Watch' : 'Go to More'}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={[card.box, { alignItems: 'center' }]}>
            <Text style={card.heading}>🌙 Sleep score · {nightLabel(last)}</Text>
            <View style={[styles.ring, { borderColor: scoreColor(score.total) }]}>
              <Text style={styles.score}>{score.total}</Text>
              <Text style={styles.scoreLabel}>{scoreLabel(score.total)}</Text>
            </View>
            <View style={styles.parts}>
              <Part label="Duration" value={score.duration} max={50} />
              <Part label="Deep + REM" value={score.quality} max={25} />
              <Part label="Restful" value={score.restful} max={15} />
              <Part label="Routine" value={score.consistency} max={10} />
            </View>
          </View>

          <View style={card.box}>
            <Text style={card.heading}>Last night</Text>
            <View style={styles.statsRow}>
              <Stat label="Asleep" value={formatMinutes(last.asleep_min)} />
              <Stat label="Bedtime" value={formatClock(last.bedtime)} />
              <Stat label="Woke up" value={formatClock(last.wake_time)} />
            </View>
            {stageTotal > 0 && (
              <>
                <View style={styles.stageBar}>
                  {STAGES.map((st) =>
                    last[st.key] > 0 ? (
                      <View key={st.key} style={{ flex: last[st.key], backgroundColor: st.color }} />
                    ) : null,
                  )}
                </View>
                {STAGES.map((st) => (
                  <View key={st.key} style={styles.stageRow}>
                    <View style={[styles.dot, { backgroundColor: st.color }]} />
                    <Text style={styles.stageLabel}>{st.label}</Text>
                    <Text style={styles.stageValue}>{formatMinutes(last[st.key])}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          <View style={card.box}>
            <Text style={card.heading}>Last 7 nights</Text>
            <View style={styles.chart}>
              {week.map((n) => {
                const s = sleepScore(n, sleep).total;
                return (
                  <View key={n.night} style={styles.barCol}>
                    <Text style={styles.barValue}>{s}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.bar, { height: `${Math.max(s, 4)}%`, backgroundColor: scoreColor(s) }]} />
                    </View>
                    <Text style={styles.barLabel}>{nightLabel(n)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

function Part({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <View style={styles.part}>
      <Text style={styles.partValue}>
        {value}
        <Text style={styles.partMax}>/{max}</Text>
      </Text>
      <Text style={styles.partLabel}>{label}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#FDECEA', borderRadius: 12, padding: 12, marginBottom: 12 },
  bannerText: { color: '#8A2B20', fontSize: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  muted: { fontSize: 14, color: colors.muted, marginTop: 2 },
  button: { marginTop: 14, backgroundColor: colors.ink, borderRadius: 14, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ring: { width: 150, height: 150, borderRadius: 75, borderWidth: 12, alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  score: { fontSize: 44, fontWeight: '800', color: colors.ink },
  scoreLabel: { fontSize: 14, fontWeight: '600', color: colors.muted },
  parts: { flexDirection: 'row', marginTop: 14, alignSelf: 'stretch' },
  part: { flex: 1, alignItems: 'center' },
  partValue: { fontSize: 18, fontWeight: '700', color: colors.ink },
  partMax: { fontSize: 12, fontWeight: '500', color: colors.muted },
  partLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  statsRow: { flexDirection: 'row', marginBottom: 14 },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.ink },
  stageBar: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: 10 },
  stageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  stageLabel: { flex: 1, fontSize: 15, color: colors.ink },
  stageValue: { fontSize: 15, fontWeight: '600', color: colors.ink },
  chart: { flexDirection: 'row', height: 160, gap: 8 },
  barCol: { flex: 1, alignItems: 'center' },
  barValue: { fontSize: 12, fontWeight: '600', color: colors.muted, marginBottom: 4 },
  barTrack: { flex: 1, width: '70%', justifyContent: 'flex-end', backgroundColor: colors.line, borderRadius: 8, overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 8 },
  barLabel: { fontSize: 12, color: colors.muted, marginTop: 6 },
});
