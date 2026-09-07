---
tags:
  - proyecto/fosforo
  - aplicación
  - fase-2
type: app-readme
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[../00-README|Indice de aplicaciónes]]"
  - "[[../../FASE_2-Sistema-de-Contenidos-CMS/WEB/00-README|Sistema de Contenidos (CMS)]]"
  - "[[../../FASE_1-Sistema-de-Logueo/WEB/00-README|Sistema de Logueo]]"
  - "[[../../FASE_2-Sistema-de-Notificaciones/WEB/00-README|Sistema de Notificaciones]]"
  - "[[../../FASE_1-0105_log/WEB/00-README|Log]]"
---

# Vida de Misionero

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Metadatos

- Plataforma: WEB
- Estado: draft
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-09-05
- Prefijo de IDs: `MISION-*`
- Ruta de codigo (a crear): `src/apps/vida-misionero/`

## Descripcion

Vida de Misionero es la aplicación de formación espiritual gamificada del ecosistema Fósforo. Propone rutas o caminos de formación espiritual (por ejemplo: misericordia, oración, servicio), cada uno dividido en pasos con misiones concretas diarias y semanales. El usuario registra su avance, acumula puntos, sube de nivel, mantiene una racha (streak) de días consecutivos y gana insignias por hitos sostenidos (5, 30 y 90 días).

El contenido pedagógico (rutas, pasos y misiones) vive íntegramente en el CMS (content types `ruta` y `mision`); la app solo presenta contenido editorial y gestiona estado dinámico por usuario (progreso, completados, insignias, preferencias) en Supabase con RLS. La autenticación es obligatoria: todo el progreso es por usuario y ninguna ruta es navegable sin sesión.

## Validación de la idea

- La formación espiritual católica está dispersa: libros, videos y homilías abundan, pero falta un camino concreto, ordenado y accionable que el feligresé pueda seguir paso a paso.
- Los intentos de oración y servicio se abandonan por falta de hábito estructurado: sin pequeñas metas diarias, sin feedback de avance y sin recordatorios, la intención no se convierte en práctica sostenida.
- La gamificación medida (progreso visible, niveles, rachas e insignias) es una técnica probada para sostener hábitos; aplicada a la formación espiritual convierte "querer formarme" en "hoy cumplo una misión concreta".

## Arquitectura

- **Frontend:** Astro 6 en modo SSR con React 19 para islas interactivas y Tailwind v4 consumiendo `@repo/ui` y `@repo/tailwind-config` (tokens compartidos del ecosistema).
- **Backend:** Supabase (Postgres + Auth + Edge Functions). Toda la lógica de progreso es server-side: validación de completado, cálculo de puntos y nivel, streak con zona horaria del usuario y otorgamiento de insignias. Reset diario de misiones via cron (Edge Function programada).
- **Datos:** esquema `vida_misionero` en Postgres con RLS por `user_id` (`progress`, `mission_completions`, `badges`, `preferences`). El contenido (rutas/misiones) NO se duplica: se referencia por `content_ref` contra el CMS.
- **Integración:** CMS (Sistema de Contenidos) provee rutas y misiones; Sistema de Logueo provee la sesión obligatoria; Sistema de Notificaciones envía recordatorios opt-in de misiones; Log registra RUM (eventos `mision.started`/`mision.completed`) y logs técnicos.

## Estado de implementación

- **Completado:** documentación de la app (12 documentos, secuencia draft).
- **En curso: nada** (la app aún no existe en codigo).
- **Pendiente:** scaffold de `src/apps/vida-misionero/`, integración con CMS, esquema `vida_misionero` + RLS, endpoints de progreso, reset diario, recordatorios, RUM y tests.

## Ubicación del codigo

- App: `src/apps/vida-misionero/` (a crear)
- Componentes: `src/apps/vida-misionero/components/`
- Estilos: imports de `@repo/ui/styles.css` + `@repo/ui/foundation.css`; CSS de app solo para reglas de dominio
- Contenido: content types `ruta` y `mision` en el CMS (Sistema de Contenidos)
- API: `src/apps/vida-misionero/pages/api/*` y Edge Functions de Supabase

## Alcance MVP

- Listado de rutas de formación (desde CMS) con estado del usuario.
- Ficha de ruta con sus pasos y misiones asociadas.
- Misiones diarias y semanales ("hoy") con check de completado.
- Completar misión con validación server-side, idempotencia y puntos.
- Progreso y niveles calculados por puntos (server-side).
- Rachas (streak) de días consecutivos con zona horaria del usuario.
- Insignias por hitos de racha (5, 30, 90 días) y por completar rutas.
- Auth obligatoria: todas las rutas de la app requieren sesión.
- RUM: eventos `mision.started` y `mision.completed` (y de embudo) hacia Log.
- Recordatorios opt-in de misiones del día via Sistema de Notificaciones.
- Reporte de problema de contenido (misión confusa, error doctrinal, etc.).

## No alcance MVP

- Comunidad/social: comentarios, grupos, foros o compartir en redes.
- Ranking público o tablas de posiciones (el progreso es privado por RLS).
- Multi-idioma (MVP en español; la arquitectura de contenido del CMS lo permitirá después).
- Modo offline o PWA instalable.
- Tienda de premios, canje de puntos o monetización.

## KPI principal

- Retención a 30 días > 40% de usuarios con al menos una misión completada.
- Misiones completadas por semana por usuario activo (objetivo inicial: >= 3).
- % de usuarios activos semanales con racha >= 5 días (proxy de hábito).
- Embudo ruta -> primera misión completada > 60%.

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | draft  |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | draft  |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | draft  |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | draft  |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | draft  |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificacion Tecnica](09-Especificacion%20Tecnica.md)           | draft  |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | draft  |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | draft  |

## Documentos complementarios

| Documento                                                   | Descripcion                                                    | Estado |
| ----------------------------------------------------------- | -------------------------------------------------------------- | ------ |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)               | 18 casos TC-MISION, cobertura >= 85% global y >= 95% criticos  | draft  |
| [09-Especificacion Tecnica](09-Especificacion%20Tecnica.md) | Stack, módulos, endpoints, modelos y UI/UX de `vida-misionero` | draft  |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa (RTO 2h, RPO 1h sobre progreso).
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
- Dependencias obligatorias para el MVP: CMS, Sistema de Logueo, Sistema de Notificaciones y Log.
