# Rollback - Horarios (runbook mínimo)

Este documento define una estrategia simple de rollback para cambios de DB de la app Horarios.

## Alcance

Aplica a cambios introducidos por:

- `db/supabase/migrations/202605261100_create_horarios_core.sql`

Tablas principales afectadas:

- `public.horarios_temples`
- `public.horarios_celebrations`
- `public.horarios_search_events`

## Principio operativo

1. **Detener nuevos cambios** (freeze temporal de deploys de app si hay incidente).
2. **Preservar datos** (backup previo al rollback).
3. **Revertir de forma controlada** (rollback SQL o restauración de backup).
4. **Validar health** (`/api/health`) y consultas críticas.

## Opción A (recomendada): rollback por backup/restore

Usar cuando el incidente compromete integridad de datos o performance general.

1. Generar backup inmediato del estado actual (si aún no existe snapshot reciente).
2. Restaurar snapshot válido previo al cambio.
3. Validar:
   - disponibilidad de tablas core de apps existentes
   - permisos/RLS esperados
   - `GET /api/health` de Horarios y apps relacionadas

## Opción B: rollback SQL puntual de Horarios

Usar cuando el problema está aislado en Horarios y no quieres restaurar toda la base.

> Ejecutar con usuario de privilegios altos (service role / owner).

```sql
begin;

drop policy if exists horarios_search_events_service_role_write on public.horarios_search_events;
drop policy if exists horarios_search_events_service_role_read on public.horarios_search_events;
drop policy if exists horarios_search_events_insert_public on public.horarios_search_events;
drop policy if exists horarios_celebrations_service_role_write on public.horarios_celebrations;
drop policy if exists horarios_celebrations_read_public on public.horarios_celebrations;
drop policy if exists horarios_temples_service_role_write on public.horarios_temples;
drop policy if exists horarios_temples_read_public on public.horarios_temples;

drop table if exists public.horarios_search_events;
drop table if exists public.horarios_celebrations;
drop table if exists public.horarios_temples;

commit;
```

## Verificación post-rollback

1. DB sin errores de permisos/policies en logs.
2. App Horarios:
   - `GET /api/health` responde `ok: true`
   - La app puede levantar en fallback local si la DB de Horarios no está disponible.
3. Smoke test rápido:
   - Home carga
   - Búsqueda devuelve resultados
   - Detalle de templo responde

## Reaplicación controlada

Cuando el incidente se cierre:

1. Revisar causa raíz.
2. Ajustar SQL/migración.
3. Reaplicar en staging.
4. Validar y luego promover a producción.
