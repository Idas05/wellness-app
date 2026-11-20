import type { CalorieProfile, Plan } from './nutrition';

/** Grams of protein, fat and carbs. */
export type Macros = { protein: number; fat: number; carbs: number };

export const NO_MACROS: Macros = { protein: 0, fat: 0, carbs: 0 };

export const scaleMacros = (m: Macros, by: number): Macros => ({ protein: m.protein * by, fat: m.fat * by, carbs: m.carbs * by });

/** Rounded to a tenth of a gram, for saving. */
export const roundMacros = (m: Macros): Macros => ({
  protein: Math.round(m.protein * 10) / 10,
  fat: Math.round(m.fat * 10) / 10,
  carbs: Math.round(m.carbs * 10) / 10,
});

export function sumMacros(list: Partial<Macros>[]): Macros {
  return list.reduce<Macros>(
    (s, m) => ({ protein: s.protein + (m.protein ?? 0), fat: s.fat + (m.fat ?? 0), carbs: s.carbs + (m.carbs ?? 0) }),
    { ...NO_MACROS },
  );
}

/**
 * Daily targets from your calorie goal: protein 0.8 g per pound of goal weight (keeps muscle while losing,
 * builds it while gaining), fat about 25% of calories, and carbs fill the rest.
 */
export function macroGoals(plan: Plan, profile: CalorieProfile): Macros {
  const cal = plan.dailyCalories;
  const protein = Math.round(Math.min(0.8 * profile.goalWeightLb, (cal * 0.4) / 4));
  const fat = Math.round((cal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((cal - protein * 4 - fat * 9) / 4));
  return { protein, fat, carbs };
}
