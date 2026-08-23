---
tags:
  - proyecto/fosforo
  - portal
  - arquitectura
  - especificación-tecnica
  - aplicación
type: app-tech-spec
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-08
related:
  - "[[00-README|0101 Portal]]"
---

# Especificación Tecnica - 0101 Portal

## Herramientas y tecnologias

- Plataforma: WEB
- Framework principal: Astro para routing, render híbrido y endpoints.
- Lenguaje principal: TypeScript.
- Herramientas de build: Astro build, pnpm y Turborepo.
- Testing: Vitest para lógica y componentes aislados; tests de integración/smoke a definir cuando exista workspace.

## Arquitectura tecnica

- Patrón de arquitectura: web app por capas con páginas Astro, componentes UI reutilizables, servicios de aplicación y endpoints server-side.
- Modulos principales: `home/catalog`, `news`, `contact`, `feedback`, `developer-guide`, `error-pages`, `api`, `observability`, `shared-ui`.
- Dependencias compartidas: `@repo/ui`, `@repo/tailwind-config`, contratos utilitarios compartidos y futuras capacidades de observabilidad/autenticación del ecosistema.

## Modelos de datos

- Modelo 1: catálogo de aplicaciónes manual en `src/content/apps-catalog/` con frontmatter versionado (`slug`, `name`, `resume`, `category`, `status`) y cuerpo Markdown por app.
- Modelo 2: novedades editoriales manuales en `src/content/novedades/` con frontmatter versionado (`titulo`, `slug`, `autor`, `fecha_creación`, `fecha_modificación`, `tags`) y cuerpo Markdown.
- Modelo 3: modelos de envíos (`portal_contact_requests`, `portal_feedback_items`) y auditoría de procesamiento (`portal_submission_audit`).
- La escritura de los modelos de envíos se realiza únicamente desde endpoints server-side mediante `SUPABASE_SERVICE_ROLE_KEY`; las claves privilegiadas nunca se exponen al navegador.
- El catálogo y las novedades continúan siendo contenido versionado en Git durante el MVP; `portal_app_registry` queda reservado para una futura necesidad de administración operativa y no se usa como segunda fuente de verdad.

## Endpoints (si aplica)

| Metodo | Ruta            | Proposito                                                                                      |
| ------ | --------------- | ---------------------------------------------------------------------------------------------- |
| GET    | `/api/apps`     | Devolver el catálogo público de aplicaciónes visibles en el portal desde contenido versionado. |
| POST   | `/api/contact`  | Recibir consultas de soporte o contacto general.                                               |
| POST   | `/api/feedback` | Recibir ideas, sugerencias o feedback general.                                                 |
| GET    | `/api/health`   | Exponer salud básica y versión desplegada del portal.                                          |

Los endpoints de escritura persisten primero el envío y su evento `created` en `portal_submission_audit`. Un resultado exitoso sólo se devuelve después de completar ambas operaciones. Resend se ejecuta como notificación opcional posterior y no reemplaza la persistencia.

El catálogo y las novedades del MVP pueden renderizarse directamente desde archivos locales sin endpoint dedicado adicional, salvo que en implementación se justifique exponer rutas de lectura internas.

La colaboración técnica del MVP no requiere endpoint propio: el portal debe enlazar al repositorio y a la guía de contribución para que el aporte se materialice mediante pull request.

## Consideraciónes UI/UX

- Navegación principal: landing con acceso visible a catálogo, novedades, soporte y colaboración, reutilizando shell del ecosistema y patrón móvil con hamburguesa.
- Estados de interfaz (loading/empty/error/success): skeleton, vacío informativo, error recuperable y confirmación breve coherentes con el ecosistema.
- Error pages: la experiencia pública incluye `src/pages/404.astro` con shell compartido, CTAs de recuperación y acceso directo a inicio, catálogo, novedades y contacto.
- Accesibilidad base: foco visible, navegación por teclado, labels explícitos en formularios, contraste AA y soporte a `prefers-reduced-motion`.
