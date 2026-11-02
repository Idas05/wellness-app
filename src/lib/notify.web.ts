// Website: uses the browser's built-in desktop notifications (free).
// The browser shows them while the website is open in a tab.
import { getCategory } from './categories';
import type { Reminder } from './reminders';

const supported = () => typeof window !== 'undefined' && 'Notification' in window;

export async function requestPermission(): Promise<boolean> {
  if (!supported()) return false;
  if (Notification.permission === 'granted') return true;
  return (await Notification.requestPermission()) === 'granted';
}

export async function cancelReminder(_reminder: Reminder): Promise<void> {}

export async function scheduleReminder(_reminder: Reminder): Promise<string[]> {
  return [];
}

const fired = new Set<string>();

function check(reminders: Reminder[]) {
  if (!supported() || Notification.permission !== 'granted') return;
  const now = new Date();
  const weekday = now.getDay() + 1; // 1 = Sunday
  const minuteKey = `${now.toDateString()} ${now.getHours()}:${now.getMinutes()}`;
  for (const r of reminders) {
    if (!r.enabled || !r.days.includes(weekday)) continue;
    if (r.hour !== now.getHours() || r.minute !== now.getMinutes()) continue;
    const key = `${r.id}@${minuteKey}`;
    if (fired.has(key)) continue;
    fired.add(key);
    const cat = getCategory(r.category);
    new Notification(`${cat.emoji} ${cat.label}`, {
      body: r.title || `Time for ${cat.label.toLowerCase()}`,
      tag: key,
    });
  }
}

/** Checks every 15 seconds whether a reminder is due. Returns a stop function. */
export function startWebChecker(getReminders: () => Reminder[]): () => void {
  // First check shortly after load, once saved reminders have been read.
  const first = setTimeout(() => check(getReminders()), 1_500);
  const timer = setInterval(() => check(getReminders()), 15_000);
  return () => {
    clearTimeout(first);
    clearInterval(timer);
  };
}
