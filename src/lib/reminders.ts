import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CategoryId } from './categories';

export type Reminder = {
  id: string;
  category: CategoryId;
  title: string;
  hour: number; // 0-23
  minute: number; // 0-59
  days: number[]; // 1 = Sunday ... 7 = Saturday
  enabled: boolean;
  notificationIds?: string[]; // scheduled notifications on the phone
};

export const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];
export const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const KEY = 'wellness.reminders.v1';

export async function loadReminders(): Promise<Reminder[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Reminder[]) : [];
  } catch {
    return [];
  }
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(reminders));
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatTime(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

export function formatDays(days: number[]): string {
  if (days.length === 7) return 'Every day';
  const sorted = [...days].sort();
  if (sorted.join() === '2,3,4,5,6') return 'Weekdays';
  if (sorted.join() === '1,7') return 'Weekends';
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return sorted.map((d) => names[d - 1]).join(', ');
}
