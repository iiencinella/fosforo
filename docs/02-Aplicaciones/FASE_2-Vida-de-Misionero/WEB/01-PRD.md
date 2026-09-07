---
tags:
  - proyecto/fosforo
  - aplicación
  - fase-2
type: app-prd
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|README Vida de Misionero]]"
  - "[[02-SRS|SRS Vida de Misionero]]"
---

# PRD - Vida de Misionero (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Resumen ejecutivo

Vida de Misionero convierte la formación espiritual en un camino gamificado: rutas editoriales (misericordia, oración, servicio) con misiones diarias y semanales pequeñas y sostenidas, progreso visible, niveles, rachas e insignias. El contenido vive en el CMS; el progreso vive en Supabase por usuario autenticado. El éxito se mide en retención (30 días > 40%) y misiones completadas por semana.

## 2. Problema

- La formación espiritual se abandona: el usuario católico tiene abundante material (biblias, homilías, libros) pero ningún camino ordenado que le diga "hacé hoy esto, paso a paso".
- Sin estructura ni hábito, la intención inicial ("quiero formarme más") decae en días: no hay metas pequeñas, ni feedback de avance, ni recordatorio.
- La gamificación tradicional (apps de hábitos seculares) no ofrece contenido espiritual confiable ni magisterialmente revisado; los recursos católicos serios no ofrecen estructura de hábito.
- Resultado: alta intención, altísima tasa de abandono, y pastores/catequistas sin una herramienta para acompañar procesos de formación.

## 3. Jobs To Be Done (JTBD)

- **JTBD principal:** "Cuando quiero crecer espiritualmente pero no sé por dónde empezar, quiero un camino concreto con pasos pequeños y sostenidos, para convertir mi intención en un hábito diario real."
- **JTBD de acompañamiento:** "Como catequista o pastor, quiero proponer a mis feligreses una ruta de formación con misiones diarias, para acompañarlos sin construir material desde cero."
- **JTBD de constancia:** "Cuando un día se me complica, quiero que mi racha y mi progreso se cuiden con reglas justas (idempotencia, zona horaria), para no sentir que el sistema me castiga injustamente ni me deja trampiar."

## 4. Objetivos del producto

1. Convertir intención en hábito: que el usuario complete su primera misión dentro de su primera sesión.
2. Sostener el hábito: racha + recordatorios + misiones diarias de bajo costo de tiempo (5-15 min).
3. Mantener confianza doctrinal: todo contenido viene del CMS, revisado por editores; el usuario puede reportar problemas de contenido.
4. Medir para iterar: RUM de embudo (ruta -> misión -> completado) y retención.

## 5. Requisitos de producto (PRD-MISION-*)

### PRD-MISION-001: Rutas de formación espiritual

- Ofrecer rutas temáticas (misericordia, oración, servicio, y las que agregue el editor) provenientes del CMS (content type `ruta`).
- Cada ruta se presenta con descripción, temática, duración estimada, cantidad de pasos y estado del usuario (no iniciada / en progreso / completada).
- El listado ordena por relevancia editorial (campo del CMS) y muestra el avance del usuario.

### PRD-MISION-002: Misiones diarias y semanales

- Cada ruta contiene pasos; cada paso contiene misiones concretas del CMS (content type `mision`) con periodicidad `diaria` o `semanal`.
- Vista "Hoy": misiones del día (y de la semana vigente) con check de completado.
- Una misión diaria completada suma puntos; la misma misión no puede otorgar puntos dos veces el mismo día (idempotencia).

### PRD-MISION-003: Progreso y niveles

- El progreso del usuario por ruta (pasos completados, puntos) y su nivel global se calculan y almacenan server-side, nunca en el cliente.
- Niveles por puntos acumulados con reglas simples y públicas (ver ADR-MISION-005).
- El progreso es privado: solo el dueño lo ve (RLS).

### PRD-MISION-004: Rachas (streak)

- Racha de días consecutivos con al menos una misión completada.
- La racha se calcula con la zona horaria del usuario (guardada como `tz_offset`), nunca con UTC del servidor.
- El MVP no incluye "escudos" ni congelamiento de racha; queda como evolución.

### PRD-MISION-005: Insignias y logros

- Insignias automáticas por hitos de racha: 5, 30 y 90 días.
- Insignias por completar rutas (primera ruta, cada ruta completada).
- Las insignias se otorgan server-side por eventos (no manualmente), son visibles en Perfil/Progreso y su concesión es idempotente.

### PRD-MISION-006: Autenticación obligatoria

- Todo el progreso es por usuario: la app requiere sesión (Sistema de Logueo) para navegar rutas, "Hoy", progreso y completar misiones.
- Sin sesión válida, cualquier ruta de la app redirige al login; no existe modo anónimo ni lectura de contenido con progreso simulado.

### PRD-MISION-007: RUM y métricas de producto

- Emitir eventos RUM `mision.started` y `mision.completed` hacia Log, más eventos de embudo (`ruta.viewed`, `ruta.started`, `hoy.viewed`).
- Medir: retención 30 días, misiones/semana, racha promedio, embudo de activación.
- Los eventos no incluyen PII (ver PRD-MISION-007.1: atribución por `user_id` interno, sin datos sensibles en payload).

### PRD-MISION-008: Recordatorios de misiones

- Opt-in: el usuario configura recordatorio diario (hora + canal) via Sistema de Notificaciones.
- El recordatorio se envía solo si el usuario lo activó (consentimiento explícito, revocable en cualquier momento).
- Por defecto desactivado.

### PRD-MISION-009: Reporte de problema de contenido

- Desde cualquier misión o ruta, el usuario puede reportar un problema de contenido (error, confusión, contenido desactualizado) hacia el CMS/equipo editorial.
- El reporte incluye `content_ref`, contexto mínimo y descripción; genera tarea para editores y feedback al usuario.

## 6. Usuarios y escenarios

- **Feligresé activa:** católico laical que quiere formarse; entra 1 vez/día, completa 1-3 misiones, mira su racha.
- **Catequista/lider:** propone una ruta a su grupo; necesita que las rutas sean autocontenidas y confiables.
- **Editor del CMS:** crea rutas y misiones; necesita ver reportes de contenido para corregir.

Escenario fundacional: Juana entra por primera vez, ve 3 rutas, elige "Oración para principiantes", completa su primera misión diaria (5 min), ve su progreso subir y activa recordatorio diario 21:00.

## 7. Métricas de éxito (KPI)

| Métrica                                 | Objetivo MVP | Fuente                |
| --------------------------------------- | ------------ | --------------------- |
| Retención a 30 días                     | > 40%        | RUM/Log               |
| Misiones completadas por semana/usuario | >= 3         | `mission_completions` |
| Usuarios con racha >= 5 días (semanal)  | > 25%        | `progress`            |
| Embudo ruta vista -> primera misión     | > 60%        | RUM                   |
| Reportes de contenido corregidos < 48h  | > 90%        | CMS                   |

## 8. Riesgos de producto

| Riesgo                               | Mitigación                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Gamificación trivial (puntos vacíos) | Misiones con contenido espiritual real del CMS; puntos atados a contenido                                    |
| Abandono temprano (primeros 7 días)  | Onboarding a primera misión, recordatorios opt-in, racha visible                                             |
| Contenido insuficiente en CMS        | Mínimo editorial de lanzamiento (3 rutas x >= 10 misiones); alerta a editores cuando no hay misiones del día |
| Racha injusta por zona horaria       | `tz_offset` del usuario + tests específicos (TC-MISION de TZ)                                                |
| Progreso duplicado/fraude            | Completado idempotente server-side (ver FR-MISION-003, ADR-MISION-002)                                       |

## 9. Fuera de alcance del MVP

- Social, comunidad, rankings públicos, multi-idioma, offline/PWA, monetización (ver 00-README).

## 10. Dependencias

- **CMS (Sistema de Contenidos):** content types `ruta` y `mision`. Bloqueante.
- **Sistema de Logueo:** sesión obligatoria. Bloqueante.
- **Sistema de Notificaciones:** recordatorios. Bloqueante para PRD-MISION-008 (el resto puede lanzar sin él).
- **Log:** RUM + logs técnicos. Bloqueante para métricas.

## 11. Trazabilidad PRD -> SRS

| PRD            | SRS                          | FRD (UC)                                    |
| -------------- | ---------------------------- | ------------------------------------------- |
| PRD-MISION-001 | FR-MISION-001, FR-MISION-002 | UC-MISION-001, UC-MISION-002                |
| PRD-MISION-002 | FR-MISION-003, FR-MISION-006 | UC-MISION-003                               |
| PRD-MISION-003 | FR-MISION-004                | UC-MISION-003, UC-MISION-004, UC-MISION-008 |
| PRD-MISION-004 | FR-MISION-004, FR-MISION-006 | UC-MISION-008                               |
| PRD-MISION-005 | FR-MISION-005                | UC-MISION-004                               |
| PRD-MISION-006 | FR-MISION-007                | UC-MISION-001..004 (precondición global)    |
| PRD-MISION-007 | FR-MISION-008                | Transversal a todos los UC                  |
| PRD-MISION-008 | FR-MISION-009                | UC-MISION-005, UC-MISION-007                |
| PRD-MISION-009 | FR-MISION-010                | UC-MISION-006                               |
