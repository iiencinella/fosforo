---
tags:
  - proyecto/fosforo
  - aplicacion
  - visita-7-iglesias
  - web
  - fase-2
  - esquema-datos
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[02-SRS]]"
  - "[[08-Decisiones de Arquitectura]]"
  - "[[docs/01-Arquitectura/Capacidades Compartidas|Capacidades Compartidas]]"
---

# Esquema de Datos - Visita 7 Iglesias

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Resumen

La app persiste en Supabase **solo datos personales de peregrinación** (esquema `visita7`): peregrinaciones iniciadas por el usuario, iglesias visitadas y preferencias (orden configurable, tema, consentimientos). **Todo el contenido devocional** (itinerarios, iglesias con dirección/mapa, oraciones de la visita) vive en el CMS y se referencia por `itinerary_ref` / `church_ref` (content_ref), nunca se duplica en la BD propia (RB-V7I-001).

## Entidades principales

| Entidad             | Proposito                                                           | Campos clave                                                                                                    |
| ------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pilgrimages`       | Una peregrinación iniciada por un usuario sobre un itinerario       | `id`, `user_id`, `itinerary_ref`, `status` (`activa` \| `completada`), `started_at`, `completed_at`             |
| `pilgrimage_visits` | La marca de visita de una iglesia dentro de una peregrinación       | `pilgrimage_id`, `church_ref`, `visit_order`, `visited_at`, `UNIQUE (pilgrimage_id, church_ref)` (idempotencia) |
| `preferences`       | Preferencias del usuario: orden configurable, tema, consentimientos | `user_id` (PK), `custom_order` (jsonb), `theme`, `geo_consent`, `updated_at`                                    |

### DDL de referencia (esquema `visita7`)

```sql
create schema if not exists visita7;

create table visita7.pilgrimages (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  itinerary_ref text not null,                      -- content_ref del itinerario en el CMS (slug canónico)
  status        text not null default 'activa'
                check (status in ('activa', 'completada')),
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint completed_at_requerido_si_completada
    check (status = 'activa' or completed_at is not null)
);

create index idx_pilgrimages_user on visita7.pilgrimages (user_id, status);
create unique index uniq_pilgrimage_activa
  on visita7.pilgrimages (user_id, itinerary_ref) where status = 'activa';

create table visita7.pilgrimage_visits (
  id            uuid primary key default gen_random_uuid(),
  pilgrimage_id uuid not null references visita7.pilgrimages (id) on delete cascade,
  church_ref    text not null,                      -- content_ref de la iglesia en el CMS
  visit_order   int not null check (visit_order between 1 and 7),
  visited_at    timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  constraint uniq_visita_idempotente unique (pilgrimage_id, church_ref)
);

create index idx_visits_pilgrimage on visita7.pilgrimage_visits (pilgrimage_id);

create table visita7.preferences (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  custom_order jsonb,                               -- { [itinerary_ref]: [church_ref, ...] } orden propio del usuario
  theme        text not null default 'system' check (theme in ('light', 'dark', 'system')),
  geo_consent  boolean not null default false,      -- consentimiento opt-in de geolocalización (nunca requerido)
  updated_at   timestamptz not null default now()
);
```

### Row Level Security (RLS)

Todas las tablas habilitan RLS con `user_id` = `auth.uid()` (RB-V7I-004); `pilgrimage_visits` se protege vía la peregrinación dueña:

```sql
alter table visita7.pilgrimages enable row level security;
alter table visita7.pilgrimage_visits enable row level security;
alter table visita7.preferences enable row level security;

create policy "dueño_pilgrimages" on visita7.pilgrimages
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "dueño_visits" on visita7.pilgrimage_visits
  for all using (
    exists (
      select 1 from visita7.pilgrimages p
      where p.id = pilgrimage_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from visita7.pilgrimages p
      where p.id = pilgrimage_id and p.user_id = auth.uid()
    )
  );

create policy "dueño_preferences" on visita7.preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```

### Idempotencia de marca (server-side)

El endpoint de escritura usa `on conflict (pilgrimage_id, church_ref) do nothing` y trata `23505`/conflicto como éxito con estado actual: re-marcar una iglesia nunca duplica filas ni altera el progreso (RB-V7I-002). La transición `activa → completada` se protege con guard `where status = 'activa'` para que la completación (y su evento RUM) ocurra una única vez (RB-V7I-006).

## Relaciónes

- `auth.users` 1:N `pilgrimages` (un usuario puede tener varias peregrinaciones; históricas + 1 activa por itinerario).
- `pilgrimages` 1:N `pilgrimage_visits` (exactamente hasta 7 filas, una por iglesia del itinerario, `on delete cascade`).
- `auth.users` 1:1 `preferences` (una fila por usuario).
- `pilgrimages.itinerary_ref` → CMS `itinerario` (referencia lógica, sin FK: el contenido no vive en Supabase).
- `pilgrimage_visits.church_ref` → CMS `iglesia` (referencia lógica, sin FK).

## Reglas de integridad

- `UNIQUE (pilgrimage_id, church_ref)` garantiza una sola marca por iglesia por peregrinación (idempotencia, RB-V7I-002).
- `visit_order` entre 1 y 7: no existen peregrinaciones con más de 7 iglesias.
- `status` restringido por check a `activa` | `completada`; `completed_at` obligatorio si `completada`.
- Una peregrinación activa es única por `(user_id, itinerary_ref)` (índice parcial): reabrir el mismo itinerario retoma la peregrinación existente.
- Toda fila personal es propiedad de `user_id = auth.uid()` y protegida por RLS (RB-V7I-004).
- Los `*_ref` son referencias al CMS: si el CMS retira un itinerario, las filas históricas del usuario se conservan (historial) pero el contenido deja de renderizarse.
- Retención: los datos de peregrinación persisten mientras exista la cuenta (son historial devocional); el borrado de cuenta (Sistema de Logueo) los elimina en cascada.
