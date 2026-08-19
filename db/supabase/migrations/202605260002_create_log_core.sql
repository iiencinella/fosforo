create table if not exists public.log_entries (
  id uuid primary key default gen_random_uuid(),
  app varchar(100) not null,
  level varchar(10) not null,
  message text not null,
  "timestamp" timestamptz not null default timezone('utc', now()),
  metadata jsonb,
  stack_trace text,
  app_version varchar(20),
  environment varchar(20),
  created_at timestamptz not null default timezone('utc', now()),
  ingested_by uuid
);

alter table public.log_entries
  drop constraint if exists log_entries_level_check;

alter table public.log_entries
  add constraint log_entries_level_check
  check (level in ('debug', 'info', 'warn', 'error', 'fatal'));

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null unique,
  app_name varchar(100) not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  last_used_at timestamptz
);

alter table public.log_entries
  drop constraint if exists log_entries_ingested_by_fkey;

alter table public.log_entries
  add constraint log_entries_ingested_by_fkey
  foreign key (ingested_by)
  references public.api_keys(id)
  on delete set null;

create index if not exists idx_log_entries_timestamp
  on public.log_entries("timestamp" desc);

create index if not exists idx_log_entries_level
  on public.log_entries(level);

create index if not exists idx_log_entries_app
  on public.log_entries(app);

create index if not exists idx_log_entries_app_level_timestamp
  on public.log_entries(app, level, "timestamp" desc);

alter table public.log_entries enable row level security;
alter table public.api_keys enable row level security;

drop policy if exists log_entries_select_dev_ops on public.log_entries;
create policy log_entries_select_dev_ops
on public.log_entries
for select
to authenticated
using (auth.jwt() -> 'app_metadata' ->> 'role' in ('dev', 'ops'));

drop policy if exists log_entries_insert_service_role on public.log_entries;
create policy log_entries_insert_service_role
on public.log_entries
for insert
to service_role
with check (true);

drop policy if exists log_entries_update_service_role on public.log_entries;
create policy log_entries_update_service_role
on public.log_entries
for update
to service_role
using (true)
with check (true);

drop policy if exists api_keys_select_service_role on public.api_keys;
create policy api_keys_select_service_role
on public.api_keys
for select
to service_role
using (true);

drop policy if exists api_keys_update_service_role on public.api_keys;
create policy api_keys_update_service_role
on public.api_keys
for update
to service_role
using (true)
with check (true);

grant select on public.log_entries to authenticated;
grant insert, update, select on public.log_entries to service_role;
grant select, update on public.api_keys to service_role;

insert into public.api_keys (key_hash, app_name, description, is_active)
values (
  '218a5c7eac0214246106fbf58a961a06c473a752056912befd1dc29f39f6d739',
  'log-dev-client',
  'API key local para ingesta inicial de log',
  true
)
on conflict (key_hash) do update
set
  app_name = excluded.app_name,
  description = excluded.description,
  is_active = excluded.is_active;
