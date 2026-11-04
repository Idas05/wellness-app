-- Run once in Supabase: SQL Editor › New query › paste › Run.
-- Stores one row per night of sleep, sent from Apple Health by an iPhone Shortcut.

create table if not exists public.sleep_nights (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  night date not null,              -- the date you woke up
  bedtime timestamptz,
  wake_time timestamptz,
  asleep_min integer not null default 0,
  deep_min integer not null default 0,
  rem_min integer not null default 0,
  core_min integer not null default 0,
  awake_min integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, night)
);
alter table public.sleep_nights enable row level security;
drop policy if exists "own sleep" on public.sleep_nights;
create policy "own sleep" on public.sleep_nights
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- A private code per person, which the Shortcut uses instead of a password.
create table if not exists public.sleep_tokens (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  token uuid not null unique default gen_random_uuid()
);
alter table public.sleep_tokens enable row level security;
drop policy if exists "own token" on public.sleep_tokens;
create policy "own token" on public.sleep_tokens
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Called by the Shortcut. "samples" is one line per Apple Health sleep sample:
--   <stage>|<start ISO 8601>|<end ISO 8601>
-- where stage is what Health calls it (In Bed, Asleep, Core, Deep, REM, Awake).
create or replace function public.ingest_sleep(p_token text, p_samples text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_line text;
  v_parts text[];
  v_stage text;
  v_start timestamptz;
  v_end timestamptz;
  v_min numeric;
  v_first timestamptz;
  v_last timestamptz;
  v_last_raw text;
  v_deep numeric := 0;
  v_rem numeric := 0;
  v_core numeric := 0;
  v_awake numeric := 0;
  v_asleep_plain numeric := 0;
  v_count int := 0;
begin
  select user_id into v_user from sleep_tokens where token::text = trim(p_token);
  if v_user is null then
    raise exception 'Unknown code. Copy it again from the More tab in the Wellness app.';
  end if;

  foreach v_line in array regexp_split_to_array(coalesce(p_samples, ''), E'[\\r\\n]+') loop
    v_parts := string_to_array(trim(v_line), '|');
    continue when array_length(v_parts, 1) is distinct from 3;
    begin
      v_stage := lower(trim(v_parts[1]));
      v_start := trim(v_parts[2])::timestamptz;
      v_end := trim(v_parts[3])::timestamptz;
    exception when others then
      continue;
    end;
    continue when v_end <= v_start;
    v_min := extract(epoch from (v_end - v_start)) / 60;
    v_count := v_count + 1;

    if v_stage like '%deep%' then v_deep := v_deep + v_min;
    elsif v_stage like '%rem%' then v_rem := v_rem + v_min;
    elsif v_stage like '%core%' then v_core := v_core + v_min;
    elsif v_stage like '%awake%' then v_awake := v_awake + v_min;
    elsif v_stage like '%asleep%' then v_asleep_plain := v_asleep_plain + v_min;
    end if;

    if v_stage not like '%in bed%' then
      if v_first is null or v_start < v_first then v_first := v_start; end if;
      if v_last is null or v_end > v_last then v_last := v_end; v_last_raw := trim(v_parts[3]); end if;
    end if;
  end loop;

  if v_count = 0 or v_last is null then
    return 'No sleep found in the last day.';
  end if;

  insert into sleep_nights (user_id, night, bedtime, wake_time, asleep_min, deep_min, rem_min, core_min, awake_min, updated_at)
  values (
    v_user,
    left(v_last_raw, 10)::date,   -- local date you woke up, as sent by the iPhone
    v_first,
    v_last,
    round(case when v_deep + v_rem + v_core > 0 then v_deep + v_rem + v_core else v_asleep_plain end),
    round(v_deep), round(v_rem), round(v_core), round(v_awake),
    now()
  )
  on conflict (user_id, night) do update set
    bedtime = excluded.bedtime, wake_time = excluded.wake_time, asleep_min = excluded.asleep_min,
    deep_min = excluded.deep_min, rem_min = excluded.rem_min, core_min = excluded.core_min,
    awake_min = excluded.awake_min, updated_at = now();

  return 'Saved last night''s sleep.';
end;
$$;

revoke all on function public.ingest_sleep(text, text) from public;
grant execute on function public.ingest_sleep(text, text) to anon, authenticated;
