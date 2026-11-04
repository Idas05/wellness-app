import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { ReminderEditor } from '../../components/ReminderEditor';
import { CATEGORIES, type CategoryId } from '../../lib/categories';
import { formatDays, formatTime, type Reminder } from '../../lib/reminders';
import { Screen } from '../../components/Screen';
import { useApp } from '../../lib/store';

type Filter = CategoryId | 'all';

export default function PlanScreen() {
  const { reminders, permission, syncError, upsertReminder, removeReminder } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const upsert = async (r: Reminder) => {
    setEditorOpen(false);
    await upsertReminder(r);
  };

  const remove = async (r: Reminder) => {
    setEditorOpen(false);
    await removeReminder(r);
  };

  const toggle = (r: Reminder) => upsert({ ...r, enabled: !r.enabled });

  const visible = reminders
    .filter((r) => filter === 'all' || r.category === filter)
    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

  const groups = CATEGORIES.map((c) => ({ cat: c, items: visible.filter((r) => r.category === c.id) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <Screen
      title="Plan"
      subtitle="Your daily reminders"
      overlay={
        <>
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
            defaultCategory={filter === 'all' ? 'wakeup' : filter}
            onSave={upsert}
            onDelete={remove}
            onClose={() => setEditorOpen(false)}
          />
        </>
      }
    >
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
        {syncError && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Couldn't sync: {syncError}</Text>
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
            <Text style={styles.emptyText}>Tap “+ Add reminder” to set one for waking up, hygiene, meals, gym and more.</Text>
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
        <View style={{ height: 50 }} />
    </Screen>
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
    bottom: 112,
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
