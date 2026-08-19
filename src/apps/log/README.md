# Log App

Aplicación web de observabilidad del ecosistema Fósforo (`0105_log`).

## Alcance actual

- Login con Supabase Auth (`dev` / `ops` via `app_metadata.role`).
- Listado de logs con filtros por nivel, app y busqueda.
- Detalle de log por ID.
- Dashboard operativo con metricas y grafico horario (React island).
- API de ingesta `POST /api/logs` con API key hasheada.

## Variables de entorno

Definir en `src/apps/log/.env` o en la raiz del workspace:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Variables necesarias para operaciones DB via scripts (raiz):

- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`

## Scripts

- `pnpm --filter log dev`
- `pnpm --filter log check-types`
- `pnpm --filter log test:unit`
- `pnpm --filter log build`

## Migraciones relacionadas

- `db/supabase/migrations/202605260002_create_log_core.sql`

Incluye tablas `log_entries` y `api_keys` con politicas RLS y seed de API key dev.

## Documentación

La documentación completa está en `docs/02-Aplicaciones/FASE_1-0105_log/WEB/`:

| Documento                          | Descripción                                  |
| ---------------------------------- | -------------------------------------------- |
| `00-README.md`                     | Contexto, owners y alcance del producto      |
| `01-PRD.md`                        | Necesidad de producto y objetivos            |
| `02-SRS.md`                        | Requisitos verificables del sistema          |
| `03-FRD.md`                        | Comportamiento funcional y reglas de negocio |
| `04-Flujos y Secuencias.md`        | Recorridos de usuario y escenarios           |
| `05-Tests Unitarios.md`            | Estrategia de validación                     |
| `06-Esquema de Datos.md`           | Entidades y relaciones                       |
| `07-ERM.md`                        | Riesgos, errores y runbooks                  |
| `08-Decisiones de Arquitectura.md` | Decisiones clave y trade-offs                |
| `09-Especificación Tecnica.md`     | Stack, módulos e implementación              |
| `10-OWASP.md`                      | Controles y evidencias de seguridad          |
| `11-SLA y SLO.md`                  | Compromisos operativos                       |
