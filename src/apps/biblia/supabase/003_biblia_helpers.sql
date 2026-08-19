create or replace function public.biblia_read_chapter(
  p_version_code text,
  p_book_slug text,
  p_chapter_number integer
)
returns table (
  version_code text,
  book_slug text,
  book_name text,
  chapter_number integer,
  verse_number integer,
  verse_text text
)
language sql
stable
security invoker
as $$
  select
    v.code as version_code,
    b.slug as book_slug,
    b.name as book_name,
    c.chapter_number,
    vs.verse_number,
    vs.verse_text
  from public.biblia_versions v
  join public.biblia_books b
    on b.version_code = v.code
  join public.biblia_chapters c
    on c.book_id = b.id
  join public.biblia_verses vs
    on vs.chapter_id = c.id
  where v.code = p_version_code
    and b.slug = p_book_slug
    and c.chapter_number = p_chapter_number
  order by vs.verse_number;
$$;

create or replace function public.biblia_search_verses(
  p_version_code text,
  p_query text,
  p_limit integer default 30
)
returns table (
  version_code text,
  book_slug text,
  book_name text,
  chapter_number integer,
  verse_number integer,
  reference_label text,
  verse_text text,
  rank real
)
language sql
stable
security invoker
as $$
  with q as (
    select plainto_tsquery('spanish', trim(p_query)) as tsq
  )
  select
    vs.version_code,
    b.slug as book_slug,
    b.name as book_name,
    vs.chapter_number,
    vs.verse_number,
    concat(b.name, ' ', vs.chapter_number::text, ',', vs.verse_number::text) as reference_label,
    vs.verse_text,
    ts_rank(vs.search_vector, q.tsq) as rank
  from public.biblia_verses vs
  join public.biblia_books b
    on b.id = vs.book_id
  join q on true
  where vs.version_code = p_version_code
    and (
      vs.search_vector @@ q.tsq
      or vs.verse_text ilike concat('%', trim(p_query), '%')
    )
  order by rank desc nulls last, b.position asc, vs.chapter_number asc, vs.verse_number asc
  limit greatest(1, least(coalesce(p_limit, 30), 200));
$$;

create or replace function public.biblia_get_liturgy_day(
  p_date date,
  p_rite text default 'roman',
  p_region_code text default 'AR'
)
returns table (
  reading_date date,
  rite text,
  region_code text,
  celebration_type text,
  celebration_name text,
  cycle text,
  week integer,
  first_reading_ref text,
  psalm_ref text,
  second_reading_ref text,
  gospel_ref text,
  source_year integer
)
language sql
stable
security invoker
as $$
  select
    l.reading_date,
    l.rite,
    l.region_code,
    l.celebration_type,
    l.celebration_name,
    l.cycle,
    l.week,
    l.first_reading_ref,
    l.psalm_ref,
    l.second_reading_ref,
    l.gospel_ref,
    l.source_year
  from public.liturgy_daily_readings l
  where l.reading_date = p_date
    and l.rite = p_rite
    and l.region_code = p_region_code;
$$;
