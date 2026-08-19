create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text not null,
  province text,
  country text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  phone text,
  email text,
  website text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists churches_name_city_uniq
  on public.churches (lower(name), lower(city));

create table if not exists public.celebration_schedules (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on update cascade,
  celebration_type text not null,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  valid_from date,
  valid_to date,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_valid_range check (
    valid_to is null or valid_from is null or valid_to >= valid_from
  )
);

create index if not exists schedules_church_idx
  on public.celebration_schedules (church_id);

create unique index if not exists schedules_church_weekday_time_uniq
  on public.celebration_schedules (church_id, weekday, start_time);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action text not null,
  resource_type text not null,
  resource_id uuid not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

drop trigger if exists trg_churches_updated_at on public.churches;
create trigger trg_churches_updated_at
before update on public.churches
for each row execute function public.set_updated_at();

drop trigger if exists trg_schedules_updated_at on public.celebration_schedules;
create trigger trg_schedules_updated_at
before update on public.celebration_schedules
for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.churches enable row level security;
alter table public.celebration_schedules enable row level security;
alter table public.admin_audit_log enable row level security;
