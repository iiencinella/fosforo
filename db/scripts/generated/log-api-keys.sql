-- API keys de ingesta para la app log (SEC-0105-LOG-007).
-- Generado por db/scripts/generate-log-api-keys.js.
-- Contiene solo hashes SHA-256; las claves crudas se entregan por canal seguro.

insert into public.api_keys (key_hash, app_name, description, is_active)
values (
  '8748271d055d80f6e5c82fadc5684e08e5d78dd4e4d2e07e40485d86ac25eba0',
  'calendario',
  'API key de ingesta para calendario',
  true
)
on conflict (key_hash) do update
set
  app_name = excluded.app_name,
  description = excluded.description,
  is_active = excluded.is_active;

insert into public.api_keys (key_hash, app_name, description, is_active)
values (
  'ea46d270e58acfcbcf5c0a6a6d70cdf0461e94c6298eca4a207b521fb761cf6f',
  'horarios',
  'API key de ingesta para horarios',
  true
)
on conflict (key_hash) do update
set
  app_name = excluded.app_name,
  description = excluded.description,
  is_active = excluded.is_active;

insert into public.api_keys (key_hash, app_name, description, is_active)
values (
  '6829c0268c7c968e3aee133eaa793a768a9c5e47651740c8d96bd652c8668d4f',
  'administracion',
  'API key de ingesta para administracion',
  true
)
on conflict (key_hash) do update
set
  app_name = excluded.app_name,
  description = excluded.description,
  is_active = excluded.is_active;
