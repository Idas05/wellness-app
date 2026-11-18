-- Run once in Supabase: SQL Editor › New query › paste › Run.
-- Stores one row per day of Apple Watch activity, sent from Apple Health by an iPhone Shortcut.
-- Uses the same private code as the sleep Shortcut.

create table if not exists public.fitness_days (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  steps integer,
  active_cal integer,
  exercise_min integer,
  distance_mi numeric(6, 2),
  flights integer,
  resting_hr integer,
  hrv_ms integer,
  vo2max numeric(4, 1),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);
alter table public.fitness_days enable row level security;
drop policy if exists "own fitness" on public.fitness_days;
create policy "own fitness" on public.fitness_days
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Same table as in sleep.sql, in case this file is run first.
create table if not exists public.sleep_tokens (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  token uuid not null unique default gen_random_uuid()
);
alter table public.sleep_tokens enable row level security;
drop policy if exists "own token" on public.sleep_tokens;
create policy "own token" on public.sleep_tokens
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Shortcuts may send "8,432" or "8432 steps"; keep just the number. Blank means not sent.
create or replace function public.fitness_num(p text)
returns numeric
language sql
immutable
as $$
  select nullif(regexp_replace(coalesce(p, ''), '[^0-9.]', '', 'g'), '')::numeric
$$;

-- Called by the Shortcut. Every value is optional except the code and the day,
-- and a value that isn't sent keeps what was saved earlier that day.
create or replace function public.ingest_fitness(
  p_token text,
  p_day text,
  p_steps text default null,
  p_active_cal text default null,
  p_exercise_min text default null,
  p_distance text default null,
  p_flights text default null,
  p_resting_hr text default null,
  p_hrv text default null,
  p_vo2max text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_day date;
  v_steps integer := round(fitness_num(p_steps));
begin
  select user_id into v_user from sleep_tokens where token::text = trim(p_token);
  if v_user is null then
    raise exception 'Unknown code. Copy it again from the Fitness Track tab in the Wellness app.';
  end if;

  begin
    v_day := left(trim(p_day), 10)::date;
  exception when others then
    raise exception 'p_day should be the date, like 2026-11-17 (ISO 8601, no time).';
  end;

  insert into fitness_days (user_id, day, steps, active_cal, exercise_min, distance_mi, flights, resting_hr, hrv_ms, vo2max, updated_at)
  values (
    v_user, v_day, v_steps,
    round(fitness_num(p_active_cal)), round(fitness_num(p_exercise_min)), round(fitness_num(p_distance), 2),
    round(fitness_num(p_flights)), round(fitness_num(p_resting_hr)), round(fitness_num(p_hrv)), round(fitness_num(p_vo2max), 1),
    now()
  )
  on conflict (user_id, day) do update set
    steps = coalesce(excluded.steps, fitness_days.steps),
    active_cal = coalesce(excluded.active_cal, fitness_days.active_cal),
    exercise_min = coalesce(excluded.exercise_min, fitness_days.exercise_min),
    distance_mi = coalesce(excluded.distance_mi, fitness_days.distance_mi),
    flights = coalesce(excluded.flights, fitness_days.flights),
    resting_hr = coalesce(excluded.resting_hr, fitness_days.resting_hr),
    hrv_ms = coalesce(excluded.hrv_ms, fitness_days.hrv_ms),
    vo2max = coalesce(excluded.vo2max, fitness_days.vo2max),
    updated_at = now();

  return 'Saved activity for ' || to_char(v_day, 'Mon DD') ||
    case when v_steps is not null then ': ' || to_char(v_steps, 'FM999,999') || ' steps.' else '.' end;
end;
$$;

revoke all on function public.ingest_fitness(text, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.ingest_fitness(text, text, text, text, text, text, text, text, text, text) to anon, authenticated;
