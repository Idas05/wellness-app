import { supabase } from './supabase';
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
  return (data as Row[]).map((row) => ({ ...row }));
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
 * Called after signing in: uploads reminders that only exist on this device,
 * then returns the full synced list (the account is the source of truth).
 */
export async function mergeAfterSignIn(local: Reminder[]): Promise<Reminder[]> {
  const remote = (await fetchRemote()) ?? [];
  const remoteIds = new Set(remote.map((r) => r.id));
  const onlyLocal = local.filter((r) => !remoteIds.has(r.id));
  for (const r of onlyLocal) await pushRemote(r);
  return [...remote, ...onlyLocal];
}
