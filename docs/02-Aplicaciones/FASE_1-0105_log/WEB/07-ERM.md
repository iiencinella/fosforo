---
tags:
  - proyecto/fosforo
  - erm
  - aplicacion/log
  - rum
  - analiticas
type: app-erm
area: aplicaciones
status: draft
created: 2026-05-26
updated: 2026-09-05
related:
  - "[[00-README|README Log]]"
  - "[[06-Esquema de Datos|Esquema de Datos Log]]"
---

# ERM - 0105_log

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `ERM-0105-LOG-*` (logs operativos), `ERM-LOG-RUM-*` (RUM y analíticas)
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Registro de riesgos y errores

### Logs operativos (MVP vigente)

| ID               | Riesgo/Error                                              | Tipo   | Severidad | Mitigacion                                                                                           | Owner           |
| ---------------- | --------------------------------------------------------- | ------ | --------- | ---------------------------------------------------------------------------------------------------- | --------------- |
| ERM-0105-LOG-001 | Caida de Supabase (DB no disponible)                      | Riesgo | P1        | Cachear ultimos datos en frontend; mostrar mensaje de degradacion; monitorear status.supabase.com    | Owner tecnico   |
| ERM-0105-LOG-002 | Pico de ingesta satura la DB                              | Riesgo | P2        | Rate limiting en POST /api/logs; indices optimizados; tabla particionada por mes                     | Owner tecnico   |
| ERM-0105-LOG-003 | API key comprometida                                      | Riesgo | P1        | Key rotation; deteccion de uso anomalo; desactivacion inmediata desde panel; almacen con hash        | Seguridad owner |
| ERM-0105-LOG-004 | Datos inconsistentes por payload malformado               | Error  | P3        | Validacion estricta con Zod; logs invalidos rechazados con 422 y detalle claro                       | Owner tecnico   |
| ERM-0105-LOG-005 | Acceso no autorizado por configuracion incorrecta de RLS  | Riesgo | P1        | Tests de RLS en CI; validacion manual antes de cada deploy; auditoria periodica de politicas         | Seguridad owner |
| ERM-0105-LOG-006 | Crecimiento de la tabla sin control                       | Riesgo | P2        | Politica de retencion (30 dias por defecto); job cron para limpieza; alerta de uso de almacenamiento | Owner tecnico   |
| ERM-0105-LOG-007 | Error en la UI al renderizar logs con metadata malformada | Error  | P3        | Renderizado defensivo con fallback a JSON stringify; test de componentes con datos malformados       | Owner tecnico   |

### RUM y analíticas (extensión)

| ID              | Riesgo/Error                                                     | Tipo   | Severidad | Mitigacion                                                                                                                                                                                   | Owner           |
| --------------- | ---------------------------------------------------------------- | ------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| ERM-LOG-RUM-001 | Volumen de eventos RUM satura la ingesta                         | Riesgo | P2        | Sampling configurable por app y tipo de evento; rate limiting separado del de logs operativos (1000 RUM req/min vs 100 logs req/min)                                                         | Owner tecnico   |
| ERM-LOG-RUM-002 | Fuga de PII via eventos RUM (metadata con email, IP, DNI)        | Riesgo | P1        | Anonimización obligatoria en SDK; validación de schema con regex en ingesta (`metadata` se rechaza si contiene patrones PII); revisión periódica de eventos                                  | Seguridad owner |
| ERM-LOG-RUM-003 | Consentimiento no respetado por SDK                              | Riesgo | P1        | SDK respeta `navigator.doNotTrack`; banner de consentimiento obligatorio en apps con tracking; auditoría de eventos con `has_consent=false`; tests automatizados de consentimiento           | Seguridad owner |
| ERM-LOG-RUM-004 | Dashboard de producto consume recursos de dashboard operativo    | Riesgo | P3        | Separación de queries (queries de RUM no impactan queries de logs operativos); cache de resultados RUM con TTL de 5 min                                                                      | Owner tecnico   |
| ERM-LOG-RUM-005 | SDK RUM rompe la app anfitriona ante error                       | Riesgo | P2        | Try-catch global en SDK; fallback silencioso; tests automatizados de resiliencia (falla de red, `sendBeacon` no disponible, DOM no disponible); NUNCA propaga errores hacia la app           | Owner tecnico   |
| ERM-LOG-RUM-006 | Crecimiento descontrolado de tablas RUM (rum_events, rum_vitals) | Riesgo | P2        | Política de retención: 90 días por defecto; job cron semanal para limpieza; alerta cuando tabla supere 10M registros; particionamiento por mes post-MVP                                      | Owner tecnico   |
| ERM-LOG-RUM-007 | Sesión anónima persiste entre sesiones o entre apps              | Riesgo | P2        | `session_id_anon` se regenera en cada nueva sesión de navegador; NO se persiste en localStorage entre sesiones; validación en backend rechaza session_ids duplicados en sesiones simultáneas | Owner tecnico   |
| ERM-LOG-RUM-008 | Taxonomía de eventos se fragmenta entre apps                     | Riesgo | P3        | Whitelist centralizada de `event_name` por dominio funcional; validación en ingesta; documentación de taxonomía por app; revisión periódica                                                  | Owner producto  |

## 3. Runbooks

### Logs operativos

- **P1 - Caida de Supabase:** Verificar status en status.supabase.com. Si es interrupcion planificada, esperar. Si es no planificada, contactar soporte Supabase. La app muestra estado de degradacion en el header.
- **P1 - API key comprometida:** Desactivar key en tabla `api_keys` (set is_active = false). Generar nueva key. Notificar al owner de la app afectada. Rotar la key en la configuracion de la app emisora.
- **P1 - Acceso no autorizado por RLS:** Revisar politicas RLS de la tabla `log_entries`. Ejecutar `SELECT * FROM pg_policies WHERE tablename = 'log_entries'`. Verificar que no haya politicas demasiado permisivas. Aplicar fix y testear.

### RUM y analíticas

- **P1 - Fuga de PII detectada:**
  1. Identificar el origen del evento (app, versión, sesión) en `rum_events`.
  2. Identificar el campo `metadata` que contiene PII.
  3. Si el leak es sistemático, pausar ingesta RUM de la app afectada (`update rum_sampling_config set pageview_sampling=0, custom_sampling=0, error_sampling=1 where app='X'`).
  4. Corregir el SDK o la app para no enviar PII.
  5. Notificar al equipo legal si aplica.
  6. Revisar y actualizar validación de schema en ingesta.
- **P1 - Consentimiento no respetado:**
  1. Verificar versión del SDK `@repo/analytics` en la app afectada.
  2. Si la versión es anterior a la que respeta DNT, forzar actualización.
  3. Auditar eventos con `has_consent=false` y revisar el origen.
  4. Si el bug es sistemático, pausar ingesta RUM de la app.
- **P2 - Volumen de eventos RUM satura ingesta:**
  1. Reducir sampling en `rum_sampling_config` para la app afectada (ej: `custom_sampling=0.05`).
  2. Monitorear métrica de ingesta RUM en dashboard de producto.
  3. Revisar apps con alto volumen y optimizar SDK (debounce, batching).

## 4. Continuidad operativa

### Logs operativos

- **RTO objetivo:** 4 horas (servicio debe estar disponible nuevamente dentro de 4 horas ante un desastre)
- **RPO objetivo:** 1 hora (perdida maxima de datos aceptable de 1 hora)
- **Estrategia de rollback:** Mantener la version anterior del deploy en Vercel disponible para rollback inmediato via dashboard de Vercel. Para cambios de schema DB, usar migraciones con `supabase db pull` y revertir con `supabase db reset` si es necesario.

### RUM y analíticas

- **RTO objetivo:** 4 horas (dashboard de producto no es crítico; apps anfitrionas siguen funcionando sin telemetría)
- **RPO objetivo:** 24 horas (datos RUM pueden perderse; no son críticos para operación de apps anfitrionas)
- **Estrategia de rollback:** Si el SDK RUM causa issues, las apps pueden degradar gracefully: `analytics.init()` con try-catch global; si el SDK falla, la app sigue funcionando sin telemetría. Desactivar sampling a 0 para pausar ingesta sin deployar.
