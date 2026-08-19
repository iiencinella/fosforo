# Supabase DB Scripts

Este directorio contiene la configuración local de Supabase CLI, migraciónes y seeds del proyecto Fósforo.

## Estructura

- `supabase/config.toml`: configuración del proyecto local.
- `supabase/migrations/*.sql`: migraciónes SQL versionadas.
- `supabase/seeds/seed.sql`: datos iniciales de desarrollo.
- `scripts/validate.js`: validación previa de archivos y variables de entorno.
- `scripts/supabase-cli.js`: wrapper de comandos Supabase para evitar diferencias de shell.

## Variables requeridas

Configura estas variables en entorno global o en `.env`:

- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`

Si falta alguna credencial, los scripts fallan con mensaje explicito indicando que debes solicitarla.

## Comandos

Desde la raiz del monorepo:

```bash
pnpm db:scripts:validate
pnpm db:link
pnpm db:migrate
pnpm db:push
pnpm db:seed
pnpm db:generate-types
```

`pnpm db:seed` ejecuta `db push --include-seed --yes` sobre el proyecto remoto vinculado.

## Nota de seguridad

No commitear secretos reales en archivos SQL ni en `.env`.
