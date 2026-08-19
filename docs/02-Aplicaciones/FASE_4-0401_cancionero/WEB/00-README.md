---
tags:
  - proyecto/fosforo
  - cancionero
  - aplicación
type: app-readme
area: aplicaciónes
status: vigente
created: 2026-05-28
updated: 2026-06-07
related:
  - "[[../00-README|Indice de aplicaciónes]]"
---

# 0401_cancionero

## Metadatos

- Plataforma: WEB
- Estado: vigente
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-05-28

## Descripcion

0401 Cancionero es una aplicación web del ecosistema Fósforo para la gestión de repertorio de cantos litúrgicos. Funciona como biblioteca de canciones con letras, acordes y recursos multimedia, diseñada para ayudar a coros, ministerios de música y comunidades a preparar las celebraciones con coherencia litúrgica.

La app implementa tres motores de búsqueda: búsqueda libre e inteligente (indexación de fragmentos de letra), filtro por tiempo litúrgico (dinámico, consumiendo datos de la API de Calendario Litúrgico) y el Selector de Momentos (cruza Tiempo + Momento de Misa para filtrar canciones validadas).

Incluye un flujo completo de contribución y validación: los músicos suben recursos con etiquetas propuestas y el administrador (moderador litúrgico) aprueba, corrige etiquetas y publica. Soporta multiformato (letra con acordes transponibles, PDF de partitura, link de YouTube) y modo offline PWA.

## Validación de la idea

- Existe una necesidad clara de un repertorio compartido dentro del ecosistema, con búsqueda por criterios litúrgicos y no solo por título.
- La integración con Calendario Litúrgico permite sugerencias contextuales según el tiempo y la celebración del día.
- El flujo de contribución + validación replicable permite que el cancionero crezca comunitariamente con supervisión centralizada.
- El modo offline y la transposición de tonos cubren necesidades reales de músicos en entornos parroquiales con conectividad limitada.

## Arquitectura

- **Frontend:** Astro + TypeScript + Tailwind CSS v4 (islas React para transposición de acordes, reproductor y formularios de contribución)
- **Backend:** API Endpoints Astro (BFF) con servicios de búsqueda, catálogo y moderación
- **Datos:** Supabase PostgreSQL
- **Integración:** Vercel, Calendario Litúrgico (API), Buscador central del ecosistema, identidad compartida del ecosistema vía `@repo/auth` (Supabase Auth + cookies cross-app)
- **Estilos:** `@repo/ui` + `@repo/tailwind-config` + scope de app

## Estado de implementación

- **Completado:** scaffold documental completo, workspace base con Astro, esqueleto de 3 motores de búsqueda (A libre, B tiempo, C momento) en `/buscar` con pestañas accesibles, comportamiento laxo "sin filtros = catalogo completo aprobado" en `/buscar` y `/api/cancionero/search`, primitive `Tabs` reutilizable en `@repo/ui`, integración de identidad real del ecosistema vía `@repo/auth` con páginas propias `/auth/login` y `/auth/register`, perfil en `/perfil`, middleware SSR que popula `Astro.locals.{session, appRole, canContribute, canModerate}`, guards SSR en `/contribuir` y `/moderacion`, asignación automática del rol `musico` (id=5) al registro desde Cancionero, persistencia de `contribuyente_id` / `moderador_id` y `fecha_contribucion` / `fecha_moderacion` en DB, y remoción del header mock `x-cancionero-role`.
- **En curso:** definición del modelo de datos en Supabase, integración con Calendario Litúrgico y Buscador central, refinamiento del flujo de contribución y panel de moderación con identidad real.
- **Pendiente:** reproductor de acordes con transposición, modo offline PWA, recomendaciones automáticas por liturgia del día.

## Ubicación del codigo

- App: `src/apps/cancionero/`
- Componentes: `src/apps/cancionero/src/components/`
- Primitive compartida: `src/packages/ui/src/astro/Tabs.astro` (pestañas accesibles reutilizables).
- Estilos: `src/packages/ui/`, `src/packages/tailwind-config/shared-styles.css`, `src/apps/cancionero/src/`
- Contenido: Supabase PostgreSQL (canciones, recursos, momentos litúrgicos)
- API: `src/apps/cancionero/src/pages/api/`
- Identidad compartida: `@repo/auth` (`src/packages/auth/`) consumido por Cancionero para sesión, cookies y role-mapping

## Alcance MVP

- Esqueleto de 3 motores de búsqueda en `/buscar` con pestañas (A libre, B tiempo, C momento).
- Comportamiento laxo: sin filtros aplicados, `/buscar` y `/api/cancionero/search` devuelven todas las canciones con `estado = publicado` ordenadas por titulo, con encabezado "N canciones aprobadas". Cada filtro (`q`/`tiempo`/`momento`) es opcional y componible (AND entre motores).
- Motor A · Búsqueda libre: tokenización OR (al menos una palabra en título o letra) con normalización sin acentos.
- Motor B · Tiempo litúrgico: selector de tiempo + refinamiento opcional por momento de misa del tiempo elegido. Opción "Todos los tiempos" disponible.
- Motor C · Momento de misa: dropdown global de momentos, independiente del tiempo litúrgico. Opción "Todos los momentos" disponible.
- Visualización de letra con acordes (sin transposición en MVP).
- Flujo de contribución: músico sube canción con etiquetas propuestas.
- Panel de moderación: administrador aprueba/rechaza/corregir etiquetas y publica.
- Catálogo de momentos litúrgicos y tiempos modelado en Supabase.
- Identidad real del ecosistema: login y registro propios en `/auth/login` y `/auth/register`, sesión persistida en cookies cross-app (`fosforo_access_token` / `fosforo_refresh_token`) leídas por `@repo/auth`, asignación automática del rol `musico` (id=5) al registro desde Cancionero, perfil en `/perfil`, guards SSR en `/contribuir` y `/moderacion`, y persistencia de `contribuyente_id` / `moderador_id` en DB.

## No alcance MVP

- Motores de búsqueda adicionales (por celebración del día, por autor, por tonalidad, por rango de acordes, full-text avanzado, búsqueda fuzzy, sinónimos).
- Transposición de tonos interactiva (post-MVP).
- Recomendaciones automáticas basadas en liturgia del día (post-MVP).
- Listas de reproducción colaborativas y carpetas de ensayo.
- Modo offline PWA completo.
- Perfiles de usuario con historial y favoritos.

## KPI principal

- KPI principal: porcentaje de búsquedas de canciones resueltas con éxito en el catálogo interno.
- KPI secundario 1: latencia p95 de búsqueda por tiempo+momento en rangos aceptables para uso en ensayo.
- KPI secundario 2: tiempo promedio entre contribución y publicación (moderación).

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------- |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | vigente |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | vigente |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | vigente |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | vigente |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | vigente |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificación Tecnica](09-Especificacion%20Tecnica.md)           | vigente |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | vigente |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | vigente |

## Documentos complementarios

| Documento                                                   | Descripcion                                                                     | Estado  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- | ------- |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)               | Estrategia de pruebas unitarias para motores de búsqueda y flujo de moderación. | vigente |
| [09-Especificación Tecnica](09-Especificacion%20Tecnica.md) | Definición de stack, módulos, endpoints y decisiones de implementación.         | vigente |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
- El modelo de momentos litúrgicos está definido en la sección 5 de este documento como JSON de referencia para poblar la base de datos.
- La integración con Calendario Litúrgico es requisito para los Motores B y C.
