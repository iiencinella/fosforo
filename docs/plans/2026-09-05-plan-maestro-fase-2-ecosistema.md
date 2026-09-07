---
tags:
  - proyecto/fosforo
  - plan
  - ecosistema
  - fase-2
type: plan-maestro
area: general
status: vigente
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[README|Indice de documentación]]"
  - "[[03-Indice-General|Indice General]]"
  - "[[2026-09-05-auditoria-horarios-migracion|Auditoria Horarios]]"
  - "[[2026-09-05-plan-desarrollo-fase-0|Plan Desarrollo Fase 0]]"
---

# Plan Maestro Fase 2 - Ecosistema Fósforo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Estado de ejecución (2026-09-05)

Todos los bloques de documentación fueron ejecutados (solo documentación, sin código):

| Bloque | Alcance                                                                                                          | Estado     |
| ------ | ---------------------------------------------------------------------------------------------------------------- | ---------- |
| A      | Capacidades transversales (SRS Observabilidad+RUM, Identidad, Notificaciones, Catalogo)                          | Completado |
| B      | 4 apps de plataforma (CMS, Motor Liturgico, Notificaciones, Logueo): 48 docs                                     | Completado |
| C      | Reescritura Log con RUM/Analiticas: 12 docs                                                                      | Completado |
| D      | 6 apps de contenido (Misal, Santopedia, Oraciones, Vida de Misionero, Visita 7 Iglesias, Lectio Divina): 72 docs | Completado |
| E      | Auditoria Horarios (solo lectura): 1 documento con 11 gaps                                                       | Completado |
| F      | Indices, matriz, sync, cierre                                                                                    | Completado |

Total: 133 documentos escritos/actualizados. Matriz y listados regenerados con `pnpm docs:sync-app-status` (aliases corregidos en `scripts/docs-sync-app-status.mjs`; "Auth" unificado como alias de "Sistema de Logueo").

Ver: [Auditoria de migración de Horarios](2026-09-05-auditoria-horarios-migracion.md).

## Objetivo

Consolidar la base de plataforma del ecosistema (contenidos, liturgia, notificaciones, identidad, observabilidad con RUM y analíticas) antes de construir las aplicaciones de contenido y comunidad. La regla es **base primero, contenido después**.

## Principio rector

- Documentación primero, código después (AGENTS.md). Toda app pasa por scaffold documental `00-README` a `11-SLA y SLO` y `pnpm docs:sync-app-status`.
- Reutilizar `src/packages/ui`, `@repo/tailwind-config`, `@repo/api-utils`, `@repo/auth` y `@repo/notification-core` antes de crear soluciones ad-hoc.
- Toda app nueva integra RUM y analíticas desde el día 1.

## Bloques de trabajo

### Bloque 1 - Base de plataforma (revisar primero)

| #   | Tópico                             | Carpeta documental                     | Estado previo                                           | Acción                                                                                                                                 |
| --- | ---------------------------------- | -------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Sistema de Contenidos (CMS)        | `FASE_2-Sistema-de-Contenidos-CMS/WEB` | Sin docs                                                | Documentado (draft). Publicación y gestión de contenido estructurado, base de Misal, Santopedia, Oraciones.                            |
| 2   | Motor Litúrgico                    | `FASE_2-Motor-Liturgico/WEB`           | Sin docs                                                | Documentado (draft). Resolución calendario + lecturas + textos propios litúrgicos.                                                     |
| 3   | Sistema de Notificaciones          | `FASE_2-Sistema-de-Notificaciones/WEB` | Sin paquete formal (existe `notification-core` parcial) | Documentado (draft). Orquestación multicanal, plantillas, preferencias.                                                                |
| 4   | Sistema de Logueo / Auth           | `FASE_1-Sistema-de-Logueo/WEB`         | Sin docs (matriz con Auth/Logueo sin documentar)        | Documentado (draft). SSO Supabase Auth + roles de ecosistema. Desambiguado vs app `Log` (observabilidad) adaptador de esta definición. |
| 5   | Sistema de Logueo/RUM + Analíticas | `FASE_1-0105_log/WEB` (existente)      | MVP vigente (logs operativos)                           | Reescrito: extensión RUM (pageviews, Web Vitals, errores frontend, eventos de producto) y dashboards de analíticas.                    |

### Bloque 2 - Piloto de migración

| #   | Tópico                   | Carpeta                                          | Acción                                                                                                                                           |
| --- | ------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 6   | Migrar Horarios de Misas | `FASE_1-0106_horarios/WEB` + `src/apps/horarios` | Auditoria y alineación: adopta Auth, CMS, Notificaciones, RUM y UI compartida. Fue el piloto de base y queda como referencia de una app migrada. |

### Bloque 3 - Apps de contenido y comunidad (tras bloque 1)

| #   | Tópico            | Carpeta documental             | Dependencias                                  |
| --- | ----------------- | ------------------------------ | --------------------------------------------- |
| 7   | Misal             | `FASE_2-Misal/WEB`             | CMS + Motor Litúrgico + Auth + RUM            |
| 8   | Santopedia        | `FASE_2-Santopedia/WEB`        | CMS + Búsqueda + RUM                          |
| 9   | Oraciones         | `FASE_2-Oraciones/WEB`         | CMS + Notificaciones + Auth + RUM             |
| 10  | Vida de Misionero | `FASE_2-Vida-de-Misionero/WEB` | CMS + Auth + Notificaciones + RUM             |
| 11  | Visita 7 Iglesias | `FASE_2-Visita-7-Iglesias/WEB` | Motor Litúrgico (Cuaresma) + CMS + Auth + RUM |
| 12  | Lectio Divina     | `FASE_2-Lectio-Divina/WEB`     | CMS + Motor Litúrgico + Auth + RUM            |

## Matriz de decisión clave

- **RUM/Analíticas**: extensión de la app `Log` existente (`src/apps/log`) en lugar de app nueva. Motivo: ya posee ingesta con API key, rate limiting, RLS y dashboard dev/ops; la telemetría de usuario comparte infraestructura y agrega solo un pipeline y vistas de producto.
- **Lectio Divina**: asignada a Fase 2 (antes sin fase en matriz) por depender de Motor y CMS.
- **Auth/Logueo vs Log**: documentados como apps distintas. `Sistema de Logueo` = identidad y acceso; `Log` = observabilidad operativa + RUM. El nombre previo en matriz queda resuelto como "Sistema de Logueo" (identidad) y "Log" (observabilidad).

## Riesgos y gaps a fecha 2026-09-05

- El documento `SRS-Observabilidad-y-Auditoria` excluía analítica de producto; quedó ampliado para incluir RUM.
- `notification-core` es parcial: la app `Sistema de Notificaciones` formaliza el servicio completo.
- El bloque 3 reobliga a redocumentar criterios de aceptación si el bloque 1 cambia contratos.
- Se detecta que no existe un paquete compartido de búsqueda; Santopedia lo define como dependencia futura.

## Orden de desarrollo propuesto

> Estado 2026-09-07: la Fase 0 esta COMPLETADA (8 pasos mergeados; ver
> [[2026-09-05-plan-desarrollo-fase-0|Plan de Desarrollo Fase 0]] y
> [[../00-General/12-Novedades-2026-09-07-cierre-fase-0|Novedades]]).
> La proxima etapa es la Fase 1 (CMS -> Motor Liturgico), previa aprobacion
> de los contratos en draft del Bloque B.

### Fase 0 - Infraestructura compartida (prerequisitos de codigo, sin app de usuario) — COMPLETADA 2026-09-07

Los contratos ya documentados se materializan como paquetes/endpointos que todo lo demas consumira:

| Orden | Pieza                                                                                                      | Por que primero                                                                                       | Estado                                                                                                       |
| ----- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 0.1   | Paquete `@repo/analytics` (SDK RUM)                                                                        | Todas las apps lo integran desde el dia 1; sin el, habria que retroceder app por app                  | Hecho (paso 4)                                                                                               |
| 0.2   | App Log: endpoints `/api/rum`, `/api/rum/vitals` + tablas `rum_events`, `rum_vitals`, `rum_sessions` + RLS | El SDK apunta a esta ingesta; sin ella no tiene destino. El dashboard de producto puede venir despues | Hecho (pasos 2-3, 5)                                                                                         |
| 0.3   | Implementacion minima de `notification-core` (plantillas + cola + API de eventos)                          | La consumen Oraciones, Vida de Misionero, Visita 7 y Lectio Divina                                    | Hecho: paquete y esquema DB (pasos 6-7); API de eventos en la app Notificaciones queda para iteracion propia |
| 0.4   | Sistema de Logueo (consolidacion de `@repo/auth` + endpoints)                                              | Evita que Misal/Visita/Lectio reimplementen auth                                                      | Hecho (pasos 1 y 8)                                                                                          |

Pendiente operativo: aplicar las 5 migraciones en staging/produccion,
asignar roles de plataforma a los usuarios actuales de log y E2E con
Supabase real (ver plan de Fase 0).

### Fase 1 - Base de contenido

| Orden | App             | Justificacion                                                                                                 |
| ----- | --------------- | ------------------------------------------------------------------------------------------------------------- |
| 1.1   | CMS             | Fuente de verdad de contenido; ninguna app de Fase 2 se alimenta sin el. Es el proyecto mas grande de la fase |
| 1.2   | Motor Liturgico | Mas acotado (calculo determinista + API). Libera a Misal y Lectio Divina                                      |

### Fase 2 - Piloto de migracion

| Orden | App                           | Justificacion                                                                                                                                                                                        |
| ----- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1   | Horarios de Misas (migracion) | Ya existe e integra logs. Se reconecta a Auth/RUM/Notificaciones y parcialmente al CMS segun la auditoria (11 gaps). Valida los contratos de Fase 0 con una app real antes de construir las 6 nuevas |

### Fase 3 - Apps de contenido

| Orden | App               | Razon del orden                                                                                                                           |
| ----- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1   | Misal             | Mayor demanda diaria y consumidor mas puro de CMS + Motor; valida ambas integraciones en produccion                                       |
| 3.2   | Santopedia        | Consume solo CMS y busqueda; valida buscador y taxonomias                                                                                 |
| 3.3   | Oraciones         | CMS + Notificaciones (recordatorios); valida el canal con un caso simple                                                                  |
| 3.4   | Vida de Misionero | CMS + Auth obligatoria + Notificaciones + logica de progreso (idempotencia, TZ); la mas compleja, despues de tener integraciones probadas |
| 3.5   | Lectio Divina     | Motor + CMS + Auth con el requisito mas duro (RLS del diario); tras probar auth obligatoria con Vida de Misionero                         |
| 3.6   | Visita 7 Iglesias | Motor + CMS + Auth + contexto estacional; menor prioridad critica diaria                                                                  |

### Criterios que sostienen el orden

1. Nada se construye antes de su contrato: los draft del Bloque B deben aprobarse antes de Fase 0/1.
2. RUM y Auth no se reordenan porque todas las apps los integran desde el dia 1.
3. Horarios como piloto entre la plataforma y las apps nuevas detecta errores de contrato con una app que ya existe.
4. Las apps mas dependientes y ricas van al final de Fase 3 para que cada integracion ya este estabilizada.

## Criterios de cierre del bloque 1

- Cada capacidad con `01-PRD`, `02-SRS` y `03-FRD` aprobados (no draft).
- Contratos publicados como paquetes en `src/packages/` o como apps en `src/apps/`.
- Tests unitarios alineados con `05-Tests Unitarios.md` de cada app.
- Matriz de trazabilidad actualizada mediante `pnpm docs:sync-app-status`.

## Referencias

- `docs/00-General/04-Listado-de-Aplicaciones.md` (matriz de estado).
- `docs/01-Arquitectura/Capacidades Compartidas/Catalogo-de-Capacidades-Compartidas.md`.
- `docs/01-Arquitectura/Capacidades Compartidas/SRS-Identidad-y-Acceso.md`.
- `docs/01-Arquitectura/Capacidades Compartidas/SRS-Observabilidad-y-Auditoria.md`.
- `docs/01-Arquitectura/Capacidades Compartidas/SRS-Notificaciónes-y-Plantillas.md`.
- `docs/02-Aplicaciones/FASE_1-0105_log/WEB/00-README.md` (MVP de Log previo a RUM).
- `docs/02-Aplicaciones/FASE_1-0106_horarios/WEB/00-README.md` (piloto de migración).
