---
tags:
  - proyecto/fosforo
  - cancionero
  - arquitectura
  - flujos
  - aplicación
type: doc-app-flujos
area: aplicaciónes
status: vigente
created: 2026-05-28
updated: 2026-06-07
related:
  - "[[00-README|Cancionero App]]"
---

# Flujos y Secuencias - 0401_cancionero

## Objetivo

Describir como interactua el usuario con las funcionalidades principales de la app.

## Flujo principal: Esqueleto de 3 motores de búsqueda con catalogo por defecto

1. Usuario abre `/buscar` (sin params de filtro) y ve la página con 3 pestañas (Motor A, Motor B, Motor C), la pestaña Motor A activa por defecto, y el panel de resultados mostrando **todas las canciones con `estado = publicado`**, ordenadas por titulo. El encabezado indica "N canciones aprobadas".
2. Usuario puede aplicar filtros de manera opcional sobre cualquiera de los 3 motores. Cada motor es independiente y aplicar un filtro no impide aplicar filtros de otros motores (AND entre motores):
   - **Motor A (búsqueda libre):** escribe una o más palabras (>= 2 caracteres) y presiona Buscar; el sistema tokeniza la query y devuelve canciones con coincidencias en título o letra.
   - **Motor B (tiempo litúrgico):** elige un tiempo del dropdown (opcional "Todos los tiempos") y, opcionalmente, un momento propio del tiempo; el sistema filtra por esa combinación.
   - **Motor C (momento de misa):** elige un momento de misa del dropdown global (opcional "Todos los momentos"); el sistema devuelve canciones con ese momento en cualquier tiempo litúrgico.
3. El sistema muestra el panel de resultados compartido, con el total de coincidencias y la fuente (Supabase o fallback local). Cuando hay al menos un filtro aplicado, el encabezado dice "N canciones encontradas"; cuando no hay filtros, dice "N canciones aprobadas".
4. Usuario hace clic en una canción y el sistema muestra la letra completa con acordes.

## Flujos secundarios

- **Flujo A - Contribución:** Contribuyente habilitado (`coordinador`, `sacerdote` o `admin`) escribe la letra limpia en el textarea. En la vista previa hace click sobre la sílaba donde va cada acorde y registra el nombre (G, D, Em, etc.). Puede cargar observaciones para moderación. El sistema serializa `letra` + `acordes: [{linea, posicion, nombre}]` + `observaciones` y crea el recurso en estado "pendiente" sin etiquetas litúrgicas finales. El moderador es notificado.
- **Flujo B - Moderación:** Moderador (`sacerdote` o `admin`) ingresa al panel, revisa pendientes, lee observaciones del proponente, define/corrige etiquetas y aprueba o rechaza.
- **Flujo C - Cambio de motor:** Usuario cambia de pestaña (click, Enter o flechas iz/der); el sistema navega a `/buscar?motor=X` preservando los params del motor activo y muestra el formulario correspondiente.

## Secuencias clave

### Secuencia 1 - Motor A (búsqueda libre)

1. Usuario: navega a `/buscar?motor=A` o hace clic en la pestaña Motor A.
2. Sistema: muestra el input de búsqueda libre (placeholder "Buscar por título o letra") con foco automático. Si no hay `q` informado, el panel ya muestra el catalogo completo de canciones aprobadas.
3. Usuario: escribe `ven senor` y presiona Buscar.
4. Sistema: tokeniza la query en `["ven", "senor"]`, normaliza sin acentos, y consulta `canciones` con `OR(titulo.ilike.%ven%, letra.ilike.%ven%, titulo.ilike.%senor%, letra.ilike.%senor%)` y `estado = publicado`.
5. Sistema: devuelve canciones que contienen al menos uno de los tokens en título o letra, ordenadas por título. Encabezado del panel: "N canciones encontradas".
6. Usuario: hace clic en una canción.
7. Sistema: carga letra con acordes desde Supabase y renderiza.

### Secuencia 2 - Motor B (tiempo litúrgico + momento opcional)

1. Usuario: navega a `/buscar?motor=B` o hace clic en la pestaña Motor B.
2. Sistema: muestra el dropdown de tiempos (placeholder "Todos los tiempos", primera opción que equivale a no filtrar). Tiempos cargados desde la tabla `tiempos_liturgicos` con fallback local.
3. Usuario: selecciona "Cuaresma" y aplica.
4. Sistema: navega a `/buscar?motor=B&tiempo=cuaresma` y muestra también el dropdown de momentos (Entrada, Acto penitencial, Salmo, Ofertorio, Comunión, Salida) poblado desde `tiempos_liturgicos.momentos_misa`.
5. Usuario: opcionalmente selecciona "Comunión" y aplica.
6. Sistema: consulta `canciones` filtrando por canciones con al menos una etiqueta `tiempo_liturgico = "Cuaresma" AND momento_misa = "Comunión"` y `estado = publicado`. Si el usuario dejo "Todos los tiempos" no se filtra por tiempo; si ademas dejo "Todos los momentos" no se filtra por momento y se devuelven todas las publicadas.
7. Sistema: devuelve lista de canciones validadas para esa combinación (o catalogo completo si no aplico filtros).

### Secuencia 3 - Motor C (momento de misa independiente)

1. Usuario: navega a `/buscar?motor=C` o hace clic en la pestaña Motor C.
2. Sistema: muestra el dropdown global de momentos (unión de `momentos_misa` de todos los tiempos, ordenados alfabéticamente, con primera opción "Todos los momentos").
3. Usuario: selecciona "Comunión" y aplica.
4. Sistema: consulta `canciones` filtrando por canciones con al menos una etiqueta `momento_misa = "Comunión"`, sin importar el tiempo litúrgico, y `estado = publicado`. Si el usuario deja "Todos los momentos", no se filtra por momento y se devuelven todas las publicadas.
5. Sistema: devuelve lista de canciones etiquetadas con Comunión en cualquier tiempo (o catalogo completo si no aplico el filtro).

### Secuencia 4 - Cambio de motor preservando contexto

1. Usuario: está en `/buscar?motor=B&tiempo=cuaresma&momento=Comunion`.
2. Usuario: hace clic en la pestaña Motor A.
3. Sistema: navega a `/buscar?motor=A` (Motor A arranca limpio; el contexto litúrgico de B no se preserva porque es de otro motor).
4. Sistema: renderiza el input de Motor A con foco listo para tipear.

### Secuencia 5 - Contribución y moderación

1. Usuario (`coordinador`, `sacerdote` o `admin`) autenticado: escribe la letra limpia en el textarea del formulario `/contribuir`.
2. Usuario: en la vista previa interactiva, hace click sobre la sílaba donde va cada acorde e ingresa el nombre (G, D, Em, etc.). Puede editar o quitar cada acorde haciendo click sobre el token.
3. Usuario: agrega observaciones opcionales para que el moderador tenga contexto pastoral o musical.
4. Sistema: serializa la contribución como `letra` (texto) + `acordes` (jsonb con `{linea, posicion, nombre}`) + `observaciones` y la envía al endpoint `POST /api/cancionero/contribuciones`.
5. Sistema: el endpoint exige sesión real (`@repo/auth.requireSession`) y capacidad `canContribute`. Valida con Zod (letra no vacía, acordes con coordenadas dentro de rango, observaciones opcionales) y crea registro en tabla `canciones` con estado "pendiente", registrando `contribuyente_id = session.user.id`, `fecha_contribucion = now()` y `observaciones_contribucion`.
6. Sistema: el recurso no es visible en búsquedas públicas.
7. Moderador (`sacerdote` o `admin`): ingresa al panel de moderación y ve la lista de pendientes.
8. Sistema: muestra para cada pendiente: título, autor, fecha, observaciones y botones de previsualizar/aprobar/rechazar.
9. Moderador: previsualiza el recurso, verifica letra y observaciones, y define tiempo litúrgico + momento de misa para aprobar.
10. Sistema: el endpoint `PUT /api/cancionero/moderacion/[id]` exige sesión + `canModerate`. Si la acción es aprobar, exige etiquetas; actualiza estado a "publicado", registra `moderador_id = session.user.id`, `fecha_moderacion = now()` y las etiquetas finales.
11. Sistema: la canción aparece en búsquedas públicas a partir de ese momento.

### Secuencia 6 - Fallback de Calendario Litúrgico

1. Sistema: al cargar el selector de tiempo en Motor B, intenta consultar API de Calendario Litúrgico.
2. API: no responde (timeout o error).
3. Sistema: muestra dropdown manual con la lista de tiempos desde la tabla `tiempos_liturgicos` o el fallback local (`FALLBACK_TIMES`).
4. Usuario: selecciona tiempo manualmente.
5. Sistema: muestra momentos de misa predefinidos para ese tiempo desde datos locales.
6. Sistema: el filtrado funciona igual que con la API, usando datos almacenados localmente.

### Secuencia 7 - Registro de músico desde Cancionero

1. Visitante: navega a `/contribuir` (o hace clic en "Crear cuenta" del header).
2. Sistema: el middleware SSR detecta que no hay sesión y redirige a `/auth/login?next=/contribuir` (paso previo: el visitante hace clic en "Crear cuenta" y va a `/auth/register`).
3. Visitante: completa el formulario de `/auth/register` con `name`, `email` y `password` (>= 8 chars). La página informa que la cuenta será de tipo "músico".
4. Sistema: envía `POST /api/cancionero/auth/register` con el payload validado por Zod.
5. Endpoint: usa `supabase.auth.admin.createUser(email, password, email_confirm: true)` con la service role, lo que dispara el trigger `internal.handle_new_user` que crea el `profile` con `role_id = 4` (usuario) por defecto.
6. Endpoint: hace upsert a `public.profiles` con `role_id = 5` (musico) e inserta en `public.user_roles` una fila con `role_id = 5`. Registra el evento en `public.audit_log` (`action = "register_musico"`).
7. Endpoint: setea las cookies cross-app `fosforo_access_token` y `fosforo_refresh_token` con los tokens retornados por `createUser`.
8. Sistema: responde 201 con `{ ok: true, user: { id, email }, appRole: "musico" }` y el cliente (form) redirige a `next` (o `/`).
9. Sistema: el `PortalHeader` se hidrata mostrando el nombre del músico y un enlace a `/perfil`.

### Secuencia 8 - Login

1. Visitante: navega a `/auth/login?next=/contribuir` (o cualquier `next` legítimo).
2. Sistema: el middleware SSR detecta que no hay sesión; muestra el formulario. Si ya hay sesión, redirige a `next` directamente.
3. Visitante: completa `email` y `password`, envía.
4. Sistema: envía `POST /api/cancionero/auth/login` con el payload.
5. Endpoint: llama a `supabase.auth.signInWithPassword(email, password)`. Si falla, responde 401 con `code: "invalid_credentials"`.
6. Endpoint: setea las cookies cross-app `fosforo_access_token` y `fosforo_refresh_token`.
7. Sistema: responde 200 con `{ ok: true, user, profile, appRole, canContribute, canModerate }` y el cliente redirige a `next` (o `/`).
8. Sistema: el `PortalHeader` re-renderiza con el nombre y la acción de logout.

### Secuencia 9 - Logout

1. Músico autenticado: hace clic en "Cerrar sesión" del `PortalHeader`.
2. Sistema: envía `POST /api/cancionero/auth/logout`.
3. Endpoint: limpia las cookies `fosforo_access_token` y `fosforo_refresh_token` (Max-Age 0).
4. Sistema: responde 200 y el cliente navega a `/` (configurable vía `onLogout.redirectTo`).

### Secuencia 10 - Contribución autenticada (con persistencia de autor)

1. Usuario autenticado con `appRole = coordinador` (o superior) navega a `/contribuir`.
2. Sistema: el guard SSR (definido en el frontmatter de la página) verifica `Astro.locals.session` y `Astro.locals.canContribute`. Si la sesión falta, redirect a `/auth/login?next=/contribuir`; si `canContribute` es false, redirect a `/`.
3. Usuario: completa y envía el formulario. El `fetch` a `/api/cancionero/contribuciones` ya no envía el header mock `x-cancionero-role`; la identidad viaja en las cookies cross-app.
4. Endpoint: `requireContributor(request)` resuelve la sesión y valida `canContribute`. Persiste la canción con `contribuyente_id = session.user.id`, `fecha_contribucion = now()` y `observaciones_contribucion`.
5. Sistema: la canción queda en estado "pendiente" y es visible en `/moderacion` con su autor real.

### Secuencia 11 - Moderación autenticada (con persistencia de moderador)

1. Administrador autenticado con `appRole = admin` navega a `/moderacion`.
2. Sistema: el guard SSR verifica `session` y `canModerate`. Si falta sesión, redirect a `/auth/login?next=/moderacion`; si `canModerate` es false, redirect a `/` con mensaje.
3. Sistema: la página carga la lista vía `GET /api/cancionero/moderacion/pendientes`, que exige `requireAdmin`.
4. Administrador: aprueba vía `PUT /api/cancionero/moderacion/[id]` definiendo tiempo litúrgico + momento de misa. El endpoint persiste `moderador_id = session.user.id`, `fecha_moderacion = now()` y etiquetas finales.
5. Sistema: la canción pasa a `estado = publicado` y aparece en búsquedas públicas.
