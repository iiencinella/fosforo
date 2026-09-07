---
tags:
  - proyecto/fosforo
  - aplicacion
  - motor-liturgico
  - fase-2
type: app-readme
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Iván Ezequiel Iencinella
related:
  - "[[../00-README|Indice de aplicaciones]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Datos-y-Taxonomias-Compartidas|SRS Datos y Taxonomias]]"
---

# Motor Liturgico

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

El Motor Liturgico es el servicio centralizado del ecosistema Fosforo que resuelve el calendario liturgico catolico (rito romano). Dada una fecha, el Motor retorna el ciclo liturgico correspondiente (A, B o C), la celebracion del dia, las lecturas (referenciadas al CMS), el color o colores liturgicos y el tipo de fiesta (solemnidad, fiesta, memoria o feria). Expone una API REST consumida por las aplicaciones Misal, Visita 7 Iglesias y Lectio Divina, asi como por cualquier app del ecosistema que necesite informacion liturgica.

El Motor separa la logica calendrica (propia del Motor) del contenido textual de lecturas, oraciones y antifonas (propiedad del CMS). Esta separacion permite actualizar el calendario sin modificar las apps consumidoras y mantener el contenido editorial en un unico lugar.

## Validacion de la idea

- Las apps de contenido liturgico (Misal, Visita 7 Iglesias, Lectio Divina) necesitan calculo calendario-centralizado; sin Motor, cada app duplicaria la logica de Pascua, ciclos y precedencias.
- El Motor permite actualizar el calendario liturgico en un solo lugar sin tocar cada app consumidora, reduciendo riesgo de inconsistencias y costo de mantenimiento.
- Centralizar el calculo garantiza consistencia: todas las apps muestran la misma celebracion, color y ciclo para una misma fecha.

## Arquitectura

- **Frontend:** Astro 6 (SSR) + React 19 + Tailwind CSS v4 + `@repo/ui` para panel admin de celebraciones excepcionales.
- **Backend:** Astro API routes (REST) en `src/apps/motor-liturgico/src/pages/api/liturgia/`.
- **Datos:** Supabase PostgreSQL con tablas `liturgical_years`, `liturgical_celebrations`, `liturgical_readings`, `liturgical_seasons`. RLS activa.
- **Integracion:** CMS (contenido textual de lecturas), Sistema de Logueo (Auth), app Log (RUM), Sistema de Notificaciones (alertas liturgicas).

## Estado de implementacion

- **Completado:** ninguno (documento en fase draft, app a crear en `src/apps/motor-liturgico/`).
- **En curso:** definicion de requisitos, arquitectura y especificacion tecnica.
- **Pendiente:** implementacion del calculo liturgico, API REST, integracion CMS, panel admin, tests unitarios, despliegue.

## Ubicacion del codigo

- App: `src/apps/motor-liturgico/`
- Componentes: `src/apps/motor-liturgico/src/components/`
- Estilos: `src/apps/motor-liturgico/src/styles/` + `@repo/ui/styles.css`
- Contenido: contenido liturgico gestionado via CMS; Motor solo guarda referencias (`cms_entry_id`).
- API: `src/apps/motor-liturgico/src/pages/api/liturgia/`
- Lib: `src/apps/motor-liturgico/src/lib/` (`compute.ts`, `pascua.ts`, `cache.ts`)

## Alcance MVP

- Calculo de fecha a celebracion liturgica (ciclo A/B/C, nombre, tipo, color).
- API REST `GET /api/liturgia/{fecha}` con respuesta JSON estructurada.
- Colores liturgicos por celebracion y tiempo liturgico.
- Tipos de fiesta: solemnidad, fiesta, memoria, feria.
- Calculo de Pascua y fiestas moviles (Miercoles de Ceniza, Ascension, Pentecostes, etc.).
- Integracion con CMS para referencias a textos de lecturas.
- Integracion RUM (pageviews y eventos) via app Log.
- Soporte para años 2000-2100.

## No alcance MVP

- Calendarios propios de otras iglesias (solo rito romano).
- Santos patronales locales o diocesanos personalizados (post-MVP).
- Multi-idioma para nombres de celebraciones (el contenido multilingue se gestiona en el CMS).
- Edicion colaborativa del calendario en tiempo real.
- Exportacion a formatos externos (iCalendar, Google Calendar).

## KPI principal

- p95 de latencia de API < 100 ms.
- 100% de apps liturgicas del ecosistema integradas al Motor.
- Determinismo: misma fecha produce siempre el mismo resultado (0% de variacion entre llamadas).

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | draft  |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | draft  |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | draft  |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | draft  |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | draft  |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificacion Tecnica](09-Especificaci%C3%B3n%20Tecnica.md)      | draft  |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | draft  |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | draft  |

## Documentos complementarios

| Documento                                                        | Descripcion                                                    | Estado |
| ---------------------------------------------------------------- | -------------------------------------------------------------- | ------ |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)                    | Matriz de pruebas unitarias con Vitest y trazabilidad FR -> TC | draft  |
| [09-Especificacion Tecnica](09-Especificaci%C3%B3n%20Tecnica.md) | Stack, modulos, endpoints y consideraciones UI/UX del Motor    | draft  |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboracion y mantenimiento de la documentacion de la app.
