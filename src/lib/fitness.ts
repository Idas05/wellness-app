import { supabase } from './supabase';

export type FitnessDay = {
  day: string; // YYYY-MM-DD
  steps: number | null;
  active_cal: number | null;
  exercise_min: number | null;
  distance_mi: number | null;
  flights: number | null;
  resting_hr: number | null;
  hrv_ms: number | null;
  vo2max: number | null;
};

export const STEP_GOAL = 10000;
export const EXERCISE_GOAL = 30; // minutes, the Apple Watch default

/** Most recent days first. Returns [] when not signed in. */
export async function fetchFitnessDays(limit = 14): Promise<FitnessDay[]> {
  if (!supabase) return [];
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) return [];
  const { data, error } = await supabase
    .from('fitness_days')
    .select('day, steps, active_cal, exercise_min, distance_mi, flights, resting_hr, hrv_ms, vo2max')
    .order('day', { ascending: false })
    .limit(limit);
  if (error) throw error;
  // numeric columns come back as strings
  return (data ?? []).map((d) => ({
    ...d,
    distance_mi: d.distance_mi == null ? null : Number(d.distance_mi),
    vo2max: d.vo2max == null ? null : Number(d.vo2max),
  })) as FitnessDay[];
}
