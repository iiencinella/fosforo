-- Consentimientos de comunicacion por categoria (paso 8, app logueo).
--
-- Contrato: FASE_1-Sistema-de-Logueo/WEB 06-Esquema de Datos (tabla
-- consents) y FR-AUTH-004. Solo categorias no obligatorias: transactional
-- se gestiona siempre activa desde @repo/notification-core (RB-NOTIF-002)
-- y no es objeto de consentimiento opt-out.
--
-- RLS: el usuario gestiona exclusivamente sus propias filas.

create table if not exists public.consents (
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  opted_in boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, category)
);

alter table public.consents
  drop constraint if exists consents_category_check;
alter table public.consents
  add constraint consents_category_check
  check (category in ('product', 'liturgical', 'community'));

drop trigger if exists trg_consents_set_updated_at on public.consents;
create trigger trg_consents_set_updated_at
before update on public.consents
for each row
execute function internal.set_updated_at();

alter table public.consents enable row level security;

drop policy if exists consents_select_own on public.consents;
create policy consents_select_own
on public.consents
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists consents_insert_own on public.consents;
create policy consents_insert_own
on public.consents
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists consents_update_own on public.consents;
create policy consents_update_own
on public.consents
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists consents_delete_own on public.consents;
create policy consents_delete_own
on public.consents
for delete
to authenticated
using (user_id = auth.uid());

grant select, insert, update, delete on public.consents to authenticated;
grant all privileges on public.consents to service_role;
