-- ============================================================================
-- GESTION DE ROLES DEL ECOSISTEMA DESDE EL PANEL DE ADMINISTRACION
-- ============================================================================
-- El modelo de datos ya existia (roles, permissions con rol+app_slug,
-- politicas RLS *_manage_admin basadas en internal.is_admin). Faltaba:
--   1. Grants DML para authenticated (solo habia SELECT).
--   2. Seed inicial de la matriz por aplicacion: el rol admin accede a todas;
--      el resto queda denegado por defecto hasta decision explicita.
-- No se crean ni alteran tablas. Idempotente.
-- ============================================================================

grant insert, update, delete on public.roles to authenticated;
grant insert, update, delete on public.permissions to authenticated;

insert into public.permissions (role_id, app_slug, can_access)
select r.id, a.app_slug, true
from public.roles r
cross join (
  values
    ('portal'),
    ('biblia'),
    ('calendario'),
    ('horarios'),
    ('usuario'),
    ('log'),
    ('administracion'),
    ('cancionero')
) as a(app_slug)
where r.slug = 'admin'
on conflict (role_id, app_slug) do nothing;

-- Verificacion esperada:
--   select r.slug, count(*) from public.permissions p
--     join public.roles r on r.id = p.role_id group by 1;
--   => admin: 8 filas; resto de roles: 0 filas.
