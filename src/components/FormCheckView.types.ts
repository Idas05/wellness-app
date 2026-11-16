export type FormCheckMessage = {
  source: 'form-check';
  type: 'result' | 'close';
  exercise: string;
  score?: number | null;
  label?: string;
  reps?: number;
  tips?: string[];
};
