-- Esquema del Sistema de Contenidos (CMS) — paso 2 del plan.
--
-- Contratos: FASE_2-Sistema-de-Contenidos-CMS/WEB 06-Esquema de Datos,
-- 02-SRS (FR-CMS-001..005), 03-FRD (RB-CMS-001..007), 10-OWASP
-- (SEC-CMS-002/004), 08-Decisiones (ADR-CMS-002/003).
--
-- Decisiones fijadas aqui (huecos documentales resueltos):
-- - Status como text + check (convencion del repo), no tipo enum.
-- - Transiciones de estado se aplican en la capa de aplicacion (paso 5);
--   la DB valida valores. Transicion archived->draft (RB-CMS-006,
--   "recuperable") autorizada solo por admin.
-- - ON DELETE: RESTRICT para content_type_id y author_id/actor_id
--   (evita perder contenido por borrado accidental); CASCADE para las
--   dependencias de la entrada (revisiones, terminos, medios, auditoria)
--   y de la taxonomia (terminos).
-- - RB-CMS-001: slug unico por content type en TODOS los estados
--   (unique completo, no parcial). RB-CMS-003 (la version publicada
--   anterior pasa a archived) se registra en content_audit_log al
--   publicar; las revisiones son inmutables (solo insert).
-- - RB-CMS-002/FR-CMS-005 en RLS: publicar (update a published) solo
--   revisor/admin; archivar solo admin. Un editor no puede mover una
--   entrada a published ni archived.

-- 1. Tipos de contenido (gestion solo admin; RB-CMS-008: slug inmutable).
create table if not exists public.content_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_content_types_slug on public.content_types(slug);

-- 2. Entradas de contenido (campos custom en jsonb, ADR-CMS-003).
create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  content_type_id uuid not null references public.content_types(id) on delete restrict,
  slug text not null,
  status text not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  author_id uuid not null references auth.users(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.content_entries
  drop constraint if exists content_entries_status_check;
alter table public.content_entries
  add constraint content_entries_status_check
  check (status in ('draft', 'review', 'published', 'archived'));

alter table public.content_entries
  drop constraint if exists content_entries_published_at_check;
alter table public.content_entries
  add constraint content_entries_published_at_check
  check (status <> 'published' or published_at is not null);

-- RB-CMS-001: slug unico por content type en todos los estados.
alter table public.content_entries
  drop constraint if exists content_entries_type_slug_key;
alter table public.content_entries
  add constraint content_entries_type_slug_key
  unique (content_type_id, slug);

create index if not exists idx_content_entries_type_status
  on public.content_entries(content_type_id, status);
create index if not exists idx_content_entries_type_status_published
  on public.content_entries(content_type_id, status, published_at desc);
create index if not exists idx_content_entries_author
  on public.content_entries(author_id);

drop trigger if exists trg_content_entries_set_updated_at
  on public.content_entries;
create trigger trg_content_entries_set_updated_at
before update on public.content_entries
for each row
execute function internal.set_updated_at();

-- 3. Revisiones inmutables (ERM-CMS-001): solo insert; cada fila guarda
-- el snapshot de data y el status de la entrada al momento del guardado.
create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.content_entries(id) on delete cascade,
  revision_number integer not null,
  data jsonb not null,
  author_id uuid not null references auth.users(id) on delete restrict,
  status text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.content_revisions
  drop constraint if exists content_revisions_status_check;
alter table public.content_revisions
  add constraint content_revisions_status_check
  check (status in ('draft', 'review', 'published', 'archived'));

alter table public.content_revisions
  drop constraint if exists content_revisions_entry_number_key;
alter table public.content_revisions
  add constraint content_revisions_entry_number_key
  unique (entry_id, revision_number);

alter table public.content_revisions
  drop constraint if exists content_revisions_number_positive;
alter table public.content_revisions
  add constraint content_revisions_number_positive
  check (revision_number >= 1);

create index if not exists idx_content_revisions_entry
  on public.content_revisions(entry_id, revision_number desc);

-- 4. Taxonomias y terminos (gestion solo admin; slug inmutable).
create table if not exists public.content_taxonomies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.content_terms (
  id uuid primary key default gen_random_uuid(),
  taxonomy_id uuid not null references public.content_taxonomies(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.content_terms
  drop constraint if exists content_terms_taxonomy_slug_key;
alter table public.content_terms
  add constraint content_terms_taxonomy_slug_key
  unique (taxonomy_id, slug);

alter table public.content_terms
  drop constraint if exists content_terms_taxonomy_name_key;
alter table public.content_terms
  add constraint content_terms_taxonomy_name_key
  unique (taxonomy_id, name);

create index if not exists idx_content_terms_taxonomy
  on public.content_terms(taxonomy_id);

-- 5. Asociacion N:M entrada <-> termino.
create table if not exists public.content_entry_terms (
  entry_id uuid not null references public.content_entries(id) on delete cascade,
  term_id uuid not null references public.content_terms(id) on delete cascade,
  primary key (entry_id, term_id)
);

create index if not exists idx_content_entry_terms_term
  on public.content_entry_terms(term_id);

-- 6. Medios (referencia a Supabase Storage; RB-CMS-009: webp/jpeg <= 2MB).
create table if not exists public.content_media (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.content_entries(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.content_media
  drop constraint if exists content_media_mime_check;
alter table public.content_media
  add constraint content_media_mime_check
  check (mime_type in ('image/webp', 'image/jpeg'));

alter table public.content_media
  drop constraint if exists content_media_size_check;
alter table public.content_media
  add constraint content_media_size_check
  check (size_bytes between 1 and 2097152); -- 2 MB

create index if not exists idx_content_media_entry
  on public.content_media(entry_id);

-- 7. Auditoria editorial (RB-CMS-007): append-only.
create table if not exists public.content_audit_log (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references public.content_entries(id) on delete cascade,
  action text not null,
  actor_id uuid references auth.users(id) on delete restrict,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_content_audit_log_entry
  on public.content_audit_log(entry_id, created_at desc);

-- 8. RLS (FR-CMS-005, SEC-CMS-002/004).
-- Helper local para no repetir la expresion: acceso editorial = tiene
-- permiso de app cms o es admin.
create or replace function public.has_cms_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role_slug() = 'admin'
    or public.user_has_app_permission('cms')
$$;

revoke all on function public.has_cms_access() from public;
grant execute on function public.has_cms_access() to authenticated;

alter table public.content_types enable row level security;
alter table public.content_entries enable row level security;
alter table public.content_revisions enable row level security;
alter table public.content_taxonomies enable row level security;
alter table public.content_terms enable row level security;
alter table public.content_entry_terms enable row level security;
alter table public.content_media enable row level security;
alter table public.content_audit_log enable row level security;

-- content_types: lectura para roles con acceso al cms; escritura solo admin.
drop policy if exists content_types_select_cms on public.content_types;
create policy content_types_select_cms
on public.content_types
for select
to authenticated
using (public.has_cms_access());

drop policy if exists content_types_write_admin on public.content_types;
create policy content_types_write_admin
on public.content_types
for all
to authenticated
using (public.current_user_role_slug() = 'admin')
with check (public.current_user_role_slug() = 'admin');

-- content_entries: el publico ve solo published (RB-CMS-005); editor y
-- admin ven todo; revisor ve review y published (06 Reglas de integridad).
drop policy if exists content_entries_select_published on public.content_entries;
create policy content_entries_select_published
on public.content_entries
for select
to anon, authenticated
using (status = 'published');

drop policy if exists content_entries_select_editorial on public.content_entries;
create policy content_entries_select_editorial
on public.content_entries
for select
to authenticated
using (
  public.current_user_role_slug() in ('admin', 'editor')
  or (
    public.current_user_role_slug() = 'revisor'
    and status in ('review', 'published')
  )
);

-- Crear entradas: editor y admin (revisor no crea, RB-CMS-004).
drop policy if exists content_entries_insert_editorial on public.content_entries;
create policy content_entries_insert_editorial
on public.content_entries
for insert
to authenticated
with check (public.current_user_role_slug() in ('admin', 'editor'));

-- Transiciones de estado aplicadas EN RLS (FR-CMS-005 en DB, no solo UI):
-- - editor: solo mueve entradas dentro de draft/review; nunca puede dejar
--   una fila en published o archived (RB-CMS-004).
-- - revisor: solo toca entradas en review y solo las deja en published
--   (aprueba) o draft (rechaza con motivo).
-- - admin: sin restricciones (incluye published->archived y
--   archived->draft de RB-CMS-006).
drop policy if exists content_entries_update_editor on public.content_entries;
create policy content_entries_update_editor
on public.content_entries
for update
to authenticated
using (
  public.current_user_role_slug() = 'editor'
  and status in ('draft', 'review')
)
with check (
  public.current_user_role_slug() = 'editor'
  and status in ('draft', 'review')
);

drop policy if exists content_entries_update_revisor on public.content_entries;
create policy content_entries_update_revisor
on public.content_entries
for update
to authenticated
using (
  public.current_user_role_slug() = 'revisor'
  and status = 'review'
)
with check (
  public.current_user_role_slug() = 'revisor'
  and status in ('draft', 'published')
);

drop policy if exists content_entries_update_admin on public.content_entries;
create policy content_entries_update_admin
on public.content_entries
for update
to authenticated
using (public.current_user_role_slug() = 'admin')
with check (public.current_user_role_slug() = 'admin');

-- Archivar/recuperar y borrar: solo admin (RB-CMS-004, RB-CMS-006).
drop policy if exists content_entries_delete_admin on public.content_entries;
create policy content_entries_delete_admin
on public.content_entries
for delete
to authenticated
using (public.current_user_role_slug() = 'admin');

-- content_revisions: insert editorial (editor/admin), lectura editorial;
-- sin update ni delete (inmutables).
drop policy if exists content_revisions_insert_editorial on public.content_revisions;
create policy content_revisions_insert_editorial
on public.content_revisions
for insert
to authenticated
with check (public.current_user_role_slug() in ('admin', 'editor'));

drop policy if exists content_revisions_select_editorial on public.content_revisions;
create policy content_revisions_select_editorial
on public.content_revisions
for select
to authenticated
using (public.has_cms_access());

-- content_taxonomies y content_terms: lectura editorial; escritura admin.
drop policy if exists content_taxonomies_select_cms on public.content_taxonomies;
create policy content_taxonomies_select_cms
on public.content_taxonomies
for select
to authenticated
using (public.has_cms_access());

drop policy if exists content_taxonomies_write_admin on public.content_taxonomies;
create policy content_taxonomies_write_admin
on public.content_taxonomies
for all
to authenticated
using (public.current_user_role_slug() = 'admin')
with check (public.current_user_role_slug() = 'admin');

drop policy if exists content_terms_select_cms on public.content_terms;
create policy content_terms_select_cms
on public.content_terms
for select
to authenticated
using (public.has_cms_access());

drop policy if exists content_terms_write_admin on public.content_terms;
create policy content_terms_write_admin
on public.content_terms
for all
to authenticated
using (public.current_user_role_slug() = 'admin')
with check (public.current_user_role_slug() = 'admin');

-- content_entry_terms: lectura editorial; escritura editor/admin.
drop policy if exists content_entry_terms_select_cms on public.content_entry_terms;
create policy content_entry_terms_select_cms
on public.content_entry_terms
for select
to authenticated
using (public.has_cms_access());

drop policy if exists content_entry_terms_write_editorial on public.content_entry_terms;
create policy content_entry_terms_write_editorial
on public.content_entry_terms
for all
to authenticated
using (public.current_user_role_slug() in ('admin', 'editor'))
with check (public.current_user_role_slug() in ('admin', 'editor'));

-- content_media: lectura editorial (y published para anon), escritura
-- editor/admin.
drop policy if exists content_media_select_published on public.content_media;
create policy content_media_select_published
on public.content_media
for select
to anon, authenticated
using (
  exists (
    select 1 from public.content_entries ce
    where ce.id = content_media.entry_id
      and ce.status = 'published'
  )
);

drop policy if exists content_media_select_editorial on public.content_media;
create policy content_media_select_editorial
on public.content_media
for select
to authenticated
using (public.has_cms_access());

drop policy if exists content_media_write_editorial on public.content_media;
create policy content_media_write_editorial
on public.content_media
for all
to authenticated
using (public.current_user_role_slug() in ('admin', 'editor'))
with check (public.current_user_role_slug() in ('admin', 'editor'));

-- content_audit_log: insercion editorial; lectura admin/dev/ops
-- (auditoria inmutable, sin update ni delete).
drop policy if exists content_audit_log_insert_editorial on public.content_audit_log;
create policy content_audit_log_insert_editorial
on public.content_audit_log
for insert
to authenticated
with check (public.current_user_role_slug() in ('admin', 'editor', 'revisor'));

drop policy if exists content_audit_log_select_platform on public.content_audit_log;
create policy content_audit_log_select_platform
on public.content_audit_log
for select
to authenticated
using (
  public.current_user_role_slug() in ('admin', 'dev', 'ops')
);

-- 9. Grants. La API publica de lectura (paso 7) consulta con
-- service_role (bypassa RLS); a anon solo se le habilita lo ya filtrado
-- por las policies published.
grant select on public.content_types to authenticated;
grant select, insert, update, delete on public.content_types to service_role;

grant select, insert, update, delete on public.content_entries to authenticated;
grant select on public.content_entries to anon;
grant all privileges on public.content_entries to service_role;

grant select, insert on public.content_revisions to authenticated;
grant select on public.content_revisions to anon;
grant all privileges on public.content_revisions to service_role;

grant select on public.content_taxonomies to authenticated;
grant select, insert, update, delete on public.content_taxonomies to service_role;

grant select on public.content_terms to authenticated;
grant select, insert, update, delete on public.content_terms to service_role;

grant select on public.content_entry_terms to authenticated, anon;
grant select, insert, update, delete on public.content_entry_terms to service_role;

grant select on public.content_media to authenticated, anon;
grant select, insert, update, delete on public.content_media to service_role;

grant select, insert on public.content_audit_log to authenticated;
grant all privileges on public.content_audit_log to service_role;

revoke update, delete on public.content_revisions from authenticated;
revoke update, delete on public.content_audit_log from authenticated;
