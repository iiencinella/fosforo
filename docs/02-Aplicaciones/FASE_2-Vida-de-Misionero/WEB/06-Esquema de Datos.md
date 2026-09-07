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
  - "[[07-ERM|ERM Vida de Misionero]]"
---

# Esquema de Datos - Vida de Misionero (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Principios

- Esquema dedicado `vida_misionero` en Postgres (Supabase), separado de esquemas de otras apps.
- El contenido (rutas, pasos, misiones) NO vive aquí: vive en el CMS y se referencia por `content_ref` (identificador estable del content type `ruta`/`mision`). El esquema solo guarda estado dinámico por usuario.
- RLS en todas las tablas: un usuario solo lee/escribe sus propias filas (política `user_id = auth.uid()`).
- Idempotencia por constraints de unicidad, no por lógica de aplicación.

## 2. Diagrama lógico

```mermaid
erDiagram
    PROGRESS ||--o{ MISSION_COMPLETIONS : "agrega"
    PROGRESS ||--o{ BADGES : "deriva"
    PREFERENCES ||--|| PROGRESS : "1:1 por user_id"

    PROGRESS {
        uuid user_id PK_FK
        text ruta_id "content_ref del CMS"
        int pasos_completados
        int puntos
        int nivel
        timestamptz updated_at
    }
    MISSION_COMPLETIONS {
        uuid id PK
        uuid user_id FK
        text mission_ref "content_ref del CMS"
        date fecha "fecha LOCAL del usuario"
        int tz_offset "minutos, al momento del completado"
        timestamptz created_at
    }
    BADGES {
        uuid id PK
        uuid user_id FK
        text badge_ref "racha-5, racha-30, racha-90, ruta-<slug>..."
        timestamptz otorgada_at
    }
    PREFERENCES {
        uuid user_id PK_FK
        bool recordatorio_activo
        text recordatorio_canal
        time recordatorio_hora
        int tz_offset
        timestamptz consentimiento_at
        timestamptz updated_at
    }
```

## 3. DDL de referencia

```sql
-- =========================================================
-- Esquema vida_misionero
-- =========================================================
create schema if not exists vida_misionero;

-- 3.1 Progreso por ruta
create table if not exists vida_misionero.progress (
    user_id           uuid        not null,
    ruta_id           text        not null,            -- content_ref 'ruta' en CMS
    pasos_completados integer     not null default 0   check (pasos_completados >= 0),
    puntos            integer     not null default 0   check (puntos >= 0),
    nivel             integer     not null default 1   check (nivel >= 1),
    updated_at        timestamptz not null default now(),
    primary key (user_id, ruta_id)
);

-- 3.2 Completados de misiones (fuente de verdad del progreso diario)
create table if not exists vida_misionero.mission_completions (
    id           uuid        not null default gen_random_uuid(),
    user_id      uuid        not null,
    mission_ref  text        not null,                 -- content_ref 'mision' en CMS
    fecha        date        not null,                 -- fecha LOCAL del usuario (no UTC)
    tz_offset    integer     not null,                 -- minutos al momento del completado
    created_at   timestamptz not null default now(),
    primary key (id),
    -- Idempotencia: 1 completado por (usuario, misión, día local)
    constraint uq_mision_user_ref_fecha unique (user_id, mission_ref, fecha)
);
create index if not exists idx_mcomp_user_fecha
    on vida_misionero.mission_completions (user_id, fecha);
create index if not exists idx_mcomp_user_mission
    on vida_misionero.mission_completions (user_id, mission_ref);

-- 3.3 Insignias (otorgamiento idempotente)
create table if not exists vida_misionero.badges (
    id           uuid        not null default gen_random_uuid(),
    user_id      uuid        not null,
    badge_ref    text        not null,                 -- 'racha-5' | 'racha-30' | 'racha-90' | 'primera-ruta' | 'ruta-<slug>'
    otorgada_at  timestamptz not null default now(),
    primary key (id),
    constraint uq_badge_user_ref unique (user_id, badge_ref)
);
create index if not exists idx_badges_user on vida_misionero.badges (user_id);

-- 3.4 Preferencias (recordatorios + zona horaria)
create table if not exists vida_misionero.preferences (
    user_id              uuid        not null primary key,
    recordatorio_activo  boolean     not null default false,
    recordatorio_canal   text        not null default 'in_app'
                         check (recordatorio_canal in ('in_app', 'email')),
    recordatorio_hora    time        not null default '21:00',
    tz_offset            integer     not null default 0,    -- minutos; se actualiza con la sesión
    consentimiento_at    timestamptz,                        -- nulo = sin consentimiento explícito
    updated_at           timestamptz not null default now()
);

-- 3.5 Reportes de contenido (enrutan a editores del CMS)
create table if not exists vida_misionero.content_reports (
    id           uuid        not null default gen_random_uuid(),
    user_id      uuid        not null,
    content_ref  text        not null,
    motivo       text        not null
                 check (motivo in ('doctrinal', 'error', 'confuso', 'desactualizado', 'otro')),
    descripcion  text        not null check (char_length(descripcion) <= 1000),
    created_at   timestamptz not null default now(),
    primary key (id)
);
create index if not exists idx_reports_content on vida_misionero.content_reports (content_ref, created_at);
```

## 4. Row Level Security (RLS)

```sql
alter table vida_misionero.progress             enable row level security;
alter table vida_misionero.mission_completions  enable row level security;
alter table vida_misionero.badges               enable row level security;
alter table vida_misionero.preferences          enable row level security;
alter table vida_misionero.content_reports      enable row level security;

-- El dueño lee y escribe lo suyo; nadie más (ni otros usuarios, ni anónimos).
create policy "progress_owner_all" on vida_misionero.progress
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "mcomp_owner_all" on vida_misionero.mission_completions
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "badges_owner_all" on vida_misionero.badges
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "prefs_owner_all" on vida_misionero.preferences
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reportes: el usuario crea y lee los suyos; el service_role (backend editorial) puede leer todos.
create policy "reports_owner_select_insert" on vida_misionero.content_reports
    for select using (auth.uid() = user_id);
create policy "reports_owner_insert" on vida_misionero.content_reports
    for insert with check (auth.uid() = user_id);
```

Notas de RLS:

- Las mutaciones de progreso se ejecutan desde el backend con `service_role` cuando corresponde (Edge Functions / server routes), que bypasea RLS explícitamente; el cliente (sesión de usuario) solo puede tocar sus propias filas.
- Ninguna tabla expone datos de otros usuarios bajo ninguna consulta del cliente (SEC-MISION-002).

## 5. Reglas de datos clave

| Regla             | Implementación                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| Idempotencia      | `unique (user_id, mission_ref, fecha)` en `mission_completions`; conflicto = no-op exitoso                |
| Puntos por misión | Definidos por periodicidad del CMS (diaria 10, semanal 30), versionados en servidor (ADR-MISION-005)      |
| Nivel             | Umbrales de puntos versionados server-side; `nivel` es columnas derivadas actualizadas en transacción     |
| Streak            | DERIVADO de `mission_completions` agrupado por `fecha` local (sin flags mutables de racha)                |
| Insignias         | `unique (user_id, badge_ref)`; insert con `on conflict do nothing` (ADR-MISION-006)                       |
| Zona horaria      | `tz_offset` (minutos) en `preferences` (vigente) y en cada completado (histórico inmutable)               |
| Reset diario      | No destruye datos: la disponibilidad del día se deriva; cron solo materializa vista/colas (RB-MISION-007) |
| Contenido         | `ruta_id` / `mission_ref` / `badge_ref` son referencias al CMS; sin duplicar contenido en este esquema    |

## 6. Retención y continuidad

- `mission_completions`, `progress` y `badges` se conservan indefinidamente (el progreso es el activo del usuario; ver 07-ERM, ERM-MISION-002: RTO 2h, RPO 1h con backups de Supabase).
- `content_reports`: retención operativa de 12 meses; luego anonimizar `user_id` conservando el reporte para estadística editorial.
- `preferences`: se eliminan con la cuenta (derecho al borrado coordinado con 0104_usuarios); el borrado de `preferences` no borra historial de progreso salvo solicitud de eliminación total.

## 7. Migraciones

- Toda migración de este esquema se registra como migración versionada del proyecto Supabase (`supabase/migrations`), nunca DDL ad-hoc.
- Toda columna nueva debe ser nullable o con default para despliegues sin downtime.
- Cambios sobre `unique(user_id, mission_ref, fecha)` requieren revisión de 08-Decisiones de Arquitectura (ADR-MISION-002) y de tests de idempotencia (05-Tests, TC-MISION-004/005).
