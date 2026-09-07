-- Roles editoriales del CMS (paso 1 del plan CMS).
--
-- Contratos: FASE_2-Sistema-de-Contenidos-CMS/WEB 02-SRS (FR-CMS-005),
-- 03-FRD (RB-CMS-004) y 06-Esquema de Datos (RLS por rol). El CMS define
-- tres roles editoriales: editor (crea y edita borradores, envia a
-- revision), revisor (publica o rechaza) y administrador (todo, ya
-- existe en el RBAC). Los roles de plataforma dev/ops/product no
-- participan del flujo editorial.
--
-- Jerarquia: revisor (31) queda por encima de editor (30) porque el
-- revisor autoriza la publicacion; ambos entre sacerdote (20) y
-- coordinador (40), como roles de produccion de contenido.

-- 1. Roles editoriales.
insert into public.roles (slug, name, description, hierarchy_level)
values
  ('editor', 'Editor de contenido', 'Crea y edita entradas de contenido del CMS y las envia a revision', 30),
  ('revisor', 'Revisor de contenido', 'Aprueba o rechaza entradas en revision del CMS', 31)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  hierarchy_level = excluded.hierarchy_level;

-- 2. Permisos de acceso a la app cms (incluye admin, que ya existia y no
-- tenia permiso para esta app nueva).
insert into public.permissions (role_id, app_slug, can_access)
select r.id, 'cms', true
from public.roles r
where r.slug in ('admin', 'editor', 'revisor')
on conflict (role_id, app_slug) do update
set can_access = excluded.can_access;
