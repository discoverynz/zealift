-- Zealift Pass 2 migration — run in Supabase SQL Editor

create table alt_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#2DD4BF',
  created_at timestamptz not null default now()
);
alter table alt_groups enable row level security;
create policy "Users manage their own alt groups" on alt_groups for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table exercises add column alt_group_id uuid references alt_groups(id) on delete set null;

create table body_weight (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight numeric not null,
  unit text not null default 'kg',
  logged_at date not null default current_date,
  created_at timestamptz not null default now()
);
alter table body_weight enable row level security;
create policy "Users manage their own body weight" on body_weight for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table phase_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  current_phase text not null default 'bulk',
  bulk_start date,
  bulk_end date,
  cut_start date,
  cut_end date
);
alter table phase_settings enable row level security;
create policy "Users manage their own phase settings" on phase_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
