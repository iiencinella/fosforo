---
tags:
  - proyecto/fosforo
  - cancionero
  - srs
  - aplicación
type: doc-app-srs
area: aplicaciónes
status: vigente
created: 2026-05-28
updated: 2026-06-07
related:
  - "[[00-README|Cancionero App]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
---

# SRS - 0401_cancionero

## 1. Ficha

- ID base: `FR-0401-CANCIONERO-*`, `NFR-0401-CANCIONERO-*`, `IR-0401-CANCIONERO-*`, `CA-0401-CANCIONERO-*`
- Plataforma: WEB
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-05-28
- Estado: vigente

## 2. Proposito y alcance tecnico

Implementar una aplicación web de canciones litúrgicas con tres motores de búsqueda (libre, por tiempo litúrgico y selector de momentos), flujo de contribución y moderación, y visualización de letras con acordes. El alcance técnico MVP incluye el modelo de datos en Supabase, API endpoints Astro para búsqueda y moderación, e integración con el Calendario Litúrgico del ecosistema.

## 3. Actores

- **Invitado (usuario sin sesión o rol base):** consulta el catálogo y navega el repertorio de canciones públicas.
- **Músico:** busca canciones, visualiza letras con acordes y gestiona listas de reproducción. No contribuye canciones nuevas ni modera.
- **Coordinador:** mismo acceso que un músico, puede contribuir (proponer) canciones nuevas y gestionar grupos (coros). No define etiquetas litúrgicas finales al proponer.
- **Sacerdote:** mismo acceso que un coordinador, además evalúa, aprueba o rechaza las canciones propuestas. Define tiempo litúrgico y momento de misa al aprobar. Puede ver todas las canciones (incluso las pendientes) para reevaluación.
- **Administrador:** máxima autoridad en validación litúrgica; aprueba, corrige etiquetas y publica contenido; gestiona usuarios y roles.

## 4. Requisitos funcionales

| ID                     | Requisito                                       | Criterio verificable                                                                                                                                                                                                                                                                                       |
| ---------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-0401-CANCIONERO-001 | Búsqueda libre por nombre de canción (Motor A)  | El sistema tokeniza la query por espacios (al menos un token debe matchear, OR lógico) y devuelve canciones donde alguno de los tokens aparece en el titulo, con normalización sin acentos                                                                                                                 |
| FR-0401-CANCIONERO-002 | Búsqueda por fragmento de letra (Motor A)       | El motor A matchea tambien dentro del texto de la letra de cada canción                                                                                                                                                                                                                                    |
| FR-0401-CANCIONERO-003 | Filtro por tiempo litúrgico (Motor B)           | El sistema presenta los tiempos disponibles; al seleccionar uno filtra canciones publicadas con ese tiempo                                                                                                                                                                                                 |
| FR-0401-CANCIONERO-004 | Refinamiento por momento de misa (Motor B)      | Cuando ademas del tiempo se informa un momento, el sistema filtra por la combinación exacta tiempo+momento                                                                                                                                                                                                 |
| FR-0401-CANCIONERO-005 | Selector de Momentos independiente (Motor C)    | El sistema expone un dropdown global con la unión de todos los momentos de misa y devuelve canciones con ese momento en cualquier tiempo litúrgico, ignorando cualquier tiempo que venga informado                                                                                                         |
| FR-0401-CANCIONERO-006 | Esqueleto de 3 motores en `/buscar`             | La página `/buscar` presenta los 3 motores como pestañas accesibles (`role="tablist"`/`tab`/`tabpanel`); la pestaña activa persiste en query string (`?motor=A\|B\|C`)                                                                                                                                     |
| FR-0401-CANCIONERO-007 | Listado sin filtros: catalogo completo aprobado | Si el usuario no aplica ningun filtro, `/buscar` y `/api/cancionero/search` devuelven todas las canciones con `estado = publicado`, ordenadas por titulo. El encabezado del panel muestra "N canciones aprobadas" en lugar de "N canciones encontradas"                                                    |
| FR-0401-CANCIONERO-008 | Filtros opcionales y componibles                | Cada filtro (`q` / `tiempo` / `momento`) es opcional. La ausencia del parametro de un motor no bloquea la busqueda; los filtros presentes se aplican en AND. La pagina `/buscar` y el endpoint nunca rechazan params vacios                                                                                |
| FR-0401-CANCIONERO-009 | Visualización de letra con acordes              | El sistema renderiza la letra con los acordes en una línea superior, alineados a la sílaba correspondiente (formato cancionero)                                                                                                                                                                            |
| FR-0401-CANCIONERO-010 | Contribución de nuevo recurso                   | El contribuyente habilitado (`coordinador`, `sacerdote` o `admin`) completa formulario con título, letra limpia, acordes posicionados visualmente, PDF opcional, link YouTube y observaciones opcionales para moderación; la contribución se crea sin etiquetas litúrgicas finales                         |
| FR-0401-CANCIONERO-011 | Panel de moderación                             | El moderador (`sacerdote` o `admin`) ve lista de pendientes, previsualiza el recurso, lee observaciones del proponente, define/corrige etiquetas litúrgicas y aprueba o rechaza                                                                                                                            |
| FR-0401-CANCIONERO-012 | Publicación de recurso aprobado                 | Una vez aprobado, el recurso se vuelve visible en búsquedas públicas                                                                                                                                                                                                                                       |
| FR-0401-CANCIONERO-013 | Historial de auditoría de moderación            | El sistema registra quién contribuyó, quién aprobó, fecha y cambios realizados sobre las etiquetas                                                                                                                                                                                                         |
| FR-0401-CANCIONERO-014 | Autenticación real del ecosistema en Cancionero | El sistema valida la sesión del usuario en cada request SSR mediante `@repo/auth` (`supabase.auth.getUser(token)`) usando las cookies cross-app `fosforo_access_token` / `fosforo_refresh_token`; reemplaza el header mock `x-cancionero-role`                                                             |
| FR-0401-CANCIONERO-015 | Páginas propias de auth en Cancionero           | La app expone `/auth/login`, `/auth/register` y `/perfil`. El registro asigna automáticamente el rol `musico` (id=5) al nuevo usuario, además del rol base `usuario` (id=4) que aplica el trigger `internal.handle_new_user`. La página de registro informa al usuario que su cuenta será de tipo "músico" |
| FR-0401-CANCIONERO-016 | Guards SSR en rutas protegidas                  | Las páginas `/contribuir` y `/moderacion` validan la sesión y la capacidad (`canContribute` / `canModerate`) en SSR; redirigen a `/auth/login?next=<ruta>` si no hay sesión o a `/` si la sesión existe pero la capacidad no                                                                               |

## 5. Requisitos no funcionales

| ID                      | Requisito                  | Objetivo                                                                                                   |
| ----------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| NFR-0401-CANCIONERO-001 | Disponibilidad/Estabilidad | 99.5% uptime en horario de uso típico (fines de semana y celebraciones)                                    |
| NFR-0401-CANCIONERO-002 | Rendimiento                | Búsqueda libre < 500ms p95; búsqueda por tiempo+momento < 300ms p95                                        |
| NFR-0401-CANCIONERO-003 | Seguridad                  | Autenticación en endpoints de moderación; validación de entrada en contribuciones; RLS en tablas sensibles |
| NFR-0401-CANCIONERO-004 | Escalabilidad              | Capacidad para 500 canciones y 50 contribuciones mensuales en MVP                                          |

## 6. Integraciónes

| ID                     | Integración                       | Contrato                                                                                                  | Version |
| ---------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------- | ------- |
| IR-0401-CANCIONERO-001 | API de Calendario Litúrgico       | HTTP REST (JSON) para obtener tiempos litúrgicos activos                                                  | v1      |
| IR-0401-CANCIONERO-002 | Buscador central del ecosistema   | HTTP REST (JSON) para indexar fragmentos de letras                                                        | v1      |
| IR-0401-CANCIONERO-003 | `@repo/auth` (paquete compartido) | Helpers de sesión, cookies cross-app y role-mapping consumidos por Cancionero para autenticar y autorizar | v1      |

## 7. Criterios de aceptación

| ID                     | Criterio                                                                                                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-0401-CANCIONERO-001 | Un usuario invitado puede buscar una canción por nombre y obtener resultados en < 500ms                                                                                                                   |
| CA-0401-CANCIONERO-002 | Un usuario con rol `coordinador`, `sacerdote` o `admin` puede contribuir un recurso con título, letra y observaciones opcionales; el recurso queda en estado "pendiente" sin etiquetas litúrgicas finales |
| CA-0401-CANCIONERO-003 | Un moderador (`sacerdote` o `admin`) puede ver la lista de pendientes, leer observaciones del proponente, asignar tiempo+momento al aprobar y la canción aparece en búsquedas públicas                    |
| CA-0401-CANCIONERO-004 | Al seleccionar un tiempo litúrgico + momento de misa, solo se muestran canciones validadas para esa combinación                                                                                           |
| CA-0401-CANCIONERO-005 | Un usuario que se registra desde `/auth/register` queda autenticado, su `profiles.role_id = 5` (musico) en DB, y puede acceder a `/contribuir`                                                            |
| CA-0401-CANCIONERO-006 | Un usuario sin sesión que intenta acceder a `/contribuir` es redirigido a `/auth/login?next=/contribuir`; un usuario con rol `coordinador`, `sacerdote` o `admin` accede normalmente                      |
| CA-0401-CANCIONERO-007 | Un usuario sin rol moderador (`sacerdote` o `admin`) que intenta acceder a `/moderacion` es redirigido a `/` con un mensaje informativo                                                                   |

## 8. Trazabilidad PRD -> SRS

| PRD                     | SRS                                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| PRD-0401-CANCIONERO-001 | FR-0401-CANCIONERO-001, FR-0401-CANCIONERO-002, FR-0401-CANCIONERO-006, FR-0401-CANCIONERO-007, FR-0401-CANCIONERO-008                         |
| PRD-0401-CANCIONERO-002 | FR-0401-CANCIONERO-003                                                                                                                         |
| PRD-0401-CANCIONERO-003 | FR-0401-CANCIONERO-004, FR-0401-CANCIONERO-005                                                                                                 |
| PRD-0401-CANCIONERO-004 | FR-0401-CANCIONERO-009                                                                                                                         |
| PRD-0401-CANCIONERO-005 | FR-0401-CANCIONERO-010, FR-0401-CANCIONERO-013                                                                                                 |
| PRD-0401-CANCIONERO-006 | FR-0401-CANCIONERO-011, FR-0401-CANCIONERO-012                                                                                                 |
| PRD-0401-CANCIONERO-007 | FR-0401-CANCIONERO-014, FR-0401-CANCIONERO-015, FR-0401-CANCIONERO-016, CA-0401-CANCIONERO-005, CA-0401-CANCIONERO-006, CA-0401-CANCIONERO-007 |
