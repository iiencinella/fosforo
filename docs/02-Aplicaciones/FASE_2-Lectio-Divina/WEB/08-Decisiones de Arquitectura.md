---
tags:
  - proyecto/fosforo
  - app/lectio-divina
  - fase/2
  - plataforma/web
type: app-arquitectura
owner: Iván Ezequiel Iencinella
status: draft
created: 2026-09-05
updated: 2026-09-05
---

# Decisiones de Arquitectura — Lectio Divina (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## ADR-LECTIO-001 — Las lecturas se obtienen vía Motor Litúrgico/CMS, con fallback manual

- **Estado:** Aceptada
- **Contexto:** Las lecturas del día dependen del calendario litúrgico; duplicarlas o hardcodarlas generaría divergencia entre apps (Biblia, Misal, Lectio) y riesgo de error doctrinal por texto desactualizado.
- **Decisión:** `lib/motor.ts` consulta al Motor Litúrgico (resolución de la fecha) y al CMS/Misal (texto), con cache de presentación TTL corto (15 min). Si el Motor no provee lecturas: **fallback** a selección manual de lectura por el usuario; la sesión y el diario funcionan igual (fuente marcada `manual`).
- **Consecuencias:** una única fuente de verdad; dependencia visible del Motor (mitigada con fallback, ERM-LECTIO-003); prohibición de hardcode (RB-LECTIO-001).

## ADR-LECTIO-002 — Diario privado con RLS estricta: solo el dueño, sin acceso por roles

- **Estado:** Aceptada
- **Contexto:** El diario contiene oraciones íntimas. Cualquier "acceso de administración para soporte" es un backdoor psicológico y técnico. La política debe poder explicarse en una línea.
- **Decisión:** Políticas RLS en `lectio.sessions`, `lectio.entries`, `lectio.preferences`: `for all using/with check (auth.uid() = user_id)`. **Ningún** rol de aplicación lectura ni backoffice. service-role únicamente para migraciones controladas; jamás en rutas de API. `user_id` se denormaliza en `entries` para hacer la política trivial y auditable.
- **Consecuencias:** soporte no puede leer el diario del usuario (se le pedirá al usuario exportar); tests de RLS bloqueantes en CI; riesgo P1 con doble barrera (ERM-LECTIO-001).

## ADR-LECTIO-003 — Autoguardado por paso (debounce 2 s) para no perder entradas

- **Estado:** Aceptada
- **Contexto:** Perder "la oración de hoy" por un corte de red o cierre de pestaña es el daño mayor a la experiencia (ERM-LECTIO-002); guardar por tecla saturaría la API.
- **Decisión:** Cada paso persiste en `entries` (upsert por `session_id`+`paso`) con cliente debounced 2 s tras la última escritura, PUT por paso (`PUT /api/diario/{paso}`), reintentos exponenciales (3) y cola local si la red falla. Sin botón "guardar": el guardado es transparente.
- **Consecuencias:** pérdida de entradas ≈ 0 (SLO-LECTIO-003); tráfico moderado y predecible; "último que escribe gana" por paso con aviso en recargas (LECTIO-E-004).

## ADR-LECTIO-004 — Sesión idempotente por fecha + streak con zona horaria del usuario

- **Estado:** Aceptada
- **Contexto:** "Reintentar hoy" no debe duplicar sesiones; y una racha rotada por UTC castiga injustamente a viajeros (ERM-LECTIO-005).
- **Decisión:** `sessions` con `UNIQUE (user_id, fecha)`: iniciar el mismo día **retoma**. Cada sesión guarda `tz_offset` del momento; el streak se computa sobre fechas locales consecutivas de sesiones completadas.
- **Consecuencias:** historial honesto por día local; edición de sesiones completadas permitida sin duplicar estado (RB-LECTIO-003/004).

## ADR-LECTIO-005 — Los textos de la guía (5 pasos) son contenido propio versionado en repositorio

- **Estado:** Aceptada
- **Contexto:** La guía es **estática y doctrinal** (qué es leer, meditar, orar, contemplar, actuar). Meterla al CMS agregaría latencia, acoplamiento y riesgo de edición sin revisión teológica.
- **Decisión:** `guia/` dentro de `src/apps/lectio-divina/` con los textos de los 5 pasos (Markdown/TS), versionado con el código. Toda modificación vía PR (revisable por contenido, RB-LECTIO-005). El CMS queda solo para lecturas.
- **Consecuencias:** cero dependencia de red para la guía; cambios auditables por git; sin panel de edición (deliberado).

## ADR-LECTIO-006 — Recordatorios vía Sistema de Notificaciones, siempre opt-in

- **Estado:** Aceptada
- **Contexto:** Reimplementar agenda/envío de notificaciones por app duplicaría la capacidad compartida del ecosistema; y las notificaciones no pedidas molestan (antipatrón en apps de oración).
- **Decisión:** `preferences` guarda opt-in, hora local y `tz_offset`; la agenda del envío se delega al **Sistema de Notificaciones**, que entrega una notificación con **enlace profundo** a `/hoy`. Baja efectiva < 24 h. Sin consentimiento, no existe agenda.
- **Consecuencias:** reutilización de capacidad compartida (IR-LECTIO-04); límite de alcance: Lectio delega el canal (si el canal falla, escalar a ese sistema).

## ADR-LECTIO-007 — RUM solo eventos de práctica: el diario nunca viaja a telemetría

- **Estado:** Aceptada
- **Contexto:** Medir práctica (KPI: sesiones/semana) requiere eventos; pero RUM/Log es un dominio con retención y accesos distintos a los del diario: valioso pero ajeno a la confianza íntima.
- **Decisión:** Whitelist de eventos: `lectio.sesion.iniciada`, `lectio.paso.completado`, `lectio.sesion.completada`. Payload permitido: `(user_id_hash, fecha, paso, fuente_lecturas)` y métricas web-vitals. **Prohibido** texto, fragmentos, longitudes o cualquier derivado del contenido (TC-LECTIO-015 las audita).
- **Consecuencias:** telemetría segura por diseño; útil para producto sin invadir lo íntimo; cualquier futuro evento pasa por esta whitelista (gobierno del campo).

## ADR-LECTIO-008 — Exportación del diario propio a Markdown/JSON (solo dueño)

- **Estado:** Aceptada
- **Contexto:** El usuario dueño de sus palabras merece portabilidad (confianza y-soberanía de datos); pero la exportación es vector de masividad si end-points toman parámetros de terceros.
- **Decisión:** `GET /api/diario/export` (requerimiento Could del MVP) genera **en memoria** Markdown/JSON con **solo** filas del `auth.uid()` (RB-LECTIO-006), entrega como descarga, y registra el evento **sin contenido**. No hay export por parámetro de usuario.
- **Consecuencias:** soberanía del usuario; sin persistir los archivos; riesgo mitigado por autenticación (TC-LECTIO-014).
