---
tags:
  - proyecto/fosforo
  - aplicacion
  - misal
  - srs
type: app-srs
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Misal]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
---

# SRS - Misal

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `FR-MISAL-*`, `NFR-MISAL-*`, `IR-MISAL-*`, `CA-MISAL-*`
- Plataforma: WEB
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-09-05
- Estado: draft

## 2. Proposito y alcance tecnico

App web que muestra el Misal diario: lecturas y oraciones del día resueltas por el Motor Litúrgico y servidas por el CMS. Astro SSR con render estático-cacheado por día; islands de React para navegación y modo lectura. Integración con Sistema de Logueo, Notificaciones, Log (RUM).

## 3. Actores

- Usuario fiel (anónimo): consulta lecturas del día y ordinario; sin sesión.
- Usuario autenticado: además guarda favoritos y preferencias de lectura.
- Sistema CMS (consumido): provee textos de lecturas y oraciones.
- Motor Litúrgico (consumido): resuelve celebración, lecturas y color del día.

## 4. Requisitos funcionales

| ID           | Requisito                                              | Criterio verificable                                                                                           |
| ------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| FR-MISAL-001 | Página del día con lecturas completas y oraciones      | Al abrir `/`, se muestran las 3 lecturas, salmo, evangelio y oración del día según calendario                  |
| FR-MISAL-002 | Navegación por fecha                                   | Selector ayer/hoy/mañana y date picker navegan a `/dia/{fecha}` con contenido de esa fecha                     |
| FR-MISAL-003 | Página del ordinario de la Misa                        | `/ordinario` muestra textos fijos (credito, Santo, Padre Nuestro, etc.)                                        |
| FR-MISAL-004 | Contenido servido desde CMS vía cache                  | Las lecturas se obtienen de `GET {CMS}/api/content/lectura` con cache SSR de 1h                                |
| FR-MISAL-005 | Resolución litúrgica vía Motor Litúrgico               | Se consulta `GET {MOTOR}/api/liturgia/{fecha}` con cache SSR de 24h                                            |
| FR-MISAL-006 | Visualización de color litúrgico y tipo de celebración | Badge con color y nombre de celebración visible en la cabecera del día                                         |
| FR-MISAL-007 | Modo lectura con modo oscuro y tamaño de fuente        | Toggle persiste preferencia en localStorage; tipografía serif optimizada                                       |
| FR-MISAL-008 | Favoritos y preferencias para usuario autenticado      | Usuario con sesión puede marcar lecturas como favoritas y verlas en `/favoritos`                               |
| FR-MISAL-009 | RUM: pageviews, Web Vitals y eventos de producto       | SDK `@repo/analytics` integrado; eventos `misal.home.viewed`, `misal.lectio.started`, `misal.lectio.completed` |
| FR-MISAL-010 | Reporte de error de contenido                          | Botón "Reportar problema" en cada lectura abre formulario que registra evento en Log                           |
| FR-MISAL-011 | Recordatorio diario opt-in                             | Usuario autenticado activa recordatorio; Notificaciones envía push/email diario                                |

## 5. Requisitos no funcionales

| ID            | Requisito      | Objetivo                                                                                |
| ------------- | -------------- | --------------------------------------------------------------------------------------- |
| NFR-MISAL-001 | Rendimiento    | LCP < 2.5s en 75% de cargas; TTFB < 800ms                                               |
| NFR-MISAL-002 | Disponibilidad | 99.5% mensual; fallback con última versión cacheada si CMS/Motor caen                   |
| NFR-MISAL-003 | Accesibilidad  | WCAG 2.2 AA; navegación por teclado; lecturas con estructura semántica (h1-h3, article) |
| NFR-MISAL-004 | Responsividad  | Optimizado para móvil (80% del tráfico esperado); menú hamburguesa según estándar       |
| NFR-MISAL-005 | Privacidad     | RUM sin PII; consentimiento gestionado por SDK; DNT respetado                           |

## 6. Integraciónes

| ID           | Integración               | Contrato                                                      | Version |
| ------------ | ------------------------- | ------------------------------------------------------------- | ------- |
| IR-MISAL-001 | CMS                       | `GET /api/content/lectura?fecha=YYYY-MM-DD` con API key       | v1      |
| IR-MISAL-002 | Motor Litúrgico           | `GET /api/liturgia/{fecha}`                                   | v1      |
| IR-MISAL-003 | Sistema de Logueo         | Supabase Auth (SSO) para favoritos y preferencias             | v1      |
| IR-MISAL-004 | Sistema de Notificaciones | Evento `misal.reminder.daily` opt-in                          | v1      |
| IR-MISAL-005 | Log (RUM)                 | SDK `@repo/analytics`: pageviews, vitals, eventos de producto | v1      |
| IR-MISAL-006 | Log (operativo)           | `@repo/api-utils/log-client` para logs de error               | v1      |

## 7. Criterios de aceptación

| ID           | Criterio                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------ |
| CA-MISAL-001 | Un usuario anónimo abre `/` y ve lecturas completas del día en < 3s con color litúrgico correcto |
| CA-MISAL-002 | Navegando a una fecha futura, la página muestra las lecturas de esa fecha según el calendario    |
| CA-MISAL-003 | Usuario autenticado guarda una lectura como favorita y la encuentra en `/favoritos`              |
| CA-MISAL-004 | El SDK RUM reporta pageview y Web Vitals de cada página sin configuración adicional              |
| CA-MISAL-005 | Si el CMS no responde, la página muestra la última versión cacheada con banner de degradación    |
| CA-MISAL-006 | Un reporte de error de contenido queda registrado en Log con app=misal                           |

## 8. Trazabilidad PRD -> SRS

| PRD           | SRS                                      |
| ------------- | ---------------------------------------- |
| PRD-MISAL-001 | FR-MISAL-001, FR-MISAL-004, FR-MISAL-005 |
| PRD-MISAL-002 | FR-MISAL-002                             |
| PRD-MISAL-003 | FR-MISAL-003                             |
| PRD-MISAL-004 | FR-MISAL-004                             |
| PRD-MISAL-005 | FR-MISAL-005, FR-MISAL-006               |
| PRD-MISAL-006 | FR-MISAL-007                             |
| PRD-MISAL-007 | FR-MISAL-008, IR-MISAL-003               |
| PRD-MISAL-008 | FR-MISAL-009, IR-MISAL-005               |
| PRD-MISAL-009 | FR-MISAL-011, IR-MISAL-004               |
