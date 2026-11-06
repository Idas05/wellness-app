import AsyncStorage from '@react-native-async-storage/async-storage';

export type Sex = 'male' | 'female';

export type CalorieProfile = {
  age: number;
  heightIn: number; // total inches
  sex: Sex;
  weightLb: number;
  goalWeightLb: number;
};

export type FoodEntry = { id: string; name: string; calories: number; at: string };

const PROFILE_KEY = 'wellness.calorieProfile.v1';
const LOG_KEY = 'wellness.foodLog.v1';

export type Plan = {
  goal: 'lose' | 'gain' | 'maintain';
  dailyCalories: number;
  maintenance: number;
  weeksToGoal: number | null;
};

// Mild daily activity (walking around, some exercise). We can ask about activity later.
const ACTIVITY = 1.375;
const LOSE_PER_DAY = 500; // about 1 lb a week
const GAIN_PER_DAY = 300; // lean, slower gain
const MIN_CALORIES: Record<Sex, number> = { male: 1500, female: 1200 };

/** Mifflin-St Jeor resting burn, times a light-activity factor, adjusted for the goal. */
export function calculatePlan(p: CalorieProfile): Plan {
  const kg = p.weightLb * 0.453592;
  const cm = p.heightIn * 2.54;
  const bmr = 10 * kg + 6.25 * cm - 5 * p.age + (p.sex === 'male' ? 5 : -161);
  const maintenance = Math.round((bmr * ACTIVITY) / 10) * 10;
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

export async function loadProfile(): Promise<CalorieProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as CalorieProfile) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(p: CalorieProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
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

export async function loadDay(date: string): Promise<FoodEntry[]> {
  return (await loadLog())[date] ?? [];
}

export async function saveDay(date: string, entries: FoodEntry[]): Promise<void> {
  const log = await loadLog();
  log[date] = entries;
  await AsyncStorage.setItem(LOG_KEY, JSON.stringify(log));
}
