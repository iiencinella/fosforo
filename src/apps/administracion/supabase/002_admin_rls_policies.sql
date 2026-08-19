-- Función SECURITY DEFINER para evitar recursión infinita en RLS de admin_users
-- (el subquery directo a admin_users dentro del policy provoca recursion)
create or replace function public.is_admin_user(uid uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = uid and active = true and role = 'admin'
  );
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'admin_users' and policyname = 'admin_users_select_self_or_admin'
  ) then
    create policy admin_users_select_self_or_admin
    on public.admin_users
    for select
    to authenticated
    using (
      user_id = auth.uid() or public.is_admin_user(auth.uid())
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'churches' and policyname = 'churches_read_all_roles'
  ) then
    create policy churches_read_all_roles
    on public.churches
    for select
    to authenticated
    using (
      exists (
        select 1 from public.admin_users me
        where me.user_id = auth.uid() and me.active = true and me.role in ('admin', 'editor', 'viewer')
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'churches' and policyname = 'churches_insert_admin_editor'
  ) then
    create policy churches_insert_admin_editor
    on public.churches
    for insert
    to authenticated
    with check (
      exists (
        select 1 from public.admin_users me
        where me.user_id = auth.uid() and me.active = true and me.role in ('admin', 'editor')
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'churches' and policyname = 'churches_update_admin_editor'
  ) then
    create policy churches_update_admin_editor
    on public.churches
    for update
    to authenticated
    using (
      exists (
        select 1 from public.admin_users me
        where me.user_id = auth.uid() and me.active = true and me.role in ('admin', 'editor')
      )
    )
    with check (
      exists (
        select 1 from public.admin_users me
        where me.user_id = auth.uid() and me.active = true and me.role in ('admin', 'editor')
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'celebration_schedules' and policyname = 'schedules_read_all_roles'
  ) then
    create policy schedules_read_all_roles
    on public.celebration_schedules
    for select
    to authenticated
    using (
      exists (
        select 1 from public.admin_users me
        where me.user_id = auth.uid() and me.active = true and me.role in ('admin', 'editor', 'viewer')
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'celebration_schedules' and policyname = 'schedules_insert_admin_editor'
  ) then
    create policy schedules_insert_admin_editor
    on public.celebration_schedules
    for insert
    to authenticated
    with check (
      exists (
        select 1 from public.admin_users me
        where me.user_id = auth.uid() and me.active = true and me.role in ('admin', 'editor')
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'celebration_schedules' and policyname = 'schedules_update_admin_editor'
  ) then
    create policy schedules_update_admin_editor
    on public.celebration_schedules
    for update
    to authenticated
    using (
      exists (
        select 1 from public.admin_users me
        where me.user_id = auth.uid() and me.active = true and me.role in ('admin', 'editor')
      )
    )
    with check (
      exists (
        select 1 from public.admin_users me
        where me.user_id = auth.uid() and me.active = true and me.role in ('admin', 'editor')
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'celebration_schedules' and policyname = 'schedules_delete_admin_only'
  ) then
    create policy schedules_delete_admin_only
    on public.celebration_schedules
    for delete
    to authenticated
    using (
      exists (
        select 1 from public.admin_users me
        where me.user_id = auth.uid() and me.active = true and me.role = 'admin'
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'admin_audit_log' and policyname = 'audit_select_all_roles'
  ) then
    create policy audit_select_all_roles
    on public.admin_audit_log
    for select
    to authenticated
    using (
      exists (
        select 1 from public.admin_users me
        where me.user_id = auth.uid() and me.active = true and me.role in ('admin', 'editor', 'viewer')
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'admin_audit_log' and policyname = 'audit_insert_admin_editor'
  ) then
    create policy audit_insert_admin_editor
    on public.admin_audit_log
    for insert
    to authenticated
    with check (
      exists (
        select 1 from public.admin_users me
        where me.user_id = auth.uid() and me.active = true and me.role in ('admin', 'editor')
      )
    );
  end if;
end $$;

grant usage on schema public to authenticated;

grant select on public.admin_users to authenticated;
grant select, insert, update on public.churches to authenticated;
grant select, insert, update, delete on public.celebration_schedules to authenticated;
grant select, insert on public.admin_audit_log to authenticated;
