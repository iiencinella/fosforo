revoke all on table public.portal_contact_requests from anon, authenticated;
revoke all on table public.portal_feedback_items from anon, authenticated;
revoke all on table public.portal_submission_audit from anon, authenticated;

grant insert, select on table public.portal_contact_requests to service_role;
grant insert, select on table public.portal_feedback_items to service_role;
grant insert, select on table public.portal_submission_audit to service_role;
