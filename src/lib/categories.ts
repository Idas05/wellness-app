// To add a new reminder section, add one entry to this list.
export const CATEGORIES = [
  { id: 'wakeup', label: 'Wake up', emoji: '☀️', color: '#FFD86B' },
  { id: 'hygiene', label: 'Personal hygiene', emoji: '🧼', color: '#F4A6B8' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳', color: '#F7C873' },
  { id: 'lunch', label: 'Lunch', emoji: '🥗', color: '#8FD19E' },
  { id: 'dinner', label: 'Dinner', emoji: '🍲', color: '#F29E6D' },
  { id: 'gym', label: 'Gym', emoji: '🏋️', color: '#6EC6E8' },
  { id: 'bedtime', label: 'Bedtime', emoji: '🌙', color: '#8E9BEF' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

// Sections that were renamed or merged, so older reminders still show up.
const RENAMED: Record<string, CategoryId> = {
  skincare: 'hygiene',
  teeth: 'hygiene',
};

export function normalizeCategory(id: string): CategoryId {
  if (CATEGORIES.some((c) => c.id === id)) return id as CategoryId;
  return RENAMED[id] ?? 'hygiene';
}

export function getCategory(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === normalizeCategory(id)) ?? CATEGORIES[0];
}
