---
tags:
  - proyecto/fosforo
  - aplicación
  - fase-2
type: app-arquitectura
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[02-SRS|SRS Vida de Misionero]]"
  - "[[03-FRD|FRD Vida de Misionero]]"
  - "[[09-Especificacion Tecnica|Especificacion Tecnica]]"
---

# Decisiones de Arquitectura - Vida de Misionero (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

Formato ADR ligero: Contexto -> Decisión -> Consecuencias. Los ADR-MISION-* son vinculantes para la implementación en `src/apps/vida-misionero/`.

## ADR-MISION-001: El contenido (rutas y misiones) vive en el CMS

- **Contexto:** la formación espiritual requiere contenido editorial revisado (doctrinalmente confiable), que cambia sin desplegar codigo y lo gestionan editores, no desarrolladores.
- **Decisión:** content types `ruta` y `mision` en el Sistema de Contenidos; la app los consume en SSR con cache de revalidación y referencia el estado dinámico por `content_ref`. No hay contenido de rutas hardcodeado ni duplicado en la app.
- **Consecuencias:** (+) editores publican sin deploys; consistencia con el resto del ecosistema; (-) dependencia del CMS (mitigada con cache y estados vacíos, ERM-MISION-003/005); obliga a validar `content_ref` al completar.

## ADR-MISION-002: Progreso server-side con idempotencia por unique constraint

- **Contexto:** el completado de misiones puede repetirse (doble click, reintentos de red, replays maliciosos); un punto otorgado dos veces rompe la confianza del juego.
- **Decisión:** el único camino de mutación es `POST /api/misiones/completar` validado server-side; la garantía final de idempotencia es la constraint `unique(user_id, mission_ref, fecha)` en `mission_completions` (conflicto -> no-op exitoso). El cliente nunca calcula ni envía puntos.
- **Consecuencias:** (+) idempotencia a prueba de reintentos y de bugs de app; antifraude estructural; (-) todo completado requiere escritura DB transaccional; los tests deben cubrir el camino del conflicto (TC-MISION-004/005).

## ADR-MISION-003: Autenticación obligatoria para toda la app

- **Contexto:** todo el valor (progreso, racha, insignias) es por usuario; sin sesión no hay progreso posible ni legítimo.
- **Decisión:** todas las páginas y endpoints requieren sesión válida del Sistema de Logueo (cookie verificada SSR y en API); sin modo invitado ni lectura de contenido "con progreso demo". `user_id` siempre del token verificado.
- **Consecuencias:** (+) simplicidad de modelo (no hay estados anónimos que migrar), privacidad por defecto (RLS con `auth.uid()`); (-) el contenido no es "descubrible" sin cuenta, mitigado con landing/descripción pública del ecosistema (fuera de la app).

## ADR-MISION-004: Streak con la zona horaria del usuario, no UTC

- **Contexto:** una "racha diaria" es un concepto local: si se calcula en UTC, usuarios de UTC-3 o UTC+10 ven rachas rotadas/injustas en los bordes del día.
- **Decisión:** `tz_offset` (minutos) se guarda en `preferences` y, inmutablemente, en cada fila de `mission_completions` (`fecha` = fecha local al completar). La racha se deriva agrupando por fecha local; los históricos nunca se reescriben aunque el usuario viaje.
- **Consecuencias:** (+) rachas justas y comprensibles; (-) requiere disciplina en tests de TZ (TC-MISION-012/013) y acepta pequeñas ambigüedades en viajes (documentadas: la racha histórica conserva la zona en que se completó).

## ADR-MISION-005: Puntos y niveles calculados en el servidor, reglas versionadas

- **Contexto:** gamificar sin reglas manipulables; las reglas cambiarán con el tiempo (balance del juego).
- **Decisión:** puntos por periodicidad (diaria 10, semanal 30) y umbrales de nivel (p. ej. nivel n en 50 x 2^(n-1) pts acumulados, tabla versionada) viven en el servidor (config en DB/Edge Function con versión); el cliente solo renderiza.
- **Consecuencias:** (+) un solo punto de verdad, cambios de balance sin deploy de apps, imposible inflar desde cliente; (-) todo cambio de reglas debe documentarse aquí y en tests (TC-MISION-014).

## ADR-MISION-006: Insignias automáticas por eventos (idempotentes)

- **Contexto:** otorgar insignias manualmente no escala y es propenso a error/favoritismo.
- **Decisión:** tras cada completado válido, el servicio evalúa hitos (racha 5/30/90; primera ruta; ruta completada) y hace `INSERT ... ON CONFLICT (user_id, badge_ref) DO NOTHING`; notificación solo cuando el insert fue nuevo.
- **Consecuencias:** (+) sin intervención manual, re-evaluable sin duplicar; (-) hitos nuevos retroactivos requieren una tarea de backfill planificada (nunca en caliente).

## ADR-MISION-007: Recordatorios via Sistema de Notificaciones (opt-in)

- **Contexto:** el hábito necesita recordatorio, pero la app no debe construir su propio pipeline de envíos ni spamear.
- **Decisión:** la app solo persiste preferencia + consentimiento (`preferences`) y sincroniza la suscripción con el Sistema de Notificaciones; los envíos (cron diario, lotes por `tz_offset`) son responsabilidad de Notificaciones. Default desactivado; revocación inmediata.
- **Consecuencias:** (+) reutiliza capacidad compartida, una sola política de consentimiento en el ecosistema; (-) acoplamiento a la disponibilidad de Notificaciones (degradación: preferencia queda `pendiente_sync` y se reintenta).

## ADR-MISION-008: RUM de producto para medir retención y embudo

- **Contexto:** el éxito del app es de hábito (retención 30d > 40%), no de tráfico; hay que medir el embudo real sin violar privacidad.
- **Decisión:** eventos RUM a Log (`mision.started`, `mision.completed`, `ruta.viewed`, `ruta.started`, `hoy.viewed`, `progreso.viewed`, `badge.earned`, `reminder.configured`) con payload mínimo sin PII (`user_id` interno, `content_ref`, `ts`, `session_id` anónimo); envío best-effort no bloqueante.
- **Consecuencias:** (+) funnel medible (activación, retención, rachas), decisiones de producto basadas en datos; (-) RUM no garantiza 100% de cobertura (best-effort): la verdad transaccional es DB, el RUM es analítica; las métricas de negocio usan ambas fuentes.

## Resumen de ADRs y su expresión en el esquema/codigo

| ADR            | Expresión concreta                                                     |
| -------------- | ---------------------------------------------------------------------- |
| ADR-MISION-001 | `lib/cms.ts` (lectura CMS + cache), `content_ref` en todas las tablas  |
| ADR-MISION-002 | `POST /api/misiones/completar` + `unique(user_id, mission_ref, fecha)` |
| ADR-MISION-003 | middleware/guard SSR + verificación en cada endpoint                   |
| ADR-MISION-004 | `fecha` local + `tz_offset` en completados; `lib/streak.ts`            |
| ADR-MISION-005 | config versionada en server; `lib/progress.ts`                         |
| ADR-MISION-006 | `unique(user_id, badge_ref)`; `lib/badges.ts`                          |
| ADR-MISION-007 | `preferences` + cliente del Sistema de Notificaciones                  |
| ADR-MISION-008 | wrapper RUM hacia Log; lista de eventos en FR-MISION-008               |
