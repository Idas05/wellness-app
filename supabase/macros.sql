-- Run once in Supabase: SQL Editor › New query › paste › Run. Safe to run again.
-- Lets each logged food keep its protein, fat and carbs (in grams) so they sync between the phone and the website.

alter table public.food_entries add column if not exists protein numeric(6, 1);
alter table public.food_entries add column if not exists fat numeric(6, 1);
alter table public.food_entries add column if not exists carbs numeric(6, 1);

-- Make the new columns visible to the app straight away.
notify pgrst, 'reload schema';
