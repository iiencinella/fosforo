---
tags:
  - proyecto/fosforo
  - portal
  - aplicación
type: app-readme
area: aplicaciónes
status: vigente
created: 2026-05-08
updated: 2026-05-09
related:
  - "[[../00-README|Indice de aplicaciónes]]"
---

# 0101 Portal

## Metadatos

- Plataforma: WEB
- Estado: vigente
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-05-09

## Descripcion

0101 Portal es la puerta de entrada web al ecosistema Fósforo durante la Fase 1. Centraliza el acceso a las aplicaciónes disponibles, muestra su estado de madurez, publica novedades relaciónadas con el ecosistema y concentra los canales de contacto y colaboración.

El portal debe servir tanto a usuarios finales como a contribuidores: permite descubrir aplicaciónes, entender si una app ya está disponible o en construcción, enviar consultas de soporte, compartir ideas y feedback, y derivar las sugerencias técnicas hacia pull requests sobre el repositorio del ecosistema.

## Validación de la idea

- La Fase 1 del ecosistema necesita un punto de entrada unificado para evitar fragmentación entre apps y capacidades compartidas.
- El portal valida el interés real sobre las aplicaciónes del ecosistema midiendo descubrimiento, clics salientes y envíos de formularios.
- El portal concentra señales de soporte, feedback y colaboración que sirven para priorizar roadmap, documentación e implementación.

## Arquitectura

- **Frontend:** Astro + Tailwind CSS
- **Backend:** API Endpoint Astro + Node.js
- **Datos:** Supabase DB + archivos versionados del repo para novedades MVP
- **Integración:** Vercel

## Estado de implementación

- **Completado:** scaffolding documental y workspace web base en `src/apps/portal/` con landing, catálogo, novedades, contacto, feedback y guía para desarrolladores. Integración server-side con Supabase para persistencia de envíos y auditoría (tablas `portal_contact_requests`, `portal_feedback_items`, `portal_submission_audit` creadas y aplicadas en producción). Rate limiting de formularios de contacto y feedback (5 req/min por IP, ventana fija). Health endpoint resiliente: sin configuración de Supabase degrada a 503 en lugar de fallar con 500.
- **En curso:** cierre operativo del despliegue (variables `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` en Vercel; el health en producción reporta degradado hasta configurarlas).
- **Pendiente:** anti-abuso distribuido (el limitador actual es en memoria por instancia de serverless), pruebas de integración E2E de formularios y observabilidad operativa (runbook disponible, alertas por conectar al panel de Log).

Detalle del proceso: [13-Runbook-Operativo](13-Runbook-Operativo.md).

## Ubicación del codigo

- App: `src/apps/portal/` (implementada en progreso para MVP)
- Componentes: `src/apps/portal/src/components/`
- Estilos: `src/packages/ui/`, `src/packages/tailwind-config/shared-styles.css` y `src/apps/portal/src/styles/`
- Contenido: `src/apps/portal/src/content/` para novedades manuales y catálogo de apps versionado del MVP
- API: `src/apps/portal/src/pages/api/`

## Alcance MVP

- Mostrar catálogo de aplicaciónes del ecosistema con estado, resumen breve, detalle Markdown versionado y enlaces de acceso cuando existan.
- Publicar noticias o novedades relaciónadas con apps, roadmap o hitos del ecosistema.
- Exponer formularios para contacto/soporte e ideas/feedback general, y orientar las sugerencias técnicas a través de pull requests al repositorio.
- Registrar envíos y eventos básicos para seguimiento operativo y priorización de mejoras.

## No alcance MVP

- Personalización avanzada por usuario, dashboard autenticado y recomendaciónes cross-app.
- Moderación automatizada, workflows editoriales complejos y gestión colaborativa avanzada tipo foro o issue tracker público.
- Integraciónes profundas con sistemas externos de terceros más allá del envío de sugerencias o enlaces de referencia.

## KPI principal

- KPI principal: porcentaje de visitantes que descubren y navegan hacia al menos una aplicación del ecosistema desde el portal.
- KPI secundario 1: tasa de envío exitoso de formularios de contacto, feedback o contribución.
- KPI secundario 2: cantidad mensual de aportes útiles para roadmap, documentación o correcciones técnicas.

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------- |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | vigente |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | vigente |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | vigente |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | vigente |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | vigente |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificación Tecnica](09-Especificación%20Tecnica.md)           | vigente |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | vigente |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | vigente |

## Documentos complementarios

| Documento                                                   | Descripcion                                                                                     | Estado  |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------- |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)               | Estrategia de validación de reglas, formularios, servicios y trazabilidad funcional del portal. | vigente |
| [09-Especificación Tecnica](09-Especificación%20Tecnica.md) | Definicion de stack, modulos, endpoints, contratos y estructura esperada del workspace web.     | vigente |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
- La decision de MVP es mantener formularios publicos con controles anti-spam, validación server-side y moderación operativa.
