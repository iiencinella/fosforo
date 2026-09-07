---
tags:
  - proyecto/fosforo
  - aplicacion
  - visita-7-iglesias
  - web
  - fase-2
  - frd
type: app-frd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[02-SRS]]"
  - "[[docs/00-General/08-FRD-Maestro|FRD Maestro]]"
---

# Visita 7 Iglesias - Web - FRD

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Casos de uso

| ID         | Caso de uso                                 | Flujo principal                                                                                                                                                                                                                                                                                              | Excepciones                                                                                                                                                                           |
| ---------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UC-V7I-001 | Ver listado de itinerarios por ciudad       | 1. Usuario entra a `/itinerarios` y elige su ciudad (MVP: 3 ciudades base). 2. La app consulta el CMS por taxonomía de ciudad. 3. Se renderiza el listado (SSR cacheado) con nombre, iglesias (7), distancia estimada y estado de verificación.                                                              | CMS caído → cache + banner; ciudad sin itinerarios → estado vacío con CTA a ciudades disponibles.                                                                                     |
| UC-V7I-002 | Ver ficha de itinerario                     | 1. Usuario toca un itinerario. 2. `/itinerario/[slug]` renderiza las 7 iglesias con nombre, dirección, mapa embebido y oración de la visita (CMS). 3. Se emite RUM `v7i.itinerario.visto`.                                                                                                                   | Slug inexistente → 404 (V7I-005); oración faltante en CMS → bloque de oración con CTA de reporte; imagen de iglesia faltante → placeholder compartido de `@repo/ui`.                  |
| UC-V7I-003 | Marcar iglesia visitada                     | 1. Usuario autenticado abre el modo peregrino y toca el checkbox de una iglesia. 2. Se crea la peregrinación si no existe (`activa`). 3. `POST /api/peregrinaciones/{id}/visitas` escribe en `pilgrimage_visits` (RLS + idempotencia). 4. UI actualiza el checkbox con estado optimista y rollback en error. | Sin sesión → CTA "Iniciá sesión" (V7I-001, nunca escritura anónima); marca repetida → respuesta idempotente, sin duplicado ni cambio de progreso; peregrinación completada → V7I-003. |
| UC-V7I-004 | Ver progreso de la peregrinación            | 1. Usuario abre `/mi-peregrinacion` (o ve la barra en la ficha). 2. La app calcula x/7 desde las filas visitadas propias (RLS). 3. Al llegar a 7/7: la peregrinación pasa a `completada`, se muestra la celebración y se emite RUM `v7i.peregrinacion.completada` (una única vez).                           | Sin peregrinación iniciada → estado vacío con CTA a itinerarios; peregrinación completada → vista de recapitulación con fecha de finalización.                                        |
| UC-V7I-005 | Reordenar el modo peregrino                 | 1. Usuario autenticado toca "ordenar" en el modo peregrino. 2. Mueve iglesias arriba/abajo (o arrastrar, según accesibilidad disponible). 3. Se persiste el orden propio en `visita7.preferences` (RLS). 4. La lista se re-renderiza con el nuevo orden.                                                     | Sin sesión → CTA (el orden es una preferencia personal); orden no persistido → la lista vuelve al orden sugerido del CMS sin error visible.                                           |
| UC-V7I-006 | Reportar datos de iglesia incorrectos       | 1. Desde la ficha, usuario abre "Reportar problema" en una iglesia. 2. Elige motivo (dirección, horario, cerrada, otro) y escribe comentario opcional. 3. Se inserta el reporte (insert-only, `session_hash` anónimo). 4. El equipo editorial corrige en el CMS (SLO < 48 h en temporada).                   | Comentario omitido es válido; falla de persistencia → mensaje de error con reintento.                                                                                                 |
| UC-V7I-007 | Gestionar consentimiento de geolocalización | 1. El usuario puede otorgar o retirar (desde preferencias) el consentimiento opt-in de geolocalización, destinado exclusivamente a mejoras futuras de recorrido. 2. La preferencia se persiste en `visita7.preferences`. 3. Sin consentimiento, la app funciona 100 % con dirección textual + mapa embebido. | Consentimiento denegado o retirado → nunca se solicita la API de geolocalización; la app nunca muestra la posición del usuario como dato de la peregrinación.                         |
| UC-V7I-008 | Ver contexto litúrgico                      | 1. Al cargar home o ficha, la app consulta `GET /api/liturgia/{fecha}` (no bloqueante). 2. Si corresponde (Cuaresma; especialmente Jueves Santo), se muestra un mensaje informativo de acompañamiento espiritual. 3. Se renderiza junto al itinerario, sin condicionar ninguna acción.                       | Motor caído o timeout → mensaje omitido silenciosamente; fuera de temporada → sin mensaje.                                                                                            |

## Reglas de negocio

| ID         | Regla                                                                                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RB-V7I-001 | El contenido (itinerarios, iglesias, oraciones de la visita) proviene SIEMPRE del CMS: prohibido hardcodear contenido devocional en la app o guardarlo en BD propia. La app solo persiste referencias (`itinerary_ref`, `church_ref`).                       |
| RB-V7I-002 | Las visitas son idempotentes: **una sola marca por iglesia por peregrinación** (enforced por `UNIQUE (pilgrimage_id, church_ref)` en `pilgrimage_visits`); re-marcar devuelve el estado actual sin duplicar ni alterar el progreso.                          |
| RB-V7I-003 | La marca de visita exige autenticación: sin sesión no existe escritura en `visita7` (ni anónima ni con identificadores alternativos); el UI muestra CTA de inicio de sesión.                                                                                 |
| RB-V7I-004 | El progreso es estrictamente personal y solo propio: RLS con `user_id` = `auth.uid()` en `pilgrimages`, `pilgrimage_visits` y `preferences`; ningún endpoint expone peregrinaciones ajenas.                                                                  |
| RB-V7I-005 | El orden de visitas es configurable por el usuario y nunca impuesto por el CMS: el itinerario define un **orden sugerido** (default), el usuario puede reordenar su peregrinación sin afectar el contenido editorial.                                        |
| RB-V7I-006 | La peregrinación se completa una única vez: al marcar la séptima iglesia, `status` pasa de `activa` a `completada` con `completed_at`; la celebración y el evento RUM `v7i.peregrinacion.completada` se emiten una sola vez por peregrinación.               |
| RB-V7I-007 | Los datos de iglesias se mantienen con verificación periódica: revisión editorial trimestral del CMS + reportes de usuarios + **verificación intensiva obligatoria antes de Jueves Santo**; un dato corregido se refleja desde el CMS sin cambios de código. |

## Validaciones y errores

| Código  | Validación                                                        | Mensaje al usuario (o HTTP)                                               |
| ------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| V7I-001 | Marcar iglesia requiere sesión activa                             | "Iniciá sesión para registrar tu visita." (401 en API)                    |
| V7I-002 | `church_ref` debe pertenecer al itinerario de la peregrinación    | "Esta iglesia no pertenece a tu peregrinación actual." (422 en API)       |
| V7I-003 | No se marcan iglesias sobre una peregrinación completada (7/7)    | "Tu peregrinación ya está completa (7/7). Iniciá una nueva." (409 en API) |
| V7I-004 | Motivo de reporte requerido desde el select                       | "Elegí el motivo del reporte."                                            |
| V7I-005 | Slug de itinerario válido e inexistente → 404 con estado definido | "Itinerario no disponible." (404)                                         |

## Estados de UI

| Vista                       | Loading                       | Empty                                         | Error                          | Success                                      |
| --------------------------- | ----------------------------- | --------------------------------------------- | ------------------------------ | -------------------------------------------- |
| Listado de itinerarios      | Skeleton de tarjetas          | Ciudad sin itinerarios + CTA a otras ciudades | Cache + banner de degradación  | Listado con tarjetas por itinerario          |
| Ficha de itinerario         | Skeleton de lista de iglesias | 404 definido (V7I-005)                        | Banner + contenido cacheado    | 7 iglesias con oración y mapa                |
| Modo peregrino              | Skeleton con checkboxes       | CTA "Elegí un itinerario"                     | Toast de error con reintento   | Checkboxes actualizados + barra de progreso  |
| Progreso (mi-peregrinacion) | Skeleton de barra             | CTA a itinerarios                             | Toast de error con reintento   | Barra x/7 o celebración 7/7 (recapitulación) |
| Reporte                     | Estado de envío en botón      | —                                             | Mensaje de error con reintento | Confirmación de reporte enviado              |

## Matriz de trazabilidad FRD → SRS

| Caso de uso FRD | Requisito SRS                                  |
| --------------- | ---------------------------------------------- |
| UC-V7I-001      | FR-V7I-001, FR-V7I-010                         |
| UC-V7I-002      | FR-V7I-002, FR-V7I-007, FR-V7I-009, FR-V7I-010 |
| UC-V7I-003      | FR-V7I-003, FR-V7I-007, FR-V7I-010             |
| UC-V7I-004      | FR-V7I-004, FR-V7I-007                         |
| UC-V7I-005      | FR-V7I-005                                     |
| UC-V7I-006      | FR-V7I-008                                     |
| UC-V7I-007      | FR-V7I-005, NFR-V7I-006                        |
| UC-V7I-008      | FR-V7I-006                                     |
