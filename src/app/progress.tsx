import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { card, colors, Screen } from '../components/Screen';
import { exportCsv } from '../lib/exportCsv';
import { todayKey } from '../lib/nutrition';
import { historyCsv, loadHistory, topWeight, volume, type HistoryEntry } from '../lib/workout';

function shortDate(d: string): string {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ProgressScreen() {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setHistory);
    }, []),
  );

  const back = () => (router.canGoBack() ? router.back() : router.navigate('/workout'));

  const download = async () => {
    setError(null);
    try {
      await exportCsv(`workout-progress-${todayKey()}.csv`, historyCsv(history ?? []));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not export the spreadsheet.');
    }
  };

  // Group by exercise, most recently trained first.
  const groups = new Map<string, HistoryEntry[]>();
  for (const h of [...(history ?? [])].sort((a, b) => b.date.localeCompare(a.date))) {
    groups.set(h.exercise, [...(groups.get(h.exercise) ?? []), h]);
  }
  const names = [...groups.keys()];
  const shown = filter && groups.has(filter) ? [filter] : names;

  return (
    <Screen title="Progress" subtitle="Every workout you set in stone">
      <Pressable onPress={back} style={styles.back} accessibilityRole="link">
        <Text style={styles.backText}>‹ Back to Workout</Text>
      </Pressable>

      {history && history.length === 0 ? (
        <View style={card.box}>
          <Text style={styles.body}>
            Nothing here yet. In Workout, tap an exercise, enter your weight and reps, then tap "Set in stone". It shows
            up here.
          </Text>
        </View>
      ) : null}

      {history && history.length > 0 ? (
        <>
          <Pressable onPress={download} style={styles.button} accessibilityRole="button">
            <Text style={styles.buttonText}>{Platform.OS === 'web' ? 'Download spreadsheet' : 'Export spreadsheet'}</Text>
          </Pressable>
          <Text style={styles.hint}>
            {Platform.OS === 'web'
              ? 'Saves a .csv file that opens in Excel, Numbers or Google Sheets.'
              : 'Save it to Files, open it in Numbers, or AirDrop it.'}
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {[null, ...names].map((n) => {
              const on = filter === n;
              return (
                <Pressable key={n ?? 'all'} onPress={() => setFilter(n)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipText, on && { color: '#fff' }]}>{n ?? 'All'}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {shown.map((name) => {
            const entries = groups.get(name)!;
            const best = Math.max(...entries.map((e) => topWeight(e.sets)));
            const first = topWeight(entries[entries.length - 1].sets);
            const latest = topWeight(entries[0].sets);
            const change = latest - first;
            return (
              <View key={name} style={card.box}>
                <Text style={styles.exName}>{name}</Text>
                <Text style={styles.muted}>
                  Best {best} lb
                  {entries.length > 1 ? `  ·  ${change >= 0 ? '+' : ''}${change} lb since ${shortDate(entries[entries.length - 1].date)}` : ''}
                </Text>

                <View style={[styles.tr, styles.th]}>
                  <Text style={[styles.thText, styles.cDate]}>Date</Text>
                  <Text style={[styles.thText, styles.cSets]}>Sets (lb × reps)</Text>
                  <Text style={[styles.thText, styles.cNum]}>Top</Text>
                  <Text style={[styles.thText, styles.cNum]}>Volume</Text>
                </View>
                {entries.map((e) => (
                  <View key={e.date + e.lockedAt} style={styles.tr}>
                    <Text style={[styles.td, styles.cDate]}>{shortDate(e.date)}</Text>
                    <Text style={[styles.td, styles.cSets]}>{e.sets.map((s) => `${s.weight || '–'}×${s.reps || '–'}`).join(', ')}</Text>
                    <Text style={[styles.td, styles.cNum, { fontWeight: '700' }]}>{topWeight(e.sets)}</Text>
                    <Text style={[styles.td, styles.cNum]}>{Math.round(volume(e.sets)).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            );
          })}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: 12, alignSelf: 'flex-start' },
  backText: { color: '#2B6CB0', fontWeight: '700', fontSize: 15 },
  body: { fontSize: 16, color: colors.ink, lineHeight: 22 },
  muted: { fontSize: 14, color: colors.muted, marginTop: 2, marginBottom: 10 },
  hint: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 12 },
  error: { fontSize: 14, color: '#C0392B', textAlign: 'center', marginBottom: 12 },
  button: { backgroundColor: colors.ink, borderRadius: 14, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  chips: { gap: 8, paddingBottom: 14 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  exName: { fontSize: 18, fontWeight: '700', color: colors.ink },
  tr: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.line },
  th: { borderTopWidth: 0, backgroundColor: colors.bg, borderRadius: 8, paddingHorizontal: 6, marginHorizontal: -6 },
  thText: { fontSize: 11, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' },
  td: { fontSize: 14, color: colors.ink },
  cDate: { width: 52 },
  cSets: { flex: 1, minWidth: 0 },
  cNum: { width: 56, textAlign: 'right' },
});
