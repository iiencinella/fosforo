---
tags:
  - proyecto/fosforo
  - aplicación
  - fase-2
type: app-erm
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[06-Esquema de Datos|Esquema de Datos]]"
  - "[[11-SLA y SLO|SLA y SLO]]"
---

# ERM - Vida de Misionero (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Marco

Registro de riesgos del app con: probabilidad (P), impacto (I), severidad (S1-S3), runbook de respuesta y objetivos de continuidad. Prioridad final = P x I. La premisa rectora: **el progreso espiritual acumulado es el activo más valioso de la app; su pérdida es inaceptable** (de ahí RTO 2h / RPO 1h).

## 2. Registro de riesgos (ERM-MISION-001..007)

| ID             | Riesgo                                            | P   | I   | Sev | Prioridad | Estado    |
| -------------- | ------------------------------------------------- | --- | --- | --- | --------- | --------- |
| ERM-MISION-001 | Fraude de completado (duplicar puntos/racha)      | M   | M   | S2  | P2        | Mitigado  |
| ERM-MISION-002 | Pérdida de progreso del usuario                   | B   | A   | S1  | P1        | Mitigado  |
| ERM-MISION-003 | CMS sin misiones del día (contenido insuficiente) | M   | M   | S2  | P2        | Mitigado  |
| ERM-MISION-004 | Zona horaria rompe el streak (injusticia visible) | M   | M   | S2  | P2        | Mitigado  |
| ERM-MISION-005 | CMS caído (app sin contenido)                     | B   | M   | S3  | P3        | Aceptado  |
| ERM-MISION-006 | PII en eventos RUM / logs                         | B   | A   | S1  | P1        | Mitigado  |
| ERM-MISION-007 | Abandono alto de usuarios (riesgo de producto)    | M   | M   | S3  | P3        | Monitoreo |

## 3. Detalle y runbooks

### ERM-MISION-001 - Fraude de completado (P2, S2)

- **Escenario:** usuario o script replaya `POST /api/misiones/completar` para duplicar puntos, inflar nivel o sostener rachas falsas.
- **Mitigaciones activas:** validación 100% server-side (`user_id` del token); idempotencia garantizada por `unique(user_id, mission_ref, fecha)`; vigencia por día/semana local; rate limiting por usuario+IP (SEC-MISION-004); payload cliente sin autoridad sobre puntos (TC-MISION-010).
- **Runbook (detección):** alarma por anomalías (completados por usuario/minuto > p99, puntos por día > umbral). Acción: revisar `mission_completions` del usuario; los constraints hacen imposible el duplicado real; en abuso confirmado, aplicar throttling permanente del usuario (tabla de moderación) y, si corresponde, reversa manual auditada.
- **Dueño:** backend. Ejercicio: revisión mensual de métricas anti-abuso.

### ERM-MISION-002 - Pérdida de progreso (P1, S1)

- **Escenario:** borrado/daño de esquema `vida_misionero`, migración destructiva mal aplicada, incidente de base de datos.
- **Mitigaciones activas:** sin DDL ad-hoc (solo migraciones versionadas, revisadas); columnas nuevas nullable/con default; transacciones atómicas para completado; backups automáticos de Supabase.
- **Continuidad:** **RTO 2h** (restaurar servicio de progreso), **RPO 1h** (pérdida máxima aceptable de completados). Justificación: un usuario que pierde semanas de racha/progreso abandona la app y pierde confianza en el ecosistema.
- **Runbook:**
  1. Detectar (alarma de errores de escritura / reporte de usuarios).
  2. Congelar escrituras de progreso si el daño es activo (feature flag `progress_writes_off`).
  3. Restaurar punto-in-time desde backup (<= 1h de pérdida) a base paralela.
  4. Validar conteos (completados por día vs. RUM `mision.completed` del período).
  5. Recortar y reabrir escrituras; comunicar a usuarios afectados si hubo pérdida visible.
- **Ejercicio:** simulacro trimestral de restauración (PITR) con checklist firmado.

### ERM-MISION-003 - CMS sin misiones del día (P2, S2)

- **Escenario:** editores no cargan misiones vigentes; `/hoy` queda vacío y la racha de usuarios activos se ve amenazada (abandono).
- **Mitigaciones activas:** estado vacío controlado con mensaje editorial; alerta automática a editores cuando el cron no encuentra misiones vigentes (FR-MISION-006); mínimo editorial de lanzamiento (3 rutas x >= 10 misiones); cola de misiones programadas hacia adelante (mínimo 7 días de contenido publicado por adelantado).
- **Runbook:** alarma "hoy sin misiones" -> editor publica contenido o extiende vigencia -> verificación en `/hoy`. Si la falta dura > 24h, el recordatorio diario se suprime para no molestar (ver 04-Flujos, reset diario).
- **Dueño:** editorial (CMS) + backend (alerta).

### ERM-MISION-004 - Zona horaria rompe el streak (P2, S2)

- **Escenario:** cálculo en UTC del servidor cuenta mal días locales; viajes del usuario; DST; racha "se rompe" o "se infla" injustamente -> pérdida de confianza.
- **Mitigaciones activas:** `tz_offset` guardado en `preferences` y en cada completado (histórico inmutable); racha derivada de fechas locales, nunca de UTC; tests específicos de frontera UTC (TC-MISION-012/013); actualización de `tz_offset` en cada sesión (sin reescribir históricos, ADR-MISION-004).
- **Runbook:** reporte de racha incorrecta -> reproducir con `user_id` + `tz_offset` históricos -> corregir cálculo (regla o zona) -> recalcular racha derivada (es derivable, no hay daño permanente). Sin parches de "racha regalada" manuales salvo decisión documentada.
- **Dueño:** backend. Ejercicio: suite TZ en CI bloquea merge si falla.

### ERM-MISION-005 - CMS caído (P3, S3)

- **Escenario:** Sistema de Contenidos no responde; rutas y misiones no cargan; completado no puede validarse contra CMS.
- **Mitigaciones activas:** cache de revalidación con serving stale (`/rutas`, `/ruta/[slug]`) + banner "contenido puede estar desactualizado"; progreso existente siempre consultable (depende solo de Supabase); sin cache -> estado vacío controlado.
- **Runbook:** alarma de latencia/errores CMS -> activar cache extendido -> coordinar con app CMS (su propio ERM) -> si falla validación de completado, responder 503 controlado (sin pérdida: reintentos idempotentes luego).
- **Decisión de riesgo:** aceptado P3; el MVP no replica contenido como fallback permanente (RB-MISION-001), solo cache temporal.

### ERM-MISION-006 - PII en RUM/logs (P1, S1)

- **Escenario:** eventos RUM o logs incluyen email, nombre, contenido libre del usuario (p. ej. texto de reporte) -> violación de privacidad (secular y eclesial: confidencialidad espiritual).
- **Mitigaciones activas:** esquema de eventos RUM cerrado (solo `user_id` interno, `content_ref`, `ts`, `session_id` anónimo); logs estructurados sin payload de usuario; el texto de `content_reports` persiste solo en DB protegida por RLS y NUNCA se loguea; revisión de PII en revisión de PR (checklist 10-OWASP, SEC-MISION-005).
- **Runbook:** detección de PII en Log (escanner) -> purgar evento/ttl corto -> corregir el emisor -> auditoría del campo invadido. Incidente con datos personales sigue el proceso de seguridad del ecosistema.
- **Dueño:** backend + Log. Ejercicio: escaneo automático semanal de campos PII en streams de Log.

### ERM-MISION-007 - Abandono alto (P3, S3, riesgo de producto)

- **Escenario:** retención 30d por debajo del 40%; usuarios activos dejan de completar misiones (hábito no se forma).
- **Mitigaciones activas:** KPIs de retención y misiones/semana en dashboard (01-PRD); recordatorios opt-in; onboarding hacia primera misión; contenido del CMS con mínimo de calidad/densidad.
- **Runbook:** KPI semanal bajo umbral -> análisis de embudo RUM (dónde se cae: ruta vista -> primera misión -> día 7) -> experimento (UX o contenido) -> medir. Sin cambios de reglas de puntos "inflando" para retener (integridad del juego).
- **Dueño:** producto.

## 4. Continuidad operativa

| Aspecto               | Valor / detalle                                              |
| --------------------- | ------------------------------------------------------------ |
| RTO (progreso)        | 2h                                                           |
| RPO (progreso)        | 1h (backups/PITR de Supabase)                                |
| RTO/RPO (resto)       | Cache y degradación controlada; sin RTO dedicado (P3)        |
| Backups               | Automáticos de Supabase; restauración validada trimestral    |
| Feature flags         | `progress_writes_off`, `cache_extended`, `reminders_enabled` |
| Dependencias críticas | Supabase (bloqueante), CMS (degradado), Log (best-effort)    |

## 5. Alertas resumen (detalle en 11-SLA y SLO)

- P1: pérdida/daño de progreso, PII en logs, escrituras fallando > 5 min.
- P2: CMS sin misiones del día, anomalías anti-fraude, cron de reset fallido.
- P3: CMS degradado, degradación de cache, KPI de retención bajo umbral.
