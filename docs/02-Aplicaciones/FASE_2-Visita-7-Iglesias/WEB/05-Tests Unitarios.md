---
tags:
  - proyecto/fosforo
  - aplicacion
  - visita-7-iglesias
  - web
  - fase-2
  - tests
type: app-tests
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[02-SRS]]"
  - "[[03-FRD]]"
  - "[[09-Especificacion Tecnica]]"
---

# Tests Unitarios - Visita 7 Iglesias

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `TC-V7I-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Estrategia

- **Framework:** Vitest (estándar del monorepo, ver skill/guía Vitest).
- **Alcance unitario:** módulos puros y de dominio de la app (`lib/peregrinacion.ts`, `lib/cms.ts`, helpers de progreso/orden), endpoints de API (`/api/peregrinaciones`, `/api/peregrinaciones/{id}/visitas`, `/api/reportes`) con Supabase mockeado, y componentes React críticos (checkbox del modo peregrino, barra de progreso) con render mínimo.
- **Supuestos de mock:** el cliente de Supabase y las llamadas al CMS (`GET /api/content/*`) y al Motor Litúrgico (`GET /api/liturgia/{fecha}`) se mockean; ningún test depende de red ni de datos reales.
- **Exclusiones justificadas:** E2E de recorrido completo (cubierto por pruebas manuales de temporada y post-MVP Playwright); render visual pixel-perfect (cubierto por revisión de UI); integración real con Better Auth (mock de sesión).

## 3. Matriz de pruebas

| ID         | Requisito trazado            | Tipo       | Escenario (Given / When / Then)                                                                                                                                                                                                                                                         | Estado    |
| ---------- | ---------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| TC-V7I-001 | FR-V7I-001                   | Unitario   | Given respuesta del CMS con itinerarios por taxonomía de ciudad, When `lib/cms.ts` lista itinerarios por ciudad, Then mapea nombre, iglesias (7), distancia estimada y estado de verificación sin campos ausentes.                                                                      | Pendiente |
| TC-V7I-002 | FR-V7I-001                   | Unitario   | Given ciudad sin itinerarios publicados en el CMS, When se lista la ciudad, Then devuelve colección vacía y la vista renderiza estado vacío con CTA a ciudades disponibles (sin error).                                                                                                 | Pendiente |
| TC-V7I-003 | FR-V7I-002                   | Unitario   | Given itinerario del CMS con 7 iglesias (nombre, dirección, mapa, oración de la visita), When se parsea la ficha, Then renderiza exactamente 7 iglesias en el orden sugerido con oración no vacía por iglesia.                                                                          | Pendiente |
| TC-V7I-004 | FR-V7I-002, V7I-005          | Unitario   | Given slug inexistente en el CMS, When se solicita la ficha, Then devuelve 404 y la vista muestra estado "Itinerario no disponible" con CTA al listado.                                                                                                                                 | Pendiente |
| TC-V7I-005 | FR-V7I-003                   | Unitario   | Given usuario autenticado con peregrinación activa, When marca una iglesia no visitada, Then se inserta la fila en `pilgrimage_visits` con `visit_order` y la respuesta es 201 con progreso incrementado.                                                                               | Pendiente |
| TC-V7I-006 | FR-V7I-003, RB-V7I-002       | Unitario   | **Idempotencia:** Given iglesia ya visitada en la peregrinación, When se marca nuevamente (violación de `UNIQUE (pilgrimage_id, church_ref)` mockeada como 23505), Then la API responde 200 con el estado actual, no inserta segunda fila y el progreso no cambia.                      | Pendiente |
| TC-V7I-007 | FR-V7I-003, V7I-001, V7I-002 | Unitario   | Given (a) request sin sesión y (b) `church_ref` ajeno al itinerario de la peregrinación, When se marca la visita, Then (a) responde 401 sin escribir en BD y (b) responde 422 sin escribir en BD.                                                                                       | Pendiente |
| TC-V7I-008 | FR-V7I-004                   | Unitario   | **Cálculo de progreso:** Given peregrinaciones con 0, 3, 6 y 7 iglesias visitadas, When se calcula el progreso, Then devuelve exactamente 0/7, 3/7, 6/7 y 7/7 (base siempre 7, ignorando duplicados).                                                                                   | Pendiente |
| TC-V7I-009 | FR-V7I-004, RB-V7I-006       | Unitario   | Given peregrinación con 6 visitas activa, When se marca la séptima iglesia, Then `status` pasa a `completada` con `completed_at`, la guard solo permite la transición una vez (re-llamada sobre completada responde 409 con V7I-003) y el evento de completación se emite una sola vez. | Pendiente |
| TC-V7I-010 | FR-V7I-005, RB-V7I-005       | Unitario   | Given usuario autenticado con preferencia de orden guardada, When abre el modo peregrino, Then la lista se renderiza con su orden propio (persistido en `preferences`) y el contenido de las iglesias no cambia.                                                                        | Pendiente |
| TC-V7I-011 | FR-V7I-005                   | Unitario   | Given usuario sin preferencia de orden, When abre el modo peregrino, Then la lista usa el orden sugerido del CMS como default; al reordenar se persiste y sobrevive al recargar (mock de reload).                                                                                       | Pendiente |
| TC-V7I-012 | FR-V7I-006                   | Unitario   | Given fecha en Cuaresma (y caso especial Jueves Santo), When la ficha consulta el Motor, Then se muestra el mensaje informativo correcto; dado timeout/500 del Motor, Then la ficha renderiza igual sin mensaje y sin error visible (degradación silenciosa).                           | Pendiente |
| TC-V7I-013 | FR-V7I-007                   | Unitario   | Given acciones de ver ficha, marcar visita y completar, When se emiten los eventos RUM, Then se envían exactamente `v7i.itinerario.visto`, `v7i.visita.marcada` y `v7i.peregrinacion.completada` con solo refs y progreso (sin user_id, sin PII, sin ubicación).                        | Pendiente |
| TC-V7I-014 | FR-V7I-008, V7I-004          | Unitario   | Given reporte sin motivo, When se envía, Then se valida V7I-004 ("Elegí el motivo del reporte"); dado motivo válido + comentario opcional, Then se inserta fila insert-only con `session_hash` anónimo (sin user_id ni email).                                                          | Pendiente |
| TC-V7I-015 | FR-V7I-009                   | Unitario   | Given ficha con imágenes de iglesias del CMS, When se renderizan, Then cada imagen tiene `width`/`height` definidos, formato moderno (webp/avif) y `loading="lazy"` fuera del viewport.                                                                                                 | Pendiente |
| TC-V7I-016 | FR-V7I-010                   | Componente | Given cada vista (listado, ficha, modo peregrino, progreso, reporte), When se renderiza, Then existen los 4 estados definidos (loading/error/empty/success) y el modo peregrino define además el estado "completada" con celebración.                                                   | Pendiente |

## 4. Cobertura objetivo

- Cobertura global: >= 80 %.
- Módulos críticos (`lib/peregrinacion.ts`: marca de visita, idempotencia, cálculo de progreso, transición a completada): >= 90 %.
- Endpoints de API con validaciones de sesión/pertenencia (401/422/409): deben tener test de cada código de error.

## 5. Criterios de aprobación

- [ ] Tests unitarios críticos en verde (marca, idempotencia TC-V7I-006, progreso TC-V7I-008, completación TC-V7I-009).
- [ ] Cobertura mínima alcanzada (>= 80 % global, >= 90 % críticos).
- [ ] Trazabilidad FR → TC actualizada (matriz de la sección 3 contra 02-SRS).
- [ ] Ningún test depende de red, credenciales reales o datos de producción.
