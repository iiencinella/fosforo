-- Suscripciones de webhook para el CMS — paso 9 del plan.
--
-- Contratos: FR-CMS-010 (webhook de publicacion), RB-CMS-010
-- (invalidacion de cache), IR-CMS-004/007, CA-CMS-005.
--
-- Decisiones:
-- - Cada suscripcion tiene su secreto HMAC-SHA256: la emision firma el
--   body con x-cms-signature; el consumidor verifica antes de procesar.
-- - target_url solo https (check en DB y en el schema de la app).
-- - Solo admin gestiona suscripciones (RLS); el despacho lee con
--   service_role para no depender del rol del revisor que publica.

create table if not exists public.content_webhook_subscriptions (
  id uuid primary key default gen_random_uuid(),
  app_name text not null,
  target_url text not null,
  secret text not null,
  events text[] not null default array['entry.published'],
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.content_webhook_subscriptions
  drop constraint if exists content_webhook_subscriptions_url_https;
alter table public.content_webhook_subscriptions
  add constraint content_webhook_subscriptions_url_https
  check (target_url like 'https://%');

alter table public.content_webhook_subscriptions
  drop constraint if exists content_webhook_subscriptions_url_key;
alter table public.content_webhook_subscriptions
  add constraint content_webhook_subscriptions_url_key
  unique (target_url);

drop trigger if exists trg_content_webhook_subscriptions_set_updated_at
  on public.content_webhook_subscriptions;
create trigger trg_content_webhook_subscriptions_set_updated_at
before update on public.content_webhook_subscriptions
for each row
execute function internal.set_updated_at();

alter table public.content_webhook_subscriptions enable row level security;

drop policy if exists content_webhook_subscriptions_select_admin on public.content_webhook_subscriptions;
create policy content_webhook_subscriptions_select_admin
on public.content_webhook_subscriptions
for select
to authenticated
using (public.current_user_role_slug() = 'admin');

drop policy if exists content_webhook_subscriptions_write_admin on public.content_webhook_subscriptions;
create policy content_webhook_subscriptions_write_admin
on public.content_webhook_subscriptions
for all
to authenticated
using (public.current_user_role_slug() = 'admin')
with check (public.current_user_role_slug() = 'admin');

grant select, insert, update, delete on public.content_webhook_subscriptions to authenticated;
grant all privileges on public.content_webhook_subscriptions to service_role;
