-- Vectra plant data (run in Supabase SQL Editor)
-- https://supabase.com/dashboard → SQL → New query

create extension if not exists "pgcrypto";

create table if not exists public.plant_workspaces (
  user_id uuid primary key references auth.users (id) on delete cascade,
  devices jsonb not null default '[]'::jsonb,
  alerts jsonb not null default '[]'::jsonb,
  maintenance jsonb not null default '[]'::jsonb,
  records jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.plant_api_keys (
  user_id uuid primary key references auth.users (id) on delete cascade,
  api_key text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.plant_telemetry_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_id text not null,
  metric text not null,
  value numeric not null,
  threshold numeric,
  created_at timestamptz not null default now()
);

create index if not exists plant_telemetry_log_user_created
  on public.plant_telemetry_log (user_id, created_at desc);

alter table public.plant_workspaces enable row level security;
alter table public.plant_api_keys enable row level security;
alter table public.plant_telemetry_log enable row level security;

create policy "Users read own plant workspace"
  on public.plant_workspaces for select
  using (auth.uid() = user_id);

create policy "Users insert own plant workspace"
  on public.plant_workspaces for insert
  with check (auth.uid() = user_id);

create policy "Users update own plant workspace"
  on public.plant_workspaces for update
  using (auth.uid() = user_id);

create policy "Users delete own plant workspace"
  on public.plant_workspaces for delete
  using (auth.uid() = user_id);

create policy "Users read own api key"
  on public.plant_api_keys for select
  using (auth.uid() = user_id);

create policy "Users insert own api key"
  on public.plant_api_keys for insert
  with check (auth.uid() = user_id);

create policy "Users update own api key"
  on public.plant_api_keys for update
  using (auth.uid() = user_id);

create policy "Users read own telemetry log"
  on public.plant_telemetry_log for select
  using (auth.uid() = user_id);
