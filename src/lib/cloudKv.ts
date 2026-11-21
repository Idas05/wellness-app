import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

/**
 * Device storage that follows your account. Each key is saved on this device and, when signed in,
 * to the user_data table (supabase/sync-everything.sql). The newest change wins; the first time a
 * device syncs, what's on it is merged with what's already in the account so nothing is lost.
 * Without an account, or offline, it simply works from this device.
 */

const stampKey = (key: string) => `${key}.changedAt`;
/** The account's version this device last matched, to tell "changed here", "changed there" and "changed on both" apart. */
const syncedKey = (key: string) => `${key}.syncedAt`;
const ms = (iso: string | null) => (iso ? new Date(iso).getTime() : 0);

export let cloudSyncError: string | null = null;

async function signedIn(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

async function readLocal<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeLocal<T>(key: string, value: T, at: string) {
  await AsyncStorage.multiSet([
    [key, JSON.stringify(value)],
    [stampKey(key), at],
  ]);
}

async function push<T>(key: string, value: T, at: string) {
  const { error } = await supabase!.from('user_data').upsert({ key, value, updated_at: at });
  if (error) throw error;
}

function report(e: unknown) {
  const msg = String((e as { message?: string })?.message ?? e);
  cloudSyncError = /user_data|schema cache/.test(msg) ? 'Run supabase/sync-everything.sql in Supabase once to sync this.' : msg;
}

export async function syncedLoad<T>(key: string, fallback: T, merge: (local: T, remote: T) => T): Promise<T> {
  const local = await readLocal(key, fallback);
  if (!(await signedIn())) return local;
  try {
    const [[, localAt], [, syncedAt]] = await AsyncStorage.multiGet([stampKey(key), syncedKey(key)]);
    const { data, error } = await supabase!.from('user_data').select('value, updated_at').eq('key', key).maybeSingle();
    if (error) throw error;
    cloudSyncError = null;
    const now = new Date().toISOString();
    const markSynced = (at: string) => AsyncStorage.setItem(syncedKey(key), at);

    if (!data) {
      if (JSON.stringify(local) !== JSON.stringify(fallback)) {
        const at = localAt ?? now;
        await push(key, local, at);
        if (!localAt) await AsyncStorage.setItem(stampKey(key), at);
        await markSynced(at);
      }
      return local;
    }

    const remote = data.value as T;
    const remoteAt = ms(data.updated_at);
    const mine = ms(localAt);
    // First sync on this device, or changed on both devices since they last matched: keep both sides.
    const both = !!syncedAt && remoteAt > ms(syncedAt) && mine > ms(syncedAt);
    if (!localAt || both) {
      const merged = merge(local, remote);
      if (JSON.stringify(merged) !== JSON.stringify(remote)) {
        await push(key, merged, now);
        await writeLocal(key, merged, now);
        await markSynced(now);
      } else {
        await writeLocal(key, merged, data.updated_at);
        await markSynced(data.updated_at);
      }
      return merged;
    }
    if (remoteAt > mine) {
      await writeLocal(key, remote, data.updated_at);
      await markSynced(data.updated_at);
      return remote;
    }
    if (mine > remoteAt) {
      await push(key, local, localAt!);
      await markSynced(localAt!);
    }
    return local;
  } catch (e) {
    report(e);
    return local;
  }
}

/** What this device has saved, without asking the account. Use it as the base for a quick edit. */
export function localLoad<T>(key: string, fallback: T): Promise<T> {
  return readLocal(key, fallback);
}

const pending = new Map<string, ReturnType<typeof setTimeout>>();

/** Saves on this device straight away, and uploads once typing pauses so uploads can't land out of order. */
export async function syncedSave<T>(key: string, value: T): Promise<void> {
  const at = new Date().toISOString();
  await writeLocal(key, value, at);
  clearTimeout(pending.get(key));
  pending.set(
    key,
    setTimeout(async () => {
      pending.delete(key);
      if (!(await signedIn())) return;
      try {
        await push(key, value, at);
        await AsyncStorage.setItem(syncedKey(key), at);
        cloudSyncError = null;
      } catch (e) {
        // The newer local stamp means the next load uploads it.
        report(e);
      }
    }, 600),
  );
}
