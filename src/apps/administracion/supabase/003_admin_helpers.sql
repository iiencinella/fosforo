create or replace function public.admin_dashboard_metrics()
returns jsonb
language sql
stable
security invoker
as $$
  with churches_cte as (
    select count(*)::int as total
    from public.churches
    where status = 'active'
  ),
  schedules_cte as (
    select count(*)::int as total
    from public.celebration_schedules
  ),
  activity_cte as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'action', action,
          'resource_type', resource_type,
          'created_at', created_at
        ) order by created_at desc
      ),
      '[]'::jsonb
    ) as items
    from (
      select action, resource_type, created_at
      from public.admin_audit_log
      order by created_at desc
      limit 8
    ) recent
  )
  select jsonb_build_object(
    'activeChurches', (select total from churches_cte),
    'schedules', (select total from schedules_cte),
    'recentActivity', (select items from activity_cte)
  );
$$;
