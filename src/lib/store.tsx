import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { cancelReminder, checkPermission, requestPermission, rescheduleAll, scheduleReminder, startWebChecker } from './notify';
import { loadReminders, saveReminders, type Reminder } from './reminders';
import { supabase } from './supabase';
import { fetchNights, type SleepNight } from './sleep';
import { deleteRemote, fetchRemote, mergeAfterSignIn, pushRemote } from './sync';

type AppState_ = {
  reminders: Reminder[];
  userEmail: string | null;
  permission: boolean | null;
  syncError: string | null;
  upsertReminder: (r: Reminder) => Promise<void>;
  removeReminder: (r: Reminder) => Promise<void>;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  sleep: SleepNight[];
  sleepError: string | null;
  refreshSleep: () => Promise<void>;
  signOut: () => Promise<void>;
  askPermission: () => Promise<void>;
  /** Goes up whenever the other device may have changed something; tabs reload their data when it does. */
  syncTick: number;
};

const Ctx = createContext<AppState_ | null>(null);

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Holds reminders, sign-in and syncing for every tab. */
export function AppProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [sleep, setSleep] = useState<SleepNight[]>([]);
  const [sleepError, setSleepError] = useState<string | null>(null);
  const [syncTick, setSyncTick] = useState(0);
  const latest = useRef<Reminder[]>([]);
  latest.current = reminders;

  const persist = useCallback(async (next: Reminder[]) => {
    setReminders(next);
    latest.current = next;
    await saveReminders(next);
  }, []);

  // Replace the list on this device with the synced one and reschedule phone notifications.
  const applySynced = useCallback(
    async (list: Reminder[]) => {
      await persist(await rescheduleAll(list));
      setSyncError(null);
    },
    [persist],
  );

  const refresh = useCallback(async () => {
    try {
      const remote = await fetchRemote();
      if (remote) await applySynced(remote);
    } catch (e) {
      setSyncError(message(e));
    }
  }, [applySynced]);

  const refreshSleep = useCallback(async () => {
    try {
      setSleep(await fetchNights(14));
      setSleepError(null);
    } catch (e) {
      setSleepError(message(e));
    }
  }, []);

  useEffect(() => {
    let signedIn = false;
    const ready = loadReminders().then(persist);
    // Browsers only show the permission prompt after a tap, so the website checks here and asks from a button.
    (Platform.OS === 'web' ? checkPermission() : requestPermission()).then(setPermission).catch(() => setPermission(false));
    const stopWeb = startWebChecker(() => latest.current);

    const sub = supabase?.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user.email ?? null);
      signedIn = !!session;
      if (!session) setSleep([]);
      else setTimeout(refreshSleep, 0);
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (!session) return;
        // Run outside the auth callback, after local reminders have loaded.
        setTimeout(() => {
          ready
            .then(() => mergeAfterSignIn(latest.current))
            .then(applySynced)
            .catch((e) => setSyncError(message(e)));
        }, 0);
      }
    });

    // Pull everything again: reminders and sleep here, and every open tab reloads its own data.
    let lastPull = 0;
    const pull = () => {
      if (!signedIn) return;
      lastPull = Date.now();
      refresh();
      refreshSleep();
      setSyncTick((t) => t + 1);
    };
    let soon: ReturnType<typeof setTimeout> | undefined;
    const pullSoon = () => {
      clearTimeout(soon);
      soon = setTimeout(pull, 400);
    };
    const visible = () => (Platform.OS === 'web' ? typeof document === 'undefined' || document.visibilityState === 'visible' : AppState.currentState === 'active');

    // Coming back to the app or the browser tab.
    const appState = AppState.addEventListener('change', (state) => state === 'active' && pull());
    const onVisible = () => visible() && pull();
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisible);

    // Live: the account tells us the moment a row changes on the other device (after supabase/live-sync.sql).
    const channel = supabase
      ?.channel('wellness-live')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => visible() && pullSoon())
      .subscribe();

    // Backup for when live updates aren't on: check every 15 seconds while you're looking at it.
    const poll = setInterval(() => visible() && Date.now() - lastPull > 14_000 && pull(), 15_000);

    return () => {
      stopWeb();
      sub?.data.subscription.unsubscribe();
      appState.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisible);
      if (channel) supabase?.removeChannel(channel);
      clearTimeout(soon);
      clearInterval(poll);
    };
  }, [persist, applySynced, refresh, refreshSleep]);

  const upsertReminder = async (r: Reminder) => {
    const notificationIds = await scheduleReminder(r).catch(() => []);
    const saved = { ...r, notificationIds };
    const list = latest.current;
    const exists = list.some((x) => x.id === r.id);
    await persist(exists ? list.map((x) => (x.id === r.id ? saved : x)) : [...list, saved]);
    if (!userEmail) return;
    try {
      await pushRemote(saved);
      await persist(latest.current.map((x) => (x.id === saved.id ? { ...x, synced: true } : x)));
    } catch (e) {
      setSyncError(message(e));
    }
  };

  /** Signs out and clears this device, so the next person to sign in here doesn't get (or upload) your data. */
  const signOut = async () => {
    await rescheduleAll([]).catch(() => []);
    await supabase?.auth.signOut();
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith('wellness.'));
    await AsyncStorage.multiRemove(keys);
    setReminders([]);
    latest.current = [];
    setSyncError(null);
  };

  const askPermission = async () => {
    setPermission(await requestPermission().catch(() => false));
  };

  const removeReminder = async (r: Reminder) => {
    await cancelReminder(r).catch(() => {});
    await persist(latest.current.filter((x) => x.id !== r.id));
    if (userEmail) deleteRemote(r.id).catch((e) => setSyncError(message(e)));
  };

  return (
    <Ctx.Provider
      value={{
        reminders,
        userEmail,
        permission,
        syncError,
        upsertReminder,
        removeReminder,
        authOpen,
        setAuthOpen,
        sleep,
        sleepError,
        refreshSleep,
        signOut,
        askPermission,
        syncTick,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
