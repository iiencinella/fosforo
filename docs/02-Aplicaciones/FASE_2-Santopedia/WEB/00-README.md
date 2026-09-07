---
tags:
  - proyecto/fosforo
  - santopedia
  - aplicación
  - web
  - enciclopedia
type: app-readme
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[../00-README|Indice de aplicaciónes]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
  - "[[../../01-Arquitectura/README|Arquitectura general]]"
---

# Santopedia

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Metadatos

- Plataforma: WEB
- Estado: draft
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-09-05

## Descripción

Santopedia es la enciclopedia de santos del ecosistema Fósforo: una aplicación web (Astro 6 SSR + React 19) de consulta y búsqueda centralizada que ofrece la biografía de los santos, sus patronazgos, su fiesta litúrgica (fecha resuelta por el Motor Litúrgico del ecosistema), su iconografía y sus atributos característicos.

Santopedia no es un editor de contenido: es el frontend de consulta y búsqueda de un content type `santo` administrado en el CMS del ecosistema. La aplicación consume ese contenido, lo presenta con una experiencia propia y le agrega capas de valor: listados alfabéticos y por categoría, buscador por nombre y patronazgo, santo del día, favoritos para usuarios autenticados, reporte de errores de contenido y telemetría RUM.

La regla que gobierna el diseño es doble: el contenido SIEMPRE proviene del CMS (nunca se duplica ni se hardcodea en la app) y la fecha de fiesta SIEMPRE se resuelve contra el Motor Litúrgico (nunca desde tablas estáticas ni desde campos de fecha crudos del CMS).

## Validación de la idea

- **Contenido disperso:** hoy la información sobre santos esta fragmentada entre sitios hagiográficos heterogéneos, con calidades editoriales, criterios teológicos y fuentes distintas; no existe una enciclopedia unificada dentro del ecosistema Fósforo.
- **Contenido erróneo o desalineado:** las fechas de fiesta que circulan en la web frecuentemente ignoran el calendario litúrgico vigente (traslaciones por cuaresma, preeminencias de solemnidades, supresiones); Santopedia resuelve la fecha SIEMPRE vía Motor Litúrgico, garantizando coherencia con las demás apps del ecosistema (Biblia, Misal, apps de oración).
- **Necesidad de enciclopedia centralizada:** fieles, catequistas y equipos pastorales necesitan un punto único, confiable y rápido para responder "¿quién es este santo, de qué es patrono y cuándo se celebra?". Centralizar el contenido en el CMS permite corregir una ficha en una sola fuente y propagarla a todo el ecosistema sin duplicación.

## Arquitectura

- **Frontend:** Astro 6 en modo SSR con islas React 19 para la interacción (buscador con debounce, favoritos, reporte), Tailwind v4 y componentes compartidos de `@repo/ui` con los tokens de `src/packages/tailwind-config/shared-styles.css`.
- **Backend:** la app no posee backend de contenido propio; consume el CMS vía su API (ficha por slug, listados paginados, búsqueda full-text). Las únicas escrituras propias del dominio son favoritos y reportes de error, persistidos en el esquema Postgres `santopedia` de Supabase con RLS.
- **Datos:** el contenido vive exclusivamente en el CMS (content type `santo`); los datos de usuario (favoritos) y los reportes viven en Supabase, esquema `santopedia`. La fecha de fiesta se resuelve consultando al Motor Litúrgico.
- **Integración:** CMS (contenido y búsqueda), Motor Litúrgico (fecha de fiesta), Sistema de Logueo (auth, sesiones), Log (RUM + logs de aplicación), Sistema de Notificaciones (futuras: avisos de fiesta del santo favorito, novedades editoriales).

## Estado de implementación

- **Completado:** nada; la app se encuentra en fase de diseño documental y aun no existe en el código del monorepo.
- **En curso:** documentación completa de la fase WEB (PRD, SRS, FRD, flujos, tests, esquema de datos, ERM, ADRs, especificación técnica, OWASP y SLA/SLO).
- **Pendiente:** creación de `src/apps/santopedia/`, contrato de lectura del content type `santo` con el CMS, integración con el Motor Litúrgico, esquema `santopedia` en Supabase, instrumentación RUM y auditoría OWASP.

## Ubicación del código

- App: `src/apps/santopedia/` (a crear)
- Páginas: `src/apps/santopedia/src/pages/`
- Componentes: `src/apps/santopedia/src/components/`
- Librerías de dominio: `src/apps/santopedia/src/lib/` (`cms.ts`, `motor.ts`, `busqueda.ts`)
- Estilos: base compartida en `@repo/ui` y tokens en `src/packages/tailwind-config/shared-styles.css`
- Contenido: CMS del ecosistema (content type `santo`); datos de usuario en Supabase, esquema `santopedia`

## Alcance MVP

- Ficha de santo: biografía, patronazgos, fiesta litúrgica resuelta por el Motor, iconografía (atributos visuales canon: llaves, rueda, lirio, etc.) y atributos.
- Listado alfabético y por categoría (mártires, papas, doctores de la Iglesia, fundadores, etc.) con paginación y filtros por taxonomía (categoría, siglo, país).
- Buscador por nombre y patronazgo con debounce (mínimo 2 caracteres).
- Santo del día: cálculo diario contra el Motor Litúrgico (fiesta = hoy).
- Favoritos para usuarios autenticados vía Sistema de Logueo, persistidos con Supabase RLS.
- RUM desde el día 1 con eventos `santo.viewed` y `santo.searched`, siempre con consentimiento previo.
- Reporte de error de contenido desde la ficha (insert-only, anonimizado).
- SEO con JSON-LD (`schema.org/Person`) en cada ficha.

## No alcance MVP

- Imágenes votivas de culto local (exvotos, imágenes peregrinas, registros de santuarios).
- Santos no canonizados: solo se incluyen canonizados, equipolentes y canonizaciones equivalentes declaradas por el CMS; beatos y siervos de Dios quedan fuera del MVP.
- Multi-idioma: solo español en MVP; la i18n depende del CMS y queda para fases posteriores.

## KPI principal

- **KPI principal:** sesiones con búsqueda exitosa > 70% (una búsqueda es exitosa cuando termina en la apertura de una ficha de santo).
- **KPI secundario 1:** LCP p75 < 2.5s en la ficha de santo.
- **KPI secundario 2:** corrección de contenido reportado < 48h desde el reporte hasta la corrección visible en el CMS.

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | draft  |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | draft  |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | draft  |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | draft  |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | draft  |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificación Tecnica](09-Especificaci%C3%B3n%20Tecnica.md)      | draft  |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | draft  |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | draft  |

## Documentos complementarios

| Documento                                                        | Descripcion                                                                                   | Estado |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------ |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)                    | Casos TC-SANTO-001 a 015 trazados contra FR-SANTO-001 a 010; Vitest; cobertura >= 80% global. | draft  |
| [09-Especificación Tecnica](09-Especificaci%C3%B3n%20Tecnica.md) | Stack, módulos, endpoints, modelos de datos y lineamientos UI/UX de implementación.           | draft  |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
- Toda la secuencia documental permanece en `status: draft` hasta que la implementación de `src/apps/santopedia/` avance y se ejecuten las validaciones (tipos, lint, tests unitarios) sobre el código real.
