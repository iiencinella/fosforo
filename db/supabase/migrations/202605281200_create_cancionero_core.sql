create schema if not exists internal;

revoke all on schema internal from public;

create or replace function public.cancionero_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function internal.is_cancionero_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = user_id
      and r.slug = 'admin'
  );
$$;

create table if not exists public.canciones (
  id uuid primary key default gen_random_uuid(),
  titulo varchar(200) not null,
  letra_acordes text not null,
  pdf_url text,
  youtube_url text,
  estado varchar(20) not null default 'pendiente',
  contribuyente_id uuid references public.profiles(id),
  moderador_id uuid references public.profiles(id),
  fecha_contribucion timestamptz not null default timezone('utc', now()),
  fecha_moderacion timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint canciones_estado_check check (estado in ('pendiente', 'publicado', 'rechazado'))
);

create table if not exists public.etiquetas_cancion (
  id uuid primary key default gen_random_uuid(),
  cancion_id uuid not null references public.canciones(id) on delete cascade,
  tiempo_liturgico varchar(50) not null,
  momento_misa varchar(100) not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (cancion_id, tiempo_liturgico, momento_misa)
);

create table if not exists public.tiempos_liturgicos (
  id varchar(50) primary key,
  nombre varchar(100) not null,
  momentos_misa jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.auditoria_moderacion (
  id uuid primary key default gen_random_uuid(),
  cancion_id uuid not null references public.canciones(id) on delete cascade,
  usuario_id uuid references public.profiles(id),
  accion varchar(30) not null,
  etiquetas_originales jsonb,
  etiquetas_finales jsonb,
  motivo text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint auditoria_moderacion_accion_check check (accion in ('aprobar', 'rechazar', 'corregir_etiquetas'))
);

create index if not exists idx_canciones_estado on public.canciones(estado);
create index if not exists idx_canciones_contribuyente on public.canciones(contribuyente_id);
create index if not exists idx_canciones_moderador on public.canciones(moderador_id);
create index if not exists idx_canciones_fecha_contribucion on public.canciones(fecha_contribucion desc);
create index if not exists idx_etiquetas_tiempo_momento on public.etiquetas_cancion(tiempo_liturgico, momento_misa);
create index if not exists idx_etiquetas_cancion_id on public.etiquetas_cancion(cancion_id);
create index if not exists idx_auditoria_cancion on public.auditoria_moderacion(cancion_id, created_at desc);

create index if not exists idx_canciones_titulo_trgm
  on public.canciones using gin (titulo gin_trgm_ops);
create index if not exists idx_canciones_letra_trgm
  on public.canciones using gin (letra_acordes gin_trgm_ops);

drop trigger if exists trg_canciones_set_updated_at on public.canciones;
create trigger trg_canciones_set_updated_at
before update on public.canciones
for each row execute function public.cancionero_set_updated_at();

drop trigger if exists trg_tiempos_liturgicos_set_updated_at on public.tiempos_liturgicos;
create trigger trg_tiempos_liturgicos_set_updated_at
before update on public.tiempos_liturgicos
for each row execute function public.cancionero_set_updated_at();

create or replace function internal.cancionero_validate_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tag_count integer;
begin
  if new.estado = 'publicado' and old.estado is distinct from 'publicado' then
    select count(*) into tag_count
    from public.etiquetas_cancion
    where cancion_id = new.id;

    if tag_count = 0 then
      raise exception 'Una canción debe tener al menos una etiqueta para publicarse';
    end if;

    new.fecha_moderacion = coalesce(new.fecha_moderacion, timezone('utc', now()));
  end if;

  return new;
end;
$$;

drop trigger if exists trg_canciones_validate_publish on public.canciones;
create trigger trg_canciones_validate_publish
before update on public.canciones
for each row execute function internal.cancionero_validate_publish();

alter table public.canciones enable row level security;
alter table public.etiquetas_cancion enable row level security;
alter table public.tiempos_liturgicos enable row level security;
alter table public.auditoria_moderacion enable row level security;

drop policy if exists canciones_read_publicadas on public.canciones;
create policy canciones_read_publicadas
on public.canciones
for select
to anon, authenticated
using (estado = 'publicado' or internal.is_cancionero_admin(auth.uid()));

drop policy if exists canciones_insert_authenticated on public.canciones;
create policy canciones_insert_authenticated
on public.canciones
for insert
to authenticated
with check (
  estado = 'pendiente'
  and (contribuyente_id is null or contribuyente_id = auth.uid())
);

drop policy if exists canciones_update_admin on public.canciones;
create policy canciones_update_admin
on public.canciones
for update
to authenticated
using (internal.is_cancionero_admin(auth.uid()))
with check (internal.is_cancionero_admin(auth.uid()));

drop policy if exists canciones_delete_admin on public.canciones;
create policy canciones_delete_admin
on public.canciones
for delete
to authenticated
using (internal.is_cancionero_admin(auth.uid()));

drop policy if exists etiquetas_read_publicadas on public.etiquetas_cancion;
create policy etiquetas_read_publicadas
on public.etiquetas_cancion
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.canciones c
    where c.id = cancion_id
      and (c.estado = 'publicado' or internal.is_cancionero_admin(auth.uid()))
  )
);

drop policy if exists etiquetas_insert_authenticated on public.etiquetas_cancion;
create policy etiquetas_insert_authenticated
on public.etiquetas_cancion
for insert
to authenticated
with check (
  exists (
    select 1
    from public.canciones c
    where c.id = cancion_id
      and (
        internal.is_cancionero_admin(auth.uid())
        or (c.estado = 'pendiente' and c.contribuyente_id = auth.uid())
      )
  )
);

drop policy if exists etiquetas_update_admin on public.etiquetas_cancion;
create policy etiquetas_update_admin
on public.etiquetas_cancion
for update
to authenticated
using (internal.is_cancionero_admin(auth.uid()))
with check (internal.is_cancionero_admin(auth.uid()));

drop policy if exists etiquetas_delete_admin on public.etiquetas_cancion;
create policy etiquetas_delete_admin
on public.etiquetas_cancion
for delete
to authenticated
using (internal.is_cancionero_admin(auth.uid()));

drop policy if exists tiempos_read_public on public.tiempos_liturgicos;
create policy tiempos_read_public
on public.tiempos_liturgicos
for select
to anon, authenticated
using (true);

drop policy if exists tiempos_write_admin on public.tiempos_liturgicos;
create policy tiempos_write_admin
on public.tiempos_liturgicos
for all
to authenticated
using (internal.is_cancionero_admin(auth.uid()))
with check (internal.is_cancionero_admin(auth.uid()));

drop policy if exists auditoria_read_admin on public.auditoria_moderacion;
create policy auditoria_read_admin
on public.auditoria_moderacion
for select
to authenticated
using (internal.is_cancionero_admin(auth.uid()));

drop policy if exists auditoria_insert_admin on public.auditoria_moderacion;
create policy auditoria_insert_admin
on public.auditoria_moderacion
for insert
to authenticated
with check (internal.is_cancionero_admin(auth.uid()));

grant select on public.canciones to anon, authenticated;
grant insert on public.canciones to authenticated;
grant update, delete on public.canciones to authenticated;

grant select on public.etiquetas_cancion to anon, authenticated;
grant insert on public.etiquetas_cancion to authenticated;
grant update, delete on public.etiquetas_cancion to authenticated;

grant select on public.tiempos_liturgicos to anon, authenticated;
grant insert, update, delete on public.tiempos_liturgicos to authenticated;

grant select, insert on public.auditoria_moderacion to authenticated;

grant all privileges on public.canciones to service_role;
grant all privileges on public.etiquetas_cancion to service_role;
grant all privileges on public.tiempos_liturgicos to service_role;
grant all privileges on public.auditoria_moderacion to service_role;

insert into public.roles (slug, name, description, hierarchy_level)
values ('musico', 'Músico', 'Contribuye canciones al cancionero', 60)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  hierarchy_level = excluded.hierarchy_level;

with role_map as (
  select id, slug from public.roles where slug in ('admin', 'sacerdote', 'coordinador', 'musico', 'usuario')
)
insert into public.permissions (role_id, app_slug, can_access)
select
  r.id,
  'cancionero',
  case
    when r.slug in ('admin', 'sacerdote', 'coordinador', 'musico', 'usuario') then true
    else false
  end
from role_map r
on conflict (role_id, app_slug) do update
set can_access = excluded.can_access;

insert into public.tiempos_liturgicos (id, nombre, momentos_misa)
values
  ('adviento', 'Adviento', '["Entrada","Salmo","Aleluya","Ofertorio","Comunion","Salida"]'::jsonb),
  ('navidad', 'Navidad', '["Entrada","Gloria","Salmo","Ofertorio","Comunion","Salida"]'::jsonb),
  ('cuaresma', 'Cuaresma', '["Entrada","Acto penitencial","Salmo","Ofertorio","Comunion","Salida"]'::jsonb),
  ('pascua', 'Pascua', '["Entrada","Gloria","Salmo","Ofertorio","Comunion","Salida"]'::jsonb),
  ('tiempo-ordinario', 'Tiempo Ordinario', '["Entrada","Salmo","Ofertorio","Santo","Comunion","Salida"]'::jsonb)
on conflict (id) do update
set
  nombre = excluded.nombre,
  momentos_misa = excluded.momentos_misa,
  updated_at = timezone('utc', now());
