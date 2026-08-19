begin;

alter table if exists public.canciones
  add column if not exists observaciones_contribucion text;

commit;
