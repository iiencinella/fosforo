-- Consolidacion del esquema de templos: administracion pasa a operar sobre
-- horarios_temples / horarios_celebrations (las mismas tablas que consume la
-- app publica 0106_horarios). Se retiran churches / celebration_schedules.
-- Segura para entornos donde ambas tablas estan vacias (estado actual de
-- produccion verificado el 2026-08-25).

-- 1) Columnas aditivas en horarios_temples para soportar datos del panel
alter table public.horarios_temples
  add column if not exists country text not null default 'Argentina';
alter table public.horarios_temples
  add column if not exists contact_email text;
alter table public.horarios_temples
  add column if not exists website text;
alter table public.horarios_temples
  add column if not exists is_active boolean not null default true;

create index if not exists idx_horarios_temples_is_active
  on public.horarios_temples(is_active);

-- Unicidad nombre+ciudad (equivalente funcional al indice de churches)
create unique index if not exists horarios_temples_name_city_uniq
  on public.horarios_temples (lower(name), lower(city));

-- 2) Auditoria del panel: resource_id pasa de uuid a text porque los ids de
-- horarios_* son slugs de texto.
alter table public.admin_audit_log
  alter column resource_id type text using resource_id::text;

-- 3) Acceso de escritura para operadores autenticados del panel via RLS.
-- El cliente del panel usa anon key + sesion de Supabase Auth, por lo que las
-- escrituras llegan como authenticated y deben pasar por admin_users.

drop policy if exists horarios_temples_admin_insert on public.horarios_temples;
create policy horarios_temples_admin_insert
on public.horarios_temples
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
      and au.active
      and au.role in ('admin', 'editor')
  )
);

drop policy if exists horarios_temples_admin_update on public.horarios_temples;
create policy horarios_temples_admin_update
on public.horarios_temples
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
      and au.active
      and au.role in ('admin', 'editor')
  )
)
with check (
  exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
      and au.active
      and au.role in ('admin', 'editor')
  )
);

drop policy if exists horarios_temples_admin_delete on public.horarios_temples;
create policy horarios_temples_admin_delete
on public.horarios_temples
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
      and au.active
      and au.role = 'admin'
  )
);

drop policy if exists horarios_celebrations_admin_insert on public.horarios_celebrations;
create policy horarios_celebrations_admin_insert
on public.horarios_celebrations
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
      and au.active
      and au.role in ('admin', 'editor')
  )
);

drop policy if exists horarios_celebrations_admin_update on public.horarios_celebrations;
create policy horarios_celebrations_admin_update
on public.horarios_celebrations
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
      and au.active
      and au.role in ('admin', 'editor')
  )
)
with check (
  exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
      and au.active
      and au.role in ('admin', 'editor')
  )
);

drop policy if exists horarios_celebrations_admin_delete on public.horarios_celebrations;
create policy horarios_celebrations_admin_delete
on public.horarios_celebrations
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
      and au.active
      and au.role = 'admin'
  )
);

grant insert, update, delete on public.horarios_temples to authenticated;
grant insert, update, delete on public.horarios_celebrations to authenticated;

-- 4) RPC de metricas del dashboard apuntada a las tablas consolidadas
create or replace function public.admin_dashboard_metrics()
returns jsonb
language sql
stable
security invoker
as $$
  with temples_cte as (
    select count(*)::int as active_total
    from public.horarios_temples
    where is_active = true
  ),
  schedules_cte as (
    select count(*)::int as total
    from public.horarios_celebrations
    where is_active = true
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
    'activeChurches', (select active_total from temples_cte),
    'schedules', (select total from schedules_cte),
    'recentActivity', (select items from activity_cte)
  );
$$;

-- 5) Retiro de las tablas legacy del panel (vacias en produccion)
drop table if exists public.celebration_schedules cascade;
drop table if exists public.churches cascade;
