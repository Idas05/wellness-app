import { supabase } from './supabase';
import { normalizeCategory } from './categories';
import type { Reminder } from './reminders';

type Row = {
  id: string;
  category: Reminder['category'];
  title: string;
  hour: number;
  minute: number;
  days: number[];
  enabled: boolean;
};

const toRow = (r: Reminder): Row => ({
  id: r.id,
  category: r.category,
  title: r.title,
  hour: r.hour,
  minute: r.minute,
  days: r.days,
  enabled: r.enabled,
});

export async function fetchRemote(): Promise<Reminder[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('reminders')
    .select('id, category, title, hour, minute, days, enabled');
  if (error) throw error;
  return (data as Row[]).map((row) => ({ ...row, category: normalizeCategory(row.category), synced: true }));
}

export async function pushRemote(r: Reminder): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('reminders')
    .upsert({ ...toRow(r), updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function deleteRemote(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('reminders').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Called when the app opens signed in: uploads reminders made on this device that never reached the account,
 * and drops ones that were synced before but are gone from the account (deleted on another device).
 */
export async function mergeAfterSignIn(local: Reminder[]): Promise<Reminder[]> {
  const remote = (await fetchRemote()) ?? [];
  const remoteIds = new Set(remote.map((r) => r.id));
  const unsent = local.filter((r) => !remoteIds.has(r.id) && !r.synced);
  for (const r of unsent) await pushRemote(r);
  return [...remote, ...unsent.map((r) => ({ ...r, synced: true }))];
}
