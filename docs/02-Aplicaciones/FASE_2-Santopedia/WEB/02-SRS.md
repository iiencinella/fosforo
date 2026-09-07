---
tags:
  - proyecto/fosforo
  - santopedia
  - srs
  - web
type: app-srs
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[01-PRD|01-PRD]]"
  - "[[03-FRD|03-FRD]]"
---

# Santopedia — SRS

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Alcance

Especificación de requisitos software de Santopedia (fase WEB). Se basa en el [01-PRD](01-PRD.md) y genera el [03-FRD](03-FRD.md). Cubre la consulta de contenido `santo` desde el CMS, la resolución de fiesta vía Motor Litúrgico, favoritos, reportes de error, RUM y no cubre la edición de contenido (exclusiva del CMS).

## 2. Requisitos funcionales

| ID           | Requisito                     | Descripción técnica                                                                                                                                                                                                                                                                                                      | PRD origen    |
| ------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| FR-SANTO-001 | Ficha de santo desde CMS      | La ficha se compone SSR desde el CMS vía `GET /api/content/santo?slug=X`. Campos: nombre, slug, biografía (rich text sanitizado), patronazgos[], fiesta (resuelta por Motor), iconografía (descripción + imágenes), atributos[], categoría, siglo, país, canonización. Slug inválido o inexistente → 404.                | PRD-SANTO-001 |
| FR-SANTO-002 | Listado paginado con filtros  | Listado SSR paginado (`page`, `pageSize`) con filtros por taxonomía: `categoria`, `siglo`, `pais`. Orden por defecto alfabético. Cada ítem muestra nombre, categoría, fiesta del día actual (si corresponde) y thumbnail. Estados vacíos sin resultados.                                                                 | PRD-SANTO-002 |
| FR-SANTO-003 | Búsqueda full-text            | Búsqueda vía CMS con parámetro `q=` (mínimo 2 caracteres) sobre nombre y patronazgos. Debounce de 300ms en el input. Resultados paginados con snippet resaltado. Términos < 2 caracteres no disparan request.                                                                                                            | PRD-SANTO-003 |
| FR-SANTO-004 | Santo del día via Motor       | Consulta al Motor Litúrgico la memoria/fiesta para la fecha de hoy; con el resultado consulta al CMS los santos cuya fiesta coincide. Si la fiesta se traslada (ej. cae en un domingo superior), el Motor devuelve la traslación y la app la muestra con nota litúrgica. Si no hay fiesta hoy, estado vacío explicativo. | PRD-SANTO-004 |
| FR-SANTO-005 | Favoritos con Supabase RLS    | `POST /api/favoritos` y `DELETE /api/favoritos/:content_ref` para usuarios con sesión válida (Sistema de Logueo). Persistencia en `santopedia.favorites` con RLS: el usuario solo lee/escribe sus filas. Sin sesión → 401. La colección se expone en `/favoritos` para el usuario dueño.                                 | PRD-SANTO-005 |
| FR-SANTO-006 | RUM                           | Instrumentación vía SDK de Log con eventos `santo.viewed { slug, origen: 'ficha'\|'busqueda'\|'santo_del_dia'\|'listado' }` y `santo.searched { q, resultados, exito }`. Solo tras consentimiento; sin cookies identificativas.                                                                                          | PRD-SANTO-006 |
| FR-SANTO-007 | Reporte de error de contenido | `POST /api/reportes` con `content_ref` (slug del santo), `tipo` (biografía, patronazgo, fiesta, imagen, otro) y `comentario` (max 1000). Insert-only en `santopedia.reports`, anonimizado con `session_hash` (hash salteado de sesión, sin IP ni PII). Confirmación visible al usuario.                                  | PRD-SANTO-007 |
| FR-SANTO-008 | Imágenes webp responsive      | Toda imagen del CMS se sirve en webp con `srcset` responsive (anchos 320/640/960/1280), `sizes` según layout, `loading="lazy"` + `decoding="async"` fuera del viewport, y dimensiones explícitas (width/height) para evitar CLS. Placeholder si el CMS no tiene imagen.                                                  | PRD-SANTO-008 |
| FR-SANTO-009 | SEO con JSON-LD               | Cada ficha emite JSON-LD `schema.org/Person` (name, alternateName, birthDate/deathDate si hay, jobTitle como patronazgo principal, description, image, sameAs). Meta title/description por santo, canonical por slug, sitemap de slugs servido desde el CMS.                                                             | PRD-SANTO-001 |
| FR-SANTO-010 | Consentimiento RUM            | Banner de consentimiento gestionado por la capa compartida del ecosistema; sin consentimiento no se inicializa el SDK RUM y no se envía ningún evento. El consentimiento es revocable.                                                                                                                                   | PRD-SANTO-006 |

## 3. Requisitos no funcionales

| ID            | Categoría              | Requisito                                                                                                                           |
| ------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| NFR-SANTO-001 | Performance            | LCP p75 < 2.5s en ficha; TTFB p95 < 800ms con cache SSR.                                                                            |
| NFR-SANTO-002 | Disponibilidad         | 99.5% mensual. Degradación controlada con cache + banner si CMS o Motor fallan.                                                     |
| NFR-SANTO-003 | Accesibilidad          | WCAG 2.2 AA: contraste, foco visible, navegación por teclado, roles ARIA del buscador (combobox/listbox), alt en imágenes.          |
| NFR-SANTO-004 | Seguridad              | RLS en favoritos; sanitización del rich text del CMS; API keys solo en SSR; rate limiting en reportes. Ver [10-OWASP](10-OWASP.md). |
| NFR-SANTO-005 | Privacidad             | RUM anónimo con consentimiento; reportes sin PII (solo `session_hash` salteado).                                                    |
| NFR-SANTO-006 | Observabilidad         | Eventos RUM `santo.viewed`/`santo.searched`; logs SSR estructurados; alertas por SLO ([11-SLA y SLO](11-SLA%20y%20SLO.md)).         |
| NFR-SANTO-007 | Consistencia litúrgica | La fecha de fiesta proviene SIEMPRE del Motor; prohibido calcular o hardcodear fechas en la app.                                    |
| NFR-SANTO-008 | Mantenibilidad         | Reutilizar `@repo/ui` y tokens compartidos; sin duplicar primitives visuales en la app.                                             |

## 4. Interfaces

| ID           | Interfaz                  | Dirección                 | Contrato                                                                                                                                                                                  |
| ------------ | ------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IR-SANTO-001 | CMS                       | Santopedia → CMS          | `GET /api/content/santo?slug=X`, `GET /api/content/santos?categoria=&siglo=&pais=&page=&pageSize=`, `GET /api/content/santos?q=&page=`, `GET /api/content/santos/fiesta?fecha=YYYY-MM-DD` |
| IR-SANTO-002 | Motor Litúrgico           | Santopedia → Motor        | Consulta de memoria/fiesta por fecha con calendario vigente y traslaciones. Única fuente de la fecha.                                                                                     |
| IR-SANTO-003 | Sistema de Logueo         | Santopedia → Auth         | Validación de sesión (cookie/token), obtención de `user_id`; sin sesión → 401 en favoritos.                                                                                               |
| IR-SANTO-004 | Log (RUM + logs)          | Santopedia → Log          | SDK RUM cliente (consentido) + logs SSR estructurados con request-id.                                                                                                                     |
| IR-SANTO-005 | Supabase (Postgres)       | Santopedia → DB           | Esquema `santopedia`: `favorites`, `reports` con RLS. Server-side únicamente (service role no expuesto).                                                                                  |
| IR-SANTO-006 | Sistema de Notificaciones | CMS → Santopedia (futuro) | Fuera del MVP: avisos de fiesta de favoritos vía notificaciones del ecosistema.                                                                                                           |

## 5. Capacidades compartidas reutilizadas

| Capacidad          | Uso en Santopedia                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| `@repo/ui`         | Cards de santo, header, shell de página, skeleton, estados vacíos, botones, inputs, paginación. |
| Tokens compartidos | `src/packages/tailwind-config/shared-styles.css`; tema claro/oscuro `data-theme`.               |
| Auth compartida    | Sesiones del Sistema de Logueo; guards en `/api/favoritos`.                                     |
| RUM compartida     | SDK de Log, consentimiento y eventos tipados.                                                   |
| Motor Litúrgico    | Resolución de fiesta diaria; contratos de memoria/traslación.                                   |

## 6. Restricciones

- Astro 6 SSR + React 19 + Tailwind v4 + Supabase; monorepo Turborepo.
- El contenido `santo` no se replica ni cachea como fuente de verdad fuera del CMS (el cache SSR es transitorio).
- Sin esquemas fuera de `santopedia` para datos de la app.
- Español único en MVP.

## 7. Criterios de aceptación (nivel SRS)

- CA-SANTO-01: Dado un slug publicado en el CMS, la ficha renderiza todos los campos con fiesta resuelta por el Motor y JSON-LD `Person` válido.
- CA-SANTO-02: Dado `q` con >= 2 caracteres, la búsqueda devuelve resultados con snippet; con < 2 no se emite request.
- CA-SANTO-03: Dado hoy con fiesta asignada por el Motor, `/santo-del-dia` muestra el santo correcto; con traslación, muestra la nota; sin fiesta, muestra estado vacío.
- CA-SANTO-04: Dado un usuario autenticado, puede marcar favorito y solo el puede listar sus favoritos (RLS verificada).
- CA-SANTO-05: Sin consentimiento, no viaja ningún evento RUM; con consentimiento, `santo.viewed` y `santo.searched` se registran.
- CA-SANTO-06: Un reporte se persiste insert-only, sin PII, con confirmación al usuario y queda en cola de revisión editorial.
- CA-SANTO-07: Ante CMS o Motor caídos, la lectura servible sale de cache y la UI muestra estado degradado (banner), sin exponer errores crudos.

## 8. Trazabilidad PRD → SRS

| PRD           | FR                         |
| ------------- | -------------------------- |
| PRD-SANTO-001 | FR-SANTO-001, FR-SANTO-009 |
| PRD-SANTO-002 | FR-SANTO-002               |
| PRD-SANTO-003 | FR-SANTO-003               |
| PRD-SANTO-004 | FR-SANTO-004               |
| PRD-SANTO-005 | FR-SANTO-005               |
| PRD-SANTO-006 | FR-SANTO-006, FR-SANTO-010 |
| PRD-SANTO-007 | FR-SANTO-007               |
| PRD-SANTO-008 | FR-SANTO-008               |

Los FR-SANTO-001 a 010 se verifican con los casos TC-SANTO-001 a 015 de [05-Tests Unitarios](05-Tests%20Unitarios.md) y se detallan comportamentalmente en [03-FRD](03-FRD.md).
