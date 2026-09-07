---
tags:
  - proyecto/fosforo
  - aplicación
  - fase-2
type: app-tests
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[04-Flujos y Secuencias|Flujos y Secuencias]]"
  - "[[09-Especificacion Tecnica|Especificacion Tecnica]]"
---

# Tests Unitarios - Vida de Misionero (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Estrategia

- Framework: **Vitest** (estándar del monorepo, `pnpm test:unit` / scope del app).
- Unitarios puros para lógica de dominio: `lib/progress.ts` (puntos/niveles), `lib/streak.ts` (racha y TZ), `lib/badges.ts` (hitos), `lib/cms.ts` (normalización y vigencia de misiones).
- Unitarios de endpoint con mocks (sesión, CMS, DB) para `POST /api/misiones/completar`, `PUT /api/preferencias`, `POST /api/reportes`.
- Las garantías de idempotencia a nivel constraint (`unique(user_id, mission_ref, fecha)`) se cubren en unitarios simulando conflicto de unique + en integración contra Supabase local.
- Sin PII en fixtures; `user_id` de prueba es un UUID sintético.

## 2. Cobertura objetivo

| Alcance                                                                            | Cobertura mínima |
| ---------------------------------------------------------------------------------- | ---------------- |
| Global del app `src/apps/vida-misionero/`                                          | >= 85%           |
| Críticos: `lib/progress.ts`, idempotencia (`lib/progress.ts` + endpoint completar) | >= 95%           |
| Críticos: `lib/streak.ts` (TZ)                                                     | >= 95%           |

## 3. Casos de test (TC-MISION-001..018)

### Autenticación y acceso

- **TC-MISION-001** - Listado de rutas con sesión: `GET /rutas` con sesión válida y CMS con 3 rutas -> 200; cada ítem tiene estado correcto (`no_iniciada` / `en_progreso` / `completada`) cruzando `progress`. _Cubre FR-MISION-001, UC-MISION-001._
- **TC-MISION-002** - Ficha de ruta inexistente: `GET /ruta/slug-que-no-existe` -> 404 controlado, sin stack trace, con navegación de vuelta. _Cubre FR-MISION-002, validación MISION-002._
- **TC-MISION-003** - Auth obligatoria en páginas y API: sin cookie de sesión, `GET /hoy` -> 302 a login con `redirect_uri` seguro; `POST /api/misiones/completar` -> 401 y **cero** efectos en DB (mock de DB verifica no-llamadas). Cookie inválida/expirada -> mismo comportamiento. _Cubre FR-MISION-007, RB-MISION-003._

### Completar misión (core, crítico)

- **TC-MISION-004** - Idempotencia de completado (doble POST): completar la misma misión dos veces el mismo día local -> primera respuesta 200 con +10 pts; segunda 200 con `already_completed: true`, +0 pts, un solo registro en `mission_completions`, un solo RUM `mision.completed`. _Cubre FR-MISION-003, RB-MISION-004, CA-01._
- **TC-MISION-005** - Idempotencia por conflicto de unique: insert que viola `unique(user_id, mission_ref, fecha)` -> la capa de servicio captura el conflicto y responde no-op exitoso (no lanza 500). _Cubre NFR-04._
- **TC-MISION-006** - RUM solo en completado efectivo: mock de Log verifica `mision.started` en apertura y `mision.completed` exactamente 1 vez por (user, mission, día); reintentos idempotentes no emiten `completed`. Fallo de RUM no rompe el 200. _Cubre FR-MISION-008, RB-MISION-008._
- **TC-MISION-007** - Misión inexistente/no publicada en CMS: POST con `mission_ref` que el CMS no resuelve -> 404, sin mutación de DB. _Cubre FR-MISION-003, MISION-002._

### Anti-fraude (crítico)

- **TC-MISION-010** - Manipulación de payload: POST con `user_id` distinto en body, `puntos` inflado o campos extra -> server ignora/valida; `user_id` siempre del token; respuesta 200/400 según campo y **jamás** otorga puntos distintos a la regla (10 diaria / 30 semanal). _Cubre RB-MISION-002, CA-04._
- **TC-MISION-011** - Rate limit: 21º POST en < 1 min por mismo usuario+IP -> 429 con `Retry-After`; primeros 20 OK (mock window). _Cubre MISION-005, SEC-MISION-004._

### Vigencia y reset

- **TC-MISION-008** - Misiones del día por TZ: usuario tz -180 min; a las 2026-09-05T23:30Z el "hoy" local es 05/09; las misiones del 05/09 aparecen vigentes y las del 06/09 no. Usuario tz +600 min: simultáneamente su "hoy" es 06/09. _Cubre FR-MISION-006, RB-MISION-007._
- **TC-MISION-009** - Reset diario: tras cron simulado, misiones diarias completadas ayer NO aparecen pendientes hoy; semanales completadas en la semana vigente no re-aparecen; nueva semana -> semanal vuelve a estar disponible. Cron re-ejecutado = mismo estado (idempotente). _Cubre FR-MISION-006, CA-07._
- **TC-MISION-017** - Vigencia fuera de ventana: POST de una misión diaria cuya ventana local fue ayer -> 422 "fuera de vigencia", sin mutación. _Cubre FR-MISION-003._

### Progreso y niveles (crítico)

- **TC-MISION-014** - Puntos y nivel: secuencia diaria(+10) x3, semanal(+30) -> 60 pts; umbrales de nivel (1:0, 2:50, 3:150...) recalculados server-side; el progreso por ruta refleja `pasos_completados`. _Cubre FR-MISION-004._
- **TC-MISION-018** - Transacción y reintentos: error de DB a mitad de la transacción (insert OK, update falla) -> rollback total; reintento posterior otorga los puntos una sola vez. _Cubre NFR-04/08._

### Racha y zona horaria (crítico)

- **TC-MISION-012** - Streak básico por días locales: completados en 05/09 y 06/09 locales (tz -180) -> racha 2; sin completado el 07/09 -> lectura de racha actual = 0, mejor racha = 2. _Cubre FR-MISION-004, UC-MISION-008._
- **TC-MISION-013** - Streak con frontera UTC: completar 05/03 23:30 local (02:30Z del 06/03) y 06/03 07:00 local (10:00Z) -> 2 días consecutivos aunque en UTC ambas caigan el 06/03; completar 2 veces el mismo día local NO incrementa racha. _Cubre RB-MISION-005, CA-02._

### Insignias

- **TC-MISION-015** - Hitos de racha: racha llega a 5 -> insignia `racha-5` otorgada exactamente una vez; a 30 -> `racha-30`; a 90 -> `racha-90`. Re-evaluar el hito (reintento, re-cálculo) no duplica ni re-notifica. _Cubre FR-MISION-005, RB-MISION-006, CA-06._
- **TC-MISION-016** - Primera ruta y ruta completada: completar todos los pasos de una ruta -> `primera-ruta` (solo la primera vez global del usuario) + `ruta-<slug>`; otra ruta completada -> solo su `ruta-<slug>`. _Cubre FR-MISION-005._

### CMS y degradación

- **TC-MISION-012b/019 (opcional para cobertura de caché)** - CMS caído en `/rutas` con cache vigente -> 200 con banner; sin cache -> estado vacío controlado con CTA reintentar; progreso del usuario siempre consultable desde DB. _Cubre FR-MISION-001, CA-05._

### Recordatorios, preferencias y reportes

- **TC-MISION-020 (preferencias)** - `PUT /api/preferencias` con opt-in -> persiste hora/canal/`tz_offset` y sincroniza con Notificaciones; revocación -> baja inmediata; payload inválido -> 400 (MISION-004). _Cubre FR-MISION-009, UC-MISION-005/007, CA-08._
- **TC-MISION-021 (reporte)** - `POST /api/reportes` con motivo válido y descripción <= 1000 -> 201 con acuse; descripción con caracteres peligrosos -> saneada (sin HTML/SQL en persistencia); rate limit de reportes aplica. _Cubre FR-MISION-010, UC-MISION-006._

> Nota de numeración: los TC opcionales de cache (TC-MISION-012b, 019, 020, 021) complementan los 18 casos obligatorios TC-MISION-001..018 sin renumerar la trazabilidad de 02-SRS.

## 4. Trazabilidad TC -> FR/RB

| TC                      | FR / RB cubiertos          |
| ----------------------- | -------------------------- |
| TC-MISION-001, 002      | FR-001/002, RB-001, RB-003 |
| TC-MISION-003           | FR-007, RB-003             |
| TC-MISION-004, 005, 018 | FR-003, RB-004, NFR-04     |
| TC-MISION-006           | FR-008, RB-008             |
| TC-MISION-007           | FR-003, RB-001             |
| TC-MISION-008, 009      | FR-006, RB-007             |
| TC-MISION-010, 011      | RB-002, SEC-MISION-004     |
| TC-MISION-012, 013      | FR-004, RB-005             |
| TC-MISION-014           | FR-004, RB-002             |
| TC-MISION-015, 016      | FR-005, RB-006             |
| TC-MISION-017           | FR-003, RB-007             |
| TC-MISION-020, 021      | FR-009, FR-010             |
| TC de cache (12b, 019)  | FR-001, FR-002, CA-05      |

## 5. Definición de done para tests

- `pnpm test:unit` (scope vida-misionero) verde en CI.
- Cobertura: >= 85% global, >= 95% en `lib/progress.ts`, `lib/streak.ts` y endpoint de completar.
- Ningún test depende de hora real del sistema: el tiempo se inyecta (`fakeTimers` / inyección de clock).
- Ningún test depende de TZ de la máquina: las TZ se inyectan explícitamente (tz_offset en fixtures).
- Fixtures sin PII; mocks de CMS/Log/Notificaciones compartidos en `src/apps/vida-misionero/__tests__/fixtures/`.
