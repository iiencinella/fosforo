do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'biblia_versions'
      and policyname = 'Public can read enabled internal-safe versions'
  ) then
    create policy "Public can read enabled internal-safe versions"
      on public.biblia_versions
      for select
      to anon, authenticated
      using (is_enabled = true and is_internal_only = true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'biblia_books'
      and policyname = 'Public can read books for enabled versions'
  ) then
    create policy "Public can read books for enabled versions"
      on public.biblia_books
      for select
      to anon, authenticated
      using (
        exists (
          select 1
          from public.biblia_versions v
          where v.code = biblia_books.version_code
            and v.is_enabled = true
            and v.is_internal_only = true
        )
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'biblia_chapters'
      and policyname = 'Public can read chapters for enabled versions'
  ) then
    create policy "Public can read chapters for enabled versions"
      on public.biblia_chapters
      for select
      to anon, authenticated
      using (
        exists (
          select 1
          from public.biblia_versions v
          where v.code = biblia_chapters.version_code
            and v.is_enabled = true
            and v.is_internal_only = true
        )
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'biblia_verses'
      and policyname = 'Public can read verses for enabled versions'
  ) then
    create policy "Public can read verses for enabled versions"
      on public.biblia_verses
      for select
      to anon, authenticated
      using (
        exists (
          select 1
          from public.biblia_versions v
          where v.code = biblia_verses.version_code
            and v.is_enabled = true
            and v.is_internal_only = true
        )
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'liturgy_daily_readings'
      and policyname = 'Public can read liturgy roman ar'
  ) then
    create policy "Public can read liturgy roman ar"
      on public.liturgy_daily_readings
      for select
      to anon, authenticated
      using (rite = 'roman' and region_code = 'AR');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'biblia_ingestion_runs'
      and policyname = 'No public select ingestion runs'
  ) then
    create policy "No public select ingestion runs"
      on public.biblia_ingestion_runs
      for select
      to anon, authenticated
      using (false);
  end if;
end
$$;
