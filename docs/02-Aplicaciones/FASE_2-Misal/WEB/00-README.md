---
tags:
  - proyecto/fosforo
  - aplicacion
  - misal
  - fase-2
type: app-readme
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[../00-README|Indice de aplicaciones]]"
  - "[[../../FASE_2-Motor-Liturgico/WEB/00-README|App Motor Liturgico]]"
  - "[[../../FASE_2-Sistema-de-Contenidos-CMS/WEB/00-README|App CMS]]"
---

# Misal

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Metadatos

- Plataforma: WEB
- Estado: draft
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-09-05

## Descripcion

Aplicación web del Misal Romano dentro del ecosistema Fósforo. Permite a usuarios consultar el ordinario de la Misa, las oraciones y las lecturas del día según el calendario litúrgico. El contenido textual proviene del CMS; la resolución del calendario (celebración, lecturas del día, color litúrgico) proviene del Motor Litúrgico.

## Validación de la idea

- Los fieles necesitan acceso al Misal diario (lecturas del día, oraciones, ordinario) en un formato legible y responsivo.
- Un Misal conectado al Motor Litúrgico se actualiza automáticamente con el calendario, sin intervención manual.
- El contenido gestionado en el CMS garantiza uniformidad y trazabilidad editorial.

## Arquitectura

- **Frontend:** Astro 6 + React 19 (islands) + Tailwind CSS v4 + `@repo/ui`
- **Backend:** Astro API endpoints (SSR) + Supabase (PostgreSQL, Auth, RLS)
- **Datos:** consumo de APIs del CMS (`/api/content/*`) y del Motor Litúrgico (`/api/liturgia/{fecha}`)
- **Integración:** Sistema de Logueo (Auth), app Log (RUM + logs), Sistema de Notificaciones (recordatorios)

## Estado de implementación

- **Completado:** Sin implementación. Documentación draft generada en 2026-09-05.
- **En curso:** Ninguno.
- **Pendiente:** Implementación completa del MVP (depende de CMS y Motor Litúrgico).

## Ubicación del codigo

- App: `src/apps/misal/` (a crear)
- Componentes: `src/apps/misal/src/components/`
- Estilos: `src/apps/misal/src/styles/` + `src/packages/tailwind-config/` + `src/packages/ui/`
- API: `src/apps/misal/src/pages/api/` (proxy interno si aplica)

## Alcance MVP

| ID            | Funcionalidad                                                                              | Prioridad |
| ------------- | ------------------------------------------------------------------------------------------ | --------- |
| MISAL-MVP-001 | Página principal con lecturas y oraciones del día (según calendario del Motor Litúrgico)   | Must      |
| MISAL-MVP-002 | Navegación por fecha (ayer, hoy, mañana, selector de fecha)                                | Must      |
| MISAL-MVP-003 | Ordinario de la Misa (textos fijos) consultable                                            | Must      |
| MISAL-MVP-004 | Lecturas del día con texto completo (referenciado del CMS)                                 | Must      |
| MISAL-MVP-005 | Visualización del color litúrgico y tipo de celebración                                    | Must      |
| MISAL-MVP-006 | Modo lectura (tipografía optimizada, modo oscuro)                                          | Should    |
| MISAL-MVP-007 | Autenticación (Sistema de Logueo) para guardar favoritos y preferencias                    | Should    |
| MISAL-MVP-008 | Integración RUM: pageviews, Web Vitals, eventos de producto (`misal.lectio.started`, etc.) | Must      |
| MISAL-MVP-009 | Recordatorio diario de lecturas via Sistema de Notificaciones                              | Could     |

## No alcance MVP

- Misal completo impreso (todas las misas del año en formato libro)
- Misas de difuntos, rituales y votivas (post-MVP)
- Multi-idioma (solo español en MVP)
- Audio de lecturas (post-MVP)
- Modo offline completo (post-MVP)

## KPI principal

- Usuarios que consultan lecturas del día diariamente (DAU / MAU)
- Latencia p95 de carga de página principal < 2s
- Web Vitals: LCP < 2.5s (good) en 75% de cargas

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | draft  |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | draft  |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | draft  |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | draft  |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | draft  |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificación Tecnica](09-Especificacion%20Tecnica.md)           | draft  |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | draft  |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | draft  |

## Documentos complementarios

| Documento                                                   | Descripcion                              | Estado |
| ----------------------------------------------------------- | ---------------------------------------- | ------ |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)               | Estrategia y matriz de pruebas unitarias | draft  |
| [09-Especificación Tecnica](09-Especificacion%20Tecnica.md) | Stack, modulos e implementación          | draft  |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
- Depende de: CMS (contenido), Motor Litúrgico (calendario), Sistema de Logueo (auth), Log (RUM), Notificaciones (recordatorios).
