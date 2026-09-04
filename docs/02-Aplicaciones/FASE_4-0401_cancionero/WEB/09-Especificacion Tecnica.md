---
tags:
  - proyecto/fosforo
  - cancionero
  - arquitectura
  - especificación-tecnica
  - aplicación
type: doc-app-especificacion-tecnica
area: aplicaciónes
status: vigente
created: 2026-05-28
updated: 2026-06-07
related:
  - "[[00-README|Cancionero App]]"
---

# Especificación Tecnica - 0401_cancionero

## Herramientas y tecnologias

- **Plataforma:** WEB
- **Framework principal:** Astro v6
- **Lenguaje principal:** TypeScript
- **UI interactiva:** Astro + TypeScript vanilla para formularios, moderación, transposición y diagramas; React islands solo cuando el dominio lo requiera
- **Estilos:** Tailwind CSS v4 + `@repo/ui` + `@repo/tailwind-config`
- **Backend:** Astro API Endpoints
- **Base de datos:** Supabase PostgreSQL
- **Autenticación:** Supabase Auth
- **Validación:** Zod (schemas compartidos)
- **Despliegue:** Vercel (`@astrojs/vercel`)
- **Testing:** Vitest

## Arquitectura tecnica

- **Patrón de arquitectura:** Islands Architecture con Astro. Las páginas son renderizadas en servidor (SSR). Los componentes interactivos (buscador en vivo, formulario de contribución, panel de moderación) se implementan como islas React con directiva `client:load` o `client:idle`.
- **Modulos principales:**
  - **Motor de búsqueda (search):** servicio server-side que ejecuta queries ILIKE en PostgreSQL y filtra por tiempo+momento con índices compuestos.
  - **Servicio de Calendario (calendar):** cliente HTTP que consulta la API de Calendario Litúrgico con fallback a datos locales.
  - **Servicio de contribuciones (contributions):** maneja la creación y validación de nuevos recursos; exige sesión real con `requireContributor` y persiste `contribuyente_id` + `fecha_contribucion`.
  - **Servicio de moderación (moderation):** lista pendientes, aplica cambios de estado y registra auditoría; exige sesión real con `requireAdmin` y persiste `moderador_id` + `fecha_moderacion`.
  - **Modelo de acordes (chord-parser):** utility que opera sobre el modelo `letra` + `acordes` (`ChordPosition[]`). Ofrece `migrateLegacyChordText` (one-shot de `[Acorde]` a coordenadas), `alignChordsWithLyrics` (devuelve la estructura por línea para render), `upsertChordAt`, `removeChordAt`, `getChordAtPosition` y `isValidChordInput`.
  - **Nombres de acordes (chord-names):** valida raíces y alteraciones en nomenclatura anglosajona y española, conserva la forma introducida, convierte internamente a anglosajona y transpone acordes incluyendo bajos alterados.
  - **Diagramas (chord-diagrams):** shapes de guitarra estándar para acordes frecuentes, render SVG accesible y fallback explícito cuando no existe una forma cargada.
  - **Módulo de auth (auth):** wrapper sobre `@repo/auth` que define `CANCIONERO_ROLE_MAP`, `CANCIONERO_ROLE_HIERARCHY`, `resolveAppRole`, `canContribute`, `canModerate`, `requireSession`, `requireContributor`, `requireAdmin`. Páginas y endpoints dependen exclusivamente de este módulo; la lógica de cookies/Supabase vive en `@repo/auth`.
  - **Middleware SSR (middleware):** `src/apps/cancionero/src/middleware.ts` resuelve la sesión en cada request y setea `Astro.locals.{session, appRole, canContribute, canModerate}` para que las páginas y endpoints los lean sin recalcular.
- **Dependencias compartidas:** `@repo/env` (variables de entorno), `@repo/ui` (componentes base), `@repo/tailwind-config` (tokens de diseño), `@repo/api-utils` (helpers de respuesta HTTP), `@repo/auth` (sesión, cookies, role-mapping — paquete compartido del ecosistema, ver `docs/01-Arquitectura/Capacidades Compartidas/SRS-Identidad-y-Acceso.md`).

## Modelos de datos

### Tabla: `canciones`

| Columna                    | Tipo                                     | Descripción                                                                                           |
| -------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| id                         | uuid PK                                  | Identificador único                                                                                   |
| titulo                     | varchar(200) NOT NULL                    | Título de la canción                                                                                  |
| letra                      | text NOT NULL                            | Letra limpia multilinea (sin markup de acordes)                                                       |
| acordes                    | jsonb NOT NULL DEFAULT '[]'              | Array de `{linea:int, posicion:int, nombre:string}` con coordenada y nomenclatura original del acorde |
| pdf_url                    | text                                     | URL a PDF de partitura                                                                                |
| youtube_url                | text                                     | Link a video de YouTube                                                                               |
| estado                     | varchar(20) NOT NULL DEFAULT 'pendiente' | pendiente/publicado/rechazado                                                                         |
| observaciones_contribucion | text                                     | Comentarios opcionales del proponente para lectura del moderador (no visibles en búsquedas públicas)  |
| contribuyente_id           | uuid FK → usuarios.id                    | Quien contribuyó                                                                                      |
| moderador_id               | uuid FK → usuarios.id                    | Quien moderó (nullable hasta moderación)                                                              |
| fecha_contribucion         | timestamptz DEFAULT now()                |                                                                                                       |
| fecha_moderacion           | timestamptz                              | Nullable hasta moderación                                                                             |
| created_at                 | timestamptz DEFAULT now()                |                                                                                                       |
| updated_at                 | timestamptz DEFAULT now()                |                                                                                                       |

Constraint adicional: `canciones_acordes_shape_check` valida que cada objeto en `acordes` tenga `linea`/`posicion`/`nombre` con tipos y longitudes válidas.

### Tabla: `etiquetas_cancion`

| Columna          | Tipo                                     | Descripción                |
| ---------------- | ---------------------------------------- | -------------------------- |
| id               | uuid PK                                  |                            |
| cancion_id       | uuid FK → canciones.id ON DELETE CASCADE |                            |
| tiempo_liturgico | varchar(50) NOT NULL                     | Ej: 'Adviento', 'Cuaresma' |
| momento_misa     | varchar(100) NOT NULL                    | Ej: 'Entrada', 'Comunión'  |

Índice compuesto único: `(cancion_id, tiempo_liturgico, momento_misa)`.

### Tabla: `tiempos_liturgicos`

| Columna       | Tipo                  | Descripción                                |
| ------------- | --------------------- | ------------------------------------------ |
| id            | varchar(50) PK        | Identificador del tiempo (ej. 'adviento')  |
| nombre        | varchar(100) NOT NULL | Nombre legible (ej. 'Adviento')            |
| momentos_misa | jsonb NOT NULL        | Array de momentos válidos para este tiempo |

### Tabla: `auditoria_moderacion`

| Columna              | Tipo                      | Descripción                                         |
| -------------------- | ------------------------- | --------------------------------------------------- |
| id                   | uuid PK                   |                                                     |
| cancion_id           | uuid FK → canciones.id    |                                                     |
| usuario_id           | uuid FK → usuarios.id     | Quien ejecutó la acción                             |
| accion               | varchar(20) NOT NULL      | aprobar/rechazar/corregir_etiquetas                 |
| etiquetas_originales | jsonb                     | Etiquetas propuestas por el contribuyente           |
| etiquetas_finales    | jsonb                     | Etiquetas después de moderación (si se corrigieron) |
| motivo               | text                      | Motivo de rechazo (si aplica)                       |
| created_at           | timestamptz DEFAULT now() |                                                     |

## Endpoints (API)

| Metodo | Ruta                                                    | Proposito                                                                                                                                                                                                                  |
| ------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/cancionero/search?motor=A&q={query}`              | Motor A · Búsqueda libre (tokenización OR sobre titulo + letra)                                                                                                                                                            |
| GET    | `/api/cancionero/search?motor=B&tiempo={t}&momento={m}` | Motor B · Tiempo litúrgico (momento opcional, propio del tiempo)                                                                                                                                                           |
| GET    | `/api/cancionero/search?motor=C&momento={m}`            | Motor C · Momento de misa independiente del tiempo litúrgico                                                                                                                                                               |
| GET    | `/api/cancionero/search` (sin filtros)                  | Devuelve todas las canciones con `estado = publicado`, ordenadas por titulo                                                                                                                                                |
| GET    | `/api/canciones/{id}`                                   | Obtener detalle de una canción (pública si está publicada)                                                                                                                                                                 |
| GET    | `/api/tiempos`                                          | Listar tiempos litúrgicos con sus momentos (consulta a API de Calendario con fallback local)                                                                                                                               |
| POST   | `/api/cancionero/auth/register`                         | Registrar nuevo usuario con rol `musico` (id=5). Crea el `auth.users`, hace upsert a `profiles.role_id = 5`, inserta en `user_roles` y setea cookies cross-app. Payload: `{ name, email, password }` (password >= 8 chars) |
| POST   | `/api/cancionero/auth/login`                            | Iniciar sesión con `supabase.auth.signInWithPassword`. Setea cookies cross-app. Payload: `{ email, password }`                                                                                                             |
| POST   | `/api/cancionero/auth/logout`                           | Cerrar sesión. Limpia las cookies `fosforo_access_token` y `fosforo_refresh_token`                                                                                                                                         |
| GET    | `/api/cancionero/auth/session`                          | Devuelve la sesión actual: `{ authenticated, user, profile, appRole, canContribute, canModerate }`                                                                                                                         |
| POST   | `/api/cancionero/contribuciones`                        | Crear nueva contribución. Exige `requireContributor` (sesión real + `canContribute`). Persiste `contribuyente_id = session.user.id`, `fecha_contribucion = now()` y `observaciones_contribucion`                           |
| GET    | `/api/cancionero/moderacion/pendientes`                 | Listar contribuciones pendientes. Exige `requireAdmin` (sesión real + `canModerate`)                                                                                                                                       |
| PUT    | `/api/cancionero/moderacion/{id}`                       | Aprobar/rechazar/corregir etiquetas. Exige `requireAdmin`. Si la acción es `aprobar`, requiere etiquetas litúrgicas. Persiste `moderador_id = session.user.id` y `fecha_moderacion = now()`                                |

Notas sobre el endpoint `/api/cancionero/search`:

- El param `motor` es opcional; si se omite, el sistema asume `A` (compatibilidad hacia atras). La página `/buscar` siempre lo envia explicitamente.
- Los params `q` / `tiempo` / `momento` son todos opcionales. La ausencia de filtros de un motor no bloquea la busqueda: el motor simplemente no aplica su filtro.
- Si **ningún** param de filtro esta presente, el endpoint devuelve el **catalogo completo aprobado** (canciones con `estado = publicado`, ordenadas por titulo) y la respuesta incluye el flag `hasFilters=false` para que la UI renderice el encabezado "N canciones aprobadas".
- Si `q` esta presente debe tener al menos 2 caracteres; de lo contrario se responde 400 con `code: "q_too_short"`.
- Si `momento` esta presente bajo `motor=B` debe pertenecer a la lista de momentos del `tiempo` elegido; de lo contrario se responde 400 con `code: "momento_invalid_for_tiempo"`.

## Esqueleto UI de 3 motores

- Página única `/buscar` con sistema de pestañas accesible (`role="tablist"`, `role="tab"`, `role="tabpanel"`), motor activo persistido en query string (`?motor=A|B|C`).
- Primitive compartida en `@repo/ui/astro/Tabs.astro` (puede ser consumida por Biblia, Calendario u otras apps que necesiten tabs).
- Estilos en `@repo/ui/tabs.css` consumidos via `@import "@repo/ui/tabs.css"` en `src/apps/cancionero/src/styles/global.css`.
- El formulario de cada motor es server-rendered (GET) y envía solo los params relevantes a su motor. El panel de resultados (`result.items`, `result.total`) es compartido.

## Consideraciónes UI/UX

- **Navegación principal:** Header con logo, campo de búsqueda global, selector de tiempo litúrgico y acceso a "Contribuir". Footer con links a otras apps del ecosistema. El `PortalHeader` consume `@repo/ui` y soporta estado autenticado (`user`, `onLogout`) y desautenticado (`loginHref`, `registerHref`); Cancionero lo configura con `loginHref="/auth/login"`, `registerHref="/auth/register"` y `onLogout={ endpoint: "/api/cancionero/auth/logout", redirectTo: "/" }`.
- **Estados de interfaz:** Loading (skeleton de cards), Empty (mensaje + CTA a contribuir), Error (notificación + reintento), Success (confirmación visual).
- **Accesibilidad base:** Navegación por teclado en buscador y selectores; roles ARIA en panel de moderación; contraste suficiente en letras con acordes.
- **Responsive:** Grid de canciones adaptable (1 columna mobile, 2 tablet, 3+ desktop). Selector de momentos como chips scrollables horizontalmente en mobile.
- **Páginas de auth:** `/auth/login` y `/auth/register` son páginas server-rendered con formularios HTML. El `PortalHeader` muestra "Iniciar sesión" y "Crear cuenta" cuando no hay sesión; muestra el nombre del usuario, enlace a `/perfil` y botón "Cerrar sesión" cuando la sesión está activa.
