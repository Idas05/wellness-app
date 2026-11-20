-- Run once in Supabase: SQL Editor › New query › paste › Run. Safe to run again.
-- Lets Cal Counter foods and your calorie goal follow your account between the phone and the website.

create table if not exists public.food_entries (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  name text not null default '',
  calories integer not null default 0,
  at timestamptz not null default now(),
  meal text,
  updated_at timestamptz not null default now()
);
create index if not exists food_entries_user_day on public.food_entries (user_id, day);
alter table public.food_entries enable row level security;
drop policy if exists "own food" on public.food_entries;
create policy "own food" on public.food_entries
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.calorie_profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  profile jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.calorie_profiles enable row level security;
drop policy if exists "own calorie profile" on public.calorie_profiles;
create policy "own calorie profile" on public.calorie_profiles
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
