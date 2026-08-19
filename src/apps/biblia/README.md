# Biblia

Aplicación web `0102_biblia` del ecosistema Fósforo.

## Alcance inicial

- Lectura por libro y capítulo sobre la versión activa.
- Búsqueda textual simple.
- Lecturas del día para Rito Romano Argentina.
- Endpoints internos sobre Supabase.

## Variables de entorno

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BIBLIA_INTERNAL_INGESTION_KEY` para proteger `POST /api/internal/ingestion/run`

## Comandos

- `pnpm --filter biblia dev`
- `pnpm --filter biblia check-types`
- `pnpm --filter biblia test:unit`
- `pnpm --filter biblia build`

## Ingestión interna

La ruta `POST /api/internal/ingestion/run` quedó protegida pero todavía responde `501` porque la ejecución automática no está implementada.

Autorización esperada:

- Header `x-biblia-ingestion-key: <BIBLIA_INTERNAL_INGESTION_KEY>`
- o `Authorization: Bearer <BIBLIA_INTERNAL_INGESTION_KEY>`

## Documentación

La documentación completa está en `docs/02-Aplicaciones/FASE_1-0102_biblia/WEB/`:

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
