-- Metricas agregadas para el dashboard de log (NFR-0105-LOG-003/006).
-- Reemplaza el full-scan de log_entries hecho desde la app por una
-- agregacion unica en Postgres.

create or replace function public.get_log_dashboard_metrics(
  p_hours integer default 24,
  p_alert_threshold integer default 10
)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'totalLogs', (
      select count(*) from public.log_entries
    ),
    'errorCount24h', (
      select count(*) from public.log_entries
      where level in ('error', 'fatal')
        and "timestamp" >= timezone('utc', now()) - interval '24 hours'
    ),
    'topApps', coalesce((
      select jsonb_agg(jsonb_build_object('app', app, 'count', count) order by count desc, app)
      from (
        select app, count(*) as count
        from public.log_entries
        group by app
        order by count desc, app
        limit 5
      ) t
    ), '[]'::jsonb),
    'hourlySeries', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'count', count) order by bucket)
      from (
        select
          gs.bucket,
          to_char(gs.bucket, 'HH24:MI') as label,
          count(le.id) as count
        from generate_series(
          date_trunc('hour', timezone('utc', now())) - make_interval(hours => greatest(p_hours, 1) - 1),
          date_trunc('hour', timezone('utc', now())),
          interval '1 hour'
        ) as gs(bucket)
        left join public.log_entries le
          on le."timestamp" >= gs.bucket
         and le."timestamp" < gs.bucket + interval '1 hour'
        group by gs.bucket
      ) s
    ), '[]'::jsonb),
    'alerts', coalesce((
      select jsonb_agg(jsonb_build_object('app', app, 'count', count) order by count desc, app)
      from (
        select app, count(*) as count
        from public.log_entries
        where level in ('error', 'fatal')
          and "timestamp" >= timezone('utc', now()) - interval '60 seconds'
        group by app
        having count(*) > p_alert_threshold
      ) a
    ), '[]'::jsonb),
    'alertThreshold', p_alert_threshold
  );
$$;

revoke all on function public.get_log_dashboard_metrics(integer, integer)
  from anon, authenticated;
grant execute on function public.get_log_dashboard_metrics(integer, integer)
  to service_role;
