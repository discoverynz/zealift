-- Zealift — Pass 1 schema
-- Run this in Supabase Dashboard → SQL Editor → New Query → paste → Run

create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'Other',
  weekday int not null check (weekday between 0 and 6), -- 0=Mon ... 6=Sun
  created_at timestamptz not null default now()
);

alter table exercises enable row level security;

create policy "Users manage their own exercises"
on exercises for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  weight numeric not null,
  weight_unit text not null default 'kg',
  num_sets int,
  reps int,
  logged_at date not null default current_date,
  created_at timestamptz not null default now()
);

alter table sets enable row level security;

create policy "Users manage their own sets"
on sets for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index sets_exercise_id_idx on sets(exercise_id);
create index sets_logged_at_idx on sets(logged_at);
