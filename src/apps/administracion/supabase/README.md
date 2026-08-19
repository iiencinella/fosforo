# Administracion Supabase (API cerrada)

Esta carpeta contiene las migraciones SQL base para el panel de administracion:

- `001_admin_schema.sql` - tablas, constraints, indices y triggers.
- `002_admin_rls_policies.sql` - RLS por rol (`admin`, `editor`, `viewer`) y grants API.
- `003_admin_helpers.sql` - funciones helper para dashboard y auditoria.

## Modelo de seguridad

- API cerrada: no hay acceso anonimo a datos operativos.
- Todas las tablas tienen RLS habilitado.
- El acceso se controla por usuario autenticado + rol en `public.admin_users`.
- `admin`: lectura/escritura total.
- `editor`: lectura + alta/edicion (sin delete).
- `viewer`: solo lectura.

## Nota sobre Data API

Supabase puede requerir grants explicitos para exponer tablas nuevas al Data API.
Por eso las migraciones incluyen `GRANT` a `authenticated` (no a `anon`) y RLS estricta.
