---
tags:
  - proyecto/fosforo
  - aplicacion
  - oraciones
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
  - "[[docs/00-General/05-Tests|Framework de tests]]"
---

# Oraciones - Web - Tests Unitarios

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Framework y estrategia

- Framework: **Vitest** (compatible con el tooling Vite del monorepo).
- Nivel: unitario sobre librerías (`lib/cms.ts`, `lib/colecciones.ts`), componentes y utilidades; SSR de páginas se prueba via helper de render de Astro en tests de integración ligeros.
- Cobertura mínima: **>= 80 % global, >= 90 % en módulos críticos** (`lib/colecciones.ts`, validaciones de favoritos, helpers de reportes).
- Supabase se mockea (cliente + RLS) en tests unitarios; validaciones de RLS reales se cubren en scripts de `db/scripts` y en la suite de integración de la plataforma.

## Casos de prueba

| ID          | Caso                            | Dado (arrange)                        | Cuando (act)                         | Entonces (assert)                                                                                                 | Requisito cubierto        |
| ----------- | ------------------------------- | ------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------- |
| TC-ORAC-001 | Listado desde CMS por categoría | Mock CMS con 5 oraciones de `rosario` | Render `/categoria/rosario`          | Lista con 5 tarjetas, título + extracto, sin contenido hardcodeado                                                | FR-ORAC-001               |
| TC-ORAC-002 | Estado vacío de categoría       | Mock CMS con []                       | Render categoría sin oraciones       | Estado vacío con CTA a búsqueda, sin crash                                                                        | FR-ORAC-001, FR-ORAC-010  |
| TC-ORAC-003 | Ficha por slug                  | Mock CMS con oración completa         | Render `/oracion/[slug]`             | Texto completo, intención, fuente, breadcrumbs, JSON-LD Article presente                                          | FR-ORAC-002, RB-ORAC-005  |
| TC-ORAC-004 | Slug inexistente                | Mock CMS 404                          | Render slug inexistente              | Respuesta 404 con estado definido de "no encontrada"                                                              | FR-ORAC-002               |
| TC-ORAC-005 | Búsqueda >= 2 caracteres        | Mock CMS con matches                  | Búsqueda "ave"                       | Resultados paginados con resaltado del match                                                                      | FR-ORAC-003               |
| TC-ORAC-006 | Búsqueda < 2 caracteres         | -                                     | Búsqueda "a"                         | No se lanza consulta; se muestra hint ORAC-002                                                                    | RB-ORAC-003, ORAC-002     |
| TC-ORAC-007 | Modo lectura persistente        | localStorage vacío                    | Alternar tema oscuro + tamaño grande | Aplica cambios y persiste en localStorage; segunda lectura aplica preferencia sin parpadeo                        | FR-ORAC-004, RB-ORAC-004  |
| TC-ORAC-008 | Marcar favorito autenticado     | Mock Supabase + sesión                | Tocar "favorito"                     | Escribe en `favorites` y UI en estado activo optimista                                                            | FR-ORAC-005, RB-ORAC-002  |
| TC-ORAC-009 | Favorito sin sesión             | Sin sesión                            | Tocar "favorito"                     | No lanza error; muestra CTA "Iniciá sesión"                                                                       | FR-ORAC-005, UC-ORAC-005  |
| TC-ORAC-010 | Crear colección válida          | Sesión + mock Supabase                | Crear "Novenario"                    | Insert con user_id, nombre, slug; redirección a detalle                                                           | FR-ORAC-006, UC-ORAC-006  |
| TC-ORAC-011 | Crear colección inválida        | Sesión                                | Crear nombre vacío o > 50 chars      | Error ORAC-001; no se lanza insert                                                                                | ORAC-001, FR-ORAC-006     |
| TC-ORAC-012 | Evento RUM viewed/searched      | Mock Log SDK                          | Render ficha; lanzar búsqueda        | Emite `oracion.viewed` {slug, categoria} y `oracion.searched` {longitud, resultados} sin texto de consulta ni PII | FR-ORAC-007, NFR-ORAC-006 |
| TC-ORAC-013 | Reporte de error insert-only    | Sin sesión obligatoria                | Enviar reporte con motivo            | Insert en `reports` con session_hash anónimo; confirmación al usuario                                             | FR-ORAC-008, RB-ORAC-006  |
| TC-ORAC-014 | Recordatorio válido/inválido    | Sesión                                | Programar hora "07:30" / "26:99"     | Válido: upsert en `preferences` + registro en Notificaciones; inválido: error ORAC-004 sin envío                  | FR-ORAC-009, ORAC-004     |
| TC-ORAC-015 | CMS caído con estados definidos | Mock CMS timeout                      | Render listado/ficha sin respuesta   | Se sirve última cache válida + banner de degradación; sin contenido local ni crash                                | FR-ORAC-010, NFR-ORAC-007 |

## Mapa de cobertura esperado

| Módulo                                   | Cobertura mínima | Cobertura crítica                                      |
| ---------------------------------------- | ---------------- | ------------------------------------------------------ |
| `lib/cms.ts`                             | 80 %             | -                                                      |
| `lib/colecciones.ts`                     | -                | 90 %+ (TC-010, TC-011)                                 |
| Validaciones (ORAC-001..005)             | -                | 90 %+ (TC-005, TC-006, TC-010, TC-011, TC-013, TC-014) |
| Componentes UI (listado, ficha, estados) | 80 %             | -                                                      |
| Helpers RUM                              | 80 %             | -                                                      |

## Convenciones

- Archivo de test espeja la estructura: `lib/cms.test.ts`, `components/OracionCard.test.tsx`, etc.
- Mocks de datos del CMS se definen en fixtures compartidos (`test/fixtures/oraciones.ts`).
- Ningún test depende de servicio real (CMS/Supabase/Notificaciones): todos via mocks.
