create schema if not exists internal;
revoke all on schema internal from public;

create or replace function internal.assign_user_role(
  p_target_user_id uuid,
  p_role_slug text,
  p_ip_address text default null
)
returns table (user_id uuid, role_slug text)
language plpgsql
security definer
set search_path = public, internal
as $$
declare
  actor_id uuid := auth.uid();
  target_role_id bigint;
  previous_role_id bigint;
begin
  if actor_id is null or not internal.is_admin(actor_id) then
    raise exception 'USERS_ROLE_ASSIGNMENT_DENIED';
  end if;

  if actor_id = p_target_user_id then
    raise exception 'USERS_ROLE_ASSIGNMENT_DENIED';
  end if;

  select id into target_role_id
  from public.roles
  where slug = p_role_slug;

  if target_role_id is null then
    raise exception 'USERS_ROLE_NOT_FOUND';
  end if;

  select role_id into previous_role_id
  from public.profiles
  where id = p_target_user_id
  for update;

  if not found then
    raise exception 'USERS_USER_NOT_FOUND';
  end if;

  update public.profiles
  set role_id = target_role_id,
      updated_at = timezone('utc', now())
  where id = p_target_user_id;

  insert into public.user_roles (user_id, role_id, assigned_by)
  values (p_target_user_id, target_role_id, actor_id);

  insert into public.audit_log (user_id, action, metadata, ip_address)
  values (
    p_target_user_id,
    'role_changed',
    jsonb_build_object(
      'actorUserId', actor_id,
      'previousRoleId', previous_role_id,
      'nextRoleId', target_role_id,
      'nextRoleSlug', p_role_slug
    ),
    p_ip_address
  );

  return query select p_target_user_id, p_role_slug;
end;
$$;

revoke all on function internal.assign_user_role(uuid, text, text) from public;

create or replace function public.assign_user_role(
  p_target_user_id uuid,
  p_role_slug text,
  p_ip_address text default null
)
returns table (user_id uuid, role_slug text)
language sql
security invoker
set search_path = public
as $$
  select * from internal.assign_user_role($1, $2, $3);
$$;

revoke all on function public.assign_user_role(uuid, text, text) from public;
grant execute on function public.assign_user_role(uuid, text, text) to authenticated;

revoke update on table public.profiles from authenticated;
grant update (name, avatar_url) on table public.profiles to authenticated;

revoke update, delete on table public.user_roles from authenticated;
revoke update, delete on table public.audit_log from authenticated;
