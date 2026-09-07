---
tags:
  - proyecto/fosforo
  - aplicación
  - fase-2
type: app-frd
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[02-SRS|SRS Vida de Misionero]]"
  - "[[04-Flujos y Secuencias|Flujos y Secuencias]]"
---

# FRD - Vida de Misionero (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Alcance

Este documento deriva del [02-SRS](02-SRS.md) y detalla casos de uso (UC-MISION-_), reglas de negocio (RB-MISION-_), validaciones/errores (MISION-001..006) y estados de los objetos de dominio.

## 2. Casos de uso (UC-MISION-*)

### UC-MISION-001: Ver rutas de formación

- **Actor:** Usuario autenticado.
- **Precondición:** Sesión válida (FR-MISION-007).
- **Flujo principal:**
  1. El usuario navega a `/rutas`.
  2. El SSR consulta el CMS (con cache) y el estado de progreso del usuario.
  3. Se renderiza la grilla/lista de rutas con estado por ruta (`no_iniciada`, `en_progreso`, `completada`) y se emite RUM `rutas.viewed`.
- **Flujo alternativo:** CMS caído -> cache; sin cache -> estado vacío con CTA "Reintentar".
- **Postcondición:** Usuario elige una ruta.

### UC-MISION-002: Ver ficha de ruta

- **Actor:** Usuario autenticado.
- **Precondición:** Sesión válida; `slug` existente en CMS.
- **Flujo principal:**
  1. `GET /ruta/[slug]` valida el slug contra el CMS.
  2. Se muestran pasos en orden con sus misiones y estados; CTA "Comenzar ruta" o "Continuar".
  3. RUM `ruta.viewed`.
- **Flujo alternativo:** Slug inválido -> 404 con navegación de vuelta.
- **Postcondición:** Usuario conoce el camino y sus misiones.

### UC-MISION-003: Completar misión

- **Actor:** Usuario autenticado.
- **Precondición:** Misión vigente (diaria: hoy local; semanal: semana local vigente); sesión válida.
- **Flujo principal:**
  1. Desde `/hoy` o desde la ficha de ruta, el usuario marca la misión (RUM `mision.started` al abrir/expandir).
  2. El cliente hace `POST /api/misiones/completar` con `{ mission_ref }`.
  3. El server valida sesión, misión en CMS, vigencia local, y aplica idempotencia (`unique(user_id, mission_ref, fecha)`).
  4. Transacción: insert en `mission_completions`, update de `progress` (+puntos, +nivel si cruza umbral), evaluación de insignias (UC hitos).
  5. Respuesta con nuevo estado; UI actualiza check, ring de progreso, puntos y racha; RUM `mision.completed` (una sola vez).
- **Flujos alternativos:** 401 sin sesión; 404 misión inexistente; 422 fuera de vigencia; 429 rate limit; reintento idempotente -> respuesta exitosa con `already_completed: true` y cero efectos adicionales.
- **Postcondición:** Progreso incrementado exactamente una vez por (usuario, misión, día).

### UC-MISION-004: Ver progreso e insignias

- **Actor:** Usuario autenticado.
- **Precondición:** Sesión válida.
- **Flujo principal:**
  1. `GET /progreso` consulta `progress`, `badges` y streak server-side.
  2. UI muestra: puntos, nivel, racha actual/mejora, progreso por ruta, insignias (otorgadas y bloqueadas con criterio visible).
  3. RUM `progreso.viewed`.
- **Postcondición:** Usuario ve su avance privado (solo dueño, RLS).

### UC-MISION-005: Configurar recordatorio

- **Actor:** Usuario autenticado.
- **Precondición:** Sesión válida; Sistema de Notificaciones disponible.
- **Flujo principal:**
  1. En Preferencias, activa recordatorio, elige hora (slots) y canal.
  2. `PUT /api/preferencias` persiste y sincroniza con Notificaciones; RUM `reminder.configured`.
  3. Acuse visual inmediato.
- **Flujo alternativo:** Notificaciones caído -> estado pendiente de sincronización + retry; se informa al usuario.
- **Postcondición:** Recordatorio activo (opt-in) o revocado.

### UC-MISION-006: Reportar problema de contenido

- **Actor:** Usuario autenticado.
- **Precondición:** Sesión válida; reporte bajo rate limit.
- **Flujo principal:**
  1. Desde ruta o misión, abre "Reportar un problema", elige motivo y escribe descripción.
  2. `POST /api/reportes` valida/sanea, persiste con `content_ref` + `user_id`, enruta a editores del CMS.
  3. Acuse al usuario ("Gracias, nuestro equipo lo revisará").
- **Flujo alternativo:** Validación falla -> errores en línea; rate limit -> 429 con mensaje.
- **Postcondición:** Reporte creado; feedback registrado.

### UC-MISION-007: Gestionar consentimiento de notificaciones

- **Actor:** Usuario autenticado.
- **Precondición:** Sesión válida.
- **Flujo principal:**
  1. Al activar recordatorio se muestra el consentimiento explícito (qué se enviará, con qué frecuencia, cómo darse de baja).
  2. Aceptación explícita habilita el envío; el rechazo deja el default (off).
  3. Revocación en cualquier momento desde Preferencias (también reachable desde pie del email/notificación).
- **Postcondición:** Consentimiento registrable y auditable (fecha, canal).

### UC-MISION-008: Ver y sostener racha (streak)

- **Actor:** Usuario autenticado.
- **Precondición:** Sesión válida; `tz_offset` en `preferences` (default del navegador en primera configuración).
- **Flujo principal:**
  1. La racha se muestra en `/hoy` y `/progreso` (ring y contador).
  2. Cada día local con >= 1 completado cuenta para la racha; sin completados en un día local, la racha se rompe al calcular (no hay flags mutables: se deriva de `mission_completions`).
  3. Al cruzar hitos 5/30/90, se otorgan insignias (UC via FR-MISION-005).
- **Flujo alternativo:** Viaje con cambio de zona -> `tz_offset` actualizado al recalcular; racha se interpreta en días locales del usuario.
- **Postcondición:** Racha consistente y justa respecto al huso del usuario.

## 3. Reglas de negocio (RB-MISION-*)

| ID            | Regla                                                                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RB-MISION-001 | El contenido de rutas y misiones proviene SIEMPRE del CMS; nunca se hardcodea ni se cachea contenido como fuente de verdad más allá del cache de revalidación           |
| RB-MISION-002 | El progreso (puntos, niveles, racha, insignias) se calcula y persiste SIEMPRE server-side; el cliente solo renderiza valores del server y jamás calcula ni envía puntos |
| RB-MISION-003 | Auth obligatoria: toda página y endpoint de la app requiere sesión válida; `user_id` siempre del token verificado, nunca del body/cliente                               |
| RB-MISION-004 | Completado idempotente: 1 punto por (usuario, misión, día local); garantizado por unique constraint `unique(user_id, mission_ref, fecha)`; reintentos = no-op exitoso   |
| RB-MISION-005 | La racha se calcula con la zona horaria del usuario (`tz_offset` guardado), nunca con UTC del servidor; cambio de `tz_offset` recalcula días locales                    |
| RB-MISION-006 | Insignias automáticas por hitos de racha (5, 30, 90 días) y por rutas completadas; otorgamiento idempotente por `(user_id, badge_ref)`, sin intervención manual en MVP  |
| RB-MISION-007 | Reset diario a las 00:00 del huso del usuario (cron materializa la disponibilidad del día); las misiones diarias no se acumulan ni se "deben" al día siguiente en MVP   |
| RB-MISION-008 | Todo evento relevante de producto emite RUM a Log sin PII; `mision.completed` solo en el completado efectivo (no en reintentos idempotentes)                            |

## 4. Validaciones y errores (MISION-001..006)

| ID         | Situación                                                            | Detección (server)                                     | Respuesta / UX                                                               |
| ---------- | -------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| MISION-001 | Sesión ausente o inválida                                            | Cookie de sesión inválida/expirada                     | Páginas: 302 a login con `redirect_uri` seguro. API: 401 JSON `{ error }`    |
| MISION-002 | `mission_ref` inexistente o ruta no publicada                        | Lookup contra CMS falla                                | 404 con mensaje "La misión ya no está disponible" y fallback a `/hoy`        |
| MISION-003 | Completado duplicado (misma misión, mismo día local)                 | Unique constraint en `mission_completions` (conflicto) | 200 con `already_completed: true`; sin puntos extra, sin RUM duplicado       |
| MISION-004 | Payload inválido (falta `mission_ref`, tipos erróneos, campos extra) | Validación de esquema en endpoint                      | 400 con mensaje genérico; log de intento (sin PII)                           |
| MISION-005 | Rate limit excedido                                                  | Contador por `user_id`+IP en window fijo               | 429 con `Retry-After`; UI deshabilita botón temporalmente                    |
| MISION-006 | CMS sin misiones vigentes del día                                    | Resolución de "hoy" vacía                              | Estado vacío controlado con mensaje editorial + alerta automática a editores |

## 5. Estados

### 5.1 Ruta (por usuario)

| Estado        | Definición                                    | Transición a                             |
| ------------- | --------------------------------------------- | ---------------------------------------- |
| `no_iniciada` | Sin completados del usuario en la ruta        | -> `en_progreso` (primer completado)     |
| `en_progreso` | Al menos un completado; faltan pasos/misiones | -> `completada` (todos los pasos)        |
| `completada`  | Todos los pasos de la ruta completados        | terminal (puede repetirse como práctica) |

### 5.2 Misión (por usuario y día/semana)

| Estado       | Definición                                                         | Transición a                            |
| ------------ | ------------------------------------------------------------------ | --------------------------------------- |
| `disponible` | Vigente en la ventana local y no completada                        | -> `completada` (POST válido)           |
| `completada` | Existe `mission_completions` para (user, mission, fecha)           | terminal para esa ventana (idempotente) |
| `expirada`   | Ventana local vencida sin completar (diaria: día; semanal: semana) | terminal para esa ventana               |

### 5.3 Insignia

| Estado      | Definición                                             | Transición a           |
| ----------- | ------------------------------------------------------ | ---------------------- |
| `bloqueada` | Hito no alcanzado (criterio visible al usuario)        | -> `otorgada`          |
| `otorgada`  | Existe `badges` (user_id, badge_ref) con `otorgada_at` | terminal (idempotente) |

### 5.4 Recordatorio

| Estado     | Definición                                    | Transición a               |
| ---------- | --------------------------------------------- | -------------------------- |
| `inactivo` | Default; sin consentimiento                   | -> `activo` (opt-in)       |
| `activo`   | Consentimiento dado; suscripción sincronizada | -> `inactivo` (revocación) |

## 6. Trazabilidad UC -> RB -> ER

| UC            | Reglas aplicadas                       | Errores posibles                          |
| ------------- | -------------------------------------- | ----------------------------------------- |
| UC-MISION-001 | RB-001, RB-003, RB-008                 | MISION-001, estado vacío CMS (MISION-006) |
| UC-MISION-002 | RB-001, RB-003, RB-008                 | MISION-001, 404 slug                      |
| UC-MISION-003 | RB-001..005, RB-008                    | MISION-001..005                           |
| UC-MISION-004 | RB-002, RB-003, RB-006                 | MISION-001                                |
| UC-MISION-005 | RB-003, RB-008                         | MISION-001, MISION-004                    |
| UC-MISION-006 | RB-003                                 | MISION-001, MISION-004, MISION-005        |
| UC-MISION-007 | RB-003                                 | MISION-001                                |
| UC-MISION-008 | RB-002, RB-005, RB-006, RB-007, RB-008 | MISION-001; TZ inválida -> default seguro |
