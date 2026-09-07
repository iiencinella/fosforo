---
tags:
  - proyecto/fosforo
  - app/lectio-divina
  - fase/2
  - plataforma/web
type: app-tests
owner: Iván Ezequiel Iencinella
status: draft
created: 2026-09-05
updated: 2026-09-05
---

# Tests Unitarios — Lectio Divina (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Estrategia

- **Framework:** Vitest (convención del monorepo; ver skill `vitest`).
- **Ambiente:** JSDOM para componentes React 19 (pasos, textarea con autoguardado); ambiente **integration de Supabase con RLS activada** (.usuario real vs. intruso) para las pruebas de privacidad; mocks de Motor/CMS/Notificaciones/Log en las demás.
- **Datos:** fixtures de sesiones/entradas por usuario A y B; fechas fijas (congelar `Date.now` para streak/TZ).
- **Cobertura mínima:** >= 85 % global; >= 95 % en **módulos críticos** (`lib/diario.ts`, políticas RLS, autoguardado, cálculo de streak).

## 2. Casos de prueba (TC-LECTIO-001..016)

| ID            | Título                                             | Dado / Cuando / Entonces                                                                                                                                                                                      | Criticidad  |
| ------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| TC-LECTIO-001 | Sesión nueva del día se crea ACTIVA                | Dado usuario autenticado sin sesión hoy, cuando llama `startOrResume(fecha)`, entonces se inserta fila `sessions.activa` con `tz_offset` del usuario.                                                         | Alta        |
| TC-LECTIO-002 | Reingreso el mismo día retoma sesión (idempotente) | Dado sesión ACTIVA hoy, cuando llama `startOrResume` de nuevo, entonces devuelve la misma fila (`unique(user_id,fecha)`), sin duplicar.                                                                       | Alta        |
| TC-LECTIO-003 | Progresión de pasos en orden                       | Dado sesión activa, cuando completa `lectio→meditatio→...`, entonces cada avanzar marca `paso_completado`; completar _actio_ setea `status=completada`.                                                       | Alta        |
| TC-LECTIO-004 | Sesión completada permite reedición sin duplicar   | Dado sesión COMPLETADA hoy, cuando vuelve a "Comenzar", entonces recibe la misma sesión para lectura/edición; `status` permanece COMPLETADA.                                                                  | Media       |
| TC-LECTIO-005 | Acceso a `/sesion/[fecha]` con fecha inválida      | Dado `fecha=1970-1-1` o formato inválido, entonces 404 (LECTIO-E-001).                                                                                                                                        | Media       |
| TC-LECTIO-006 | Lecturas SIEMPRE vía Motor (sin hardcode)          | Dado mock de Motor, cuando renderiza `/hoy`, entonces el texto mostrado es exactamente el del mock; no hay lecturas en código ni en BD de Lectio.                                                             | Alta        |
| TC-LECTIO-007 | Escritura de diario sin auth → 401 + redirect      | Dado usuario anónimo, cuando intenta PUT `/api/diario/{paso}`, entonces recibe 401 y la UI redirige a login con `returnTo` conservando el texto local.                                                        | Alta        |
| TC-LECTIO-008 | **RLS: un intruso no puede leer entradas ajenas**  | Dado usuario B `auth.uid()` = B y entrada de A, cuando hace `select` por `entry_id` (o por `session_id`), entonces obtiene **vacío**; la fila nunca se devuelve.                                              | **Crítica** |
| TC-LECTIO-009 | **RLS: un intruso no puede escribir/actualizar**   | Dado B intenta `update/insert/delete` sobre filas de A, entonces el rowCount afectado es **0** y el intento queda auditado (log).                                                                             | **Crítica** |
| TC-LECTIO-010 | Autoguardado con debounce 2 s y reintentos         | Dado el usuario escribe en un paso, cuando pasan 2 s de inactividad, entonces ocurre `PUT /api/diario/{paso}` (1 llamada; no una por tecla); ante 3 fallos, se muestra aviso y el texto permanece en cliente. | **Crítica** |
| TC-LECTIO-011 | Modo lectura sin auth: sin escritura en BD         | Dado usuario anónimo recorre la guía, entonces puede leer pasos y lecturas; ninguna fila de `entries/sessions` se crea.                                                                                       | Media       |
| TC-LECTIO-012 | Streak con TZ del usuario (+ viajero)              | Dado `tz_offset=-180` y sesiones completadas el 05-sep local (04-sep UTC) y 06-sep local, cuando `getStreak`, entonces streak = 2; simulando salto de TZ (viaje), la racha no se rompe por desfase UTC.       | Alta        |
| TC-LECTIO-013 | Preferencias de recordatorio (opt-in / opt-out)    | Dado usuario, cuando PUT `preferences` con recordatorio, entonces se persiste y pide agenda a Notificaciones; con `null`, se cancela; sin consentimiento nunca se agendó.                                     | Media       |
| TC-LECTIO-014 | Exportación del diario propio                      | Dado dueño autenticado, cuando GET `/api/diario/export`, entonces recibe Markdown/JSON **solo** con sus entradas; con otra identidad → vacío/403; log no incluye contenido.                                   | Alta        |
| TC-LECTIO-015 | RUM nunca incluye contenido del diario             | Dado emisión de eventos `lectio.*`, cuando se serializan payloads, entonces no contienen texto de entradas ni longitudes ni derivados; solo id, fecha, paso.                                                  | **Crítica** |
| TC-LECTIO-016 | Motor caído: fallback de lectura manual            | Dado Motor responde error/timeout y CMS sin cache, cuando usuario abre sesión, entonces ve banner LECTIO-E-003 y puede elegir lectura manual; la sesión y diario se crean igualmente.                         | Alta        |

## 3. Pruebas de RLS (detalle crítico)

Se ejecutan **conectando como usuario real** (anon key con claims de auth), no `service_role`, sobre la base con RLS habilitada:

1. **Lectura cruzada:** B no ve entradas de A (por `id`, por `session_id`, por listado).
2. **Escritura cruzada:** UPDATE/DELETE de filas de A afecta 0 `rows`.
3. **Política negativa:** sin JWT (anon), cualquier query a `entries` devuelva vacío.
4. **Dueño:** A puede CRUD completo de sus filas.
5. **Auditoría:** cada intento violado queda registrado (sin contenido).

## 4. Cobertura y ejecución

| Suite                                              | Comando                                    | Cobertura objetivo     |
| -------------------------------------------------- | ------------------------------------------ | ---------------------- |
| Global (`pnpm turbo test`)                         | `vitest run --coverage`                    | >= 85 %                |
| Críticos (`lib/diario`, RLS, autoguardado, streak) | `vitest run --coverage --project critical` | >= 95 % branches/lines |

Reglas de CI:

- Fallan los tests de RLS = bloqueante de merge (P1).
- Cambios en schema/`06-Esquema de Datos.md` exigen actualizar fixtures y TC-LECTIO-008/009.

## 5. Campos no cubiertos por unit (dejar a E2E/manuales)

- Notificaciones reales (canal del Sistema de Notificaciones):contract test con fixture de evento.
- Performance LCP y TTFB: medición con RUM en ambiente productivo (SLO-LECTIO-002/008).
