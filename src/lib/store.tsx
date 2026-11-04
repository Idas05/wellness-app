import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { cancelReminder, requestPermission, rescheduleAll, scheduleReminder, startWebChecker } from './notify';
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
    requestPermission().then(setPermission).catch(() => setPermission(false));
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

    // Pick up changes made on the other device when the app comes back to the front.
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active' && signedIn) {
        refresh();
        refreshSleep();
      }
    });

    // The website stays open in a tab, so pull changes made on the phone every minute.
    const poll = Platform.OS === 'web' ? setInterval(() => signedIn && refresh(), 60_000) : undefined;

    return () => {
      stopWeb();
      sub?.data.subscription.unsubscribe();
      appState.remove();
      if (poll) clearInterval(poll);
    };
  }, [persist, applySynced, refresh, refreshSleep]);

  const upsertReminder = async (r: Reminder) => {
    const notificationIds = await scheduleReminder(r).catch(() => []);
    const saved = { ...r, notificationIds };
    const list = latest.current;
    const exists = list.some((x) => x.id === r.id);
    await persist(exists ? list.map((x) => (x.id === r.id ? saved : x)) : [...list, saved]);
    if (userEmail) pushRemote(saved).catch((e) => setSyncError(message(e)));
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
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
