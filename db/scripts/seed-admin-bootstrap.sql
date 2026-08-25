-- ============================================================================
-- SEED DE BOOTSTRAP DE IDENTIDAD Y PANEL DE ADMINISTRACION
-- ============================================================================
-- Estado que habilita: roles base del ecosistema + primer operador del panel
-- (app administracion) + primer perfil de usuario (app usuario).
--
-- VERIFICADO EN PRODUCCION (2026-08-25): tablas `roles`, `profiles`,
-- `user_roles`, `admin_users` existen y estan VACIAS.
--
-- COMO APLICAR:
--   1. Editar la variable :admin_email con el email real del primer
--      administrador. El usuario debe existir previamente en Supabase Auth
--      (crear desde Dashboard > Authentication > Add user, o via API admin).
--   2. Ejecutar en el proyecto remoto (SQL Editor o MCP con aprobacion).
--   3. Es idempotente: puede re-ejecutarse sin duplicar datos.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Roles base del ecosistema (definidos en el alcance MVP de Gestion de
--    Usuarios). hierarchy_level menor = mas privilegios.
-- ---------------------------------------------------------------------------
insert into public.roles (slug, name, description, hierarchy_level)
values
  ('admin',       'Administrador', 'Control total del ecosistema',            10),
  ('sacerdote',   'Sacerdote',     'Contenido pastoral y gestion liturgica',  30),
  ('coordinador', 'Coordinador',   'Coordinacion de comunidades y eventos',   50),
  ('usuario',     'Usuario',       'Usuario final de las aplicaciones',      100)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 2) Primer administrador del panel (app administracion).
--    REQUISITO: reemplazar el email y asegurarse de que el usuario exista en
--    auth.users. Si no existe, el bloque no inserta nada (no falla).
-- ---------------------------------------------------------------------------
do $$
declare
  v_admin_email text := 'CAMBIA-ESTE-EMAIL@ejemplo.com';
  v_user_id uuid;
  v_admin_role_id bigint;
begin
  if v_admin_email = 'CAMBIA-ESTE-EMAIL@ejemplo.com' then
    raise notice 'SALTADO: configura v_admin_email antes de ejecutar.';
    return;
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = lower(v_admin_email)
  limit 1;

  if v_user_id is null then
    raise notice 'SALTADO: no existe usuario auth con email %.', v_admin_email;
    return;
  end if;

  select id into v_admin_role_id from public.roles where slug = 'admin';

  -- Perfil de la app usuario (rol ecosistema = admin)
  insert into public.profiles (id, email, name, role_id)
  values (
    v_user_id,
    lower(v_admin_email),
    coalesce((select raw_user_meta_data->>'name' from auth.users where id = v_user_id), 'Admin'),
    v_admin_role_id
  )
  on conflict (id) do nothing;

  -- Rol operativo del panel (app administracion)
  insert into public.admin_users (user_id, role, active)
  values (v_user_id, 'admin', true)
  on conflict (user_id) do nothing;

  -- Trazabilidad del bootstrap
  insert into public.audit_log (user_id, action, metadata)
  values (v_user_id, 'bootstrap_seed', jsonb_build_object('source', 'seed-admin-bootstrap'));

  raise notice 'OK: administrador % habilitado en profiles y admin_users.', v_admin_email;
end $$;

-- ---------------------------------------------------------------------------
-- 3) Verificacion post-ejecucion (resultados esperados >= 1 fila cada uno)
-- ---------------------------------------------------------------------------
-- select * from public.roles order by hierarchy_level;
-- select u.email, p.role_id, r.slug, au.role as panel_role
--   from public.profiles p
--   join public.roles r on r.id = p.role_id
--   join public.admin_users au on au.user_id = p.id
--   join auth.users u on u.id = p.id;
