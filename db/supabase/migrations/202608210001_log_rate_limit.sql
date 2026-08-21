-- Rate limiting por API key para la ingesta de logs (SEC-0105-LOG-006).
-- Ventana fija de 1 minuto con limite configurable (default 100 req/min).

create table if not exists public.api_key_rate_limits (
  api_key_id uuid primary key references public.api_keys(id) on delete cascade,
  window_started_at timestamptz not null default timezone('utc', now()),
  request_count integer not null default 0
);

alter table public.api_key_rate_limits enable row level security;

-- La tabla solo se accede via service_role desde el backend del panel log.
drop policy if exists api_key_rate_limits_service_role on public.api_key_rate_limits;
create policy api_key_rate_limits_service_role
on public.api_key_rate_limits
for all
to service_role
using (true)
with check (true);

revoke all on public.api_key_rate_limits from anon, authenticated;
grant select, insert, update on public.api_key_rate_limits to service_role;

create or replace function public.check_api_key_rate_limit(
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

  insert into public.api_key_rate_limits (api_key_id, window_started_at, request_count)
  values (p_api_key_id, v_now, 0)
  on conflict (api_key_id) do nothing;

  -- Lock de fila para que requests concurrentes serialicen el conteo.
  select window_started_at, request_count
  into v_window_started, v_request_count
  from public.api_key_rate_limits
  where api_key_id = p_api_key_id
  for update;

  if v_window_started < v_now - make_interval(secs => p_window_seconds) then
    update public.api_key_rate_limits
    set window_started_at = v_now,
        request_count = 1
    where api_key_id = p_api_key_id;
    return true;
  end if;

  if v_request_count >= p_limit then
    return false;
  end if;

  update public.api_key_rate_limits
  set request_count = request_count + 1
  where api_key_id = p_api_key_id;

  return true;
end;
$$;

revoke all on function public.check_api_key_rate_limit(uuid, integer, integer)
  from anon, authenticated;
grant execute on function public.check_api_key_rate_limit(uuid, integer, integer)
  to service_role;
