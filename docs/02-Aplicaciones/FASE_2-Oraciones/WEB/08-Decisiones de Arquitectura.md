---
tags:
  - proyecto/fosforo
  - aplicacion
  - oraciones
  - web
  - fase-2
  - adr
  - arquitectura
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[09-Especificacion Tecnica]]"
  - "[[docs/01-Arquitectura/README|Arquitectura]]"
---

# Oraciones - Web - Decisiones de Arquitectura (ADR)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## ADR-ORAC-001 — Contenido SIEMPRE del CMS

- **Estado**: aceptada.
- **Contexto**: la colección es producto del equipo editorial; se necesita corrección rápida y una fuente única para no divergir versiones oracionales.
- **Decisión**: toda oración y taxonomía proviene del CMS vía `GET /api/content/oracion`. Prohibido hardcodear oraciones en la app o guardarlas en la BD de Supabase.
- **Consecuencias**: dependencia operativa del CMS (cache SSR como respaldo); la BD solo guarda referencias (`content_ref`); editorial controla todo el texto sin despliegues de código.

## ADR-ORAC-002 — SSR cacheado por categoría y slug

- **Estado**: aceptada.
- **Contexto**: el tráfico es de búsqueda/navegación y el contenido editorial cambia con poca frecuencia; el rendimiento (LCP < 2.5 s) y los picos virales son sensibles.
- **Decisión**: páginas de listado y ficha se renderizan con Astro SSR y se cachean en CDN con revalidación por contenido (tags `categoria=*`, `oracion=*`). Búsqueda y acciones personales quedan dinámicas.
- **Consecuencias**: TTFB p95 < 800 ms; resistencia a fallas del CMS (última cache válida + banner); la edición del CMS se propaga en el próximo revalidado.

## ADR-ORAC-003 — Colecciones personales en Supabase con RLS

- **Estado**: aceptada.
- **Contexto**: favoritos y colecciones son datos de usuarios con sesión; exigen aislamiento estricto entre cuentas.
- **Decisión**: se persisten en el esquema Supabase `oraciones` (`favorites`, `collections`, `collection_items`, `preferences`) con RLS estricta por `user_id = auth.uid()` y `force row_level_security`; véase 06.
- **Consecuencias**: autorización a nivel de BD, no solo de app; los patches sobre datos personales exigen migraciones revisadas; sin servicio, no hay capa personal pero si lectura pública.

## ADR-ORAC-004 — Modo lectura en localStorage

- **Estado**: aceptada.
- **Contexto**: tema y tamaño de fuente son preferencias de presentación de bajo costo; servirse desde el servidor implicaría consulta extra por SSR para un valor puramente visual.
- **Decisión**: tema y tamaño de fuente se aplican desde `localStorage` (sin FOUC, con script inline temprano); opcionalmente se sincronizan a `preferences` para la cuenta. El recordatorio (dato funcional) sí vive en Supabase.
- **Consecuencias**: preferencia visual funciona incluso sin sesión; servidor nunca procesa PII de la presentación; una limpieza del navegador la borra (aceptable).

## ADR-ORAC-005 — RUM desde el día 1

- **Estado**: aceptada.
- **Contexto**: el KPI principal es DAU y la tasa de búsqueda exitosa; medir tardi significa operar a ciegas durante el lanzamiento.
- **Decisión**: eventos `oracion.viewed` y `oracion.searched` via Sistema de Log desde el primer despliegue, anónimos por diseño (no PII, no texto completo de la consulta).
- **Consecuencias**: da propuesta de valor mensurable en producción; impone disciplina de revisión de payload en cada release (ver ERM-ORAC-004).

## ADR-ORAC-006 — SEO con JSON-LD (schema.org Article)

- **Estado**: aceptada.
- **Contexto**: gran parte del tráfico esperado es orgánico de búsqueda de oraciones específicas.
- **Decisión**: cada ficha de oración incluye JSON-LD `schema.org/Article` (título, texto, notas breadcrumb) + meta título/description generada del contenido del CMS.
- **Consecuencias**: mejor descubrimiento orgánico; el formato JSON-LD es mantenido en el render de la página y sometido a tests (TC-ORAC-003).

## ADR-ORAC-007 — Recordatorios vía Sistema de Notificaciones, no email propio

- **Estado**: aceptada.
- **Contexto**: el envío de notificaciones es una capacidad compartida del ecosistema; levantar un canal propio (SMTP/push propio) duplicaría capacidad y seguridad.
- **Decisión**: la app solo escribe la preferencia (tipo + hora) en `oraciones.preferences` y la registra en Notificaciones; el envío es responsabilidad exclusiva del Sistema de Notificaciones.
- **Consecuencias**: menor superficie de especificación y mantenimiento; la app hereda los SLAs de Notificaciones; requiere contrato estable IR-ORAC-003.

## ADR-ORAC-008 — No duplicar contenido ni visuales

- **Estado**: aceptada.
- **Contexto**: `@repo/ui` y el CMS ya proveen primitives visuales y contenido; duplicar crearía divergencia entre apps del ecosistema.
- **Decisión**: la app consume `@repo/ui` (cards, shells, filtros, artículos, estados vacíos, paginación) y el design tokens de `src/packages/tailwind-config/shared-styles.css`; el CSS local de `oraciones` queda restringido a reglas estrictamente de dominio. El contenido editorial, idem (ver ADR-ORAC-001).
- **Consecuencias**: consistencia visual del ecosistema; eventos de app se centralizan en `@repo/ui`; cualquier primitive nueva se implementa primero en el paquete compartido.
