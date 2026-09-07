-- Esquema RUM para la app log (telemetria anonima de producto).
--
-- Contratos: docs/02-Aplicaciones/FASE_1-0105_log/WEB/06-Esquema de Datos.md
-- (seccion RUM), FR-LOG-RUM-002/003/005/006/007, ADR-LOG-RUM-003/004/006.
-- Ingesta publica anonima (sin API key): insert con check (true) para anon y
-- authenticated; lectura restringida a roles de plataforma dev/ops/product via
-- el modelo RBAC compartido (current_user_role_slug, paso 1).
--
-- Privacidad (SEC-LOG-RUM-001/009): no se almacena IP ni user id; solo
-- session_id_anon (hash aleatorio por sesion) y user_agent_hash (SHA-256).

-- 1. Eventos de producto (pageview, custom event, error de frontend).
create table if not exists public.rum_events (
  id uuid primary key default gen_random_uuid(),
  app varchar(100) not null,
  event_name varchar(100) not null,
  page_url text,
  page_path varchar(500),
  session_id_anon varchar(64) not null,
  metadata jsonb,
  user_agent_hash varchar(64),
  app_version varchar(20),
  environment varchar(20),
  "timestamp" timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  has_consent boolean not null default true
);

create index if not exists idx_rum_events_app_timestamp
  on public.rum_events(app, "timestamp" desc);
create index if not exists idx_rum_events_event_name
  on public.rum_events(event_name);
create index if not exists idx_rum_events_session_id
  on public.rum_events(session_id_anon);
create index if not exists idx_rum_events_page_path
  on public.rum_events(page_path);

-- 2. Web Vitals (LCP, INP, CLS) por pagina.
create table if not exists public.rum_vitals (
  id uuid primary key default gen_random_uuid(),
  app varchar(100) not null,
  page_url text,
  page_path varchar(500),
  metric_name varchar(10) not null,
  metric_value numeric not null,
  rating varchar(20) not null,
  session_id_anon varchar(64) not null,
  app_version varchar(20),
  "timestamp" timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.rum_vitals
  drop constraint if exists rum_vitals_metric_name_check;
alter table public.rum_vitals
  add constraint rum_vitals_metric_name_check
  check (metric_name in ('LCP', 'INP', 'CLS'));

alter table public.rum_vitals
  drop constraint if exists rum_vitals_rating_check;
alter table public.rum_vitals
  add constraint rum_vitals_rating_check
  check (rating in ('good', 'needs-improvement', 'poor'));

create index if not exists idx_rum_vitals_app_metric
  on public.rum_vitals(app, metric_name);
create index if not exists idx_rum_vitals_app_timestamp
  on public.rum_vitals(app, "timestamp" desc);
create index if not exists idx_rum_vitals_rating
  on public.rum_vitals(rating);

-- 3. Sesiones anonimas (agrupan eventos y vitals por session_id_anon).
create table if not exists public.rum_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id_anon varchar(64) not null unique,
  app varchar(100) not null,
  first_page_url text,
  last_page_url text,
  page_count integer not null default 0,
  event_count integer not null default 0,
  started_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_rum_sessions_app_started_at
  on public.rum_sessions(app, started_at desc);

-- 4. Sampling configurable por app (default 100% pageview/errores, 10% custom).
create table if not exists public.rum_sampling_config (
  id uuid primary key default gen_random_uuid(),
  app varchar(100) not null unique,
  pageview_sampling numeric not null default 1.0,
  custom_sampling numeric not null default 0.1,
  error_sampling numeric not null default 1.0,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid
);

alter table public.rum_sampling_config
  drop constraint if exists rum_sampling_config_pageview_range;
alter table public.rum_sampling_config
  add constraint rum_sampling_config_pageview_range
  check (pageview_sampling between 0 and 1);

alter table public.rum_sampling_config
  drop constraint if exists rum_sampling_config_custom_range;
alter table public.rum_sampling_config
  add constraint rum_sampling_config_custom_range
  check (custom_sampling between 0 and 1);

alter table public.rum_sampling_config
  drop constraint if exists rum_sampling_config_error_range;
alter table public.rum_sampling_config
  add constraint rum_sampling_config_error_range
  check (error_sampling between 0 and 1);

-- 5. Rate limit anonimo por clave de cliente (patron de api_key_rate_limits).
-- La clave la calcula el backend (hash de IP + UA); nunca se almacena la IP.
create table if not exists public.rum_rate_limits (
  client_key text primary key,
  window_started_at timestamptz not null default timezone('utc', now()),
  request_count integer not null default 0
);

-- 6. RLS.
alter table public.rum_events enable row level security;
alter table public.rum_vitals enable row level security;
alter table public.rum_sessions enable row level security;
alter table public.rum_sampling_config enable row level security;
alter table public.rum_rate_limits enable row level security;

drop policy if exists rum_events_insert_anon on public.rum_events;
create policy rum_events_insert_anon
on public.rum_events
for insert
to anon, authenticated
with check (true);

drop policy if exists rum_events_select_platform_roles on public.rum_events;
create policy rum_events_select_platform_roles
on public.rum_events
for select
to authenticated
using (public.current_user_role_slug() in ('dev', 'ops', 'product'));

drop policy if exists rum_vitals_insert_anon on public.rum_vitals;
create policy rum_vitals_insert_anon
on public.rum_vitals
for insert
to anon, authenticated
with check (true);

drop policy if exists rum_vitals_select_platform_roles on public.rum_vitals;
create policy rum_vitals_select_platform_roles
on public.rum_vitals
for select
to authenticated
using (public.current_user_role_slug() in ('dev', 'ops', 'product'));

drop policy if exists rum_sessions_insert_anon on public.rum_sessions;
create policy rum_sessions_insert_anon
on public.rum_sessions
for insert
to anon, authenticated
with check (true);

drop policy if exists rum_sessions_select_platform_roles on public.rum_sessions;
create policy rum_sessions_select_platform_roles
on public.rum_sessions
for select
to authenticated
using (public.current_user_role_slug() in ('dev', 'ops', 'product'));

drop policy if exists rum_sampling_config_select_platform_roles on public.rum_sampling_config;
create policy rum_sampling_config_select_platform_roles
on public.rum_sampling_config
for select
to authenticated
using (public.current_user_role_slug() in ('dev', 'ops', 'product'));

drop policy if exists rum_rate_limits_service_role on public.rum_rate_limits;
create policy rum_rate_limits_service_role
on public.rum_rate_limits
for all
to service_role
using (true)
with check (true);

-- 7. Grants.
grant insert on public.rum_events to anon, authenticated;
grant insert on public.rum_vitals to anon, authenticated;
grant insert on public.rum_sessions to anon, authenticated;

grant select on public.rum_events to authenticated;
grant select on public.rum_vitals to authenticated;
grant select on public.rum_sessions to authenticated;
grant select on public.rum_sampling_config to authenticated;

grant select, insert, update, delete on public.rum_events to service_role;
grant select, insert, update, delete on public.rum_vitals to service_role;
grant select, insert, update, delete on public.rum_sessions to service_role;
grant select, insert, update, delete on public.rum_sampling_config to service_role;
grant select, insert, update on public.rum_rate_limits to service_role;

-- 8. RPC de rate limit para ingesta anonima (mismo patron fijo por ventana
-- que check_api_key_rate_limit). Se invoca con el cliente service_role.
create or replace function public.check_rum_rate_limit(
  p_client_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := timezone('utc', now());
  v_window_started timestamptz;
  v_request_count integer;
begin
  if p_client_key is null or p_limit is null or p_window_seconds is null then
    return false;
  end if;

  insert into public.rum_rate_limits (client_key, window_started_at, request_count)
  values (p_client_key, v_now, 0)
  on conflict (client_key) do nothing;

  select window_started_at, request_count
  into v_window_started, v_request_count
  from public.rum_rate_limits
  where client_key = p_client_key
  for update;

  if v_window_started < v_now - make_interval(secs => p_window_seconds) then
    update public.rum_rate_limits
    set window_started_at = v_now,
        request_count = 1
    where client_key = p_client_key;
    return true;
  end if;

  if v_request_count >= p_limit then
    return false;
  end if;

  update public.rum_rate_limits
  set request_count = request_count + 1
  where client_key = p_client_key;

  return true;
end;
$$;

revoke all on function public.check_rum_rate_limit(text, integer, integer)
  from anon, authenticated;
grant execute on function public.check_rum_rate_limit(text, integer, integer)
  to service_role;
