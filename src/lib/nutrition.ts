import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export type Sex = 'male' | 'female';

export const ACTIVITY_LEVELS = [
  { id: 'none', label: 'No activity', hint: 'Mostly sitting, little walking', factor: 1.2 },
  { id: 'light', label: 'Light activity', hint: 'Walking, or exercise 1–3 days a week', factor: 1.375 },
  { id: 'moderate', label: 'Moderate activity', hint: 'Exercise 3–5 days a week', factor: 1.55 },
  { id: 'heavy', label: 'Heavy activity', hint: 'Hard exercise 6–7 days a week', factor: 1.725 },
  { id: 'freak', label: 'Workout freak', hint: 'Training twice a day or a physical job', factor: 1.9 },
] as const;

export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number]['id'];

export function getActivity(id: ActivityLevel | undefined) {
  return ACTIVITY_LEVELS.find((a) => a.id === id) ?? ACTIVITY_LEVELS[1];
}

export type CalorieProfile = {
  age: number;
  heightIn: number; // total inches
  sex: Sex;
  weightLb: number;
  goalWeightLb: number;
  activity?: ActivityLevel; // older saved profiles don't have it; treated as light
};

export const MEALS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks' },
] as const;

export type MealId = (typeof MEALS)[number]['id'];

export type FoodEntry = {
  id: string;
  name: string;
  calories: number;
  /** Grams, when known. */
  protein?: number;
  fat?: number;
  carbs?: number;
  at: string;
  meal?: MealId;
  /** Set once the entry is saved to your account, so a later sync can tell "deleted elsewhere" from "not uploaded yet". */
  synced?: boolean;
};

/** Foods logged before meal sections existed are sorted in by the time they were added. */
export function mealOf(f: FoodEntry): MealId {
  if (f.meal) return f.meal;
  const h = new Date(f.at).getHours();
  if (h >= 4 && h < 11) return 'breakfast';
  if (h >= 11 && h < 16) return 'lunch';
  if (h >= 16 && h < 22) return 'dinner';
  return 'snack';
}

const PROFILE_KEY = 'wellness.calorieProfile.v1';
const LOG_KEY = 'wellness.foodLog.v1';

export type Plan = {
  goal: 'lose' | 'gain' | 'maintain';
  dailyCalories: number;
  maintenance: number;
  weeksToGoal: number | null;
};

const LOSE_PER_DAY = 500; // about 1 lb a week
const GAIN_PER_DAY = 300; // lean, slower gain
const MIN_CALORIES: Record<Sex, number> = { male: 1500, female: 1200 };

/** Mifflin-St Jeor resting burn, times the activity factor, adjusted for the goal. */
export function calculatePlan(p: CalorieProfile): Plan {
  const kg = p.weightLb * 0.453592;
  const cm = p.heightIn * 2.54;
  const bmr = 10 * kg + 6.25 * cm - 5 * p.age + (p.sex === 'male' ? 5 : -161);
  const maintenance = Math.round((bmr * getActivity(p.activity).factor) / 10) * 10;
  const diff = p.goalWeightLb - p.weightLb;

  if (Math.abs(diff) < 1) return { goal: 'maintain', dailyCalories: maintenance, maintenance, weeksToGoal: null };

  if (diff < 0) {
    const daily = Math.max(maintenance - LOSE_PER_DAY, MIN_CALORIES[p.sex]);
    const perWeekLb = ((maintenance - daily) * 7) / 3500;
    return {
      goal: 'lose',
      dailyCalories: daily,
      maintenance,
      weeksToGoal: perWeekLb > 0 ? Math.ceil(-diff / perWeekLb) : null,
    };
  }
  return {
    goal: 'gain',
    dailyCalories: maintenance + GAIN_PER_DAY,
    maintenance,
    weeksToGoal: Math.ceil(diff / ((GAIN_PER_DAY * 7) / 3500)),
  };
}

async function loadLocalProfile(): Promise<CalorieProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as CalorieProfile) : null;
  } catch {
    return null;
  }
}

const PROFILE_STAMP = `${PROFILE_KEY}.changedAt`;

/**
 * Your goal, from your account when signed in (so phone and web match), else from this device.
 * A change made here while offline is newer than the account's copy, so it gets uploaded instead of overwritten.
 */
export async function loadProfile(): Promise<CalorieProfile | null> {
  const local = await loadLocalProfile();
  if (!(await signedIn())) return local;
  try {
    const { data, error } = await supabase!.from('calorie_profiles').select('profile, updated_at').maybeSingle();
    if (error) throw error;
    const localAt = await AsyncStorage.getItem(PROFILE_STAMP);
    if (data?.profile) {
      if (local && localAt && new Date(localAt).getTime() > new Date(data.updated_at).getTime()) {
        await pushProfile(local, localAt);
        return local;
      }
      await AsyncStorage.multiSet([
        [PROFILE_KEY, JSON.stringify(data.profile)],
        [PROFILE_STAMP, data.updated_at],
      ]);
      return data.profile as CalorieProfile;
    }
    if (local) await pushProfile(local, localAt ?? new Date().toISOString());
  } catch (e) {
    reportSyncError(e);
  }
  return local;
}

async function pushProfile(p: CalorieProfile, at: string) {
  const { error } = await supabase!.from('calorie_profiles').upsert({ profile: p, updated_at: at });
  if (error) throw error;
}

export async function saveProfile(p: CalorieProfile): Promise<void> {
  const at = new Date().toISOString();
  await AsyncStorage.multiSet([
    [PROFILE_KEY, JSON.stringify(p)],
    [PROFILE_STAMP, at],
  ]);
  if (!(await signedIn())) return;
  try {
    await pushProfile(p, at);
  } catch (e) {
    reportSyncError(e);
  }
}

// ---- Account sync ----

async function signedIn(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/** The last sync problem, e.g. the tables not set up yet. Cal Counter shows it. */
export let foodSyncError: string | null = null;
function reportSyncError(e: unknown) {
  const msg = String((e as { message?: string })?.message ?? e);
  foodSyncError = /food_entries|calorie_profiles|schema cache/.test(msg) ? 'Syncing food needs a one-time setup: run supabase/food-sync.sql in Supabase.' : `Couldn't sync food: ${msg}`;
}

type FoodRow = { id: string; day: string; name: string; calories: number; at: string; meal: string | null; protein?: number | null; fat?: number | null; carbs?: number | null };
const toRow = (date: string, f: FoodEntry) => ({
  id: f.id,
  day: date,
  name: f.name,
  calories: f.calories,
  at: f.at,
  meal: f.meal ?? null,
  updated_at: new Date().toISOString(),
  ...(macroColumns ? { protein: f.protein ?? null, fat: f.fat ?? null, carbs: f.carbs ?? null } : {}),
});
const fromRow = (r: FoodRow): FoodEntry => ({
  id: r.id,
  name: r.name,
  calories: r.calories,
  at: r.at,
  meal: (r.meal ?? undefined) as MealId | undefined,
  synced: true,
  ...(r.protein != null ? { protein: Number(r.protein) } : {}),
  ...(r.fat != null ? { fat: Number(r.fat) } : {}),
  ...(r.carbs != null ? { carbs: Number(r.carbs) } : {}),
});

// Until supabase/macros.sql has been run, the account has no protein/fat/carbs columns. Calories still sync,
// macros stay on the device, and Cal Counter says how to finish setup.
let macroColumns = true;
const MACRO_SETUP = 'Protein, fat and carbs need a one-time setup to sync: run supabase/macros.sql in Supabase.';
const missingMacroColumn = (e: { message?: string } | null) => !!e && /protein|fat|carbs/.test(e.message ?? '');

async function selectDay(date: string) {
  if (macroColumns) {
    const r = await supabase!.from('food_entries').select('id, day, name, calories, at, meal, protein, fat, carbs').eq('day', date);
    if (!missingMacroColumn(r.error)) return r;
    macroColumns = false;
  }
  return supabase!.from('food_entries').select('id, day, name, calories, at, meal').eq('day', date);
}

async function upsertRows(date: string, entries: FoodEntry[]) {
  let r = await supabase!.from('food_entries').upsert(entries.map((f) => toRow(date, f)));
  if (macroColumns && missingMacroColumn(r.error)) {
    macroColumns = false;
    r = await supabase!.from('food_entries').upsert(entries.map((f) => toRow(date, f)));
  }
  return r;
}

/** Keeps macros this device knows about when the account can't store them yet. */
function keepLocalMacros(remote: FoodEntry[], local: FoodEntry[]): FoodEntry[] {
  if (macroColumns) return remote;
  const byId = new Map(local.map((f) => [f.id, f]));
  return remote.map((r) => {
    const l = byId.get(r.id);
    return l ? { ...r, protein: l.protein, fat: l.fat, carbs: l.carbs } : r;
  });
}

function clearSyncError() {
  foodSyncError = macroColumns ? null : MACRO_SETUP;
}

/** Local date like 2026-11-06, so "today" follows your own clock. */
export function todayKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

type Log = Record<string, FoodEntry[]>;

async function loadLog(): Promise<Log> {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as Log) : {};
  } catch {
    return {};
  }
}

async function loadLocalDay(date: string): Promise<FoodEntry[]> {
  return (await loadLog())[date] ?? [];
}

async function saveLocalDay(date: string, entries: FoodEntry[]): Promise<void> {
  const log = await loadLog();
  log[date] = entries;
  await AsyncStorage.setItem(LOG_KEY, JSON.stringify(log));
}

/**
 * A day's food. When signed in, your account is the source of truth: foods added on another device show up,
 * foods deleted elsewhere go away, and foods added here before signing in (or offline) get uploaded.
 */
export async function loadDay(date: string): Promise<FoodEntry[]> {
  const local = await loadLocalDay(date);
  if (!(await signedIn())) return local;
  try {
    const { data, error } = await selectDay(date);
    if (error) throw error;
    const remote = keepLocalMacros((data as FoodRow[]).map(fromRow), local);
    const remoteIds = new Set(remote.map((r) => r.id));
    const unsent = local.filter((f) => !f.synced && !remoteIds.has(f.id));
    if (unsent.length) {
      const up = await upsertRows(date, unsent);
      if (up.error) throw up.error;
    }
    const merged = [...remote, ...unsent.map((f) => ({ ...f, synced: true }))].sort((a, b) => a.at.localeCompare(b.at));
    await saveLocalDay(date, merged);
    clearSyncError();
    return merged;
  } catch (e) {
    reportSyncError(e);
    return local;
  }
}

/** Saves a day's food here, and to your account when signed in (removed entries are deleted there too). */
export async function saveDay(date: string, entries: FoodEntry[]): Promise<void> {
  const before = await loadLocalDay(date);
  await saveLocalDay(date, entries);
  if (!(await signedIn())) return;
  try {
    const ids = new Set(entries.map((f) => f.id));
    const removed = before.filter((f) => !ids.has(f.id)).map((f) => f.id);
    if (removed.length) {
      const del = await supabase!.from('food_entries').delete().in('id', removed);
      if (del.error) throw del.error;
    }
    if (entries.length) {
      const up = await upsertRows(date, entries);
      if (up.error) throw up.error;
    }
    await saveLocalDay(date, entries.map((f) => ({ ...f, synced: true })));
    clearSyncError();
  } catch (e) {
    reportSyncError(e);
  }
}
