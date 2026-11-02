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

export async function rescheduleAll(reminders: Reminder[]): Promise<Reminder[]> {
  return reminders;
}

const fired = new Set<string>();
let lastChecked = Date.now() - 60_000;

// Browsers slow down timers in background tabs, so instead of matching the exact
// minute we fire every reminder that came due since the previous check.
function check(reminders: Reminder[]) {
  const now = new Date();
  // Look back at least 3 minutes (covers reminders that just synced from the phone),
  // or further if the browser paused this tab, up to 10 minutes.
  const lookBack = Math.min(Math.max(3 * 60_000, now.getTime() - lastChecked), 10 * 60_000);
  const since = now.getTime() - lookBack;
  lastChecked = now.getTime();
  if (!supported() || Notification.permission !== 'granted') return;
  const weekday = now.getDay() + 1; // 1 = Sunday
  for (const r of reminders) {
    if (!r.enabled || !r.days.includes(weekday)) continue;
    const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), r.hour, r.minute).getTime();
    if (due <= since || due > now.getTime()) continue;
    const key = `${r.id}@${due}`;
    if (fired.has(key)) continue;
    fired.add(key);
    const cat = getCategory(r.category);
    new Notification(`${cat.emoji} ${cat.label}`, {
      body: r.title || `Time for ${cat.label.toLowerCase()}`,
      tag: key,
      requireInteraction: true,
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
