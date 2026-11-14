import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalorieProfile } from './nutrition';

export type Goal = 'lose' | 'gain' | 'maintain';
export type Exercise = { name: string; sets: string; note?: string };
export type WorkoutDay = {
  weekday: number; // 0 Sunday … 6 Saturday
  short: string;
  title: string; // Push, Pull, Legs, Rest
  focus: string;
  exercises: Exercise[];
  cardio: { minutes: number; what: string; setting: string; how: string } | null;
};
export type WorkoutPlan = {
  goal: Goal;
  poundsToGo: number;
  summary: string;
  repStyle: string;
  rest: string;
  cardioMinutes: number;
  days: WorkoutDay[]; // Sunday first, so days[new Date().getDay()] is today
};

export function goalOf(p: CalorieProfile): Goal {
  const diff = p.goalWeightLb - p.weightLb;
  if (Math.abs(diff) < 1) return 'maintain';
  return diff < 0 ? 'lose' : 'gain';
}

// Sets and reps depend on the goal: lighter and faster to lose, heavier with more rest to gain.
const STYLE: Record<Goal, { main: string; accessory: string; rest: string; repStyle: string }> = {
  lose: { main: '4 × 8–10', accessory: '3 × 12–15', rest: '45–60 sec', repStyle: 'Higher reps, short rest to keep your heart rate up' },
  maintain: { main: '4 × 6–8', accessory: '3 × 8–12', rest: '60–90 sec', repStyle: 'Moderate reps to hold your strength and muscle' },
  gain: { main: '4 × 5–6', accessory: '4 × 8–10', rest: '2 min', repStyle: 'Heavier weight, longer rest to build muscle' },
};

// Cardio comes after every lifting day. Losing weight gets the most, gaining the least.
export function cardioMinutes(goal: Goal, poundsToGo: number): number {
  if (goal === 'gain') return 10;
  if (goal === 'maintain') return 20;
  if (poundsToGo >= 40) return 40;
  if (poundsToGo >= 15) return 35;
  return 30;
}

// Two cardio options, taking turns day by day.
const CARDIO = [
  { what: 'Incline treadmill walk', setting: 'Incline 12, speed 3' },
  { what: 'StairMaster', setting: 'A steady level you can keep the whole time' },
];

type Move = { name: string; main?: true; fixed?: string; note?: string };

const PUSH_A: Move[] = [
  { name: 'Barbell bench press', main: true },
  { name: 'Overhead press', note: 'Standing, barbell or dumbbells' },
  { name: 'Incline dumbbell press' },
  { name: 'Lateral raise' },
  { name: 'Triceps rope pushdown' },
  { name: 'Overhead triceps extension' },
];
const PULL_A: Move[] = [
  { name: 'Deadlift', main: true },
  { name: 'Pull-ups', note: 'Use the assisted machine or lat pulldown if needed' },
  { name: 'Barbell row' },
  { name: 'Face pull' },
  { name: 'Barbell curl' },
  { name: 'Hammer curl' },
];
const LEGS_A: Move[] = [
  { name: 'Back squat', main: true },
  { name: 'Romanian deadlift' },
  { name: 'Leg press' },
  { name: 'Lying leg curl' },
  { name: 'Standing calf raise' },
  { name: 'Plank', fixed: '3 × 45 sec' },
];
const PUSH_B: Move[] = [
  { name: 'Incline barbell press', main: true },
  { name: 'Seated dumbbell shoulder press' },
  { name: 'Machine chest press' },
  { name: 'Cable chest fly' },
  { name: 'Lateral raise' },
  { name: 'Dips', note: 'Use the assisted machine if needed' },
];
const PULL_B: Move[] = [
  { name: 'Lat pulldown', main: true },
  { name: 'Seated cable row' },
  { name: 'Chest-supported dumbbell row' },
  { name: 'Rear delt fly' },
  { name: 'Incline dumbbell curl' },
  { name: 'Preacher curl' },
];
const LEGS_B: Move[] = [
  { name: 'Hack squat', main: true, note: 'Or front squat' },
  { name: 'Hip thrust' },
  { name: 'Bulgarian split squat', note: 'Sets are per leg' },
  { name: 'Leg extension' },
  { name: 'Seated calf raise' },
  { name: 'Hanging knee raise', fixed: '3 × 12–15' },
];

const WEEK: { title: string; focus: string; moves: Move[] | null }[] = [
  { title: 'Rest', focus: 'Recover: an easy walk and some stretching', moves: null }, // Sunday
  { title: 'Push', focus: 'Chest, shoulders, triceps', moves: PUSH_A },
  { title: 'Pull', focus: 'Back, rear shoulders, biceps', moves: PULL_A },
  { title: 'Legs', focus: 'Quads, hamstrings, glutes, calves, core', moves: LEGS_A },
  { title: 'Push', focus: 'Chest, shoulders, triceps', moves: PUSH_B },
  { title: 'Pull', focus: 'Back, rear shoulders, biceps', moves: PULL_B },
  { title: 'Legs', focus: 'Quads, hamstrings, glutes, calves, core', moves: LEGS_B },
];
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CARDIO_HOW: Record<Goal, string> = {
  lose: 'Steady pace where you can talk but not sing',
  maintain: 'Steady, comfortable pace',
  gain: 'Easy pace, just to warm down and keep your heart healthy',
};

export function buildWorkoutPlan(p: CalorieProfile): WorkoutPlan {
  const goal = goalOf(p);
  const poundsToGo = Math.round(Math.abs(p.goalWeightLb - p.weightLb));
  const style = STYLE[goal];
  const minutes = cardioMinutes(goal, poundsToGo);

  let lift = 0;
  const days = WEEK.map((d, weekday): WorkoutDay => {
    if (!d.moves) return { weekday, short: SHORT[weekday], title: d.title, focus: d.focus, exercises: [], cardio: null };
    const c = CARDIO[lift++ % CARDIO.length];
    return {
      weekday,
      short: SHORT[weekday],
      title: d.title,
      focus: d.focus,
      exercises: d.moves.map((m) => ({ name: m.name, sets: m.fixed ?? (m.main ? style.main : style.accessory), note: m.note })),
      cardio: { minutes, what: c.what, setting: c.setting, how: CARDIO_HOW[goal] },
    };
  });

  const summary =
    goal === 'lose'
      ? `Built to lose ${poundsToGo} lb, from ${p.weightLb} to ${p.goalWeightLb} lb, while keeping your muscle.`
      : goal === 'gain'
        ? `Built to gain ${poundsToGo} lb, from ${p.weightLb} to ${p.goalWeightLb} lb, mostly as muscle.`
        : `Built to stay at ${p.weightLb} lb and get stronger.`;

  return { goal, poundsToGo, summary, repStyle: style.repStyle, rest: style.rest, cardioMinutes: minutes, days };
}

/** How many sets a prescription like "3 × 12–15" asks for. */
export function setCount(sets: string): number {
  const n = parseInt(sets, 10);
  return Number.isFinite(n) && n > 0 ? n : 3;
}

// ---- Weight and reps log, kept on this device ----

export type LoggedSet = { weight: string; reps: string };
/** date (YYYY-MM-DD) → exercise name → sets */
type WorkoutLog = Record<string, Record<string, LoggedSet[]>>;
const WORKOUT_LOG_KEY = 'wellness.workoutLog.v1';

async function loadAll(): Promise<WorkoutLog> {
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_LOG_KEY);
    return raw ? (JSON.parse(raw) as WorkoutLog) : {};
  } catch {
    return {};
  }
}

export async function loadWorkoutDay(date: string): Promise<Record<string, LoggedSet[]>> {
  return (await loadAll())[date] ?? {};
}

export async function saveWorkoutDay(date: string, day: Record<string, LoggedSet[]>): Promise<void> {
  const all = await loadAll();
  all[date] = day;
  await AsyncStorage.setItem(WORKOUT_LOG_KEY, JSON.stringify(all));
}

export const isFilled = (s: LoggedSet) => s.reps.trim() !== '' || s.weight.trim() !== '';

/** The most recent day before `date` that has sets logged for each exercise. */
export async function loadLastTimes(date: string): Promise<Record<string, { date: string; sets: LoggedSet[] }>> {
  const all = await loadAll();
  const out: Record<string, { date: string; sets: LoggedSet[] }> = {};
  for (const d of Object.keys(all).sort().reverse()) {
    if (d >= date) continue;
    for (const [name, sets] of Object.entries(all[d])) {
      const done = sets.filter(isFilled);
      if (!out[name] && done.length) out[name] = { date: d, sets: done };
    }
  }
  return out;
}
