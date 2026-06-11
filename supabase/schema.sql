-- CLAU — Supabase schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query →
-- paste this whole file → Run. It creates the table the app reads/writes in
-- src/lib/UserContext.tsx (`profiles`), and locks it down so each user can only
-- touch their own row.

-- One row per signed-in user. The entire UserProfile object is stored as JSON in
-- `data`, so adding new profile fields never requires a migration.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Row Level Security: without this, the anon key could read everyone's data.
alter table public.profiles enable row level security;

-- A user may read only their own row.
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- A user may create only their own row (id must equal their auth uid).
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- A user may update only their own row. The app uses upsert, which needs both
-- the insert policy above and this update policy.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
