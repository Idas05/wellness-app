import { supabase } from './supabase';

export type SleepNight = {
  night: string; // YYYY-MM-DD, the day you woke up
  bedtime: string | null;
  wake_time: string | null;
  asleep_min: number;
  deep_min: number;
  rem_min: number;
  core_min: number;
  awake_min: number;
};

/** Most recent nights first. Returns [] when not signed in. */
export async function fetchNights(limit = 14): Promise<SleepNight[]> {
  if (!supabase) return [];
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) return [];
  const { data, error } = await supabase
    .from('sleep_nights')
    .select('night, bedtime, wake_time, asleep_min, deep_min, rem_min, core_min, awake_min')
    .order('night', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as SleepNight[];
}

/** The private code the iPhone Shortcut sends with your sleep data. */
export async function getOrCreateToken(): Promise<string> {
  if (!supabase) throw new Error('Sync is not set up.');
  const { data, error } = await supabase.from('sleep_tokens').select('token').maybeSingle();
  if (error) throw error;
  if (data?.token) return data.token as string;
  const created = await supabase.from('sleep_tokens').insert({}).select('token').single();
  if (created.error) throw created.error;
  return created.data.token as string;
}

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

// Minutes since 6 PM, so 11 PM and 1 AM sit close together.
function bedMinutes(iso: string): number {
  const d = new Date(iso);
  return (d.getHours() * 60 + d.getMinutes() - 18 * 60 + 24 * 60) % (24 * 60);
}

export type ScoreParts = { total: number; duration: number; quality: number; restful: number; consistency: number };

/**
 * Sleep score out of 100:
 *  - Duration (50): full marks for 7–9 hours asleep.
 *  - Deep + REM (25): full marks when they make up 40% or more of sleep.
 *  - Restful (15): full marks with 20 minutes or less awake.
 *  - Consistency (10): full marks when bedtime is within 30 min of your recent average.
 */
export function sleepScore(night: SleepNight, recent: SleepNight[] = []): ScoreParts {
  const hours = night.asleep_min / 60;
  const duration = 50 * (hours >= 7 && hours <= 9 ? 1 : hours < 7 ? clamp((hours - 4) / 3) : clamp(1 - (hours - 9) / 3));

  const staged = night.deep_min + night.rem_min + night.core_min;
  // Without stage data (older watches), give a neutral middle score.
  const quality = staged > 0 ? 25 * clamp((night.deep_min + night.rem_min) / staged / 0.4) : 15;

  const restful = 15 * clamp(1 - (night.awake_min - 20) / 60);

  const others = recent.filter((n) => n.night !== night.night && n.bedtime).slice(0, 7);
  let consistency = 10;
  if (night.bedtime && others.length > 0) {
    const avg = others.reduce((s, n) => s + bedMinutes(n.bedtime!), 0) / others.length;
    const off = Math.abs(bedMinutes(night.bedtime) - avg);
    consistency = 10 * clamp(1 - (off - 30) / 90);
  }

  const total = Math.round(duration + quality + restful + consistency);
  return {
    total,
    duration: Math.round(duration),
    quality: Math.round(quality),
    restful: Math.round(restful),
    consistency: Math.round(consistency),
  };
}

export function scoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

export function scoreColor(score: number): string {
  if (score >= 85) return '#5BBF7A';
  if (score >= 70) return '#8E9BEF';
  if (score >= 50) return '#F7C873';
  return '#F29E6D';
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatClock(iso: string | null): string {
  if (!iso) return '–';
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
