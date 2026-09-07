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
  - "[[03-FRD|FRD Vida de Misionero]]"
  - "[[05-Tests Unitarios|Tests Unitarios]]"
---

# Flujos y Secuencias - Vida de Misionero (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Flujo principal: elegir ruta -> completar misión -> progreso

```mermaid
flowchart TD
    A[Usuario autenticado entra a /rutas] --> B[SSR: rutas del CMS + estado del usuario]
    B --> C{¿Sesión válida?}
    C -- No --> L[302 -> Login con redirect_uri seguro]
    C -- Sí --> D[Lista de rutas con estado]
    D --> E[Usuario abre ficha /ruta/slug]
    E --> F[Pasos y misiones con estados]
    F --> G[CTA Comenzar/Continuar -> /hoy]
    G --> H[Misiones del día local con check]
    H --> I[Usuario marca misión como completada]
    I --> J[POST /api/misiones/completar]
    J --> K[Validación server + idempotencia + puntos + insignias]
    K --> M[UI: check, puntos, nivel, racha actualizados]
    M --> N[RUM mision.completed]
    N --> O[Progreso visible en /progreso]
```

Notas del flujo:

- El único punto de mutación de progreso es `POST /api/misiones/completar` (RB-MISION-002).
- El contenido mostrado en cada pantalla viene del CMS con cache de revalidación (RB-MISION-001).

## 2. Flujos secundarios

### 2.1 Racha (streak)

```mermaid
flowchart LR
    A[Completado válido en día local D] --> B[Existe completado en D-1 local?]
    B -- Sí --> C[streak += 1]
    B -- No --> D[streak = 1]
    C --> E{streak cruza 5 / 30 / 90?}
    D --> E
    E -- Sí --> F[Otorgar insignia idempotente]
    E -- No --> G[Persistir progreso]
    F --> G
```

- La racha SIEMPRE se calcula con `tz_offset` del usuario (RB-MISION-005); el día local D = `timestamp_utc + tz_offset` truncado a fecha.
- Sin completado en un día local, el streak derivado cae a 0 en la próxima lectura (no hay flags que "rompan": es derivado).

### 2.2 Insignias por hitos

```mermaid
flowchart TD
    A[Post completado válido] --> B[Evaluar hitos: racha 5/30/90, primera ruta, ruta completada]
    B --> C{¿Insignia nueva?}
    C -- Sí --> D[Insert badges user_id+badge_ref]
    D --> E[RUM badge.earned + respuesta UI con confeti/toast]
    C -- No --> F[No-op idempotente]
```

### 2.3 Recordatorio diario (opt-in)

```mermaid
flowchart TD
    A[Preferencias: activar recordatorio] --> B[Consentimiento explícito]
    B --> C[PUT /api/preferencias: hora, canal, tz_offset]
    C --> D[Sincronizar suscripción con Notificaciones]
    D --> E[Cron diario de Notificaciones: misiones pendientes del día]
    E --> F{¿Consentimiento vigente y hay misiones pendientes?}
    F -- Sí --> G[Enviar recordatorio]
    F -- No --> H[No enviar]
```

## 3. Secuencia: completar misión (validación server + idempotencia + puntos + RUM)

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant UI as React 19 (isla)
    participant API as POST /api/misiones/completar
    participant AUTH as Sistema de Logueo
    participant CMS as CMS (Sistema de Contenidos)
    participant DB as Supabase vida_misionero
    participant LOG as Log (RUM)

    U->>UI: Marca misión como completada
    UI->>API: POST { mission_ref } (cookie de sesión)
    API->>AUTH: Verificar sesión -> user_id
    AUTH-->>API: user_id (o 401)
    API->>CMS: Validar mission_ref (ruta publicada, periodicidad)
    CMS-->>API: metadata de misión (puntos, tipo)
    API->>DB: INSERT mission_completions (user_id, mission_ref, fecha_local, tz_offset)
    Note over DB: unique(user_id, mission_ref, fecha)<br/>conflicto = ya completada
    alt Conflicto unique
        DB-->>API: already_completed
        API-->>UI: 200 { already_completed: true } (sin puntos, sin RUM completed)
    else Insert exitoso
        API->>DB: UPDATE progress (+puntos, nivel, pasos) en transacción
        API->>DB: Evaluar insignias (hitos racha 5/30/90, rutas)
        API->>LOG: RUM mision.completed (user_id, content_ref)
        API-->>UI: 200 { puntos, nivel, racha, badges nuevos }
        UI-->>U: Check + feedback de progreso
    end
```

Puntos de anti-fraude en la secuencia:

1. `user_id` SIEMPRE de la sesión verificada (nunca del body) - RB-MISION-003.
2. La misión debe existir y estar publicada en el CMS en el momento del completado - RB-MISION-001.
3. Vigencia por día/semana LOCAL del usuario - RB-MISION-005/007.
4. Idempotencia por unique constraint en DB (la garantía final) - RB-MISION-004.
5. Rate limit antes de tocar DB - SEC-MISION-004.

## 4. Secuencia: calcular streak con zona horaria

```mermaid
sequenceDiagram
    autonumber
    participant API as GET /progreso | /hoy
    participant DB as Supabase
    participant U as Usuario (tz_offset = -180 min)

    API->>DB: SELECT completados de los últimos N días (user_id)
    DB-->>API: fechas locales guardadas (fecha_local por completado)
    API->>API: Agrupar por fecha_local derivada con tz_offset actual
    API->>API: Caminar hacia atrás desde hoy local: racha actual y mejor
    API-->>U: racha actual + mejor racha (solo lectura, derivada)
```

- Regla: un día local cuenta si existe >= 1 completado con esa `fecha_local`.
- `fecha_local` se guarda al momento del completado usando el `tz_offset` vigente; si el usuario cambia de zona, los históricos NO se reescriben (inmutabilidad de completados) y la racha se evalúa sobre días locales históricos + vigencia actual (ADR-MISION-004).

## 5. Secuencia: otorgar insignia

```mermaid
sequenceDiagram
    autonumber
    participant SVC as Servicio de progreso (post-completado)
    participant DB as Supabase badges
    participant LOG as Log (RUM)
    participant UI as UI /progreso + toast

    SVC->>SVC: Evaluar hitos tras completado (racha, ruta)
    SVC->>DB: INSERT INTO badges (user_id, badge_ref, otorgada_at) ON CONFLICT DO NOTHING
    alt Insert exitoso (nueva)
        DB-->>SVC: insignia nueva
        SVC->>LOG: RUM badge.earned
        SVC-->>UI: badges_nuevos[] en respuesta
        UI-->>UI: Toast "¡Nueva insignia!"
    else Conflicto (ya existía)
        DB-->>SVC: sin efecto
        Note over SVC: No re-notifica (idempotencia)
    end
```

## 6. Secuencia: reset diario (cron/edge)

```mermaid
sequenceDiagram
    autonumber
    participant CRON as Cron (Edge Function diaria)
    participant DB as Supabase
    participant CMS as CMS
    participant NOTIF as Notificaciones
    participant LOG as Log

    CRON->>DB: Listar usuarios con actividad reciente y tz_offset
    CRON->>CMS: Resolver misiones vigentes por día/semana
    alt CMS sin misiones del día
        CRON->>LOG: Alerta a editores (ERM-MISION-003)
        CRON->>NOTIF: Suprimir recordatorios del día (no molestar con vacío)
    else Misiones vigentes
        CRON->>DB: Materializar disponibilidad del día (view/derived state)
        CRON->>NOTIF: Encolar recordatorios opt-in por huso (lote por tz)
        CRON->>LOG: RUM reminder.batch + log de ejecución
    end
```

- El reset no borra historial: la disponibilidad del día se deriva de `mission_completions` por `fecha_local` (RB-MISION-007); el cron solo materializa la vista del día y encola notificaciones.
- Idempotencia del cron: correr dos veces el mismo día produce el mismo estado (no duplica notificaciones).

## 7. Estados de error del flujo principal

| Punto de falla          | Comportamiento                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Sesión expirada al POST | 401 -> UI pide re-login conservando contexto                                                                            |
| CMS caído en ficha      | Cache stale + banner; completado validado contra cache marcado `stale` solo si vigencia lo permite, sino 503 controlado |
| DB caída al POST        | 503 con mensaje "No pudimos registrar tu misión, probá de nuevo"; SIN pérdida: reintento idempotente                    |
| RUM caído               | Best-effort: la acción del usuario NO se afecta                                                                         |
| Notificaciones caído    | Preferencia se marca `pendiente_sync` y se reintenta; se informa en Preferencias                                        |
