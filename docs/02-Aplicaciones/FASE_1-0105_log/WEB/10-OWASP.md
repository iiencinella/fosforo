---
tags:
  - proyecto/fosforo
  - owasp
  - seguridad
  - aplicacion/log
  - rum
  - analiticas
type: app-owasp
area: aplicaciones
status: draft
created: 2026-05-26
updated: 2026-09-05
related:
  - "[[00-README|README Log]]"
---

# OWASP - 0105_log

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `SEC-0105-LOG-*` (logs operativos), `SEC-LOG-RUM-*` (RUM y analíticas)
- Plataforma: WEB
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Baseline aplicable

- Web: OWASP Top 10 (2021) + ASVS.
- RUM: adicionalmente, cumplimiento de principios de privacidad (minimización, consentimiento, DNT).
- Supabase: RLS en todas las tablas; Auth con sesiones seguras.

## 3. Checklist de controles

### Logs operativos (MVP vigente)

| ID               | Control                                                 | Estado | Evidencia                                             |
| ---------------- | ------------------------------------------------------- | ------ | ----------------------------------------------------- |
| SEC-0105-LOG-001 | Autenticación y sesion seguras (Supabase Auth)          | Hecho  | Rutas SSR protegidas con `requireRole(['dev','ops'])` |
| SEC-0105-LOG-002 | Autorización por rol (dev, ops) con RLS                 | Hecho  | RLS en `log_entries`: solo dev/ops leen               |
| SEC-0105-LOG-003 | Validación y sanitización de entradas (Zod)             | Hecho  | Esquemas Zod en `src/lib/schemas/log.ts`              |
| SEC-0105-LOG-004 | Proteccion de datos sensibles (RLS en todas las tablas) | Hecho  | RLS en `log_entries`, `api_keys`                      |
| SEC-0105-LOG-005 | Logging y auditoria de seguridad                        | Hecho  | Auditoria de accesos via Supabase Auth logs           |
| SEC-0105-LOG-006 | API key hasheada (SHA-256) en DB                        | Hecho  | NUNCA se almacena la key en texto plano               |
| SEC-0105-LOG-007 | Rate limiting en ingesta                                | Hecho  | 100 req/min por API key                               |
| SEC-0105-LOG-008 | Headers de seguridad                                    | Hecho  | CSP, HSTS, X-Frame-Options via middleware Astro       |
| SEC-0105-LOG-009 | HTTPS obligatorio                                       | Hecho  | Vercel fuerza HTTPS                                   |
| SEC-0105-LOG-010 | CORS configurado                                        | Hecho  | Solo orígenes permitidos                              |

### RUM y analíticas (extensión)

| ID              | Control                                                                                       | Estado    | Evidencia                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-LOG-RUM-001 | Anonimización de datos RUM (sin PII, sin IP, sin user ID crudo)                               | Pendiente | SDK NO expone APIs para setear user ID; backend rechaza payloads con campos PII (regex); `session_id_anon` es hash aleatorio                            |
| SEC-LOG-RUM-002 | Consentimiento del usuario y respeto de DNT                                                   | Pendiente | SDK respeta `navigator.doNotTrack`; banner de consentimiento obligatorio en apps con tracking; SDK expone `setConsent(granted)` para gestionar elección |
| SEC-LOG-RUM-003 | Rate limiting en ingesta RUM (separado de logs operativos)                                    | Pendiente | 1000 RUM req/min por app (vs 100 logs req/min); rate limiting en middleware Astro                                                                       |
| SEC-LOG-RUM-004 | Validación de schema de eventos RUM (event_name whitelist, metadata sanitizada)               | Pendiente | Whitelist centralizada de `event_name`; validación de `metadata` con regex (rechaza email, IP, DNI, teléfono)                                           |
| SEC-LOG-RUM-005 | RLS en `rum_events`, `rum_vitals`, `rum_sessions`, `rum_sampling_config`                      | Pendiente | RLS: solo lectura/escritura para roles `dev`, `ops`, `product`; admin puede escribir en `rum_sampling_config`                                           |
| SEC-LOG-RUM-006 | SDK RUM con try-catch global (nunca rompe app anfitriona)                                     | Pendiente | Try-catch en todas las operaciones del SDK; fallback silencioso; tests automatizados de resiliencia                                                     |
| SEC-LOG-RUM-007 | Retención limitada de datos RUM                                                               | Pendiente | Job cron purga `rum_events` y `rum_vitals` tras 90 días; configurable por admin                                                                         |
| SEC-LOG-RUM-008 | Uso de `sendBeacon` (no `fetch`) para no bloquear app                                         | Pendiente | SDK usa `navigator.sendBeacon()` cuando disponible; fallback a `fetch` async con `keepalive: true`                                                      |
| SEC-LOG-RUM-009 | No almacenamiento de IP                                                                       | Pendiente | Backend NO extrae ni almacena IP del request (no se usa `req.headers['x-forwarded-for']`); solo se almacena `user_agent_hash` (SHA-256 del User-Agent)  |
| SEC-LOG-RUM-010 | Separación de roles: dashboard operativo (dev/ops) vs dashboard de producto (dev/ops/product) | Pendiente | Rutas SSR protegidas con `requireRole` específico por sección                                                                                           |

## 4. Riesgo aceptado

### Logs operativos

- **Excepcion:** API key de ingesta compartida por app (no por usuario).
- **Justificación:** Las apps emisoras no tienen usuarios humanos; la key identifica la app origen. La key se almacena hasheada y se puede desactivar.
- **Aprobado por:** Iván Ezequiel Iencinella
- **Fecha:** 2026-05-26

### RUM y analíticas

- **Excepcion 1:** Datos RUM sin user ID (no se puede identificar usuarios individuales).
- **Justificación:** Decisión de privacidad y minimización de datos. Si en el futuro se requiere tracking de usuarios autenticados, se hará con consentimiento explícito y cumpliendo GDPR/LOPD.
- **Aprobado por:** Iván Ezequiel Iencinella
- **Fecha:** 2026-09-05

- **Excepcion 2:** Dashboard de producto accesible para rol `product` (no solo dev/ops).
- **Justificación:** El equipo de producto necesita acceso a métricas de uso para tomar decisiones de roadmap. RLS limita el acceso a datos agregados/anónimos, no a datos personales.
- **Aprobado por:** Iván Ezequiel Iencinella
- **Fecha:** 2026-09-05

## 5. Trazabilidad Seguridad -> Requisitos

### Logs operativos

| Seguridad        | Requisito relaciónado             |
| ---------------- | --------------------------------- |
| SEC-0105-LOG-001 | NFR-0105-LOG-004, FR-0105-LOG-012 |
| SEC-0105-LOG-002 | NFR-0105-LOG-004, FR-0105-LOG-013 |
| SEC-0105-LOG-003 | FR-0105-LOG-002, RB-0105-LOG-001  |
| SEC-0105-LOG-006 | ADR-0105-LOG-003                  |
| SEC-0105-LOG-007 | ERM-0105-LOG-002                  |

### RUM y analíticas

| Seguridad       | Requisito relaciónado                            |
| --------------- | ------------------------------------------------ |
| SEC-LOG-RUM-001 | FR-LOG-RUM-006, NFR-LOG-RUM-003, RB-LOG-RUM-001  |
| SEC-LOG-RUM-002 | FR-LOG-RUM-006, RB-LOG-RUM-005                   |
| SEC-LOG-RUM-003 | NFR-LOG-RUM-002, ERM-LOG-RUM-001                 |
| SEC-LOG-RUM-004 | FR-LOG-RUM-002, RB-LOG-RUM-001                   |
| SEC-LOG-RUM-005 | FR-LOG-RUM-005, FR-LOG-RUM-R008                  |
| SEC-LOG-RUM-006 | NFR-LOG-RUM-001, RB-LOG-RUM-006, ERM-LOG-RUM-005 |
| SEC-LOG-RUM-008 | ADR-LOG-RUM-002, NFR-LOG-RUM-001                 |
| SEC-LOG-RUM-009 | RB-LOG-RUM-001, NFR-LOG-RUM-003                  |
| SEC-LOG-RUM-010 | FR-LOG-RUM-R008                                  |
