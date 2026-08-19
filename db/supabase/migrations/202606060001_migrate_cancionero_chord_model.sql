-- Migración: separa la letra de los acordes y migra el formato legado [Acorde].
-- Antes:  letra_acordes text   -> "[G]Ven, [D]ven [Em]Señor"
-- Ahora:  letra text + acordes jsonb -> [{ linea, posicion, nombre }]

begin;

-- 1) Helper PL/pgSQL: parsea un texto con markup [Acorde] y devuelve (letra, jsonb de acordes).
--    Esta función queda disponible por si se necesita re-procesar texto legado en el futuro.
create or replace function internal.cancionero_migrate_chord_text(legacy text)
returns table (letra_out text, acordes_out jsonb)
language plpgsql
immutable
as $$
declare
  line_idx integer;
  line_count integer;
  lines text[];
  current_line text;
  working text;
  pattern constant text := '\[([^\[\]\n]+)\]';
  m text[];
  chord_name text;
  chords jsonb := '[]'::jsonb;
  result_lines text[] := '{}';
begin
  if legacy is null or length(legacy) = 0 then
    letra_out := '';
    acordes_out := '[]'::jsonb;
    return next;
    return;
  end if;

  lines := string_to_array(legacy, E'\n');
  line_count := array_length(lines, 1);

  for line_idx in 1..line_count loop
    current_line := '';
    working := lines[line_idx];

    while working ~ pattern loop
      m := regexp_match(working, pattern);
      chord_name := btrim(coalesce(m[1], ''));

      if length(chord_name) = 0 then
        current_line := current_line || m[0];
      else
        chords := chords || jsonb_build_array(
          jsonb_build_object(
            'linea', line_idx - 1,
            'posicion', length(current_line),
            'nombre', chord_name
          )
        );
      end if;

      working := substring(working from position(m[0] in working) + length(m[0]));
    end loop;

    current_line := current_line || working;
    result_lines := result_lines || current_line;
  end loop;

  letra_out := array_to_string(result_lines, E'\n');
  acordes_out := chords;
  return next;
  return;
end;
$$;

-- 2) Helper PL/pgSQL: valida la forma del array de acordes. Se usa desde el CHECK
--    porque los CHECK constraints no admiten FROM ni set-returning functions.
create or replace function internal.cancionero_validate_chord_positions(positions jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  item jsonb;
begin
  if positions is null or jsonb_typeof(positions) <> 'array' then
    return false;
  end if;

  for item in
    select value from jsonb_array_elements(positions)
  loop
    if not (
      jsonb_typeof(item) = 'object'
      and item ? 'linea'
      and jsonb_typeof(item->'linea') = 'number'
      and (item->>'linea') ~ '^[0-9]+$'
      and item ? 'posicion'
      and jsonb_typeof(item->'posicion') = 'number'
      and (item->>'posicion') ~ '^[0-9]+$'
      and item ? 'nombre'
      and jsonb_typeof(item->'nombre') = 'string'
      and length(btrim(item->>'nombre')) between 1 and 12
    ) then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

-- 3) Agregar columnas nuevas con default seguro para registros existentes.
alter table public.canciones
  add column if not exists letra text,
  add column if not exists acordes jsonb not null default '[]'::jsonb;

-- 4) Backfill desde letra_acordes hacia letra + acordes.
do $$
declare
  row record;
  migrated_letra text;
  migrated_acordes jsonb;
begin
  for row in
    select id, letra_acordes
    from public.canciones
    where letra is null and letra_acordes is not null
  loop
    select letra_out, acordes_out
      into migrated_letra, migrated_acordes
    from internal.cancionero_migrate_chord_text(row.letra_acordes);

    update public.canciones
       set letra = migrated_letra,
           acordes = migrated_acordes
     where id = row.id;
  end loop;
end;
$$;

-- 5) Hacer NOT NULL la nueva columna de letra.
alter table public.canciones
  alter column letra set not null;

-- 6) Eliminar el índice viejo y la columna vieja.
drop index if exists public.idx_canciones_letra_trgm;
alter table public.canciones drop column if exists letra_acordes;

-- 7) Recrear el índice GIN sobre la nueva columna de letra limpia.
create index if not exists idx_canciones_letra_trgm
  on public.canciones using gin (letra gin_trgm_ops);

-- 8) Constraint que delega la validación de forma a la función PL/pgSQL.
alter table public.canciones
  drop constraint if exists canciones_acordes_shape_check;
alter table public.canciones
  add constraint canciones_acordes_shape_check
  check (internal.cancionero_validate_chord_positions(acordes));

commit;
