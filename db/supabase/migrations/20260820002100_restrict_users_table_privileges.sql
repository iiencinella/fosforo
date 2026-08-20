revoke all on table public.user_roles from authenticated;
grant select, insert on table public.user_roles to authenticated;

revoke all on table public.audit_log from authenticated;
grant select, insert on table public.audit_log to authenticated;
