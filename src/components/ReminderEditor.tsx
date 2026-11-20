import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CATEGORIES, type CategoryId } from '../lib/categories';
import { ALL_DAYS, DAY_LABELS, formatTime, newId, type Reminder } from '../lib/reminders';

type Props = {
  visible: boolean;
  initial: Reminder | null; // null = creating a new reminder
  defaultCategory: CategoryId;
  onSave: (r: Reminder) => void;
  onDelete: (r: Reminder) => void;
  onClose: () => void;
};

export function ReminderEditor({ visible, initial, defaultCategory, onSave, onDelete, onClose }: Props) {
  const [category, setCategory] = useState<CategoryId>(defaultCategory);
  const [title, setTitle] = useState('');
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [days, setDays] = useState<number[]>(ALL_DAYS);

  useEffect(() => {
    if (!visible) return;
    setCategory(initial?.category ?? defaultCategory);
    setTitle(initial?.title ?? '');
    setHour(initial?.hour ?? 8);
    setMinute(initial?.minute ?? 0);
    setDays(initial?.days ?? ALL_DAYS);
  }, [visible, initial, defaultCategory]);

  const toggleDay = (d: number) =>
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()));

  const save = () =>
    onSave({
      id: initial?.id ?? newId(),
      enabled: initial?.enabled ?? true,
      notificationIds: initial?.notificationIds,
      category,
      title: title.trim(),
      hour,
      minute,
      days,
    });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.heading}>{initial ? 'Edit reminder' : 'New reminder'}</Text>

            <Text style={styles.label}>Section</Text>
            <View style={styles.wrap}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setCategory(c.id)}
                  style={[styles.chip, category === c.id && { backgroundColor: c.color, borderColor: c.color }]}
                >
                  <Text style={[styles.chipText, category === c.id && { color: '#05070D', fontWeight: '600' }]}>
                    {c.emoji} {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Brush teeth + skincare"
              placeholderTextColor="#5B6680"
              style={styles.input}
            />

            <Text style={styles.label}>Time</Text>
            <View style={styles.timeRow}>
              <Stepper label="Hour" onMinus={() => setHour((h) => (h + 23) % 24)} onPlus={() => setHour((h) => (h + 1) % 24)} />
              <Text style={styles.time}>{formatTime(hour, minute)}</Text>
              <Stepper
                label="Min"
                onMinus={() => setMinute((m) => (m + 55) % 60)}
                onPlus={() => setMinute((m) => (m + 5) % 60)}
              />
            </View>

            <Text style={styles.label}>Repeat on</Text>
            <View style={styles.days}>
              {ALL_DAYS.map((d) => (
                <Pressable key={d} onPress={() => toggleDay(d)} style={[styles.day, days.includes(d) && styles.dayOn]}>
                  <Text style={[styles.dayText, days.includes(d) && { color: '#fff' }]}>{DAY_LABELS[d - 1]}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={save}
              disabled={days.length === 0}
              style={[styles.primary, days.length === 0 && { opacity: 0.4 }]}
            >
              <Text style={styles.primaryText}>Save</Text>
            </Pressable>
            {initial && (
              <Pressable onPress={() => onDelete(initial)} style={styles.secondary}>
                <Text style={[styles.secondaryText, { color: '#F87171' }]}>Delete</Text>
              </Pressable>
            )}
            <Pressable onPress={onClose} style={styles.secondary}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Stepper({ label, onMinus, onPlus }: { label: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable onPress={onPlus} style={styles.stepBtn} accessibilityLabel={`${label} up`}>
        <Text style={styles.stepText}>▲</Text>
      </Pressable>
      <Text style={styles.stepLabel}>{label}</Text>
      <Pressable onPress={onMinus} style={styles.stepBtn} accessibilityLabel={`${label} down`}>
        <Text style={styles.stepText}>▼</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    backgroundColor: '#0E1422', borderTopWidth: 1, borderColor: '#24314D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    width: '100%',
    maxWidth: 560,
  },
  heading: { fontSize: 22, fontWeight: '700', color: '#EEF2FF', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#8C98B3', marginTop: 18, marginBottom: 8, textTransform: 'uppercase' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#1F2A40', backgroundColor: '#151D30' },
  chipText: { fontSize: 14, color: '#EEF2FF' },
  input: { backgroundColor: '#151D30', borderRadius: 12, borderWidth: 1, borderColor: '#1F2A40', padding: 12, fontSize: 16, color: '#EEF2FF' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#151D30', borderRadius: 12, padding: 12 },
  time: { fontSize: 32, fontWeight: '700', color: '#EEF2FF' },
  stepBtn: { padding: 8 },
  stepText: { fontSize: 18, color: '#EEF2FF' },
  stepLabel: { fontSize: 12, color: '#8C98B3' },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#151D30', borderWidth: 1, borderColor: '#1F2A40' },
  dayOn: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  dayText: { fontWeight: '600', color: '#EEF2FF' },
  primary: { marginTop: 28, backgroundColor: '#3B82F6', borderRadius: 14, padding: 16, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondary: { marginTop: 10, padding: 12, alignItems: 'center' },
  secondaryText: { fontSize: 16, color: '#8C98B3', fontWeight: '600' },
});
