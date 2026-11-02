-- Run this once in Supabase: SQL Editor › New query › paste › Run.
create table if not exists public.reminders (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null,
  title text not null default '',
  hour smallint not null check (hour between 0 and 23),
  minute smallint not null check (minute between 0 and 59),
  days smallint[] not null default '{1,2,3,4,5,6,7}',
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.reminders enable row level security;

-- Each person can only see and change their own reminders.
drop policy if exists "own reminders" on public.reminders;
create policy "own reminders" on public.reminders
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
