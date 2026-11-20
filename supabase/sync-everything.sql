-- Run once in Supabase: SQL Editor › New query › paste › Run. Safe to run again.
-- Keeps the rest of the app (workout log, progress history, your recipes, recent foods,
-- diet answers) in step between the phone and the website.

create table if not exists public.user_data (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.user_data enable row level security;
drop policy if exists "own data" on public.user_data;
create policy "own data" on public.user_data
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
