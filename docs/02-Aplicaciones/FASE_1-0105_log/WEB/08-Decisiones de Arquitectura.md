---
tags:
  - proyecto/fosforo
  - arquitectura
  - decisiones
  - aplicacion/log
  - rum
  - analiticas
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-05-26
updated: 2026-09-05
related:
  - "[[00-README|README Log]]"
  - "[[02-SRS|SRS Log]]"
  - "[[03-FRD|FRD Log]]"
---

# Decisiones de Arquitectura - 0105_log

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Contexto

- Plataforma objetivo: WEB
- Alcance de esta decision: Arquitectura completa de la aplicacion de logs y RUM, incluyendo frontend, API, base de datos, autenticacion, SDK RUM y despliegue.

## Funcionalidades generales obligatorias

- Layout responsivo con menu hamburguesa en mobile (segun estandar del ecosistema)
- Tema claro/oscuro con toggle y persistencia (segun estandar del ecosistema)
- View Transitions de Astro entre paginas
- Skeletons durante la carga de datos
- Accesibilidad base: foco visible, roles ARIA, etiquetas, navegacion por teclado

## Decisiones clave

### Logs operativos (MVP vigente)

| ID               | Decision                                            | Motivo                                                                                                                 | Impacto                                                                  |
| ---------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ADR-0105-LOG-001 | Usar Astro SSR en lugar de static                   | Necesitamos API endpoints y proteccion de rutas por autenticacion                                                      | Cambia output de build a server; requiere adapter (Vercel)               |
| ADR-0105-LOG-002 | Usar Supabase Auth con RLS para control de acceso   | Mismo stack que el resto del ecosistema; RLS garantiza seguridad a nivel DB                                            | Requiere configurar roles en app_metadata                                |
| ADR-0105-LOG-003 | API key (hash) para ingesta en lugar de JWT de apps | Las apps emisoras no tienen usuarios; una API key es mas simple y evita depender del ciclo de vida de sesiones humanas | Requiere tabla api_keys y logica de hashing                              |
| ADR-0105-LOG-004 | Tabla unica log_entries con indices                 | Simplicidad; el volumen esperado no justifica sharding inicial. Particionamiento por mes como mejora futura            | Monitorear crecimiento; planificar particion cuando supere 10M registros |
| ADR-0105-LOG-005 | Zod para validacion de payloads de ingesta          | Tipado compartido entre API y frontend; Same-source validation                                                         | Dependencia adicional, pero ligera y estandar en el ecosistema           |
| ADR-0105-LOG-006 | React islands para tabla, filtros y dashboard       | Interactividad rich (filtros reactivos, graficos) sin perder SSR del layout Astro                                      | Requires @astrojs/react                                                  |
| ADR-0105-LOG-007 | Chart.js liviano para dashboard                     | Simple, maduro, bundle pequeno. Alternativas: Recharts (mas React-native) o Nivo (mas features)                        | Chart.js elegido por bundle size y simplicidad para MVP                  |

### RUM y analíticas (extensión)

| ID              | Decision                                                                                               | Motivo                                                                                                                       | Impacto                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| ADR-LOG-RUM-001 | SDK RUM como paquete compartido `@repo/analytics` (no dentro de cada app)                              | Reutilización, consistencia, mantenimiento centralizado, versionado unificado                                                | Requiere crear nuevo paquete; todas las apps del ecosistema lo integran como dependencia                         |
| ADR-LOG-RUM-002 | Usar `navigator.sendBeacon()` para envío de RUM (no `fetch`)                                           | `sendBeacon` no bloquea el main thread, funciona en eventos `unload`/`pagehide`, tiene mejor comportamiento en mobile        | SDK debe detectar fallback a `fetch` async si `sendBeacon` no está disponible                                    |
| ADR-LOG-RUM-003 | Tablas separadas para RUM (`rum_events`, `rum_vitals`, `rum_sessions`), no mezcladas con `log_entries` | Volumen diferente (RUM es 10x-100x más alto que logs); queries optimizadas; retención diferente; audiencia diferente         | Mantener dos dominios de datos separados; sincronizar via `app_name`                                             |
| ADR-LOG-RUM-004 | `session_id_anon` es hash aleatorio generado por SDK, NO persistente entre sesiones ni entre apps      | Privacidad: no tracking cross-session; cumplimiento de principios de minimización                                            | SDK regenera session_id en cada nueva sesión de navegador; backend NO puede correlacionar sesiones               |
| ADR-LOG-RUM-005 | Dashboard de producto (`/dashboard-producto`) separado del dashboard operativo (`/dashboard`)          | Audiencia diferente (product/dev/ops vs dev/ops); queries diferentes (agregaciones RUM vs queries de logs); roles diferentes | Dos rutas Astro separadas con SSR; compartir layout pero contenido distinto                                      |
| ADR-LOG-RUM-006 | Sampling configurable por app y por tipo de evento                                                     | Evita saturación de ingesta en apps de alto tráfico; flexibilidad para casos de uso diversos                                 | Admin configura via tabla `rum_sampling_config`; SDK lee config al `init()`                                      |
| ADR-LOG-RUM-007 | Taxonomía común de `event_name` con whitelist centralizada                                             | Evita fragmentación de datos entre apps; permite construir embudos cross-app                                                 | Whitelist se valida en ingesta; admin puede agregar nuevos event_names; SDK tiene helper para autocompletar      |
| ADR-LOG-RUM-008 | SDK con try-catch global y fallback silencioso                                                         | SDK NUNCA debe romper la app anfitriona; es una capa de observabilidad, no de funcionalidad crítica                          | SDK envuelve todas las operaciones en try-catch; cualquier error se loguea internamente (opcional) y se descarta |
| ADR-LOG-RUM-009 | Sin user ID crudo ni IP persistida, solo `user_agent_hash` y `session_id_anon`                         | Cumplimiento de privacidad y minimización de datos; no tracking cross-session                                                | SDK NO expone APIs para setear user ID; backend rechaza payloads con campos PII                                  |

## Alternativas consideradas

### Logs operativos

- **Alternativa A - Tabla separada por app:** Se descarto porque complica el listado unificado y las consultas cross-app.
- **Alternativa B - Logging via webhook externo (Better Stack, Datadog):** Se descarto para MVP por costo y dependencia externa. Se evaluara en futura iteracion.
- **Alternativa C - Modo static Astro con cliente pesado:** Se descarto por los requisitos de autenticacion y proteccion de rutas.

### RUM y analíticas

- **Alternativa A - Google Analytics:** Se descartó por: (a) dependencia externa y costo; (b) problemas de privacidad (tracking cross-site por defecto); (c) falta de control sobre datos.
- **Alternativa B - PostHog self-hosted:** Se descartó para MVP por complejidad operacional (requiere infraestructura adicional); se evaluará post-MVP.
- **Alternativa C - Mixpanel:** Se descartó por: (a) costo y dependencia externa; (b) modelo de datos centrado en user ID (no encaja con nuestro modelo anónimo); (c) almacenamiento fuera del ecosistema.
- **Alternativa D - Custom solution sobre logs existentes (`log_entries` con `app='rum'`):** Se descartó por volumen esperado (RUM es 10x-100x más alto que logs), queries optimizadas diferentes y audiencia diferente.
- **Alternativa E - RUM con user ID (tracking cross-session):** Se descartó por incumplimiento de principios de privacidad y minimización de datos.

## Riesgos y mitigaciones

### Logs operativos

- **Riesgo 1 - Crecimiento acelerado de la tabla log_entries:** Mitigacion: indice compuesto por (app, level, timestamp); plan de particionamiento por mes al alcanzar 10M registros; job cron semanal para limpieza de logs > 30 dias.
- **Riesgo 2 - Abuso del endpoint de ingesta (muchos requests):** Mitigacion: rate limiting a nivel de Vercel o middleware de Astro; maximo 100 requests/min por API key.
- **Riesgo 3 - Datos sensibles en metadata de logs:** Mitigacion: documentar que las apps emisoras no deben incluir datos personales en logs; validacion no blocking en API para advertir.

### RUM y analíticas

- **Riesgo 1 - Volumen de eventos RUM satura ingesta:** Mitigacion: sampling configurable por app y tipo de evento (default 100% pageview/errors, 10% custom); rate limiting separado del de logs operativos; particionamiento por mes post-MVP.
- **Riesgo 2 - Fuga de PII en metadata de eventos:** Mitigacion: validación estricta en ingesta con regex (email, IP, DNI, teléfono); SDK no expone APIs para setear user ID; revisión periódica de eventos; whitelist de campos permitidos en `metadata`.
- **Riesgo 3 - SDK rompe app anfitriona:** Mitigacion: try-catch global; tests automatizados de resiliencia; fallback silencioso; versión del SDK validada en CI; SDK < 5KB comprimido.
- **Riesgo 4 - Taxonomía de eventos se fragmenta:** Mitigacion: whitelist centralizada; helper en SDK para autocompletar event_name; documentación por app; revisión periódica.
- **Riesgo 5 - Consentimiento no respetado:** Mitigacion: SDK respeta DNT por defecto; banner de consentimiento obligatorio en apps con tracking; tests automatizados; auditoría de eventos con `has_consent=false`.
