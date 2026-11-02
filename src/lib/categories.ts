// To add a new reminder section, add one entry to this list.
export const CATEGORIES = [
  { id: 'skincare', label: 'Skin care', emoji: '🧴', color: '#F4A6B8' },
  { id: 'bedtime', label: 'Bedtime', emoji: '🌙', color: '#8E9BEF' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳', color: '#F7C873' },
  { id: 'lunch', label: 'Lunch', emoji: '🥗', color: '#8FD19E' },
  { id: 'dinner', label: 'Dinner', emoji: '🍲', color: '#F29E6D' },
  { id: 'gym', label: 'Gym', emoji: '🏋️', color: '#6EC6E8' },
  { id: 'teeth', label: 'Brushing teeth', emoji: '🪥', color: '#B8A6F4' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function getCategory(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
