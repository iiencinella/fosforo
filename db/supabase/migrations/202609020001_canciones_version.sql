begin;

create extension if not exists unaccent;

create or replace function public.cancion_titulo_normalizado(titulo text)
returns text
language sql
immutable
parallel safe
set search_path = public, extensions
as $$
  select regexp_replace(unaccent(lower(btrim(titulo))), '\s+', ' ', 'g')
$$;

alter table if exists public.canciones
  add column if not exists version smallint not null default 1;

update public.canciones c
set version = r.rn
from (
  select id,
         row_number() over (
           partition by public.cancion_titulo_normalizado(titulo)
           order by fecha_contribucion asc, created_at asc, id asc
         ) as rn
  from public.canciones
) as r
where c.id = r.id and c.version <> r.rn;

alter table if exists public.canciones
  drop constraint if exists canciones_version_check;

alter table if exists public.canciones
  add constraint canciones_version_check check (version >= 1);

create unique index if not exists canciones_titulo_version_uidx
  on public.canciones (public.cancion_titulo_normalizado(titulo), version);

create or replace function public.canciones_por_titulo(titulo_input text)
returns table (id uuid, titulo varchar, version smallint)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select c.id, c.titulo, c.version
  from public.canciones c
  where public.cancion_titulo_normalizado(c.titulo) = public.cancion_titulo_normalizado(titulo_input)
  order by c.version asc
$$;

revoke all on function public.canciones_por_titulo(text) from public;
grant execute on function public.canciones_por_titulo(text) to service_role;

commit;
