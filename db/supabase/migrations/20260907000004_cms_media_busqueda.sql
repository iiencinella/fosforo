-- Medios y busqueda del CMS — paso 8 del plan.
--
-- Contratos: FR-CMS-008/009, RB-CMS-009, NFR-CMS-006 (webp/jpeg <= 2MB),
-- SEC-CMS-009 (validacion de tipo y tamanio), CMS-007 (busqueda), 09-
-- Especificacion Tecnica (bucket cms-media, Supabase Storage).
--
-- Decisiones:
-- - Bucket PUBLICO de solo lectura: los medios de contenido se sirven en
--   paginas publicas; la escritura queda restringida a admin/editor via
--   policies de Storage con el RBAC del ecosistema.
-- - Busqueda con RPC security invoker: la RLS del paso 2 filtra los
--   estados por rol (editor draft/review, revisor review/published,
--   admin todo); la API publica pasa statuses=['published'] con
--   service_role. Sin GIN sobre jsonb en MVP (NFR-CMS-005: 10k entradas
--   soportan ILIKE sobre claves acotadas).

-- 1. Bucket cms-media (idempotente).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media',
  'cms-media',
  true,
  2097152, -- 2 MB (RB-CMS-009)
  array['image/webp', 'image/jpeg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Policies de Storage sobre storage.objects para el bucket.
drop policy if exists cms_media_select_all on storage.objects;
create policy cms_media_select_all
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'cms-media');

drop policy if exists cms_media_insert_editorial on storage.objects;
create policy cms_media_insert_editorial
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'cms-media'
  and public.current_user_role_slug() in ('admin', 'editor')
);

drop policy if exists cms_media_update_editorial on storage.objects;
create policy cms_media_update_editorial
on storage.objects
for update
to authenticated
using (
  bucket_id = 'cms-media'
  and public.current_user_role_slug() in ('admin', 'editor')
)
with check (
  bucket_id = 'cms-media'
  and public.current_user_role_slug() in ('admin', 'editor')
);

drop policy if exists cms_media_delete_editorial on storage.objects;
create policy cms_media_delete_editorial
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'cms-media'
  and public.current_user_role_slug() in ('admin', 'editor')
);

-- 3. RPC de busqueda (security invoker: respeta RLS del rol del usuario;
-- para la API publica se llama con service_role + statuses=['published']).
create or replace function public.search_content_entries(
  p_query text,
  p_content_type_slug text default null,
  p_statuses text[] default null,
  p_limit integer default 20
)
returns table (
  id uuid,
  content_type_slug text,
  content_type_name text,
  slug text,
  status text,
  title text,
  published_at timestamptz,
  updated_at timestamptz
)
language sql
stable
set search_path = public
as $$
  select
    ce.id,
    ct.slug as content_type_slug,
    ct.name as content_type_name,
    ce.slug as slug,
    ce.status as status,
    coalesce(ce.data ->> 'titulo', ce.data ->> 'title', ce.slug) as title,
    ce.published_at as published_at,
    ce.updated_at as updated_at
  from public.content_entries ce
  join public.content_types ct on ct.id = ce.content_type_id
  where (p_statuses is null or ce.status = any(p_statuses))
    and (p_content_type_slug is null or ct.slug = p_content_type_slug)
    and (
      ce.slug ilike '%' || p_query || '%'
      or coalesce(ce.data ->> 'titulo', '') ilike '%' || p_query || '%'
      or coalesce(ce.data ->> 'title', '') ilike '%' || p_query || '%'
      or coalesce(ce.data ->> 'cuerpo', '') ilike '%' || p_query || '%'
      or coalesce(ce.data ->> 'body', '') ilike '%' || p_query || '%'
    )
  order by ce.updated_at desc
  limit least(coalesce(p_limit, 20), 50)
$$;

revoke all on function public.search_content_entries(text, text, text[], integer)
  from public, anon;
grant execute on function public.search_content_entries(text, text, text[], integer)
  to authenticated, service_role;
