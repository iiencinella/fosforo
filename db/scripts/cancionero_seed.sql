begin;

insert into public.canciones (
  id,
  titulo,
  letra,
  acordes,
  pdf_url,
  youtube_url,
  estado,
  fecha_contribucion,
  fecha_moderacion
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Ven, ven Senor no tardes',
    'Ven, ven Senor no tardes' || E'\n' || 'Ven, ven que te esperamos',
    '[
      {"linea": 0, "posicion": 0,  "nombre": "G"},
      {"linea": 0, "posicion": 5,  "nombre": "D"},
      {"linea": 0, "posicion": 18, "nombre": "Em"},
      {"linea": 1, "posicion": 0,  "nombre": "G"},
      {"linea": 1, "posicion": 5,  "nombre": "D"},
      {"linea": 1, "posicion": 16, "nombre": "G"}
    ]'::jsonb,
    null,
    'https://www.youtube.com/watch?v=3e3hA9M2m5Q',
    'publicado',
    timezone('utc', now()) - interval '20 days',
    timezone('utc', now()) - interval '18 days'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Pescador de hombres',
    'Tu has venido a la orilla' || E'\n' || 'No has buscado ni a sabios ni a ricos',
    '[
      {"linea": 0, "posicion": 0,  "nombre": "C"},
      {"linea": 0, "posicion": 21, "nombre": "G"},
      {"linea": 1, "posicion": 7,  "nombre": "Am"},
      {"linea": 1, "posicion": 22, "nombre": "F"},
      {"linea": 1, "posicion": 33, "nombre": "G"}
    ]'::jsonb,
    null,
    'https://www.youtube.com/watch?v=wP1yP3D6w0I',
    'publicado',
    timezone('utc', now()) - interval '16 days',
    timezone('utc', now()) - interval '14 days'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Tu reinaras',
    'Tu reinaras, este es el grito' || E'\n' || 'Que ardiente exhala nuestra fe',
    '[
      {"linea": 0, "posicion": 0,  "nombre": "D"},
      {"linea": 0, "posicion": 23, "nombre": "A"},
      {"linea": 1, "posicion": 4,  "nombre": "Bm"},
      {"linea": 1, "posicion": 18, "nombre": "G"}
    ]'::jsonb,
    null,
    null,
    'publicado',
    timezone('utc', now()) - interval '14 days',
    timezone('utc', now()) - interval '12 days'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Tomado de la mano',
    'Tomado de la mano con Jesus yo voy' || E'\n' || 'Le sigo como oveja que encontro al pastor',
    '[
      {"linea": 0, "posicion": 0,  "nombre": "G"},
      {"linea": 0, "posicion": 15, "nombre": "D"},
      {"linea": 0, "posicion": 20, "nombre": "Em"},
      {"linea": 0, "posicion": 26, "nombre": "C"},
      {"linea": 1, "posicion": 3,  "nombre": "G"},
      {"linea": 1, "posicion": 16, "nombre": "D"},
      {"linea": 1, "posicion": 33, "nombre": "C"},
      {"linea": 1, "posicion": 46, "nombre": "D"}
    ]'::jsonb,
    null,
    'https://www.youtube.com/watch?v=1J4Qk0kz9i0',
    'publicado',
    timezone('utc', now()) - interval '12 days',
    timezone('utc', now()) - interval '10 days'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'Gloria a Dios en el cielo',
    'Gloria a Dios en el cielo' || E'\n' || 'Y en la tierra paz a los hombres',
    '[
      {"linea": 0, "posicion": 0,  "nombre": "A"},
      {"linea": 0, "posicion": 19, "nombre": "E"},
      {"linea": 1, "posicion": 9,  "nombre": "F#m"},
      {"linea": 1, "posicion": 27, "nombre": "D"}
    ]'::jsonb,
    null,
    null,
    'publicado',
    timezone('utc', now()) - interval '10 days',
    timezone('utc', now()) - interval '8 days'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'Hoy el Senor resucito',
    'Hoy el Senor resucito' || E'\n' || 'Y de la muerte nos libro',
    '[
      {"linea": 0, "posicion": 0,  "nombre": "C"},
      {"linea": 0, "posicion": 14, "nombre": "G"},
      {"linea": 1, "posicion": 9,  "nombre": "Am"},
      {"linea": 1, "posicion": 20, "nombre": "F"}
    ]'::jsonb,
    null,
    'https://www.youtube.com/watch?v=2q0Xy7qz6gM',
    'publicado',
    timezone('utc', now()) - interval '8 days',
    timezone('utc', now()) - interval '6 days'
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    'Perdonanos Senor',
    'Perdonanos Senor' || E'\n' || 'Hemos pecado contra ti',
    '[
      {"linea": 0, "posicion": 0,  "nombre": "Am"},
      {"linea": 0, "posicion": 12, "nombre": "G"},
      {"linea": 1, "posicion": 6,  "nombre": "Dm"},
      {"linea": 1, "posicion": 13, "nombre": "E7"},
      {"linea": 1, "posicion": 22, "nombre": "Am"}
    ]'::jsonb,
    null,
    null,
    'publicado',
    timezone('utc', now()) - interval '7 days',
    timezone('utc', now()) - interval '5 days'
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    'Perdon, oh Dios mio',
    'Perdon, oh Dios mio' || E'\n' || 'Perdon e indulgencia',
    '[
      {"linea": 0, "posicion": 0,  "nombre": "Am"},
      {"linea": 0, "posicion": 10, "nombre": "G"},
      {"linea": 1, "posicion": 0,  "nombre": "Dm"},
      {"linea": 1, "posicion": 9,  "nombre": "E7"}
    ]'::jsonb,
    null,
    null,
    'pendiente',
    timezone('utc', now()) - interval '2 days',
    null
  ),
  (
    '99999999-9999-4999-8999-999999999999',
    'Ven Espiritu Santo',
    'Ven Espiritu Santo' || E'\n' || 'Llena los corazones de tus fieles',
    '[
      {"linea": 0, "posicion": 0,  "nombre": "G"},
      {"linea": 0, "posicion": 15, "nombre": "D"},
      {"linea": 1, "posicion": 6,  "nombre": "Em"},
      {"linea": 1, "posicion": 25, "nombre": "C"}
    ]'::jsonb,
    null,
    null,
    'pendiente',
    timezone('utc', now()) - interval '1 day',
    null
  )
on conflict (id) do update
set
  titulo = excluded.titulo,
  letra = excluded.letra,
  acordes = excluded.acordes,
  pdf_url = excluded.pdf_url,
  youtube_url = excluded.youtube_url,
  estado = excluded.estado,
  fecha_contribucion = excluded.fecha_contribucion,
  fecha_moderacion = excluded.fecha_moderacion,
  updated_at = timezone('utc', now());

delete from public.etiquetas_cancion
where cancion_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555',
  '66666666-6666-4666-8666-666666666666',
  '77777777-7777-4777-8777-777777777777',
  '88888888-8888-4888-8888-888888888888',
  '99999999-9999-4999-8999-999999999999'
);

insert into public.etiquetas_cancion (id, cancion_id, tiempo_liturgico, momento_misa)
values
  ('a1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Adviento', 'Entrada'),
  ('a1111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', 'Adviento', 'Salida'),
  ('a2222222-2222-4222-8222-222222222221', '22222222-2222-4222-8222-222222222222', 'Tiempo Ordinario', 'Comunion'),
  ('a2222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'Tiempo Ordinario', 'Salida'),
  ('a3333333-3333-4333-8333-333333333331', '33333333-3333-4333-8333-333333333333', 'Tiempo Ordinario', 'Salida'),
  ('a4444444-4444-4444-8444-444444444441', '44444444-4444-4444-8444-444444444444', 'Tiempo Ordinario', 'Entrada'),
  ('a5555555-5555-4555-8555-555555555551', '55555555-5555-4555-8555-555555555555', 'Navidad', 'Gloria'),
  ('a6666666-6666-4666-8666-666666666661', '66666666-6666-4666-8666-666666666666', 'Pascua', 'Salida'),
  ('a7777777-7777-4777-8777-777777777771', '77777777-7777-4777-8777-777777777777', 'Cuaresma', 'Acto penitencial'),
  ('a8888888-8888-4888-8888-888888888881', '88888888-8888-4888-8888-888888888888', 'Cuaresma', 'Acto penitencial'),
  ('a9999999-9999-4999-8999-999999999991', '99999999-9999-4999-8999-999999999999', 'Pascua', 'Salida');

insert into public.auditoria_moderacion (
  id,
  cancion_id,
  accion,
  etiquetas_originales,
  etiquetas_finales,
  motivo,
  created_at
)
values
  (
    'b1111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'aprobar',
    '[{"tiempoLiturgico":"Adviento","momentoMisa":"Entrada"}]'::jsonb,
    '[{"tiempoLiturgico":"Adviento","momentoMisa":"Entrada"},{"tiempoLiturgico":"Adviento","momentoMisa":"Salida"}]'::jsonb,
    null,
    timezone('utc', now()) - interval '18 days'
  ),
  (
    'b2222222-2222-4222-8222-222222222222',
    '77777777-7777-4777-8777-777777777777',
    'aprobar',
    '[{"tiempoLiturgico":"Cuaresma","momentoMisa":"Acto penitencial"}]'::jsonb,
    '[{"tiempoLiturgico":"Cuaresma","momentoMisa":"Acto penitencial"}]'::jsonb,
    null,
    timezone('utc', now()) - interval '5 days'
  )
on conflict (id) do update
set
  accion = excluded.accion,
  etiquetas_originales = excluded.etiquetas_originales,
  etiquetas_finales = excluded.etiquetas_finales,
  motivo = excluded.motivo,
  created_at = excluded.created_at;

commit;
