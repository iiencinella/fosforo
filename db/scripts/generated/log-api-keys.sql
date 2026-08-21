-- API keys de ingesta para la app log (SEC-0105-LOG-007).
-- Generado por db/scripts/generate-log-api-keys.js.
-- Contiene solo hashes SHA-256; las claves crudas se entregan por canal seguro.

insert into public.api_keys (key_hash, app_name, description, is_active)
values (
  '2830a3adacf487e0f8f3ec33beb51fbc027564ece583e0577ebcda6e9b8a4fc3',
  'portal',
  'API key de ingesta para portal',
  true
)
on conflict (key_hash) do update
set
  app_name = excluded.app_name,
  description = excluded.description,
  is_active = excluded.is_active;

insert into public.api_keys (key_hash, app_name, description, is_active)
values (
  '93f1ca17cf1f6f92102b200e048e8c00f823f4f9c54812e0b76f708f2f179493',
  'biblia',
  'API key de ingesta para biblia',
  true
)
on conflict (key_hash) do update
set
  app_name = excluded.app_name,
  description = excluded.description,
  is_active = excluded.is_active;

insert into public.api_keys (key_hash, app_name, description, is_active)
values (
  '7857de950828692648fa0726401dbf2d23aff75372fb8242e78c5a2ab0068682',
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
  '9f0bc0ef9a2270bd4ad48f325244d6749dccd07f0cad46683e269fbe412be386',
  'cancionero',
  'API key de ingesta para cancionero',
  true
)
on conflict (key_hash) do update
set
  app_name = excluded.app_name,
  description = excluded.description,
  is_active = excluded.is_active;

insert into public.api_keys (key_hash, app_name, description, is_active)
values (
  '141debbcc624690d4fd7d676ddb83458823f99b8ea256fb675a98066fe1152ba',
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
  '1a588da54624e359565bac4595f1e8796f27cc77f38bed400a1eb92baec15b0d',
  'usuario',
  'API key de ingesta para usuario',
  true
)
on conflict (key_hash) do update
set
  app_name = excluded.app_name,
  description = excluded.description,
  is_active = excluded.is_active;

insert into public.api_keys (key_hash, app_name, description, is_active)
values (
  '5faaaeb3cffa2f9f2b849ee3d27c7de5f22456ac6426bfee1697816c32da9977',
  'administracion',
  'API key de ingesta para administracion',
  true
)
on conflict (key_hash) do update
set
  app_name = excluded.app_name,
  description = excluded.description,
  is_active = excluded.is_active;
