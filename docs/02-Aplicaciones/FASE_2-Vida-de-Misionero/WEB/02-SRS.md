---
tags:
  - proyecto/fosforo
  - aplicación
  - fase-2
type: app-srs
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[01-PRD|PRD Vida de Misionero]]"
  - "[[03-FRD|FRD Vida de Misionero]]"
---

# SRS - Vida de Misionero (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Alcance y contexto

Este documento deriva del [01-PRD](01-PRD.md) y especifica los requisitos funcionales (FR-MISION-*), requisitos no funcionales (NFR), integraciones (IR), criterios de aceptación (CA) y trazabilidad. La app corre como sitio Astro 6 SSR con islas React 19, autenticación obligatoria vía Sistema de Logueo, contenido del CMS y estado de progreso en Supabase (esquema `vida_misionero`, RLS por `user_id`).

## 2. Requisitos funcionales (FR-MISION-*)

### FR-MISION-001: Listado de rutas desde CMS

- La página `/rutas` consulta el CMS (content type `ruta`) en SSR con cache corta (revalidación) y cruza cada ruta con el estado del usuario autenticado.
- Cada ítem muestra: título, temática, descripción breve, cantidad de pasos, duración estimada, imagen/campo editorial de portada y estado (`no_iniciada` / `en_progreso` / `completada`).
- Si el CMS no responde, se sirve la última copia cacheada y se registra en Log; el usuario ve banner de "contenido puede estar desactualizado". Si no hay cache, estado vacío controlado.
- Requiere sesión (FR-MISION-007).

### FR-MISION-002: Ficha de ruta con pasos

- `/ruta/[slug]` valida el `slug` contra el CMS; slug inválido -> 404.
- Muestra la ruta completa: pasos en orden, y por paso sus misiones (`diaria`/`semanal`) con estado del usuario (disponible / completada hoy-semana / expirada).
- Registra RUM `ruta.viewed`; si el usuario no había iniciado la ruta, al completar su primera misión de esa ruta se emite `ruta.started`.
- Botón "Comenzar ruta" que marca inicio local (primer paso activo) y navega a "Hoy".

### FR-MISION-003: Completar misión (validación server-side, anti-fraude)

- El único camino para completar una misión es `POST /api/misiones/completar` con sesión válida (cookie httpOnly) y payload `{ mission_ref }`.
- Validación server-side: (a) sesión y `user_id` de la cookie, nunca del body; (b) `mission_ref` debe existir en el CMS y pertenecer a una ruta publicada; (c) periodicidad vigente (una `diaria` solo valida el día actual del usuario según su `tz_offset`; una `semanal` solo dentro de su semana vigente).
- Anti-fraude / idempotencia: si `(user_id, mission_ref, fecha_local)` ya existe, la operación es no-op exitoso (no duplica puntos, no duplica RUM `mision.completed`); constraint `unique(user_id, mission_ref, fecha)` en DB (ver 06-Esquema de Datos).
- Rate limiting por usuario e IP (ver 10-OWASP, SEC-MISION-004). Payload inválido -> 400; sesión inválida -> 401; misión inexistente -> 404; ventana no vigente -> 422.
- Respuesta exitosa: nuevo estado de progreso (puntos, nivel, racha), insignias nuevas si corresponden, y flag `already_completed`.

### FR-MISION-004: Progreso y nivel calculados por puntos

- Al completar una misión, una Edge Function/endpoint server suma puntos (diaria: 10 pts; semanal: 30 pts; reglas simples versionadas en DB, ver ADR-MISION-005), recalcula el nivel global por umbrales y actualiza `progress` de la ruta (`pasos_completados`, `puntos`).
- El nivel global se calcula server-side en la misma transacción; el cliente solo renderiza valores de servidor, nunca calcula puntos ni niveles.
- `/progreso` muestra: puntos totales, nivel, racha actual y mejor racha, progreso por ruta (barra) e insignias.
- Toda transacción de progreso es idempotente: reintentos de red no corrompen el estado.

### FR-MISION-005: Insignias otorgadas por hitos

- Tras cada completado válido, el server evalúa hitos: racha de 5, 30 y 90 días (`badge_ref: racha-5`, `racha-30`, `racha-90`), primera ruta completada (`primera-ruta`) y ruta completada (`ruta-<slug>`).
- Otorgamiento idempotente: si la insignia ya existe para el usuario, no se vuelve a otorgar ni notificar (PK/unique por `(user_id, badge_ref)`).
- La insignia otorgada devuelve el evento en la respuesta de completar y se emite RUM `badge.earned`.

### FR-MISION-006: Misiones diarias y semanales con reset (cron/edge)

- La vista `/hoy` resuelve, para el día local del usuario (`tz_offset` de `preferences`), las misiones diarias vigentes de sus rutas en progreso y las semanales de la semana vigente.
- Edge Function programada (cron diario) materializa/resetear la disponibilidad del día: ninguna misión diaria completada ayer aparece como pendiente hoy; el estado del día se deriva de `mission_completions` por fecha local, no por flags mutables.
- Si el CMS no tiene misiones vigentes para el día, `/hoy` muestra estado vacío controlado con mensaje editorial y se alerta a editores (ver 07-ERM, ERM-MISION-003).

### FR-MISION-007: Auth obligatoria (rutas protegidas)

- Todas las páginas (`/rutas`, `/ruta/[slug]`, `/hoy`, `/progreso`, preferencias) y todos los endpoints requieren sesión válida (cookie de sesión del Sistema de Logueo, verificada SSR y en API).
- Sin sesión: redirección 302 a login con `redirect_uri` seguro (whitelist de paths internos). Sin excepciones ni modo invitado.
- `user_id` para todas las operaciones se obtiene del token de sesión verificado server-side.

### FR-MISION-008: RUM con eventos

- Emitir a Log los eventos: `mision.started` (al abrir una misión no completada), `mision.completed` (solo en el completado efectivo, no en reintentos idempotentes), `ruta.viewed`, `ruta.started`, `hoy.viewed`, `progreso.viewed`, `badge.earned`, `reminder.configured`.
- Payload mínimo: evento, `user_id` interno, `content_ref`, `ts`, `session_id` anónimo. Sin PII, sin contenido libre del usuario (ver 10-OWASP SEC-MISION-005).
- Envío no bloqueante con best-effort; un fallo de RUM nunca rompe la acción del usuario ni la transacción de progreso.

### FR-MISION-009: Recordatorios opt-in

- `/progreso` (o sección Preferencias) permite configurar: recordatorio activo (default off), hora (lista de slots), canal (in-app / email según capacidades del Sistema de Notificaciones).
- Al guardar, `PUT /api/preferencias` persiste en `preferences` (con `tz_offset`) y sincroniza la suscripción con el Sistema de Notificaciones (`reminder.configured`).
- Revocación inmediata y completa (baja también en Notificaciones).

### FR-MISION-010: Reporte de contenido

- En ficha de ruta y en misión: acción "Reportar un problema" con motivo (selector: doctrinal, error, confuso, desactualizado, otro) y descripción (validada y saneada, límite 1000 caracteres).
- `POST /api/reportes` persiste el reporte con `content_ref` y `user_id`, y lo enruta al equipo editorial del CMS; respuesta con acuse al usuario. Rate limit estricto (SEC-MISION-004).

## 3. Requisitos no funcionales (NFR)

| NFR    | Requisito                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------- |
| NFR-01 | Performance: LCP p75 < 2.5s en móvil 4G para `/rutas`, `/hoy`, `/progreso` (SSR + cache de CMS)         |
| NFR-02 | Accesibilidad WCAG 2.2 AA: navegación por teclado, foco visible, contraste >= 4.5:1, checks accesibles  |
| NFR-03 | Disponibilidad del servicio: 99.5% mensual (ver 11-SLA y SLO)                                           |
| NFR-04 | Idempotencia de completado: 100% (cero doble otorgamiento de puntos, garantizado por unique en DB)      |
| NFR-05 | Privacidad: RUM sin PII; progreso visible solo por el dueño (RLS); sin exponer datos en cliente         |
| NFR-06 | Responsividad: layouts mobile-first, breakpoints del design system compartido (`@repo/tailwind-config`) |
| NFR-07 | Observabilidad: logs estructurados sin secretos; eventos RUM con sampling razonable                     |
| NFR-08 | Robustez: fallas del CMS o de RUM degradan la experiencia, nunca pierden progreso (transacciones DB)    |

## 4. Integraciones (IR)

| IR    | Sistema                       | Uso                                                                 |
| ----- | ----------------------------- | ------------------------------------------------------------------- |
| IR-01 | CMS (Sistema de Contenidos)   | Content types `ruta` y `mision`; lectura SSR con cache; reportes    |
| IR-02 | Sistema de Logueo             | Sesión obligatoria; verificación de cookie; `user_id` server-side   |
| IR-03 | Sistema de Notificaciones     | Recordatorios opt-in de misiones del día                            |
| IR-04 | Log                           | RUM de producto (`mision.*`, `ruta.*`, `badge.earned`) + logs       |
| IR-05 | Supabase (Auth/Postgres/Edge) | Sesión y RLS por `user_id`; esquema `vida_misionero`; cron de reset |

## 5. Criterios de aceptación (CA)

- **CA-01:** Usuario autenticado completa una misión diaria -> progreso sube exactamente 10 pts; repetir la misma acción el mismo día (doble click, reintento de red, replay del POST) no suma más puntos (CA de idempotencia, verificado por TC-MISION-004/005).
- **CA-02:** La racha refleja correctamente días consecutivos con completados usando la zona horaria del usuario: completar el 05/03 23:30 (UTC-3) y el 06/03 07:00 (UTC-3) cuenta como 2 días consecutivos, aunque en UTC ambas caigan el 06/03 (TC-MISION-012/013).
- **CA-03:** Sin sesión, `GET /hoy` redirige a login; `POST /api/misiones/completar` responde 401 y no muta estado.
- **CA-04:** El cliente nunca recibe responsabilidad de cálculo: manipular el payload con `puntos` o `user_id` propios no altera el resultado (server ignora/valida).
- **CA-05:** Con CMS caído, `/rutas` sirve cache; sin cache muestra estado vacío; el progreso existente sigue intacto y consultable.
- **CA-06:** Al alcanzar racha de 5 días, la insignia `racha-5` aparece una única vez; re-evaluar el hito no la duplica ni re-notifica.
- **CA-07:** Reset diario: tras el cron, las misiones diarias de ayer no aparecen como pendientes hoy y las nuevas del día aparecen vigentes.
- **CA-08:** Recordatorio: activar/desactivar se refleja en Notificaciones; desactivar detiene los envíos en < 24h (siguiente ciclo).

## 6. Trazabilidad SRS

| FR            | PRD                | CA          | UC (FRD)                     | TC (05)                      |
| ------------- | ------------------ | ----------- | ---------------------------- | ---------------------------- |
| FR-MISION-001 | PRD-MISION-001     | CA-05       | UC-MISION-001                | TC-MISION-001                |
| FR-MISION-002 | PRD-MISION-001     | CA-05       | UC-MISION-002                | TC-MISION-002                |
| FR-MISION-003 | PRD-MISION-002     | CA-01/03/04 | UC-MISION-003                | TC-MISION-004..007, 010, 011 |
| FR-MISION-004 | PRD-MISION-003/004 | CA-01/02    | UC-MISION-003, 004, 008      | TC-MISION-008, 012..014      |
| FR-MISION-005 | PRD-MISION-005     | CA-06       | UC-MISION-004                | TC-MISION-014..016           |
| FR-MISION-006 | PRD-MISION-002/004 | CA-02/07    | UC-MISION-003, 008           | TC-MISION-017, 018           |
| FR-MISION-007 | PRD-MISION-006     | CA-03       | Precondición de todos los UC | TC-MISION-003                |
| FR-MISION-008 | PRD-MISION-007     | CA-01       | Transversal                  | TC-MISION-006, 009           |
| FR-MISION-009 | PRD-MISION-008     | CA-08       | UC-MISION-005, 007           | TC-MISION-009                |
| FR-MISION-010 | PRD-MISION-009     | -           | UC-MISION-006                | TC-MISION-007                |
