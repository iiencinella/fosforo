# Biblia Supabase (MVP interno)

Este directorio contiene el esquema SQL base y guias de carga para `src/apps/biblia`.

## Archivos

- `001_biblia_schema.sql`: tablas e indices propuestos para lectura, busqueda y liturgia.

## Tablas principales

- `biblia_versions`
- `biblia_books`
- `biblia_chapters`
- `biblia_verses`
- `liturgy_daily_readings`
- `biblia_ingestion_runs`

## Ejecucion sugerida

1. Aplicar SQL en proyecto Supabase interno.
2. Ejecutar en app Biblia:
   - `pnpm --filter=biblia ingest:bible -- --dry-run`
   - `pnpm --filter=biblia ingest:bible`

## Seguridad

- Todas las tablas quedan con RLS habilitado por defecto.
- El contenido LPD debe permanecer en uso interno hasta resolver licencia para distribución pública.
