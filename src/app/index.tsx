import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { ReminderEditor } from '../components/ReminderEditor';
import { CATEGORIES, getCategory, type CategoryId } from '../lib/categories';
import { cancelReminder, requestPermission, scheduleReminder, startWebChecker } from '../lib/notify';
import { formatDays, formatTime, loadReminders, saveReminders, type Reminder } from '../lib/reminders';

type Filter = CategoryId | 'all';

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [permission, setPermission] = useState<boolean | null>(null);
  const latest = useRef<Reminder[]>([]);
  latest.current = reminders;

  useEffect(() => {
    loadReminders().then(setReminders);
    requestPermission().then(setPermission).catch(() => setPermission(false));
    return startWebChecker(() => latest.current);
  }, []);

  const persist = useCallback(async (next: Reminder[]) => {
    setReminders(next);
    await saveReminders(next);
  }, []);

  const upsert = async (r: Reminder) => {
    const notificationIds = await scheduleReminder(r).catch(() => []);
    const saved = { ...r, notificationIds };
    const exists = reminders.some((x) => x.id === r.id);
    await persist(exists ? reminders.map((x) => (x.id === r.id ? saved : x)) : [...reminders, saved]);
    setEditorOpen(false);
  };

  const remove = async (r: Reminder) => {
    await cancelReminder(r).catch(() => {});
    await persist(reminders.filter((x) => x.id !== r.id));
    setEditorOpen(false);
  };

  const toggle = (r: Reminder) => upsert({ ...r, enabled: !r.enabled });

  const visible = reminders
    .filter((r) => filter === 'all' || r.category === filter)
    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

  const groups = CATEGORIES.map((c) => ({ cat: c, items: visible.filter((r) => r.category === c.id) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {permission === false && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Notifications are off.{' '}
              {Platform.OS === 'web'
                ? 'Allow notifications for this site in your browser to get reminders.'
                : 'Turn them on in Settings › Notifications to get reminders.'}
            </Text>
          </View>
        )}
        {Platform.OS === 'web' && permission && (
          <Text style={styles.hint}>Keep this tab open to get desktop notifications.</Text>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              label={`${c.emoji} ${c.label}`}
              color={c.color}
              active={filter === c.id}
              onPress={() => setFilter(c.id)}
            />
          ))}
        </ScrollView>

        {groups.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No reminders yet</Text>
            <Text style={styles.emptyText}>Tap “+ Add reminder” to set one for skin care, meals, gym and more.</Text>
          </View>
        )}

        {groups.map(({ cat, items }) => (
          <View key={cat.id} style={{ marginTop: 18 }}>
            <Text style={styles.groupTitle}>
              {cat.emoji} {cat.label}
            </Text>
            {items.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => {
                  setEditing(r);
                  setEditorOpen(true);
                }}
                style={[styles.card, { borderLeftColor: cat.color }, !r.enabled && { opacity: 0.5 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTime}>{formatTime(r.hour, r.minute)}</Text>
                  <Text style={styles.cardSub}>
                    {r.title ? `${r.title} · ` : ''}
                    {formatDays(r.days)}
                  </Text>
                </View>
                <Switch value={r.enabled} onValueChange={() => toggle(r)} />
              </Pressable>
            ))}
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => {
          setEditing(null);
          setEditorOpen(true);
        }}
      >
        <Text style={styles.fabText}>+ Add reminder</Text>
      </Pressable>

      <ReminderEditor
        visible={editorOpen}
        initial={editing}
        defaultCategory={filter === 'all' ? 'skincare' : filter}
        onSave={upsert}
        onDelete={remove}
        onClose={() => setEditorOpen(false)}
      />
    </View>
  );
}

function FilterChip({ label, active, color, onPress }: { label: string; active: boolean; color?: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: color ?? '#2B2724', borderColor: color ?? '#2B2724' }]}
    >
      <Text style={[styles.chipText, active && !color && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  banner: { backgroundColor: '#FDECEA', borderRadius: 12, padding: 12, marginBottom: 12 },
  bannerText: { color: '#8A2B20', fontSize: 14 },
  hint: { color: '#6B645C', fontSize: 13, marginBottom: 8 },
  filters: { gap: 8, paddingVertical: 4 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: '#DDD6CC', backgroundColor: '#fff' },
  chipText: { fontSize: 14, color: '#2B2724' },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2B2724' },
  emptyText: { fontSize: 15, color: '#6B645C', textAlign: 'center', marginTop: 6 },
  groupTitle: { fontSize: 15, fontWeight: '700', color: '#6B645C', marginBottom: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 5,
  },
  cardTime: { fontSize: 22, fontWeight: '700', color: '#2B2724' },
  cardSub: { fontSize: 14, color: '#6B645C', marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    backgroundColor: '#2B2724',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
