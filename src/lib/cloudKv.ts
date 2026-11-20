import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

/**
 * Device storage that follows your account. Each key is saved on this device and, when signed in,
 * to the user_data table (supabase/sync-everything.sql). The newest change wins; the first time a
 * device syncs, what's on it is merged with what's already in the account so nothing is lost.
 * Without an account, or offline, it simply works from this device.
 */

const stampKey = (key: string) => `${key}.changedAt`;

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

export async function syncedLoad<T>(key: string, fallback: T, firstMerge: (local: T, remote: T) => T): Promise<T> {
  const local = await readLocal(key, fallback);
  if (!(await signedIn())) return local;
  try {
    const localAt = await AsyncStorage.getItem(stampKey(key));
    const { data, error } = await supabase!.from('user_data').select('value, updated_at').eq('key', key).maybeSingle();
    if (error) throw error;
    cloudSyncError = null;
    const now = new Date().toISOString();
    if (!data) {
      if (JSON.stringify(local) !== JSON.stringify(fallback)) {
        const at = localAt ?? now;
        await push(key, local, at);
        if (!localAt) await AsyncStorage.setItem(stampKey(key), at);
      }
      return local;
    }
    const remote = data.value as T;
    const remoteAt = new Date(data.updated_at).getTime();
    if (!localAt) {
      // First sync on this device: keep both sides.
      const merged = firstMerge(local, remote);
      if (JSON.stringify(merged) !== JSON.stringify(remote)) {
        await push(key, merged, now);
        await writeLocal(key, merged, now);
      } else {
        await writeLocal(key, merged, data.updated_at);
      }
      return merged;
    }
    const mine = new Date(localAt).getTime();
    if (remoteAt > mine) {
      await writeLocal(key, remote, data.updated_at);
      return remote;
    }
    if (mine > remoteAt) await push(key, local, localAt);
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
        cloudSyncError = null;
      } catch (e) {
        // The newer local stamp means the next load uploads it.
        report(e);
      }
    }, 600),
  );
}
