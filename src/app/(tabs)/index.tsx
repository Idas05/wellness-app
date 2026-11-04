import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { card, colors, Screen } from '../../components/Screen';
import { getCategory } from '../../lib/categories';
import { formatTime } from '../../lib/reminders';
import { formatMinutes, scoreColor, scoreLabel, sleepScore } from '../../lib/sleep';
import { useApp } from '../../lib/store';

function greeting(h: number) {
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const router = useRouter();
  const { reminders, sleep, userEmail } = useApp();
  const now = new Date();
  const weekday = now.getDay() + 1; // 1 = Sunday
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const today = reminders
    .filter((r) => r.enabled && r.days.includes(weekday))
    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  const next = today.find((r) => r.hour * 60 + r.minute >= nowMin);

  const last = sleep[0];
  const score = last ? sleepScore(last, sleep) : null;

  return (
    <Screen
      title={greeting(now.getHours())}
      subtitle={now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
    >
      <Pressable style={card.box} onPress={() => router.navigate(last ? '/progress' : '/more')}>
        <Text style={card.heading}>🌙 Last night's sleep</Text>
        {last && score ? (
          <View style={styles.row}>
            <View style={[styles.badge, { backgroundColor: scoreColor(score.total) }]}>
              <Text style={styles.badgeText}>{score.total}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.big}>{scoreLabel(score.total)}</Text>
              <Text style={styles.muted}>
                {formatMinutes(last.asleep_min)} asleep · {formatMinutes(last.deep_min)} deep
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.muted}>
            {userEmail
              ? 'No sleep data yet. Tap to connect your Apple Watch.'
              : 'Sign in from the More tab to see your Apple Watch sleep score.'}
          </Text>
        )}
      </Pressable>

      <View style={card.box}>
        <Text style={card.heading}>Today's reminders</Text>
        {today.length === 0 && (
          <Pressable onPress={() => router.navigate('/plan')}>
            <Text style={styles.muted}>Nothing set for today. Tap to add reminders in Plan.</Text>
          </Pressable>
        )}
        {today.map((r) => {
          const cat = getCategory(r.category);
          const done = r.hour * 60 + r.minute < nowMin;
          const isNext = r.id === next?.id;
          return (
            <View key={r.id} style={[styles.item, isNext && { backgroundColor: cat.color + '33' }, done && { opacity: 0.45 }]}>
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{r.title || cat.label}</Text>
                <Text style={styles.muted}>{isNext ? 'Up next' : done ? 'Done' : cat.label}</Text>
              </View>
              <Text style={styles.time}>{formatTime(r.hour, r.minute)}</Text>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  badge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 24, fontWeight: '800', color: colors.ink },
  big: { fontSize: 20, fontWeight: '700', color: colors.ink },
  muted: { fontSize: 14, color: colors.muted, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12, marginHorizontal: -6 },
  emoji: { fontSize: 22 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: colors.ink },
  time: { fontSize: 15, fontWeight: '700', color: colors.ink },
});
