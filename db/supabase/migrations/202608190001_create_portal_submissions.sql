create table if not exists public.portal_contact_requests (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  email varchar(120) not null,
  message varchar(1000) not null,
  status varchar(30) not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb,
  constraint portal_contact_requests_status_check
    check (status in ('pending', 'in_review', 'resolved', 'rejected'))
);

create table if not exists public.portal_feedback_items (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  contact_channel varchar(120) not null,
  category varchar(30) not null,
  message varchar(1000) not null,
  status varchar(30) not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb,
  constraint portal_feedback_items_category_check
    check (category in ('producto', 'contenido', 'ux')),
  constraint portal_feedback_items_status_check
    check (status in ('pending', 'in_review', 'resolved', 'rejected'))
);

create table if not exists public.portal_submission_audit (
  id uuid primary key default gen_random_uuid(),
  submission_type varchar(30) not null,
  submission_id uuid not null,
  event_type varchar(40) not null,
  actor varchar(100) not null default 'portal',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint portal_submission_audit_type_check
    check (submission_type in ('contact', 'feedback'))
);

create index if not exists idx_portal_contact_requests_created_at
  on public.portal_contact_requests(created_at desc);

create index if not exists idx_portal_contact_requests_status
  on public.portal_contact_requests(status);

create index if not exists idx_portal_feedback_items_created_at
  on public.portal_feedback_items(created_at desc);

create index if not exists idx_portal_feedback_items_status
  on public.portal_feedback_items(status);

create index if not exists idx_portal_submission_audit_submission
  on public.portal_submission_audit(submission_type, submission_id, created_at desc);

alter table public.portal_contact_requests enable row level security;
alter table public.portal_feedback_items enable row level security;
alter table public.portal_submission_audit enable row level security;

revoke all on table public.portal_contact_requests from anon, authenticated;
revoke all on table public.portal_feedback_items from anon, authenticated;
revoke all on table public.portal_submission_audit from anon, authenticated;

drop policy if exists portal_contact_requests_insert_service_role
  on public.portal_contact_requests;
create policy portal_contact_requests_insert_service_role
  on public.portal_contact_requests
  for insert
  to service_role
  with check (true);

drop policy if exists portal_feedback_items_insert_service_role
  on public.portal_feedback_items;
create policy portal_feedback_items_insert_service_role
  on public.portal_feedback_items
  for insert
  to service_role
  with check (true);

drop policy if exists portal_submission_audit_insert_service_role
  on public.portal_submission_audit;
create policy portal_submission_audit_insert_service_role
  on public.portal_submission_audit
  for insert
  to service_role
  with check (true);

grant insert, select on public.portal_contact_requests to service_role;
grant insert, select on public.portal_feedback_items to service_role;
grant insert, select on public.portal_submission_audit to service_role;
