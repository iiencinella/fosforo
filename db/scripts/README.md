# DB Scripts - Guía rápida (staging / producción)

Esta guía resume el orden recomendado para aplicar esquema de base de datos en entornos remotos.

## Requisitos

Definir en entorno o `.env`:

- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`

Validar antes de ejecutar:

```bash
pnpm db:scripts:validate
```

## Flujo recomendado (migraciones versionadas)

Usar este flujo en staging y producción para mantener historial de cambios.

1. Vincular proyecto remoto:

```bash
pnpm db:link
```

2. Aplicar migraciones pendientes:

```bash
pnpm db:migrate
```

3. Sincronizar esquema completo al proyecto remoto:

```bash
pnpm db:push
```

4. (Opcional) aplicar seed remoto:

```bash
pnpm db:seed
```

## Horarios: script SQL directo

Si prefieres compilar Horarios directamente por SQL (sin depender del orden de migraciones), usa:

- Script principal: `db/supabase/migrations/202605261100_create_horarios_core.sql`
- Wrapper: `db/scripts/horarios_schema.sql`

Ejemplo con `psql`:

```bash
psql "$DATABASE_URL" -f db/supabase/migrations/202605261100_create_horarios_core.sql
```

Si usas `db/scripts/horarios_schema.sql`, ejecútalo desde una sesión `psql` que soporte metacomandos (`\i`).

## Log: API keys de ingesta

Genera una API key por app del ecosistema para enviar logs a la app Log:

```bash
node db/scripts/generate-log-api-keys.js
```

- Imprime las claves crudas por consola: copia cada una al entorno de su app (`LOGS_API_KEY`).
- Escribe el SQL con hashes SHA-256 en `db/scripts/generated/log-api-keys.sql` (seguro de versionar).
- Aplica el SQL con: `psql "$DATABASE_URL" -f db/scripts/generated/log-api-keys.sql`.
- Regenerar claves por entorno (staging/producción); nunca reutilizar claves impresas en sesiones previas.

Variables de ingesta por app emisora: `LOGS_API_URL` (endpoint `/api/logs` de la app log) y `LOGS_API_KEY`.

## Orden sugerido por entorno

- `staging`
  1. `pnpm db:scripts:validate`
  2. `pnpm db:link`
  3. `pnpm db:migrate`
  4. `pnpm db:push`
  5. Verificar tablas/policies y smoke tests de app

- `producción`
  1. `pnpm db:scripts:validate`
  2. `pnpm db:link`
  3. `pnpm db:migrate`
  4. `pnpm db:push`
  5. Verificar health endpoint y métricas post-deploy

## Nota

Para Horarios, la app ya tiene fallback local en runtime si faltan credenciales de Supabase, pero en staging/producción se recomienda operar siempre con DB remota para métricas y tracking reales.
