create table day_types (
  user_id uuid not null references auth.users(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  label text not null,
  primary key (user_id, weekday)
);
alter table day_types enable row level security;
create policy "Users manage their own day types" on day_types for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
