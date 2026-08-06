-- Vectra v2 tenant tables (paste into Supabase SQL Editor → Run)
-- Dashboard: https://supabase.com/dashboard/project/ahaousuahjwavkmaezdu/sql/new

create extension if not exists "pgcrypto";

create table if not exists public.plant_tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  site text not null default 'Site not set',
  invite_code text not null unique,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.plant_members (
  tenant_id uuid not null references public.plant_tenants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'ops_lead', 'maintenance', 'vendor')),
  joined_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create index if not exists plant_members_user_idx on public.plant_members (user_id);

create table if not exists public.plant_tenant_workspaces (
  tenant_id uuid primary key references public.plant_tenants (id) on delete cascade,
  devices jsonb not null default '[]'::jsonb,
  alerts jsonb not null default '[]'::jsonb,
  maintenance jsonb not null default '[]'::jsonb,
  records jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.plant_tenant_api_keys (
  tenant_id uuid primary key references public.plant_tenants (id) on delete cascade,
  api_key text not null unique,
  mqtt_topic text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.plant_tenant_telemetry_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.plant_tenants (id) on delete cascade,
  device_id text not null,
  metric text not null,
  value numeric not null,
  threshold numeric,
  source text not null default 'http',
  created_at timestamptz not null default now()
);

create index if not exists plant_tenant_telemetry_created
  on public.plant_tenant_telemetry_log (tenant_id, created_at desc);

alter table public.plant_tenants enable row level security;
alter table public.plant_members enable row level security;
alter table public.plant_tenant_workspaces enable row level security;
alter table public.plant_tenant_api_keys enable row level security;
alter table public.plant_tenant_telemetry_log enable row level security;

drop policy if exists "Members read tenant" on public.plant_tenants;
drop policy if exists "Owner updates tenant" on public.plant_tenants;
drop policy if exists "Users create tenant" on public.plant_tenants;
drop policy if exists "Members read membership" on public.plant_members;
drop policy if exists "Owner inserts members" on public.plant_members;
drop policy if exists "Members read tenant workspace" on public.plant_tenant_workspaces;
drop policy if exists "Non-vendor upsert tenant workspace" on public.plant_tenant_workspaces;
drop policy if exists "Non-vendor update tenant workspace" on public.plant_tenant_workspaces;
drop policy if exists "Owner deletes tenant workspace" on public.plant_tenant_workspaces;
drop policy if exists "Members read tenant api key metadata" on public.plant_tenant_api_keys;
drop policy if exists "Owner manages tenant api key" on public.plant_tenant_api_keys;
drop policy if exists "Members read tenant telemetry log" on public.plant_tenant_telemetry_log;

create policy "Members read tenant" on public.plant_tenants for select using (
  exists (select 1 from public.plant_members m where m.tenant_id = plant_tenants.id and m.user_id = auth.uid())
);
create policy "Owner updates tenant" on public.plant_tenants for update using (owner_user_id = auth.uid());
create policy "Users create tenant" on public.plant_tenants for insert with check (owner_user_id = auth.uid());
create policy "Members read membership" on public.plant_members for select using (
  user_id = auth.uid() or exists (select 1 from public.plant_members m where m.tenant_id = plant_members.tenant_id and m.user_id = auth.uid())
);
create policy "Owner inserts members" on public.plant_members for insert with check (
  exists (select 1 from public.plant_tenants t where t.id = tenant_id and t.owner_user_id = auth.uid()) or user_id = auth.uid()
);
create policy "Members read tenant workspace" on public.plant_tenant_workspaces for select using (
  exists (select 1 from public.plant_members m where m.tenant_id = plant_tenant_workspaces.tenant_id and m.user_id = auth.uid())
);
create policy "Non-vendor upsert tenant workspace" on public.plant_tenant_workspaces for insert with check (
  exists (select 1 from public.plant_members m where m.tenant_id = plant_tenant_workspaces.tenant_id and m.user_id = auth.uid() and m.role in ('owner', 'ops_lead', 'maintenance'))
);
create policy "Non-vendor update tenant workspace" on public.plant_tenant_workspaces for update using (
  exists (select 1 from public.plant_members m where m.tenant_id = plant_tenant_workspaces.tenant_id and m.user_id = auth.uid() and m.role in ('owner', 'ops_lead', 'maintenance'))
);
create policy "Owner deletes tenant workspace" on public.plant_tenant_workspaces for delete using (
  exists (select 1 from public.plant_tenants t where t.id = plant_tenant_workspaces.tenant_id and t.owner_user_id = auth.uid())
);
create policy "Members read tenant api key metadata" on public.plant_tenant_api_keys for select using (
  exists (select 1 from public.plant_members m where m.tenant_id = plant_tenant_api_keys.tenant_id and m.user_id = auth.uid())
);
create policy "Owner manages tenant api key" on public.plant_tenant_api_keys for all using (
  exists (select 1 from public.plant_tenants t where t.id = plant_tenant_api_keys.tenant_id and t.owner_user_id = auth.uid())
);
create policy "Members read tenant telemetry log" on public.plant_tenant_telemetry_log for select using (
  exists (select 1 from public.plant_members m where m.tenant_id = plant_tenant_telemetry_log.tenant_id and m.user_id = auth.uid())
);

notify pgrst, 'reload schema';
