-- Esquema del Sistema de Notificaciones (paso 7).
--
-- Contratos: FASE_2-Sistema-de-Notificaciones/WEB 06-Esquema de Datos,
-- FR-NOTIF-001..004, RB-NOTIF-001..004, y el paquete @repo/notification-core
-- (paso 6: canales, categorias, plantillas versionadas, idempotencia por
-- event_id, maximo 3 intentos con backoff).
--
-- Privacidad: notification_events guarda solo recipient (email/token) y
-- user_id referencial; el payload puede contener variables renderizadas,
-- por lo que su lectura queda restringida (dueno del evento o admin).

-- 1. Plantillas versionadas (RB-NOTIF-001: versiones publicadas inmutables).
create table if not exists public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version integer not null,
  channel text not null,
  category text not null,
  subject text not null,
  body text not null,
  required_variables text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.notification_templates
  drop constraint if exists notification_templates_channel_check;
alter table public.notification_templates
  add constraint notification_templates_channel_check
  check (channel in ('email', 'push', 'in_app'));

alter table public.notification_templates
  drop constraint if exists notification_templates_category_check;
alter table public.notification_templates
  add constraint notification_templates_category_check
  check (category in ('transactional', 'product', 'liturgical', 'community'));

alter table public.notification_templates
  drop constraint if exists notification_templates_name_version_key;
alter table public.notification_templates
  add constraint notification_templates_name_version_key
  unique (name, version);

alter table public.notification_templates
  drop constraint if exists notification_templates_version_positive;
alter table public.notification_templates
  add constraint notification_templates_version_positive
  check (version >= 1);

create index if not exists idx_notification_templates_name
  on public.notification_templates(name, version desc);

-- 2. Eventos de notificacion: trazabilidad por mensaje con idempotencia
-- por event_id (RB-NOTIF-003). rendered_subject/body son el snapshot
-- renderizado que efectivamente se envio.
create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  template_id uuid not null references public.notification_templates(id),
  template_version integer not null,
  channel text not null,
  category text not null,
  recipient text not null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  rendered_subject text,
  rendered_body text,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  sent_at timestamptz,
  delivered_at timestamptz
);

alter table public.notification_events
  drop constraint if exists notification_events_channel_check;
alter table public.notification_events
  add constraint notification_events_channel_check
  check (channel in ('email', 'push', 'in_app'));

alter table public.notification_events
  drop constraint if exists notification_events_category_check;
alter table public.notification_events
  add constraint notification_events_category_check
  check (category in ('transactional', 'product', 'liturgical', 'community'));

alter table public.notification_events
  drop constraint if exists notification_events_status_check;
alter table public.notification_events
  add constraint notification_events_status_check
  check (status in ('pending', 'sent', 'delivered', 'failed', 'opened'));

alter table public.notification_events
  drop constraint if exists notification_events_template_version_match;
alter table public.notification_events
  add constraint notification_events_template_version_match
  check (template_version >= 1);

create index if not exists idx_notification_events_status_created
  on public.notification_events(status, created_at desc);
create index if not exists idx_notification_events_user
  on public.notification_events(user_id, created_at desc);
create index if not exists idx_notification_events_channel_category
  on public.notification_events(channel, category);

-- 3. Preferencias por usuario: opt-in por canal + categoria
-- (FR-NOTIF-003). El filtro de categorias obligatorias lo aplica
-- @repo/notification-core en la capa de aplicacion.
create table if not exists public.notification_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null,
  category text not null,
  opted_in boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, channel, category)
);

alter table public.notification_preferences
  drop constraint if exists notification_preferences_channel_check;
alter table public.notification_preferences
  add constraint notification_preferences_channel_check
  check (channel in ('email', 'push', 'in_app'));

alter table public.notification_preferences
  drop constraint if exists notification_preferences_category_check;
alter table public.notification_preferences
  add constraint notification_preferences_category_check
  check (category in ('transactional', 'product', 'liturgical', 'community'));

-- 4. Cola de procesamiento con reintentos (FR-NOTIF-004). Un evento tiene
-- a lo sumo una fila de cola (event_id unique); los limites de intentos
-- los aplica @repo/notification-core (MAX_DELIVERY_ATTEMPTS = 3).
create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.notification_events(id) on delete cascade,
  status text not null default 'pending',
  attempts integer not null default 0,
  next_retry_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.notification_queue
  drop constraint if exists notification_queue_status_check;
alter table public.notification_queue
  add constraint notification_queue_status_check
  check (status in ('pending', 'processing', 'done', 'failed'));

alter table public.notification_queue
  drop constraint if exists notification_queue_attempts_range;
alter table public.notification_queue
  add constraint notification_queue_attempts_range
  check (attempts between 0 and 10);

create index if not exists idx_notification_queue_due
  on public.notification_queue(status, next_retry_at);

-- Trigger de updated_at reutilizando el helper existente del ecosistema.
drop trigger if exists trg_notification_preferences_set_updated_at
  on public.notification_preferences;
create trigger trg_notification_preferences_set_updated_at
before update on public.notification_preferences
for each row
execute function internal.set_updated_at();

drop trigger if exists trg_notification_queue_set_updated_at
  on public.notification_queue;
create trigger trg_notification_queue_set_updated_at
before update on public.notification_queue
for each row
execute function internal.set_updated_at();

-- 5. RLS.
alter table public.notification_templates enable row level security;
alter table public.notification_events enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_queue enable row level security;

-- Plantillas: legibles para authenticated; escritura solo admin
-- (la inmutabilidad de versiones la refuerza el paquete y la app).
drop policy if exists notification_templates_select_authenticated on public.notification_templates;
create policy notification_templates_select_authenticated
on public.notification_templates
for select
to authenticated
using (true);

drop policy if exists notification_templates_write_admin on public.notification_templates;
create policy notification_templates_write_admin
on public.notification_templates
for all
to authenticated
using (public.current_user_role_slug() = 'admin')
with check (public.current_user_role_slug() = 'admin');

-- Eventos: el usuario ve sus propios envios; admin/dev/ops ven todo
-- (auditoria de entrega). Insercion y actualizacion solo via service_role
-- (la API de notificaciones corre en el backend).
drop policy if exists notification_events_select_own_or_platform on public.notification_events;
create policy notification_events_select_own_or_platform
on public.notification_events
for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_user_role_slug() in ('admin', 'dev', 'ops')
);

-- Preferencias: el usuario gestiona solo las suyas (RLS por dueno).
drop policy if exists notification_preferences_select_own on public.notification_preferences;
create policy notification_preferences_select_own
on public.notification_preferences
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists notification_preferences_insert_own on public.notification_preferences;
create policy notification_preferences_insert_own
on public.notification_preferences
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists notification_preferences_update_own on public.notification_preferences;
create policy notification_preferences_update_own
on public.notification_preferences
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists notification_preferences_delete_own on public.notification_preferences;
create policy notification_preferences_delete_own
on public.notification_preferences
for delete
to authenticated
using (user_id = auth.uid());

-- Cola: solo service_role (worker de envio en el backend).
drop policy if exists notification_queue_service_role on public.notification_queue;
create policy notification_queue_service_role
on public.notification_queue
for all
to service_role
using (true)
with check (true);

-- 6. Grants.
grant select on public.notification_templates to authenticated;
grant select on public.notification_events to authenticated;
grant select, insert, update, delete on public.notification_preferences to authenticated;

grant all privileges on public.notification_templates to service_role;
grant all privileges on public.notification_events to service_role;
grant all privileges on public.notification_preferences to service_role;
grant all privileges on public.notification_queue to service_role;

revoke all on public.notification_queue from anon, authenticated;
