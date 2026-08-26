# Indice - Aplicaciones

> Este indice se actualiza automaticamente con `pnpm docs:new-app` y `pnpm docs:sync-app-status`.

> El indice refleja aplicaciónes con documentación generada. No implica que ya exista un workspace implementado en `src/apps/`, `src/mobile/` o `src/desktop/`.

## Estructura

- Carpeta app: `FASE_[N]-[NOMBRE]`
- Carpeta plataforma: `WEB`, `MOVIL` o `DESKTOP`

## Orden canonico de documentos por app

| Documento | Se basa en | Genera |
| --- | --- | --- |
| `01-PRD.md` | Idea | `02-SRS.md` |
| `02-SRS.md` | `01-PRD.md` | `03-FRD.md` |
| `03-FRD.md` | `02-SRS.md` | `04-Flujos y Secuencias.md` |
| `04-Flujos y Secuencias.md` | `03-FRD.md` | `05-Tests Unitarios.md` |
| `06-Esquema de Datos.md` / `07-ERM.md` | `02-SRS.md` | `08-Decisiones de Arquitectura.md` |
| `08-Decisiones de Arquitectura.md` | `02-SRS.md` + `03-FRD.md` | `09-Especificación Tecnica.md` |
| `10-OWASP.md` | `08-Decisiones de Arquitectura.md` | Definiciones tecnicas y controles |
| `11-SLA y SLO.md` | `01-PRD.md` | Definiciones tecnicas y operativas |

Notas:

- `07-ERM.md` se mantiene como documento obligatorio del ecosistema y acompana el eje de datos/arquitectura para riesgos, operación y continuidad.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento dentro de cada app.

## Aplicaciones generadas

<!-- apps-generated-table:start -->
| Fase | App | Plataforma | Ruta |
| --- | --- | --- | --- |
| 1 | Panel de Administración | WEB | [./FASE_1-0107_administracion/WEB/](./FASE_1-0107_administracion/WEB/) |
| 1 | Biblia | WEB | [./FASE_1-0102_biblia/WEB/](./FASE_1-0102_biblia/WEB/) |
| 1 | Calendario Liturgico | WEB | [./FASE_1-0103_calendario/WEB/](./FASE_1-0103_calendario/WEB/) |
| 1 | Horarios de Misas | WEB | [./FASE_1-0106_horarios/WEB/](./FASE_1-0106_horarios/WEB/) |
| 1 | Log | WEB | [./FASE_1-0105_log/WEB/](./FASE_1-0105_log/WEB/) |
| 1 | Fósforo Portal | WEB | [./FASE_1-0101_portal/WEB/](./FASE_1-0101_portal/WEB/) |
| 1 | Gestion de Usuarios | WEB | [./FASE_1-0104_usuarios/WEB/](./FASE_1-0104_usuarios/WEB/) |
| 4 | Cancionero | WEB | [./FASE_4-0401_cancionero/WEB/](./FASE_4-0401_cancionero/WEB/) |
<!-- apps-generated-table:end -->

## Estado actual de implementación del repo

<!-- app-implementation-status:start -->
- `src/apps/`: `src/apps/administracion`, `src/apps/biblia`, `src/apps/calendario`, `src/apps/cancionero`, `src/apps/horarios`, `src/apps/log`, `src/apps/portal`, `src/apps/usuario`.
- `src/mobile/`: sin workspaces implementados actualmente.
- `src/desktop/`: sin workspaces implementados actualmente.
- `src/packages/`: paquetes compartidos activos `api-utils`, `auth`, `env`, `eslint-config`, `mobile-auth-client`, `notification-core`, `tailwind-config`, `typescript-config`, `ui`.
<!-- app-implementation-status:end -->

Cuando se implemente una app nueva, su workspace debe crearse en `src/<plataforma>/` y mantenerse alineado con su carpeta documental en `docs/02-Aplicaciones/`.
