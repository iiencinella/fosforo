# Changelog

Este archivo registra cambios relevantes del monorepo `fosforo`.

## 2026-08-24

### Changed

- **Plataforma / actualización integral de dependencias** (`pnpm-workspace.yaml`, `package.json` de los 14 workspaces, `patches/`): se introdujo el **catálogo de pnpm** con versiones exactas como única fuente de verdad para dependencias compartidas, eliminando la dispersión histórica (ej. astro 6.3.1–6.4.1 entre apps).
  - Stack web: `astro` 6.4.8 → **7.2.4** + `@astrojs/react` 4.4.2 → **6.0.4** + `@astrojs/vercel` 10.0.8 → **11.0.7** en las 8 apps; todos los builds verdes con el nuevo compilador Rust.
  - UI: `react`/`react-dom` 19.2.8, `tailwindcss` 4.3.3, tipos React al día.
  - Datos: `@supabase/supabase-js` 2.112.4, `zod` 4.4.3.
  - Tooling: `vitest` unificado en **4.1.11** (los 5 workspaces rezagados en v3 migrados sin cambios de API), `eslint` **10.9.0** (resuelve peer warning preexistente), `prettier` 3.9.6, `turbo` 2.10.11.
  - TypeScript unificado en **6.0.3**: se probó 7.0.2 pero `astro check` crashea (`@astrojs/language-server` aún no lo soporta); a reintentar cuando haya soporte. `@types/node` alineado a **24.x** (runtime LTS real de Vercel), no a 26.

### Fixed

- **Calendario / APIs day-month** (`src/apps/calendario/src/pages/api/calendar/*.ts`, preexistente en main): `CACHE_HEADERS` estaba referenciado sin definirse (rompía check-types) y `CalendarDateInputError` no se manejaba en la vista mensual (devolvía 503 en vez de 400 para fechas inválidas).
- **Builds Astro en Windows** (`patches/@astrojs__internal-helpers@0.10.4.patch`): el tracing de `@astrojs/vercel@11` crea symlinks que requieren privilegio de administrador; el patch usa junctions resueltos en absoluto en Windows, sin cambios en Linux/CI.

## 2026-08-23

### Changed

- **Plataforma / unificación de variables de entorno** (`src/packages/env`, `src/packages/api-utils`, `turbo.json`, `.env.example`, `docs/01-Arquitectura/Capacidades Compartidas/Guia-Variables-de-Entorno.md`): se define una convención canónica de nombres (plano para server-only, `PUBLIC_`/`EXPO_PUBLIC_` solo client-exposed) y se documenta el estándar completo en la nueva guía de variables de entorno.
  - `@repo/env`: alias deprecados (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_KEY`, `LOGS_INGEST_API_KEY`) siguen resolviéndose pero emiten warning único; nuevo `requireEnvValues()` que agrega todas las variables faltantes en un solo error (`MissingEnvError`); validación Zod conectada a los getters de Supabase.
  - `turbo.json`: `globalEnv` limpiado (fuera vars muertas de GitHub) y declaradas todas las canónicas; con Turborepo en modo estricto, Vercel solo expone a build y runtime las variables declaradas ahí.
  - Tests unitarios nuevos para el lector de entorno (9 casos).

### Fixed

- **Biblia / administracion: 500 global por inicialización de Supabase a nivel de módulo** (`src/apps/biblia/src/db/supabase.ts`, `src/apps/administracion/src/db/supabase.ts`): el cliente ahora se instancia de forma perezosa con cache, igual que en horarios/log/cancionero/calendario. Si falta una variable, el error ocurre al usar el cliente y no rompe todas las rutas.
- **Biblia en producción** (`fosforo-biblia.vercel.app`): el 500 general se debía a variables de entorno presentes en Vercel pero no declaradas en `turbo.json`, combinado con la inicialización a nivel de módulo.

## 2026-08-08

### Changed

- **Biblia / modal de búsqueda unificado** (`src/packages/ui/src/portal-bible-hub.tsx`, `src/apps/biblia/src/styles/biblia-hub.css`, `docs/02-Aplicaciones/FASE_1-0102_biblia/WEB/04-Flujos y Secuencias.md`, `docs/02-Aplicaciones/FASE_1-0102_biblia/WEB/09-Especificacion Tecnica.md`): los resultados de búsqueda se muestran dentro del modal con el mismo formato de versículos numerados que el modal de lectura, en lugar de tarjetas.
  - Referencias resueltas (ej. `Juan 3,16-18`) renderizan los versículos consecutivos en un único bloque.
  - Búsquedas textuales con múltiples resultados muestran cada versículo con su referencia; al hacer clic se abre el capítulo completo en modo lectura.
  - Se mantiene la paginación en el footer del modal para resultados no referenciados.
  - Se actualiza la documentación de flujos y especificación técnica para reflejar el formato unificado de modales.

### Fixed

- **Biblia / título del modal de referencia**: cuando la búsqueda resuelve una referencia, el título del modal usa la referencia normalizada en lugar del genérico "Resultados de búsqueda".

Formato recomendado:

- Una entrada por cambio relevante orientado a producto o mantenimiento.
- Texto breve enfocado en impacto (que se corrige/mejora y por que importa).
- Fecha en formato `YYYY-MM-DD`.

## 2026-08-05

### Changed

- **Biblia / vista única sin scroll** (`src/apps/biblia/src/pages/index.astro`, `src/apps/biblia/src/components/BibleHub.tsx`, `src/apps/biblia/src/styles/biblia-hub.css`, `src/apps/biblia/src/components/SiteHeader.astro`): se reemplazan las 4 páginas separadas (inicio, lectura, búsqueda, liturgia) por una vista única de 100dvh sin scroll de página.
  - Nuevo componente `PortalBibleHub` en `@repo/ui` que orquesta los 3 modos (Lectura, Búsqueda, Liturgia) en un solo viewport fijo, usando los mismos endpoints existentes (`/api/bible/read`, `/api/bible/search`, `/api/liturgy/daily`).
  - Modo **Lectura**: selects compactos (versión, libro, capítulo) + botones prev/next; el texto del capítulo se abre en un `<dialog>` nativo con scroll interno.
  - Modo **Búsqueda**: input + resultados paginados (5 por página) en tarjetas; cada resultado abre el modo lectura con el pasaje seleccionado.
  - Modo **Liturgia**: selector de fecha + carrusel de tarjetas por lectura (primera, salmo, segunda, evangelio); cada tarjeta carga el texto vía `/api/bible/search` (resolución de referencias) y lo muestra en modal.
  - Barra de estado fija con versión activa, pasaje actual y link a `/estado`.
  - El SiteHeader se actualiza con links a `/?modo=...` y el CTA apunta a `/?modo=busqueda`.
  - Las rutas `/lectura`, `/busqueda`, `/liturgia` redirigen a `/?modo=...` preservando query params.
  - Se restaura `vite.ssr.noExternal` condicionado a `NODE_ENV=production` para evitar EPERM por symlinks en Windows durante el build a Vercel (patrón alineado con administracion y log).
  - La página `/estado` queda intacta fuera de este alcance.
  - Los wrappers `BibleReader.tsx`, `BibleSearch.tsx`, `LiturgyDaily.tsx` en la app se eliminan (reemplazados por `BibleHub`).
  - Los módulos `PortalBibleReader`, `PortalBibleSearchModule`, `PortalLiturgyDaily` en `@repo/ui` se mantienen por compatibilidad con otros consumidores.
  - Documentación sincronizada: `docs/02-Aplicaciones/FASE_1-0102_biblia/WEB/{00-README.md,09-Especificacion Tecnica.md}`.

### Added

- **Primitive Modal** (`src/packages/ui/src/modal.tsx`, `src/packages/ui/src/overlays.css`): componente reutilizable con `<dialog>` nativo, backdrop blur, cierre por Esc y click fuera, `aria-labelledby` automático, scroll interno en body, footer opcional y animaciones de entrada. Expuesto como `Modal` en `@repo/ui`.

- **Primitive Carousel** (`src/packages/ui/src/carousel.tsx`, `src/packages/ui/src/overlays.css`): componente reutilizable `CardCarousel` con scroll-snap horizontal, flechas de navegación con estado disabled, y `CarouselCard` con soporte de selección (`aria-pressed`), badge, título, descripción y variantes `md`/`lg`. Expuesto en `@repo/ui`.

### Fixed

- **Biblia / build en Windows** (`src/apps/biblia/astro.config.mjs`): se restaura `vite.ssr.noExternal` condicionado a producción para resolver EPERM por symlinks del adaptador Vercel al generar `.vercel/output/functions`, usando el mismo patrón que `administracion` y `log`.

## 2026-06-21

### Changed

- **Cancionero / contribución y moderación litúrgica** (`src/apps/cancionero/src/pages/contribuir.astro`, `src/apps/cancionero/src/pages/moderacion.astro`, `src/apps/cancionero/src/lib/{types.ts,validators.ts}`, `src/apps/cancionero/src/lib/server/repository.ts`, `db/supabase/migrations/202606291230_add_cancionero_observaciones_contribucion.sql`): se movió la selección de tiempo litúrgico y momento de misa desde la propuesta al paso de aprobación en moderación, manteniendo el flujo de contribución para `coordinador`/`sacerdote`/`admin`.
  - El formulario `/contribuir` ya no solicita etiquetas litúrgicas y ahora permite `observaciones` opcionales del proponente (persistidas en `canciones.observaciones_contribucion`).
  - El panel `/moderacion` muestra las observaciones del proponente y exige que el moderador seleccione tiempo+momento al aprobar.
  - Las observaciones quedan ocultas de la búsqueda pública y del listado principal; solo se ven en moderación.
  - Se aplicó migración en Supabase: `add_cancionero_observaciones_contribucion`.
  - Documentación sincronizada: `docs/02-Aplicaciones/FASE_4-0401_cancionero/WEB/{02-SRS.md,03-FRD.md,04-Flujos y Secuencias.md,05-Tests Unitarios.md,06-Esquema de Datos.md,09-Especificacion Tecnica.md}`.

### Fixed

- **Biblia / referencias bíblicas y contratos de lectura** (`src/apps/biblia/src/lib/data.ts`, `src/apps/biblia/src/pages/api/bible/read.ts`, `src/apps/biblia/src/pages/api/bible/search.ts`, `src/packages/ui/src/portal-bible-search-module.tsx`): se corrigió la resolución de citas abreviadas y el rango de versículos para que consultas como `Lc 1,26-38` devuelvan resultados consistentes en API y UI.
  - Se habilitó normalización de abreviaturas (ej. `Lc`, `Jn`) en la resolución de libros.
  - `GET /api/bible/read` ahora acepta `verseStart` y `verseEnd`, valida rangos inválidos y filtra versículos en la respuesta.
  - `GET /api/bible/search` detecta referencias bíblicas, resuelve lectura por capítulo/rango y expone `normalizedReference` en el payload.
  - La UI de búsqueda muestra la referencia interpretada para mejorar trazabilidad del resultado.
  - Se agregaron pruebas unitarias para parser y endpoints (`src/apps/biblia/src/lib/data.test.ts`, `src/apps/biblia/src/pages/api/bible/read.test.ts`, `src/apps/biblia/src/pages/api/bible/search.test.ts`).
  - Validación ejecutada: `check-types` 0/0/0 y `test:unit` 11/11 en `src/apps/biblia`.

## 2026-06-07

### Added

- **Paquete compartido `@repo/auth`** (`src/packages/auth/`, `docs/01-Arquitectura/Capacidades Compartidas/SRS-Identidad-y-Acceso.md`): paquete del ecosistema que centraliza la identidad para todas las apps.
  - Helpers exportados: `getSupabaseAuthClient`, `getSessionFromToken`, `getUserProfileById`, `getSessionFromRequest`, `requireSession`, `requireAdminSession`, `getSessionFromCookies`, `setSessionCookies`, `clearSessionCookies`, `mapRoleSlugToAppRole`, `canPerformForAppRole` y tipos `UserProfile`, `SessionBundle`, `ProfileRow`, `RoleRow`, `RoleMap`, `AppRoleHierarchy`, `EcosystemRoleSlug`.
  - Cookies cross-app: `fosforo_access_token` y `fosforo_refresh_token` con `Path=/`, `HttpOnly`, `SameSite=Lax`, `Secure` en producción. Asumen mismo dominio en MVP (ver `08-Decisiones de Arquitectura` de Cancionero, Riesgo 6, para la migración a subdominios).
  - Role-mapping reutilizable: `ECOSYSTEM_ROLE_SLUGS = ['admin', 'sacerdote', 'coordinador', 'musico', 'usuario']` con `hierarchy_level` y un `AppRoleHierarchy` con `contribute` / `moderate` configurable por app.
  - 14 tests unitarios en `vitest` (`src/cookies.test.ts` + `src/role-mapping.test.ts`) que cubren roundtrip de cookies, expiración, nombres de cookie y mapeo de todos los slugs del ecosistema.
  - `check-types` 0/0/0; `test:unit` 14/14.

- **Refactor 0104_usuarios → `@repo/auth`** (`src/apps/usuario/`, `src/packages/auth/`): la app 0104 Usuario pasa a ser la fuente de los datos de identidad y consume `@repo/auth` para reusar los helpers. Archivos re-escritos: `src/apps/usuario/src/lib/{supabase, session, authz, profiles, auth, admin}.ts` ahora importan de `@repo/auth`. `check-types` 0/0/0; sin cambio visible para los consumidores externos.

- **Integración de auth real en Cancionero** (`src/apps/cancionero/`, `src/packages/auth/`, `src/packages/ui/`, `docs/02-Aplicaciones/FASE_4-0401_cancionero/WEB/`): se reemplaza el mock `x-cancionero-role` por la identidad real del ecosistema basada en Supabase Auth + cookies compartidas.
  - Páginas propias: `/auth/login`, `/auth/register`, `/perfil` (todas server-rendered).
  - Endpoints: `POST /api/cancionero/auth/register` (crea `auth.users` con service role, hace upsert a `profiles.role_id = 5` (musico), inserta en `user_roles` y setea cookies); `POST /api/cancionero/auth/login` (signInWithPassword + set cookies); `POST /api/cancionero/auth/logout` (clear cookies); `GET /api/cancionero/auth/session` (devuelve `appRole` y capacidades).
  - Middleware SSR (`src/apps/cancionero/src/middleware.ts`): popula `Astro.locals.{session, appRole, canContribute, canModerate}` en cada request.
  - Guards SSR en `/contribuir` y `/moderacion`: redirect a `/auth/login?next=<ruta>` si no hay sesión; redirect a `/` si la sesión existe pero la capacidad no.
  - Repositorio: `createContribution` y `moderateSong` ahora exigen sesión real con `requireContributor` / `requireAdmin` y persisten `contribuyente_id` / `moderador_id` + `fecha_contribucion` / `fecha_moderacion`.
  - Jerarquía de Cancionero: `admin` → "admin" (puede moderar); `sacerdote` / `coordinador` / `musico` → pueden contribuir; `usuario` (rol base) o sesión ausente → "invitado".
  - `@repo/ui` extendido: `PortalHeader` ahora acepta `user`, `loginHref`, `registerHref`, `onLogout` (todas opcionales, aditivas — no rompe consumidores previos). Estilos `.nav-auth` / `.nav-user` en `@repo/ui/portal.css`.
  - 25 tests unitarios nuevos en `src/apps/cancionero/src/lib/auth.test.ts` que cubren `CANCIONERO_ROLE_MAP`, `CANCIONERO_ROLE_HIERARCHY`, `resolveAppRole` (todos los slugs + null/undefined/desconocido), `canContribute` y `canModerate`.
  - `cancionero check-types` 0/0/0 (42 archivos); `cancionero test:unit` 89/89 (64 existentes + 25 nuevos).
  - `@repo/ui` reconstruido (`pnpm --filter @repo/ui build:components`) para que `dist/portal-header.d.ts` refleje las props nuevas; el resto de apps del ecosistema (portal, biblia, calendario, administracion, usuario) sigue en 0/0/0.
  - Documentación sincronizada: `00-README.md` (estado de implementación y alcance), `02-SRS.md` (FR-014/015/016, CA-005/006/007, IR-003, PRD→SRS), `03-FRD.md` (UC-009..012, RB-011..015), `04-Flujos y Secuencias.md` (Secuencias 5/7-11 reescritas o nuevas), `05-Tests Unitarios.md` (TC-015..020 marcados como implementados), `08-Decisiones de Arquitectura.md` (ADR-007/008, alternativas E/F, riesgos 4/5/6), `09-Especificacion Tecnica.md` (módulo de auth, middleware, nuevos endpoints de auth).

### Changed

- **Cancionero / mock auth removido** (`src/apps/cancionero/src/pages/contribuir.astro`, `src/apps/cancionero/src/pages/moderacion.astro`): se elimina el header `x-cancionero-role: musico` / `x-cancionero-role: admin` que enviaba el cliente a sus propios endpoints. La identidad viaja exclusivamente en las cookies cross-app (`fosforo_access_token` / `fosforo_refresh_token`); el server valida con `requireContributor` / `requireAdmin` desde `@repo/auth`.

## 2026-06-06

### Added

- **Cancionero** (`src/apps/cancionero/`, `src/packages/ui/`, `docs/02-Aplicaciones/FASE_4-0401_cancionero/WEB/`): esqueleto de 3 motores de búsqueda en `/buscar` con pestañas accesibles.
  - Motor A · Búsqueda libre: input único, tokenización OR de la query sobre `titulo` y `letra`, con normalización sin acentos (PostgreSQL `ILIKE` por token en DB, mismo algoritmo en fallback local).
  - Motor B · Tiempo litúrgico: dropdown de tiempo + refinamiento opcional por momento del tiempo elegido.
  - Motor C · Momento de misa: dropdown global de momentos, independiente del tiempo litúrgico (ignora cualquier `tiempo` que venga informado).
  - Esqueleto UI: nueva primitive `Tabs` accesible en `src/packages/ui/src/astro/Tabs.astro` (consumida por Cancionero, reutilizable por Biblia/Calendario y otras apps), con su CSS en `@repo/ui/tabs.css`. Pestañas con roles ARIA `tablist`/`tab`/`tabpanel`, navegación con flechas y persistencia del motor activo en query string.
  - Validador Zod (`searchQuerySchema`) extendido con el param `motor` (`A|B|C`) y reglas `superRefine` por motor.
  - 19 tests unitarios nuevos cubriendo los 3 motores del fallback (`filterFallbackSongs`) y la validación del esquema.
  - Documentación sincronizada: `00-README.md` (estado de implementación, alcance/no-alcance), `02-SRS.md` (FR-0401-CANCIONERO-001..011 re-numerados y trazados), `03-FRD.md` (UC/RB actualizados), `04-Flujos y Secuencias.md` (3 secuencias nuevas), `05-Tests Unitarios.md` (TC-001..005 marcados como implementados), `09-Especificacion Tecnica.md` (contrato `?motor=` y primitive Tabs).

### Changed

- **Cancionero** (`src/apps/cancionero/`, `db/supabase/migrations/202606060001_migrate_cancionero_chord_model.sql`, `db/scripts/cancionero_seed.sql`, `docs/02-Aplicaciones/FASE_4-0401_cancionero/WEB/`): se migra el modelo de letra+acordes del formato legado `[Acorde]` embebido a coordenadas explícitas.
  - Nuevas columnas `letra` (text) y `acordes` (jsonb) en `canciones`; la columna `letra_acordes` se elimina tras backfill controlado por un script PL/pgSQL reusable (`internal.cancionero_migrate_chord_text`).
  - La página `/contribuir` deja de pedir markup manual: el músico escribe la letra limpia y hace click sobre la sílaba para colocar el acorde, que se muestra en la línea superior (formato cancionero). El form serializa `letra` + `acordes: ChordPosition[]` (`{linea, posicion, nombre}`).
  - La página `/canciones/[id]` renderiza los acordes en la línea superior alineados a la sílaba correspondiente.
  - Se agregan 26 tests unitarios del parser (`migrateLegacyChordText`, `alignChordsWithLyrics`, `getChordAtPosition`, `upsertChordAt`, `removeChordAt`, `isValidChordInput`).
  - Documentación actualizada: `02-SRS.md`, `03-FRD.md`, `04-Flujos y Secuencias.md`, `05-Tests Unitarios.md`, `06-Esquema de Datos.md`, `08-Decisiones de Arquitectura.md` (ADR-004/006), `09-Especificacion Tecnica.md`.

- **Cancionero / filtros opcionales y catálogo por defecto** (`src/apps/cancionero/src/lib/validators.ts`, `src/apps/cancionero/src/lib/data.ts`, `src/apps/cancionero/src/lib/server/repository.ts`, `src/apps/cancionero/src/pages/buscar.astro`, `src/apps/cancionero/src/lib/search-engines.test.ts`, `docs/02-Aplicaciones/FASE_4-0401_cancionero/WEB/`): los 3 motores de búsqueda pasan a tener filtros opcionales y componibles.
  - Sin filtros aplicados, `/buscar` y `/api/cancionero/search` devuelven todas las canciones con `estado = publicado`, ordenadas por titulo, con encabezado "N canciones aprobadas". Cada filtro (`q` / `tiempo` / `momento`) es opcional: la ausencia del parametro de un motor no bloquea la busqueda y los filtros presentes se aplican en AND.
  - El validador Zod (`searchQuerySchema`) deja de rechazar con 400 la falta de parametros: ahora solo valida que `q`, si se informa, tenga al menos 2 caracteres. Motor C sigue ignorando cualquier `tiempo` que venga informado.
  - `filterFallbackSongs` y `listSongsFromDb` aplican el filtro de un motor solo si su parametro principal esta presente; si no hay ninguno, devuelven el catalogo aprobado.
  - La página `/buscar` muestra encabezados dinamicos: "N canciones aprobadas" sin filtros / "N canciones encontradas" con filtros. Placeholders y opciones "Todos los tiempos"/"Todos los momentos" permiten al usuario dejar el motor sin restricción explicita.
  - Se agregan 3 tests nuevos al `search-engines.test.ts` (sin filtros devuelve todas, cada motor sin su filtro principal devuelve todas, validación acepta params vacios). Total: 22 tests.
  - Documentación actualizada: `02-SRS.md` (FR-007 y FR-008 nuevos, renumeración 007..011 → 009..013, trazabilidad PRD→SRS ajustada), `03-FRD.md` (UC-001..008 reescritos, RB-006..010 actualizadas, sección de validaciones y trazabilidad FRD→SRS corregidas), `04-Flujos y Secuencias.md` (flujo principal y secuencias 1-3 con comportamiento laxo), `05-Tests Unitarios.md` (TC-001..005 con nueva trazabilidad), `09-Especificacion Tecnica.md` (endpoint `/api/cancionero/search` documentado con reglas laxis), `00-README.md` (alcance y estado de implementación).

- **Cancionero / jerarquía de roles ajustada** (`src/apps/cancionero/src/lib/auth.ts`, `src/apps/cancionero/src/lib/auth.test.ts`, `docs/02-Aplicaciones/FASE_4-0401_cancionero/WEB/02-SRS.md`, `docs/02-Aplicaciones/FASE_4-0401_cancionero/WEB/03-FRD.md`): se redefinen las capacidades de cada rol según el nuevo diseño de producto.
  - `musico` → ya no contribuye canciones; su aporte son listas de reproducción (futuro).
  - `coordinador` → puede contribuir canciones, pero no moderar.
  - `sacerdote` -> puede contribuir y moderar (evaluar + aprobar canciones).
  - `admin` → todo (contribuir y moderar).
  - Tests actualizados: 90/90 (64 existentes + 26 de auth). check-types 0/0/0.
  - Se crearon usuarios de prueba en Supabase para cada rol: `musico.test@fosforo.test`, `coordinador.test@fosforo.test`, `sacerdote.test@fosforo.test`. El usuario existente `Iván Ezequiel iencinella` fue promovido a admin.
  - Smoke E2E validado: sacerdote puede contribuir + moderar, coordinador contribuye pero no modera, músico no contribuye ni modera, invitado no contribuye ni modera.

## 2026-04-17

### Added

- **Santopedia** (`apps/santopedia`): nueva aplicación web con catalogo de perfiles devocionales (santos, beatos, siervos de Dios, advocaciónes marianas, Jesus).
  - Catalogo navegable con filtros: tipo de entidad, audiencia, tema, tiempo liturgico, búsqueda por texto.
  - Paginas de perfil con contenido desde Markdown, metadata SEO y enlaces ecosistema.
  - API endpoints: `/api/santopedia/profiles` (listado paginado), `/api/santopedia/profiles/[slug]` (detalle), `/api/santopedia/collections/current` (colecciones), `/api/santopedia/share-card/[slug]` (tarjeta compartible).
  - Componentes reutilizables y estilos unificados para consistencia visual.
  - Soporte para imagen por defecto en tarjetas y fichas.

### Fixed

- **Santopedia** (`apps/santopedia`): se corrigio el error "Slug invalido" en el catalogo, ahora el slug se deriva correctamente del nombre de archivo en la coleccion de contenido.
- **Portal** (`apps/portal`): se normalizaron los `iconSrc` de SVG a URL string en `apps/portal/src/pages/apps/index.astro` para evitar errores de hidratación de Astro/React (`TypeError: t is not iterable`) en las cards de aplicaciónes.

## 2026-05-09

### Fixed

- **Portal** (`src/packages/ui/src/portal.css`): se corrigio la visualización del video en el hero principal ajustando overlays y opacidad con tokens del tema para mejorar legibilidad y consistencia en modo oscuro/claro y en mobile.
- **Portal** (`src/packages/ui/src/portal-hero.tsx`): se corrigio el renderizado del video que no se visualizaba porque el componente esperaba un string pero Astro pasa un objeto con propiedad `src`. Ahora acepta ambos formatos.
- **Portal** (`src/apps/portal/src/pages/index.astro`): se elimino el skeleton persistente del hero principal reemplazando el render `client:only` por SSR directo, para que el video siempre aparezca en la carga inicial.
- **Portal** (`src/packages/ui/src/portal-header.tsx`, `src/packages/ui/src/portal.css`, `src/apps/portal/src/components/SiteHeader.astro`): se reemplazo el boton textual de tema por un switch con iconos de sol/luna, persistencia en `localStorage` y comportamiento real de cambio claro/oscuro al hidratar el header.
- **Portal Docs** (`docs/02-Aplicaciones/FASE_1-0101_portal/WEB/00-README.md`): se actualizo el estado de implementación para reflejar que `src/apps/portal/` ya esta implementada en progreso y no solo como ruta objetivo.

## 2026-05-18

### Added

- **Biblia Docs** (`docs/02-Aplicaciones/FASE_1-0102_biblia/WEB/`): se completo la documentación spec-driven de la app `0102_biblia` (README, PRD, SRS, FRD, flujos, tests, datos, ERM, ADR, especificación tecnica, OWASP y SLA/SLO).
  - Se definio el MVP en lectura bíblica + búsqueda textual + lecturas del día.
  - Se formalizo el uso de Supabase con catálogo abierto de versiones y una sola versión habilitada en MVP.
  - Se establecio Rito Romano (Argentina) para lecturas litúrgicas en esta fase.
  - Se documento el bloqueo de publicación pública por licencia del contenido LPD y el alcance interno privado hasta resolver derechos.

## 2026-05-20

### Fixed

- **Biblia / UI compartida** (`src/apps/biblia/src/`, `src/packages/ui/src/`, `src/packages/eslint-config/`): se alineo la experiencia visual de Biblia con el shell de Portal para unificar hero, secciones, cards y header con el resto del ecosistema.
  - Se corrigio el header para respetar el logo personalizado enviado desde Biblia en lugar del fallback por defecto.
  - Se reforzo el contraste del boton "Buscar pasaje" y del toggle de tema en modo oscuro para evitar que se pierdan sobre el fondo del header.
  - Se resolvio el error de navegación `Unexpected ">"` en rutas de Biblia corrigiendo props Astro invalidas e imports faltantes en paginas refactorizadas.
  - Se ajusto la configuración compartida de ESLint para React 19 y ESLint 10, restaurando `pnpm lint` en el monorepo.

## 2026-05-21

### Fixed

- **Biblia** (`src/apps/biblia/src/`, `src/packages/ui/src/`, `src/apps/biblia/astro.config.mjs`): se termino de alinear la UI de la app con Portal, unificando cards de entrada, breadcrumbs, secciones editoriales y continuidad entre modulos para que lectura, busqueda, liturgia y estado compartan el mismo shell visual del ecosistema.
  - Se agrego una card propia para los modulos reales de Biblia y se reforzaron los cierres editoriales de las paginas internas con acciones y paneles consistentes con Portal.
  - Se ajusto el build SSR para Vercel en Windows usando bundling interno de dependencias (`vite.ssr.noExternal = true`), evitando fallos `EPERM` por symlinks al generar `.vercel/output/functions`.
- **Docs / workspace** (`pnpm-lock.yaml`, `docs/00-General/04-Listado-de-Aplicaciones.md`, `docs/02-Aplicaciones/00-README.md`): se resolvieron conflictos de merge pendientes y se sincronizo el inventario documental con el estado real del monorepo.
  - `pnpm-lock.yaml` quedo regenerado y valido para `pnpm install --frozen-lockfile`.
  - El listado general y el indice de aplicaciones ahora reflejan que `Portal`, `Biblia` y `Calendario` estan documentadas e implementadas en `src/apps/`.
- **Calendario / consistencia cross-app** (`src/apps/calendario/src/`, `src/packages/ui/src/calendar.css`, `src/apps/calendario/astro.config.mjs`): se normalizaron estados visuales, superficies compartidas e imports globales para que `calendario` conserve identidad leve propia sin separarse del shell de `portal` y `biblia`.
  - Se unificaron cards, estados vacio/error y contratos de estilos de entrada para usar foundation y tokens compartidos.
  - Se ajusto el build SSR en Windows con `vite.ssr.noExternal = true`, evitando errores `EPERM` del adaptador de Vercel.
- **Portal / build y lint** (`src/apps/portal/astro.config.mjs`, `src/packages/ui/src/portal-bible-reader.tsx`): se completo la verificación final del set web activo corrigiendo el build de `portal` en Windows y eliminando un warning de hooks en `@repo/ui`.
  - `portal` ahora usa el mismo ajuste SSR que `biblia` y `calendario` para evitar symlinks fallidos en `.vercel/output/functions`.
  - `PortalBibleReader` dejo de recrear el fallback del libro en cada render, limpiando `pnpm lint` del paquete UI.

## 2026-05-22

### Fixed

- **Biblia / UI compartida** (`src/apps/biblia/src/`, `src/packages/ui/src/`): se profundizo la unificación visual con Portal reemplazando componentes locales por primitives compartidas del design system para reducir duplicación y asegurar que los puntos de entrada y CTAs respondan al mismo contrato visual del ecosistema.
  - La home de `biblia` ahora reutiliza `PortalAppCard` con soporte de `href` directo para enlazar modulos internos sin mantener una card paralela solo para esa app.
  - Los footers de `portal` y `biblia` ahora consumen un footer Astro compartido, y los enlaces tipo boton de `biblia` pasaron a una primitive reutilizable en `@repo/ui`.
- **Biblia** (`src/apps/biblia/src/pages/`, `src/apps/biblia/src/styles/`): se ajusto la direccion estetica para acercarla a `calendario`, reduciendo el tono marketing de `portal` y reorganizando las vistas en heroes editoriales sobrios, paneles laterales y grillas mas serenas.
  - La home recibio un refinamiento adicional de jerarquia, spacing y contraste para que el resumen del MVP, la version activa y los modulos principales se lean con mas claridad en desktop y mobile.
- **Biblia / header compartido** (`src/apps/biblia/src/layouts/Layout.astro`, `src/apps/biblia/src/styles/biblia.css`, `docs/02-Aplicaciones/FASE_1-0102_biblia/WEB/09-Especificacion Tecnica.md`): se realineo `biblia` para que el header use el mismo tratamiento visual de `portal` en CTA, switch de tema y halo del logo, evitando que en modo oscuro se pierdan el boton principal, el toggle y la presencia visual del isotipo.
- **Biblia / glow visual** (`src/apps/biblia/src/styles/biblia.css`): se recupero en cards, paneles y modulos principales el mismo nivel de glow y borde animado que usa `portal`, para que la app vuelva a compartir la misma intensidad visual en superficies destacadas.
- **Biblia / alineación visual total con Portal** (`src/apps/biblia/src/styles/biblia.css`): se extendio la igualación para replicar también el tratamiento full-bleed del hero, overlays y profundidad visual de superficies destacadas, cerrando la brecha visual restante entre ambas apps.

## 2026-05-26

### Added

- **Log App** (`src/apps/log/`, `db/supabase/migrations/202605260002_create_log_core.sql`): se implemento la base funcional de la aplicación `0105_log` sobre Astro SSR + Supabase + UI compartida del ecosistema.
  - Login real con Supabase Auth y control de acceso por rol `dev`/`ops` usando `app_metadata.role`.
  - Endpoints operativos: `/api/health`, `/api/logs`, `/api/logs/[id]`, `/api/dashboard/metrics`, `/api/auth/login`, `/api/auth/logout`.
  - Dashboard con metricas operativas y grafico horario en island React con skeleton de carga.
  - Persistencia via Supabase para logs e API keys con fallback en memoria solo para desarrollo/degradacion.
  - Migracion SQL con tablas `log_entries` y `api_keys`, indices, RLS y seed de API key de desarrollo hasheada.

### Fixed

- **Log App / Build en Windows** (`src/apps/log/astro.config.mjs`): se agrego `vite.ssr.noExternal = true` para reducir fallos `EPERM` por symlinks del adaptador Vercel en entornos Windows.
- **Log App / Cleanup scaffold** (`src/apps/log/src/components/Welcome.astro`, `src/apps/log/src/layouts/Layout.astro`, `src/apps/log/src/styles/global.css`, `src/apps/log/src/assets/*`): se elimino el contenido inicial de Astro Starter para evitar deuda tecnica y confusión con el dominio real de la app.

## 2026-05-27

### Added

- **Administracion App** (`src/apps/administracion/`): se implemento la base funcional del panel de administración con API cerrada sobre Supabase Auth + RLS por rol.
  - Setup SSR Astro + Vercel adapter + React islands + UI compartida del ecosistema.
  - Layout operativo con navegación móvil hamburguesa, toggle de tema claro/oscuro y view transitions.
  - Módulos iniciales del MVP: dashboard general, gestión de iglesias y vista de horarios.
  - Endpoints protegidos: login/logout, CRUD de iglesias, CRUD de horarios y métricas de dashboard.
  - SQL base en `src/apps/administracion/supabase/`: esquema, políticas RLS y función `admin_dashboard_metrics()`.

### Changed

- **Supabase proyecto** (migraciones remotas): se aplicaron `admin_panel_schema`, `admin_panel_rls_policies` y `admin_panel_helpers`.
  - Nuevas tablas activas: `public.admin_users`, `public.churches`, `public.celebration_schedules`, `public.admin_audit_log`.
  - Se registró el primer admin en `public.admin_users` con rol `admin` para habilitar acceso inicial al panel.

## 2026-05-28

### Added

- **Cancionero App** (`src/apps/cancionero/`): se implementó el MVP funcional web de `0401_cancionero` alineado a la documentación spec-driven.
  - Nuevas páginas de producto: búsqueda (`/buscar`), liturgia (`/liturgia`), contribución (`/contribuir`), moderación (`/moderacion`), estado (`/estado`) y detalle de canción (`/canciones/[id]`).
  - API BFF de cancionero: `/api/cancionero/search`, `/api/cancionero/liturgy`, `/api/cancionero/tiempos`, `/api/cancionero/songs/[id]`, `/api/cancionero/contribuciones`, `/api/cancionero/moderacion/pendientes`, `/api/cancionero/moderacion/[id]`, más `/api/health`.
  - Capa de dominio y servicios: parseo de acordes `[Acorde]`, validaciones Zod, repositorio Supabase y fallback local para desarrollo.

- **Supabase / Cancionero** (`db/supabase/migrations/202605281200_create_cancionero_core.sql`): se agregó migración core del dominio cancionero.
  - Tablas: `public.canciones`, `public.etiquetas_cancion`, `public.tiempos_liturgicos`, `public.auditoria_moderacion`.
  - Seguridad: RLS habilitado en todas las tablas expuestas, políticas por rol para lectura pública de publicadas, contribución autenticada y moderación admin.
  - Reglas y performance: trigger de `updated_at`, validación de publicación con etiquetas obligatorias, índices compuestos y trigram para búsqueda textual.
  - Seed base: tiempos litúrgicos iniciales y permiso `cancionero` para roles del ecosistema, incluyendo nuevo rol `musico`.

### Changed

- **Cancionero / operación en producción** (`src/apps/cancionero/src/lib/server/repository.ts`): en `NODE_ENV=production` ya no se degrada automáticamente a fallback ante errores de base; ahora falla de forma explícita para evitar ocultar incidentes de infraestructura.
- **Cancionero / configuración** (`src/apps/cancionero/.env.example`, `src/apps/cancionero/README.md`): se documentaron variables de entorno requeridas para conexión real a Supabase y consumo opcional de la API de calendario.

### Data

- **Cancionero / dataset inicial** (`db/scripts/cancionero_seed.sql`): se agregó y aplicó seed reproducible con 9 canciones (7 publicadas, 2 pendientes), etiquetas por tiempo+momento y 2 registros de auditoría para habilitar pruebas reales de búsqueda, liturgia y moderación desde el primer arranque.
