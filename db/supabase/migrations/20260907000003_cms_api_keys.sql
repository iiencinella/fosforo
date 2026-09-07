-- API keys de lectura para el CMS — paso 7 del plan.
--
-- Contratos: FR-CMS-006/007, NFR-CMS-004, ADR-CMS-007, SEC-CMS-006,
-- 09-Especificacion Tecnica (API REST con API key por app consumidora).
--
-- Decision: tabla propia content_api_keys (no se reutiliza la api_keys
-- de la app log para no acoplar apps). El hash es SHA-256; nunca se
-- almacena la key en texto plano. Rate limit 100 req/min por key con el
-- patron de ventana fija del ecosistema (misma logica que
-- check_api_key_rate_limit y check_rum_rate_limit).

create table if not exists public.content_api_keys (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null unique,
  app_name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  last_used_at timestamptz
);

create index if not exists idx_content_api_keys_app
  on public.content_api_keys(app_name);

-- Contadores de ventana fija por key (solo service_role).
create table if not exists public.content_api_key_rate_limits (
  api_key_id uuid primary key references public.content_api_keys(id) on delete cascade,
  window_started_at timestamptz not null default timezone('utc', now()),
  request_count integer not null default 0
);

-- 1. RLS cerrado: solo service_role toca ambas tablas (SEC-CMS-006).
alter table public.content_api_keys enable row level security;
alter table public.content_api_key_rate_limits enable row level security;

drop policy if exists content_api_keys_service_role on public.content_api_keys;
create policy content_api_keys_service_role
on public.content_api_keys
for all
to service_role
using (true)
with check (true);

drop policy if exists content_api_key_rate_limits_service_role on public.content_api_key_rate_limits;
create policy content_api_key_rate_limits_service_role
on public.content_api_key_rate_limits
for all
to service_role
using (true)
with check (true);

revoke all on public.content_api_keys from anon, authenticated;
revoke all on public.content_api_key_rate_limits from anon, authenticated;

grant all privileges on public.content_api_keys to service_role;
grant select, insert, update on public.content_api_key_rate_limits to service_role;

-- 2. RPC de rate limit (ventana fija, mismo patron del ecosistema).
create or replace function public.check_content_api_key_rate_limit(
  p_api_key_id uuid,
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
  if p_api_key_id is null or p_limit is null or p_window_seconds is null then
    return false;
  end if;

  insert into public.content_api_key_rate_limits (api_key_id, window_started_at, request_count)
  values (p_api_key_id, v_now, 0)
  on conflict (api_key_id) do nothing;

  select window_started_at, request_count
  into v_window_started, v_request_count
  from public.content_api_key_rate_limits
  where api_key_id = p_api_key_id
  for update;

  if v_window_started < v_now - make_interval(secs => p_window_seconds) then
    update public.content_api_key_rate_limits
    set window_started_at = v_now,
        request_count = 1
    where api_key_id = p_api_key_id;
    return true;
  end if;

  if v_request_count >= p_limit then
    return false;
  end if;

  update public.content_api_key_rate_limits
  set request_count = request_count + 1
  where api_key_id = p_api_key_id;

  return true;
end;
$$;

revoke all on function public.check_content_api_key_rate_limit(uuid, integer, integer)
  from public, anon, authenticated;
grant execute on function public.check_content_api_key_rate_limit(uuid, integer, integer)
  to service_role;
