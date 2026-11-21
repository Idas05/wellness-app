-- Live updates between the phone and the website.
-- Turns on Supabase Realtime for the app's tables, so a change on one device shows up on the other within
-- a second instead of at the next 15-second check. Safe to run more than once. Row-level security still
-- applies: each device only hears about its own account's rows.
do $$
declare t text;
begin
  foreach t in array array['reminders', 'food_entries', 'calorie_profiles', 'user_data', 'sleep_nights', 'fitness_days'] loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t)
       and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
