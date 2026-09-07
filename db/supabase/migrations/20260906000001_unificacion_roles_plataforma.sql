-- Unificacion del modelo de roles del ecosistema.
--
-- La app log dejaba de resolver roles via auth.jwt() -> 'app_metadata' ->> 'role'
-- y pasa al modelo RBAC compartido (profiles.role_id -> roles + permissions),
-- incorporando los roles de plataforma dev, ops y product.
--
-- Contratos: docs/02-Aplicaciones/FASE_1-Sistema-de-Logueo/WEB/02-SRS.md (FR-AUTH-002)
-- y docs/plans/2026-09-05-plan-desarrollo-fase-0.md (paso 1).

-- 1. Roles de plataforma.
insert into public.roles (slug, name, description, hierarchy_level)
values
  ('dev', 'Desarrollo', 'Rol de plataforma para desarrollo del ecosistema', 2),
  ('ops', 'Operaciones', 'Rol de plataforma para operacion del ecosistema', 3),
  ('product', 'Producto', 'Rol de plataforma para gestion de producto', 4)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  hierarchy_level = excluded.hierarchy_level;

-- 2. Permisos de acceso a la app log para los roles de plataforma.
insert into public.permissions (role_id, app_slug, can_access)
select r.id, 'log', true
from public.roles r
where r.slug in ('dev', 'ops', 'product')
on conflict (role_id, app_slug) do update
set can_access = excluded.can_access;

-- 3. Helpers de resolucion de rol para policies RLS.
create or replace function public.current_user_role_slug()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.slug
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
  limit 1
$$;

revoke all on function public.current_user_role_slug() from public;
grant execute on function public.current_user_role_slug() to authenticated;

create or replace function public.user_has_app_permission(p_app_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select perm.can_access
    from public.profiles p
    join public.permissions perm on perm.role_id = p.role_id
    where p.id = auth.uid()
      and perm.app_slug = p_app_slug
    limit 1
  ), false)
$$;

revoke all on function public.user_has_app_permission(text) from public;
grant execute on function public.user_has_app_permission(text) to authenticated;

-- 4. RLS de log_entries: migra de app_metadata al RBAC compartido.
-- Solo dev y ops leen log_entries (product accede a dashboard-producto, paso 5).
drop policy if exists log_entries_select_dev_ops on public.log_entries;
drop policy if exists log_entries_select_rbac on public.log_entries;
create policy log_entries_select_platform_roles
on public.log_entries
for select
to authenticated
using (public.current_user_role_slug() in ('dev', 'ops'));
