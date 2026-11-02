// Phone (iOS/Android): notifications are scheduled on the device itself,
// so they fire even when the app is closed and cost nothing.
import * as Notifications from 'expo-notifications';
import { getCategory } from './categories';
import type { Reminder } from './reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function cancelReminder(reminder: Reminder): Promise<void> {
  for (const id of reminder.notificationIds ?? []) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  }
}

/** Cancels any old notifications for this reminder and schedules new ones. Returns their ids. */
export async function scheduleReminder(reminder: Reminder): Promise<string[]> {
  await cancelReminder(reminder);
  if (!reminder.enabled || reminder.days.length === 0) return [];

  const cat = getCategory(reminder.category);
  const content = {
    title: `${cat.emoji} ${cat.label}`,
    body: reminder.title || `Time for ${cat.label.toLowerCase()}`,
    sound: true,
  };
  const { hour, minute } = reminder;

  if (reminder.days.length === 7) {
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
    return [id];
  }

  const ids: string[] = [];
  for (const weekday of reminder.days) {
    ids.push(
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute },
      }),
    );
  }
  return ids;
}

/** Website-only reminder checking; phones don't need it. */
export function startWebChecker(_getReminders: () => Reminder[]): () => void {
  return () => {};
}
