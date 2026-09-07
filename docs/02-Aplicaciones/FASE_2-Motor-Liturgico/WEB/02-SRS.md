---
tags:
  - proyecto/fosforo
  - aplicacion
  - motor-liturgico
  - fase-2
  - srs
type: app-srs
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Iván Ezequiel Iencinella
related:
  - "[[00-README|Motor Liturgico]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
---

# SRS - Motor Liturgico

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `FR-MOTOR-LIT-*`, `NFR-MOTOR-LIT-*`, `IR-MOTOR-LIT-*`, `CA-MOTOR-LIT-*`
- Plataforma: WEB
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-09-05
- Estado: draft

## 2. Proposito y alcance tecnico

El Motor Liturgico es un servicio backend (Astro SSR + API routes) que resuelve el calendario liturgico catolico (rito romano) de forma determinista. Recibe una fecha como entrada y retorna el ciclo liturgico (A/B/C), la celebracion del dia, las lecturas (referenciadas al CMS), el color o colores liturgicos y el tipo de fiesta. El Motor no almacena ni sirve el contenido textual de lecturas; mantiene referencias (`cms_entry_id`) al CMS. El alcance del MVP cubre años 2000 a 2100, rito romano, y expone una API REST consumida por las apps del ecosistema.

## 3. Actores

- **App consumidora (sistema):** Aplicacion del ecosistema (Misal, Visita 7 Iglesias, Lectio Divina) que consulta la API del Motor para obtener informacion liturgica por fecha.
- **Editor de calendario (admin):** Usuario autenticado con rol de editor que gestiona celebraciones excepcionales y actualizaciones del calendario via panel admin.
- **Sistema (RUM):** App Log que recibe telemetria de pageviews y eventos del Motor para observabilidad.

## 4. Requisitos funcionales

| ID               | Requisito                                                                    | Criterio verificable                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| FR-MOTOR-LIT-001 | Calcular la celebracion liturgica para una fecha dada                        | Dada una fecha ISO 8601 (YYYY-MM-DD), el Motor retorna ciclo, nombre, tipo y color de la celebracion en menos de 100 ms p95              |
| FR-MOTOR-LIT-002 | Devolver el color o colores liturgicos asociados a la celebracion            | La respuesta incluye uno o mas colores del conjunto {verde, rojo, blanco, morado, rosado, negro}                                         |
| FR-MOTOR-LIT-003 | Devolver el tipo de fiesta de la celebracion                                 | La respuesta incluye el tipo: solemnidad, fiesta, memoria, feria o memorial                                                              |
| FR-MOTOR-LIT-004 | Exponer API REST `GET /api/liturgia/{fecha}` con respuesta JSON estructurada | La API responde 200 con JSON para fechas validas y 400/404 para fechas fuera de rango o invalidas                                        |
| FR-MOTOR-LIT-005 | Calcular Pascua y fiestas moviles derivadas                                  | Pascua se calcula con algoritmo de Gauss; Miercoles de Ceniza, Ascension, Pentecostes y Trinidad se derivan correctamente                |
| FR-MOTOR-LIT-006 | Integrar con el CMS para referencias a textos de lecturas                    | Cada celebracion incluye `liturgical_readings` con referencias `cms_entry_id` resolvibles en el CMS                                      |
| FR-MOTOR-LIT-007 | Mantener cache de calculo liturgico precalculado por año                     | El calculo de un año completo se precalcula y se almacena en PostgreSQL; las consultas por fecha leen de cache, no recalculan en runtime |
| FR-MOTOR-LIT-008 | Enviar telemetria RUM (pageviews y eventos) a la app Log                     | Cada llamada a la API registra un evento RUM con fecha, endpoint y latencia; sin PII                                                     |

## 5. Requisitos no funcionales

| ID                | Requisito                 | Objetivo                                                                                  |
| ----------------- | ------------------------- | ----------------------------------------------------------------------------------------- |
| NFR-MOTOR-LIT-001 | Disponibilidad            | 99.9% uptime mensual                                                                      |
| NFR-MOTOR-LIT-002 | Rendimiento               | p95 < 100 ms para `GET /api/liturgia/{fecha}`; p99 < 250 ms                               |
| NFR-MOTOR-LIT-003 | Determinismo              | Misma fecha produce siempre el mismo resultado (calculo determinista, idempotente)        |
| NFR-MOTOR-LIT-004 | Rango de fechas soportado | años 2000 a 2100 inclusive; fechas fuera de rango responden 400 con mensaje claro         |
| NFR-MOTOR-LIT-005 | Seguridad                 | Autenticacion Supabase Auth; RLS en todas las tablas; rate limiting en endpoints publicos |

## 6. Integraciones

| ID               | Integracion               | Contrato                                                  | Version |
| ---------------- | ------------------------- | --------------------------------------------------------- | ------- |
| IR-MOTOR-LIT-001 | Supabase Auth             | Autenticacion JWT para panel admin y API admin            | v1      |
| IR-MOTOR-LIT-002 | CMS (contenido liturgico) | Referencia por `cms_entry_id`; Motor no duplica contenido | v1      |
| IR-MOTOR-LIT-003 | App Log (RUM)             | Eventos de pageviews y latencia; sin PII                  | v1      |
| IR-MOTOR-LIT-004 | Sistema de Notificaciones | Webhook para alertas liturgicas (solemnidades destacadas) | v1      |

## 7. Criterios de aceptacion

| ID               | Criterio                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| CA-MOTOR-LIT-001 | Dada la fecha `2026-12-25`, el Motor retorna Navidad (solemnidad, color blanco, ciclo A)                               |
| CA-MOTOR-LIT-002 | Dada una fecha en Cuaresma (ej. `2026-02-18`, Miercoles de Ceniza), el Motor retorna feria/memoria con color morado    |
| CA-MOTOR-LIT-003 | Dada la fecha `2026-04-05` (Pascua 2026), el Motor retorna Domingo de Pascua (solemnidad, blanco)                      |
| CA-MOTOR-LIT-004 | Dada una fecha fuera de rango (ej. `1999-01-01`), el Motor responde 400 con mensaje "Fecha fuera de rango (2000-2100)" |
| CA-MOTOR-LIT-005 | Todas las celebraciones incluyen al menos una referencia `cms_entry_id` a una lectura en el CMS                        |

## 8. Trazabilidad PRD -> SRS

| PRD               | SRS                                |
| ----------------- | ---------------------------------- |
| PRD-MOTOR-LIT-001 | FR-MOTOR-LIT-001                   |
| PRD-MOTOR-LIT-002 | FR-MOTOR-LIT-002, FR-MOTOR-LIT-003 |
| PRD-MOTOR-LIT-003 | FR-MOTOR-LIT-004                   |
| PRD-MOTOR-LIT-004 | FR-MOTOR-LIT-006                   |
| PRD-MOTOR-LIT-005 | FR-MOTOR-LIT-005                   |
| PRD-MOTOR-LIT-006 | FR-MOTOR-LIT-008                   |
