---
tags:
  - proyecto/fosforo
  - biblia
  - aplicación
type: app-readme
area: aplicaciónes
status: vigente
created: 2026-05-18
updated: 2026-08-14
related:
  - "[[../00-README|Indice de aplicaciónes]]"
---

# 0102_biblia

## Metadatos

- Plataforma: WEB
- Estado: vigente
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-08-14

## Descripcion

0102 Biblia es una aplicación web del ecosistema Fósforo para lectura bíblica por libro/capítulo/versículo, búsqueda textual y consulta de lecturas del día según calendario litúrgico católico.

En Fase 1 se documenta y prepara un MVP de uso interno con contenido en Supabase y un modelo abierto a múltiples versiones, habilitando inicialmente una sola versión activa. La app se diseña para escalar a favoritos, listas personales, contenido para niños/adolescentes y tarjetas para compartir en fases posteriores.

## Validación de la idea

- Existe una necesidad clara de un punto de lectura bíblica centralizado dentro del ecosistema, con navegación simple y búsqueda rápida.
- La integración con lecturas del día agrega valor pastoral y de uso frecuente más allá de la consulta puntual de versículos.
- Un catálogo abierto de versiones en Supabase permite crecer por fases sin rediseñar el modelo de datos.

## Arquitectura

- **Frontend:** Astro + TypeScript + Tailwind CSS v4 (islas React para interacción avanzada)
- **Backend:** API Endpoints Astro (BFF) con servicio server-side de catálogo de versiones
- **Datos:** Supabase PostgreSQL
- **Integración:** Vercel (inlineStylesheets habilitado)
- **Estilos:** `@repo/ui` + `@repo/tailwind-config` + scope de app vía `biblia-theme`

## Estado de implementación

- **Completado:** scaffold documental, workspace base, vista única consolidada (Lectura/Búsqueda/Liturgia) en 100dvh sin scroll, primitives Modal y Carousel en `@repo/ui`, endpoints BFF con validación de versión, catálogo server-side de versiones, protección auth del endpoint de ingestion e integración con Tailwind CSS v4 y `@repo/ui`. Página de estado operativo independiente. Widget embebible del evangelio del día vía iframe (`/widget/gospel`). Página de compartir (`/compartir`) con botones de redes sociales (Facebook, X/Twitter, LinkedIn, WhatsApp), copiar enlace, Web Share API nativa, vista previa de OG card y soporte de fecha por query param. Imagen OG (`og-biblia.png`) con script de generación automática (`sharp`). Scripts de extracción de lecturas litúrgicas desde EWTN.
- **En curso:** endurecimiento de contratos de ingestion automática y cobertura de tests unitarios.
- **Pendiente:** ingestion automática de contenido bíblico vía endpoint interno, multi-versión activa, publicación pública y features post-MVP.

## Ubicación del codigo

- App: `src/apps/biblia/`
- Componentes: `src/apps/biblia/src/components/` (BibleHub.tsx re-exporta PortalBibleHub desde @repo/ui)
- Estilos: `src/packages/ui/overlays.css` (Modal, Carousel), `src/apps/biblia/src/styles/biblia-hub.css`, `src/packages/tailwind-config/shared-styles.css`
- Scripts: `src/apps/biblia/scripts/` (generación de imagen OG, extracción de lecturas desde EWTN)
- Contenido: Supabase PostgreSQL (texto bíblico y lecturas litúrgicas para MVP interno)
- API: `src/apps/biblia/src/pages/api/`

## Alcance MVP

- Lectura de Biblia por versión activa, libro, capítulo y versículo.
- Búsqueda textual simple por palabras clave con resultados por referencia bíblica y selector de versión.
- Lecturas del día desde datos cargados manualmente en Supabase (Rito Romano Argentina).
- Catálogo de versiones modelado en Supabase con una sola versión habilitada para uso interno y servicio server-side con fallback a datos locales.
- Endpoint de ingestion protegido con validación de clave interna (`BIBLIA_INTERNAL_INGESTION_KEY`) vía header o Bearer token.
- Página de estado operativo con métricas locales, catálogo en Supabase y metadata litúrgica.

## No alcance MVP

- Lanzamiento público de contenido LPD sin licencia explícita de distribución.
- Favoritos, listas personalizadas, tarjetas para redes sociales y perfiles de usuario.
- Sección para niños/adolescentes con juegos, historias y actividades.

## KPI principal

- KPI principal: porcentaje de consultas de lectura/búsqueda resueltas con éxito en entorno interno.
- KPI secundario 1: latencia p95 de búsqueda bíblica en rangos aceptables para lectura fluida.
- KPI secundario 2: cobertura de lecturas litúrgicas cargadas para el período operativo definido.

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
| [05-Tests Unitarios](05-Tests%20Unitarios.md)               | Estrategia de pruebas unitarias para servicios de lectura, búsqueda y liturgia. | vigente |
| [09-Especificación Tecnica](09-Especificacion%20Tecnica.md) | Definición de stack, módulos, endpoints y decisiones de implementación.         | vigente |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
- El MVP queda definido como interno y no público por restricción de licencia de "El Libro del Pueblo de Dios".
- En una fase posterior, las lecturas litúrgicas se integrarán con una app de calendario dedicada del ecosistema.
