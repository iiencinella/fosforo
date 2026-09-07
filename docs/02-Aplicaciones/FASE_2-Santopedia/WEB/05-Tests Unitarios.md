---
tags:
  - proyecto/fosforo
  - santopedia
  - tests
  - vitest
  - web
type: app-tests
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[04-Flujos y Secuencias|04-Flujos y Secuencias]]"
  - "[[02-SRS|02-SRS]]"
---

# Santopedia — Tests Unitarios

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Estrategia

Framework: **Vitest** (estándar del monorepo, ver skill `vitest`). Alcance unitario: librerías de dominio (`lib/cms.ts`, `lib/motor.ts`, `lib/busqueda.ts`, `lib/favoritos.ts`, `lib/rum.ts`), helpers de validación/seo y lógica de componentes React aislados (mockeando el CMS, el Motor, la sesión y el SDK RUM). La ejecución es `pnpm test:unit` con scope de la app.

Cobertura mínima: **>= 80% global** en la app y **>= 90% en módulos críticos** (`lib/cms.ts`, `lib/favoritos.ts`, validaciones de slug y reportes).

## 2. Casos de prueba

| ID           | Título                                           | Precondiciones                                  | Pasos                                                                                         | Resultado esperado                                                                                                                         | FR                                                      |
| ------------ | ------------------------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| TC-SANTO-001 | Ficha se compone desde el CMS por slug           | CMS mock responde 200 con santo completo        | Invocar `getSantoBySlug("san-jose")`                                                          | Devuelve el santo del mock; fiesta resuelta consultando al Motor; no hay contenido local hardcodeado                                       | FR-SANTO-001                                            |
| TC-SANTO-002 | Slug inválido o inexistente → 404 suave          | Slug con caracteres fuera del patrón, o CMS 404 | `getSantoBySlug("../etc")` y `getSantoBySlug("no-existe")`                                    | Rechaza con error tipado `SantoNotFound`; nunca llega a buscar en CMS si el patrón no matchea                                              | FR-SANTO-001 (SANTO-001)                                |
| TC-SANTO-003 | CMS caído → estado degradado con cache           | CMS mock falla; cache SSR tiene versión stale   | Render de ficha con CMS caído y cache presente; luego cache ausente                           | Con cache: 200 degradado + flag `degraded=true` + banner; sin cache: 503 con página de error controlada                                    | FR-SANTO-001 (SANTO-005)                                |
| TC-SANTO-004 | Listado paginado con filtros de taxonomía        | CMS mock con 25 santos, categorías y siglos     | `getSantos({categoria:"martires", siglo:"IV", pais:"ar", page:2, pageSize:12})`               | Arma la query correcta; pagina; expone total y next/prev; orden alfabético por defecto                                                     | FR-SANTO-002                                            |
| TC-SANTO-005 | Listado sin resultados → estado vacío            | Filtros que no matchean nada                    | `getSantos({categoria:"inexistente"})`                                                        | Devuelve lista vacía + flag `empty=true` para render del estado vacío con "limpiar filtros"                                                | FR-SANTO-002                                            |
| TC-SANTO-006 | Búsqueda con >= 2 caracteres devuelve resultados | CMS mock con índice de búsqueda                 | `buscarSantos({q:"jose"})`                                                                    | Consulta `q=jose`; devuelve resultados con snippet resaltado sobre nombre/patronazgos                                                      | FR-SANTO-003                                            |
| TC-SANTO-007 | Búsqueda con < 2 caracteres no consulta el CMS   | Ninguna                                         | `buscarSantos({q:"j"})` y endpoint `/api/...?q=j`                                             | Cliente devuelve `{blocked:true}` sin fetch; endpoint responde 400 (defensa en profundidad)                                                | FR-SANTO-003 (RB-SANTO-003, SANTO-002)                  |
| TC-SANTO-008 | Debounce: una sola request por ráfaga de tipeo   | Timers falsos de Vitest (`vi.useFakeTimers`)    | Simular 6 tipeos en < 300ms con throttle de fetch                                             | Solo 1 request sale a la red (el último término); requests obsoletos se cancelan                                                           | FR-SANTO-003                                            |
| TC-SANTO-009 | Santo del día usa el Motor como única fuente     | Motor mock devuelve memoria con traslación      | `getSantoDelDia(hoy)`                                                                         | Consulta Motor para la fecha; mapea a santos del CMS; incluye nota de traslación cuando el Motor la marca                                  | FR-SANTO-004 (RB-SANTO-002)                             |
| TC-SANTO-010 | Sin fiesta hoy → estado vacío explicativo        | Motor mock devuelve "sin memoria"               | `getSantoDelDia(hoy)`                                                                         | Devuelve `{santos:[], motivo:"sin_fiesta"}`; la UI muestra el empty state, nunca un santo incorrecto                                       | FR-SANTO-004                                            |
| TC-SANTO-011 | Favorito sin sesión → 401 + CTA login            | Sin cookie de sesión                            | `POST /api/favoritos` sin sesión; clic en corazón anónimo                                     | 401 tipado; la UI muestra CTA de login y conserva la intención (retorno a la ficha)                                                        | FR-SANTO-005 (RB-SANTO-004, SANTO-003)                  |
| TC-SANTO-012 | Favorito persiste y RLS aísla por dueño          | Sesión mock A; DB con RLS                       | A marca favorito; A lista `/favoritos`; consultar filas de B                                  | Insert ok con `user_id` de sesión; A ve su fila; B no ve la fila de A (RLS `auth.uid()=user_id`)                                           | FR-SANTO-005                                            |
| TC-SANTO-013 | RUM solo envía con consentimiento                | SDK RUM mock; consentimiento on/off             | Render ficha y búsqueda con consent off; luego con consent on                                 | Off: cero llamadas al SDK; On: `santo.viewed` y `santo.searched` con payload tipado y sin PII                                              | FR-SANTO-006, FR-SANTO-010                              |
| TC-SANTO-014 | Reporte insert-only, anonimizado y validado      | Supabase mock; sesión anónima con hash          | `POST /api/reportes` válido; con tipo inválido; con comentario vacío; con texto de 1001 chars | Válido: insert sin PII (`session_hash` salteado, sin IP); inválidos: 400 con errores de campo                                              | FR-SANTO-007 (SANTO-004)                                |
| TC-SANTO-015 | Imágenes webp responsive + JSON-LD Person válido | Santo mock con imagen; parser de JSON-LD        | Render de ficha; validar `srcset`/`sizes`/`loading=lazy`/dimensiones; parsear JSON-LD         | `srcset` con anchos 320/640/960/1280; lazy fuera de viewport; width/height presentes; JSON-LD `Person` válido con name, image, description | FR-SANTO-008, FR-SANTO-009 (RB-SANTO-005, RB-SANTO-006) |

## 3. Fixtures y mocks

- **CMS:** server que responde fixtures de `santo` (completo, mínimo, sin imagen, rich text con HTML peligroso para verificar sanitización), 404 y 500.
- **Motor:** respuestas de memoria con y sin traslación, sin fiesta, timeout/500.
- **Sesión:** cookies de sesión válidas (usuario A/B) y ausente.
- **Supabase:** cliente mock de `favorites` y `reports` (verificando columnas escritas) y test de políticas RLS documentado en [06-Esquema de Datos](06-Esquema%20de%20Datos.md).
- **RUM:** SDK fake que registra llamadas para asertar consentimiento y payloads.

## 4. Cobertura objetivo

| Módulo                                                        | Cobertura mínima | Razón                          |
| ------------------------------------------------------------- | ---------------- | ------------------------------ |
| `lib/cms.ts`                                                  | >= 90%           | Origen único de contenido      |
| `lib/favoritos.ts` + guards de sesión                         | >= 90%           | Escritura a DB y auth          |
| Validaciones (slug, reporte, búsqueda)                        | >= 90%           | Superficie de seguridad        |
| `lib/motor.ts`, `lib/busqueda.ts`, `lib/rum.ts`, `lib/seo.ts` | >= 80%           | Reglas de negocio y telemetría |
| App global                                                    | >= 80%           | Estándar del monorepo          |

## 5. Trazabilidad

- FR-SANTO-001 → TC-001, TC-002, TC-003
- FR-SANTO-002 → TC-004, TC-005
- FR-SANTO-003 → TC-006, TC-007, TC-008
- FR-SANTO-004 → TC-009, TC-010
- FR-SANTO-005 → TC-011, TC-012
- FR-SANTO-006 → TC-013
- FR-SANTO-007 → TC-014
- FR-SANTO-008 → TC-015
- FR-SANTO-009 → TC-015
- FR-SANTO-010 → TC-013

Todos los FR quedan cubiertos por al menos un caso; los casos ejecutables son TC-SANTO-001 a TC-SANTO-015.
