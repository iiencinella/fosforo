---
tags:
  - proyecto/fosforo
  - aplicacion
  - visita-7-iglesias
  - web
  - fase-2
  - srs
type: app-srs
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[01-PRD]]"
  - "[[03-FRD]]"
  - "[[docs/00-General/07-SRS-Maestro|SRS Maestro]]"
---

# Visita 7 Iglesias - Web - SRS

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Requisitos funcionales

| ID         | Requisito                                          | Criterio verificable                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-V7I-001 | Listado de itinerarios por ciudad desde el CMS     | La app consulta `GET /api/content/itinerario?taxonomy={ciudad}` (CMS, API de lectura con API key) y renderiza el listado por ciudad (MVP: 3 ciudades base): nombre, barrio/recorrido, cantidad de iglesias (siempre 7), distancia estimada y estado de verificación del contenido; la app nunca mantiene contenido propio; ciudad sin itinerarios muestra estado vacío definido.                                                                      |
| FR-V7I-002 | Ficha de itinerario con las 7 iglesias y oraciones | `GET /itinerario/[slug]` renderiza las 7 iglesias del itinerario —nombre, dirección textual (fuente primaria), mapa embebido por iglesia (iframe, sin API keys en cliente) y **oración de la visita** obtenida del CMS (referenciada al catálogo de Oraciones)— en el orden sugerido del itinerario; slug inexistente devuelve 404 con estado definido.                                                                                               |
| FR-V7I-003 | Marcar iglesia visitada (auth + RLS, idempotente)  | Usuario autenticado marca una iglesia como visitada: `POST /api/peregrinaciones/{id}/visitas` escribe en `visita7.pilgrimage_visits` con `UNIQUE (pilgrimage_id, church_ref)`; re-marcar la misma iglesia **no duplica** ni altera el progreso (respuesta idempotente 200 con estado actual); la escritura exige sesión (`401` sin ella) y RLS restringe filas propias; `church_ref` debe pertenecer al itinerario de la peregrinación (`422` si no). |
| FR-V7I-004 | Progreso x/7 con celebración al completar          | El progreso se calcula desde las filas visitadas (`COUNT` sobre `pilgrimage_visits` de la peregrinación, siempre base 7); al alcanzar 7/7 la peregrinación pasa a `status = completada` **una única vez** (con `completed_at`), se muestra una celebración y se emite RUM `v7i.peregrinacion.completada`; re-visitar después no reinicia ni duplica la celebración.                                                                                   |
| FR-V7I-005 | Modo peregrino con orden configurable              | Vista de lista con checkboxes (una por iglesia) pensada para uso peatonal; el usuario puede **reordenar** las iglesias de su peregrinación (mover arriba/abajo); la preferencia se persiste en `visita7.preferences` (RLS); por defecto se usa el orden sugerido del itinerario del CMS; el CMS nunca impone el orden del usuario.                                                                                                                    |
| FR-V7I-006 | Contexto litúrgico vía Motor Litúrgico             | La app consulta `GET /api/liturgia/{fecha}` al cargar la ficha/home y muestra un mensaje informativo cuando aplica (tiempo de Cuaresma; tipo "Jueves Santo" con invitación a la peregrinación); si el Motor no responde, la app funciona igual **sin** el mensaje (degradación silenciosa, sin error visible al usuario).                                                                                                                             |
| FR-V7I-007 | RUM de eventos de producto                         | La app emite `v7i.visita.marcada` (itinerary_ref, church_ref, progreso x/7) y `v7i.peregrinacion.completada` (itinerary_ref, duración) al Sistema de Log desde el primer despliegue; además `v7i.itinerario.visto` (slug) para el embudo; eventos sin PII (sin user_id, sin ubicación precisa).                                                                                                                                                       |
| FR-V7I-008 | Reporte de datos de iglesia                        | Desde la ficha, el usuario reporta un problema de datos de una iglesia (select de motivo: dirección incorrecta, horario incorrecto, iglesia cerrada, otro + comentario opcional) a la cola de reportes (insert-only, con `session_hash` anónimo); sin requisito de sesión.                                                                                                                                                                            |
| FR-V7I-009 | Imágenes de iglesias optimizadas                   | Las imágenes de las iglesias (provenientes del CMS) se sirven con formatos modernos (webp/avif), atributos `width`/`height` para evitar layout shift y lazy loading fuera del viewport; el LCP de la ficha no depende de imágenes no críticas.                                                                                                                                                                                                        |
| FR-V7I-010 | Estados de UI completos                            | Cada vista define estado de carga (skeleton), error (con reintento), vacío (con CTA) y éxito; no existe vista sin estados definidos; el modo peregrino define además el estado "peregrinación completada" (celebración).                                                                                                                                                                                                                              |

## Requisitos no funcionales

| ID          | Requisito                 | Objetivo                                                                                            |
| ----------- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| NFR-V7I-001 | Disponibilidad            | 99.5 % MVP; 99.9 % durante la semana de Jueves Santo (pico anual)                                   |
| NFR-V7I-002 | Rendimiento (LCP p75)     | < 2.5 s                                                                                             |
| NFR-V7I-003 | TTFB p95                  | < 800 ms (SSR cacheado en CDN; contenido casi estático)                                             |
| NFR-V7I-004 | Accesibilidad             | WCAG 2.2 AA (checkboxes del modo peregrino accesibles por teclado y lectores de pantalla)           |
| NFR-V7I-005 | Cobertura de tests        | >= 80 % global, >= 90 % en módulos críticos (`lib/peregrinacion.ts`: marca, idempotencia, progreso) |
| NFR-V7I-006 | Privacidad                | RUM sin PII; reportes anónimos con hash; geolocalización solo opt-in y nunca fuente de verdad       |
| NFR-V7I-007 | Consistencia de contenido | Fuente única: CMS. Cero duplicación de itinerarios, iglesias u oraciones en la app o en BD propia   |

## Integraciones

| ID         | Integración                                        | Contrato                                                                                                                | Version |
| ---------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------- |
| IR-V7I-001 | CMS (itinerarios + iglesias + oraciones de visita) | `GET /api/content/itinerario` y `GET /api/content/iglesia` (filtros por taxonomía de ciudad y slug), con API key en SSR | v1      |
| IR-V7I-002 | Sistema de Logueo (Better Auth)                    | Sesión para iniciar peregrinación y marcar visitas; middleware de autorización                                          | v1      |
| IR-V7I-003 | Motor Litúrgico                                    | `GET /api/liturgia/{fecha}` para contexto Cuaresma/Jueves Santo; consumo no bloqueante                                  | v1      |
| IR-V7I-004 | Log (RUM + logs)                                   | Eventos `v7i.itinerario.visto`, `v7i.visita.marcada`, `v7i.peregrinacion.completada`, errores de frontend               | v1      |

## Criterios de aceptación transversales

- **CA-V7I-001**: un usuario marca las 7 visitas de su peregrinación y ve progreso completo (7/7) con celebración; ninguna marca se duplica aunque repita el gesto.
- **CA-V7I-002**: los datos de iglesias son corregibles vía reporte: un dato errado reportado entra a la cola editorial y se corrige en el CMS (la app refleja la corrección sin cambios de código).
- Todo el contenido mostrado (itinerarios, iglesias, oraciones de la visita) proviene del CMS; no existe texto devocional hardcodeado en la app ni en la BD de Supabase.
- Toda fila personal de Supabase (`visita7`) está protegida por RLS con `user_id` = `auth.uid()`; un usuario jamás ve ni edita la peregrinación de otro.
- Sin sesión, el listado y la ficha del itinerario son 100 % funcionales; la marca de visita muestra CTA de inicio de sesión (nunca error).
- Si el CMS o el Motor Litúrgico no responden, la app funciona degradada: cache SSR + banner informativo (CMS) o mensaje ausente (Motor), sin crash.

## Matriz de trazabilidad SRS

| Requisito SRS | Origen PRD               | Refinado en FRD        | Cubierto por Tests                 |
| ------------- | ------------------------ | ---------------------- | ---------------------------------- |
| FR-V7I-001    | PRD-V7I-001              | UC-V7I-001             | TC-V7I-001, TC-V7I-002             |
| FR-V7I-002    | PRD-V7I-002              | UC-V7I-002             | TC-V7I-003, TC-V7I-004             |
| FR-V7I-003    | PRD-V7I-004, PRD-V7I-006 | UC-V7I-003             | TC-V7I-005, TC-V7I-006, TC-V7I-007 |
| FR-V7I-004    | PRD-V7I-005              | UC-V7I-004             | TC-V7I-008, TC-V7I-009             |
| FR-V7I-005    | PRD-V7I-003              | UC-V7I-005, UC-V7I-007 | TC-V7I-010, TC-V7I-011             |
| FR-V7I-006    | PRD-V7I-007              | UC-V7I-008             | TC-V7I-012                         |
| FR-V7I-007    | PRD-V7I-008              | —                      | TC-V7I-013                         |
| FR-V7I-008    | PRD-V7I-009              | UC-V7I-006             | TC-V7I-014                         |
| FR-V7I-009    | PRD-V7I-002              | UC-V7I-002             | TC-V7I-015                         |
| FR-V7I-010    | PRD-V7I-001/002/003      | UC-V7I-001/002/003     | TC-V7I-016                         |
