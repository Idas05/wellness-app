import { localLoad, syncedLoad, syncedSave } from './cloudKv';
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
  daysPerWeek: number;
  days: WorkoutDay[]; // Sunday first, so days[new Date().getDay()] is today
};

export function goalOf(p: CalorieProfile): Goal {
  const diff = p.goalWeightLb - p.weightLb;
  if (Math.abs(diff) < 1) return 'maintain';
  return diff < 0 ? 'lose' : 'gain';
}

// Rest between sets depends on the goal.
const STYLE: Record<Goal, { rest: string }> = {
  lose: { rest: '45–60 sec' },
  maintain: { rest: '60–90 sec' },
  gain: { rest: '2 min' },
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

// Ishan's own split. Every set goes to failure (newer lifters stop a rep or two short).
type Move = { name: string; sets: string; note?: string };

const PUSH_A: Move[] = [
  { name: 'Barbell/DB bench press', sets: '3 × 6–8' },
  { name: 'Seated DB shoulder press', sets: '2 × 8–10' },
  { name: 'Incline DB press', sets: '2 × 8–10' },
  { name: 'Lateral raises', sets: '3 × 12–15' },
  { name: 'Tricep rope pushdowns', sets: '2 × 10–12' },
  { name: 'Overhead tricep extension', sets: '2 × 12' },
];
const PULL_A: Move[] = [
  { name: 'Pull-ups / lat pulldown', sets: '3 × 6–8' },
  { name: 'Barbell row', sets: '2 × 8' },
  { name: 'Seated cable row', sets: '2 × 10' },
  { name: 'Face pulls', sets: '2 × 15' },
  { name: 'Barbell curl', sets: '2 × 8–10' },
  { name: 'Hammer curl', sets: '2 × 12' },
];
const LEGS_A: Move[] = [
  { name: 'Back squat', sets: '3 × 6–8' },
  { name: 'Leg press', sets: '2 × 10' },
  { name: 'Walking lunges', sets: '2 × 10/leg' },
  { name: 'Leg extensions', sets: '2 × 12–15' },
  { name: 'Standing calf raises', sets: '3 × 12' },
  { name: 'Hanging leg raises', sets: '3 × 12–15' },
];
const PUSH_B: Move[] = [
  { name: 'Incline barbell press', sets: '3 × 8–10' },
  { name: 'Machine chest press / dips', sets: '2 × 10–12' },
  { name: 'Arnold press', sets: '2 × 10' },
  { name: 'Cable lateral raises', sets: '3 × 15' },
  { name: 'Cable flyes', sets: '2 × 12–15' },
  { name: 'Skull crushers', sets: '2 × 10–12' },
];
const PULL_B: Move[] = [
  { name: 'Close-grip lat pulldown', sets: '3 × 10' },
  { name: 'Single-arm DB row', sets: '2 × 10/arm' },
  { name: 'Chest-supported row', sets: '2 × 12' },
  { name: 'Reverse pec deck', sets: '2 × 15' },
  { name: 'Incline DB curl', sets: '2 × 10–12' },
  { name: 'Cable curl', sets: '2 × 15' },
];
const LEGS_B: Move[] = [
  { name: 'Romanian deadlift', sets: '3 × 8' },
  { name: 'Hip thrust (machine or bar)', sets: '2 × 10' },
  { name: 'Bulgarian split squat', sets: '2 × 8–10/leg' },
  { name: 'Lying/seated leg curl', sets: '2 × 12' },
  { name: 'Seated calf raises', sets: '3 × 15' },
  { name: 'Cable crunches', sets: '3 × 15' },
  { name: 'Plank', sets: '3 × 45–60 s', note: 'Hold to max' },
];

const WEEK: { title: string; focus: string; moves: Move[] | null }[] = [
  { title: 'Rest', focus: 'Recover: an easy walk and some stretching', moves: null }, // Sunday
  { title: 'Push', focus: 'Push A: chest, shoulders, triceps', moves: PUSH_A },
  { title: 'Pull', focus: 'Pull A: back, rear shoulders, biceps', moves: PULL_A },
  { title: 'Legs', focus: 'Legs A: quads, calves, core', moves: LEGS_A },
  { title: 'Push', focus: 'Push B: chest, shoulders, triceps', moves: PUSH_B },
  { title: 'Pull', focus: 'Pull B: back, rear shoulders, biceps', moves: PULL_B },
  { title: 'Legs', focus: 'Legs B: hamstrings, glutes, calves, core', moves: LEGS_B },
];
// Newer lifters (no or light activity) start with each workout once a week, Mon/Wed/Fri, and stop a rep or two short of failure.
const BEGINNER_WEEK: typeof WEEK = [
  WEEK[0],
  WEEK[1],
  { title: 'Rest', focus: 'Recover: an easy walk and some stretching', moves: null },
  WEEK[2],
  { title: 'Rest', focus: 'Recover: an easy walk and some stretching', moves: null },
  WEEK[3],
  { title: 'Rest', focus: 'Recover: an easy walk and some stretching', moves: null },
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

  const beginner = p.activity === 'none' || p.activity === 'light';
  const week = beginner ? BEGINNER_WEEK : WEEK;
  const effort = beginner ? 'Stop with 1–2 reps left' : 'To failure';

  let lift = 0;
  const days = week.map((d, weekday): WorkoutDay => {
    if (!d.moves) return { weekday, short: SHORT[weekday], title: d.title, focus: d.focus, exercises: [], cardio: null };
    const c = CARDIO[lift++ % CARDIO.length];
    return {
      weekday,
      short: SHORT[weekday],
      title: d.title,
      focus: d.focus,
      exercises: d.moves.map((m) => ({ name: m.name, sets: m.sets, note: m.note ?? effort })),
      cardio: { minutes, what: c.what, setting: c.setting, how: CARDIO_HOW[goal] },
    };
  });

  const summary =
    goal === 'lose'
      ? `Built to lose ${poundsToGo} lb, from ${p.weightLb} to ${p.goalWeightLb} lb, while keeping your muscle.`
      : goal === 'gain'
        ? `Built to gain ${poundsToGo} lb, from ${p.weightLb} to ${p.goalWeightLb} lb, mostly as muscle.`
        : `Built to stay at ${p.weightLb} lb and get stronger.`;

  return {
    goal,
    poundsToGo,
    summary,
    repStyle: beginner ? 'Stop each set with 1–2 reps left in the tank' : 'Every set to failure',
    rest: style.rest,
    cardioMinutes: minutes,
    daysPerWeek: lift,
    days,
  };
}

/** How many sets a prescription like "3 × 12–15" asks for. */
export function setCount(sets: string): number {
  const n = parseInt(sets, 10);
  return Number.isFinite(n) && n > 0 ? n : 3;
}

// ---- Weight and reps log (follows your account when signed in) ----

export type LoggedSet = { weight: string; reps: string };
/** date (YYYY-MM-DD) → exercise name → sets */
type WorkoutLog = Record<string, Record<string, LoggedSet[]>>;
const WORKOUT_LOG_KEY = 'wellness.workoutLog.v1';

/** First sync: every day and exercise from both sides; this device wins where both logged the same one. */
function mergeLogs(local: WorkoutLog, remote: WorkoutLog): WorkoutLog {
  const out: WorkoutLog = { ...remote };
  for (const [date, day] of Object.entries(local)) out[date] = { ...(out[date] ?? {}), ...day };
  return out;
}

async function loadAll(): Promise<WorkoutLog> {
  return syncedLoad<WorkoutLog>(WORKOUT_LOG_KEY, {}, mergeLogs);
}

export async function loadWorkoutDay(date: string): Promise<Record<string, LoggedSet[]>> {
  return (await loadAll())[date] ?? {};
}

export async function saveWorkoutDay(date: string, day: Record<string, LoggedSet[]>): Promise<void> {
  const all = await localLoad<WorkoutLog>(WORKOUT_LOG_KEY, {});
  all[date] = day;
  await syncedSave(WORKOUT_LOG_KEY, all);
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

// ---- Locked ("set in stone") history, used for the progress spreadsheet ----

export type HistoryEntry = { date: string; day: string; exercise: string; sets: LoggedSet[]; lockedAt: string };
const HISTORY_KEY = 'wellness.workoutHistory.v1';

const sameEntry = (a: HistoryEntry, b: HistoryEntry) => a.date === b.date && a.exercise === b.exercise;

export async function loadHistory(): Promise<HistoryEntry[]> {
  return syncedLoad<HistoryEntry[]>(HISTORY_KEY, [], (local, remote) => [...remote, ...local.filter((l) => !remote.some((r) => sameEntry(l, r)))]);
}

/** Saves an exercise's sets for good. Only filled-in sets are kept. */
export async function lockExercise(date: string, day: string, exercise: string, sets: LoggedSet[]): Promise<HistoryEntry[]> {
  const history = await loadHistory();
  const done = sets.filter(isFilled);
  if (!done.length || history.some((h) => h.date === date && h.exercise === exercise)) return history;
  const next = [...history, { date, day, exercise, sets: done, lockedAt: new Date().toISOString() }];
  await syncedSave(HISTORY_KEY, next);
  return next;
}

const num = (s: string) => parseFloat(s) || 0;
export const topWeight = (sets: LoggedSet[]) => Math.max(0, ...sets.map((s) => num(s.weight)));
export const volume = (sets: LoggedSet[]) => sets.reduce((t, s) => t + num(s.weight) * num(s.reps), 0);

/** One row per set, ready to open in Excel, Numbers or Google Sheets. */
export function historyCsv(history: HistoryEntry[]): string {
  const cell = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [['Date', 'Day', 'Exercise', 'Set', 'Weight (lb)', 'Reps', 'Volume (lb)']];
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date) || a.lockedAt.localeCompare(b.lockedAt));
  for (const h of sorted) {
    h.sets.forEach((s, i) => {
      rows.push([h.date, h.day, h.exercise, String(i + 1), s.weight, s.reps, String(Math.round(num(s.weight) * num(s.reps)))]);
    });
  }
  return rows.map((r) => r.map(cell).join(',')).join('\n') + '\n';
}
