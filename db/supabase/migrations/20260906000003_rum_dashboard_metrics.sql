-- Agregaciones en Postgres para el dashboard de producto RUM (paso 5).
--
-- Contratos: FR-LOG-RUM-005, NFR-0105-LOG-003 (agregacion en DB, no
-- descarga de tabla), docs/plans/2026-09-05-plan-desarrollo-fase-0.md.
--
-- Nota de diseno: la "retencion por cohorte" de usuarios no es posible por
-- decision de privacidad (ADR-LOG-RUM-004: session_id_anon no persiste entre
-- sesiones). El proxy implementado es actividad diaria (sesiones por dia y
-- paginas vistas), suficiente para tendencias de producto.
--
-- Los RPCs se ejecutan con el cliente service_role desde el backend del
-- panel (requireRole dev/ops/product en la capa de API).

create or replace function public.get_rum_top_pages(
  p_hours integer,
  p_app text default null
)
returns table (page_path varchar, event_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select re.page_path, count(*)::bigint
  from public.rum_events re
  where re.event_name = 'pageview'
    and re.page_path is not null
    and re."timestamp" >= timezone('utc', now()) - make_interval(secs => p_hours * 3600)
    and (p_app is null or re.app = p_app)
  group by re.page_path
  order by count(*) desc
  limit 20
$$;

create or replace function public.get_rum_vitals_distribution(
  p_hours integer,
  p_app text default null
)
returns table (metric_name varchar, rating varchar, sample_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select rv.metric_name, rv.rating, count(*)::bigint
  from public.rum_vitals rv
  where rv."timestamp" >= timezone('utc', now()) - make_interval(secs => p_hours * 3600)
    and (p_app is null or rv.app = p_app)
  group by rv.metric_name, rv.rating
$$;

create or replace function public.get_rum_events_by_app(
  p_hours integer
)
returns table (app varchar, event_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select re.app, count(*)::bigint
  from public.rum_events re
  where re."timestamp" >= timezone('utc', now()) - make_interval(secs => p_hours * 3600)
  group by re.app
  order by count(*) desc
$$;

create or replace function public.get_rum_funnel(
  p_events text[],
  p_hours integer,
  p_app text default null
)
returns table (event_name text, sessions bigint)
language sql
stable
security definer
set search_path = public
as $$
  select e.event_name,
         count(distinct re.session_id_anon)::bigint as sessions
  from unnest(p_events) with ordinality as e(event_name, ord)
  left join public.rum_events re
    on re.event_name = e.event_name
   and re."timestamp" >= timezone('utc', now()) - make_interval(secs => p_hours * 3600)
   and (p_app is null or re.app = p_app)
  group by e.event_name, e.ord
  order by e.ord
$$;

create or replace function public.get_rum_daily_sessions(
  p_days integer,
  p_app text default null
)
returns table (day date, session_count bigint, pageviews bigint)
language sql
stable
security definer
set search_path = public
as $$
  select rs.started_at::date as day,
         count(distinct rs.session_id_anon)::bigint as session_count,
         coalesce(sum(rs.page_count), 0)::bigint as pageviews
  from public.rum_sessions rs
  where rs.started_at >= timezone('utc', now()) - make_interval(days => p_days)
    and (p_app is null or rs.app = p_app)
  group by rs.started_at::date
  order by rs.started_at::date asc
$$;

revoke all on function public.get_rum_top_pages(integer, text) from public, anon, authenticated;
revoke all on function public.get_rum_vitals_distribution(integer, text) from public, anon, authenticated;
revoke all on function public.get_rum_events_by_app(integer) from public, anon, authenticated;
revoke all on function public.get_rum_funnel(text[], integer, text) from public, anon, authenticated;
revoke all on function public.get_rum_daily_sessions(integer, text) from public, anon, authenticated;

grant execute on function public.get_rum_top_pages(integer, text) to service_role;
grant execute on function public.get_rum_vitals_distribution(integer, text) to service_role;
grant execute on function public.get_rum_events_by_app(integer) to service_role;
grant execute on function public.get_rum_funnel(text[], integer, text) to service_role;
grant execute on function public.get_rum_daily_sessions(integer, text) to service_role;
