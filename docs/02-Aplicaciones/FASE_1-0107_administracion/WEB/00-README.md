---
tags:
  - proyecto/fosforo
  - administracion
  - aplicacion
type: app-readme
area: aplicaciones
status: vigente
created: 2026-05-27
updated: 2026-06-19
related:
  - "[[../00-README|Indice de aplicaciones]]"
  - "[[../../00-General/04-Listado-de-Aplicaciones|Listado de aplicaciones]]"
---

# 0107_administracion

## Metadatos

- Plataforma: WEB
- Estado: vigente
- Owner producto: Ivan Ezequiel Iencinella
- Owner tecnico: Ivan Ezequiel Iencinella
- QA owner: Ivan Ezequiel Iencinella
- Seguridad owner: Ivan Ezequiel Iencinella
- Fecha ultima actualizacion: 2026-06-19

## Descripcion

Panel de administracion central del ecosistema Fosforo. Permite gestionar la informacion critica que consumen otras aplicaciones: iglesias, horarios de celebraciones, usuarios, contenido liturgico y metricas del ecosistema. Actua como superficie de control para operadores y administradores, consolidando en un unico punto la gestion de datos maestros del sistema.

Esta aplicacion no tiene un alcance MVP cerrado: su desarrollo se dara en paralelo al de otras aplicaciones y su alcance se ira ampliando a medida que se identifiquen nuevas necesidades de gestion.

## Validacion de la idea

- [VALIDACION_1] Un administrador debe poder crear, editar y desactivar iglesias sin intervencion tecnica.
- [VALIDACION_2] Un operador debe poder consultar y modificar horarios de misas desde el panel.
- [VALIDACION_3] El dashboard debe reflejar metricas basicas del ecosistema en tiempo real.

## Arquitectura

- **Frontend:** Astro 6 SSR + React 19 islands (AdminNav, ThemeToggle) + Tailwind CSS + CSS custom properties de `@repo/ui/foundation.css`
- **Backend:** Astro API routes server-side + Supabase Auth directo con cookies de sesion personalizadas (`admin_session`)
- **Datos:** Supabase PostgreSQL con esquema compartido (churches, celebration_schedules, admin_users, admin_audit_log)
- **Integracion:** Supabase Auth para autenticacion, control de acceso por roles (admin/editor/viewer) via tabla `admin_users`, `@repo/api-utils` para helpers API compartidos

## Estado de implementacion

- **Completado:** Workspace `src/apps/administracion/` funcional con CRUD de iglesias, gestion de horarios, dashboard con metricas, autenticacion con roles (admin/editor/viewer), auditoria de operaciones y esquema Supabase completo
- **En curso:** Ampliacion de modulos a medida que crece el ecosistema (gestion de contenido, notificaciones)
- **Pendiente:** Tests unitarios automatizados (matriz definida en 05-Tests Unitarios.md, pendiente de implementacion)

## Ubicacion del codigo

- App: `src/apps/administracion/`
- Componentes: `src/apps/administracion/src/components/`
- Estilos: `src/packages/ui/`, `src/packages/tailwind-config/shared-styles.css`, `src/apps/administracion/src/styles/`
- Contenido: `src/apps/administracion/src/content/`
- API: `src/apps/administracion/src/pages/api/`

## Alcance MVP

- Modulo de gestion de iglesias/templos (CRUD + datos de contacto + geolocalizacion)
- Modulo de gestion de horarios de celebraciones (asociados a iglesias)
- Dashboard general con metricas del ecosistema (iglesias activas, horarios registrados, actividad reciente)

## No alcance MVP

- Gestion avanzada de usuarios y roles (se integrara con la app Gestion de Usuarios existente)
- Gestion de contenido liturgico (calendario, lecturas)
- Automatizacion de notificaciones
- Reportes avanzados o exportacion de datos

## KPI principal

- Porcentaje de iglesias del ecosistema con horarios completeados desde el panel
- Tiempo medio entre creacion de una iglesia y asignacion de horarios
- Tasa de adopcion del panel entre operadores habilitados

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------- |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | vigente |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | vigente |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | vigente |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | vigente |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | vigente |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificacion Tecnica](09-Especificaci%C3%B3n%20Tecnica.md)      | vigente |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | vigente |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | vigente |

## Documentos complementarios

| Documento                                                        | Descripcion                                               | Estado  |
| ---------------------------------------------------------------- | --------------------------------------------------------- | ------- |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)                    | Pruebas unitarias y de integracion para modulos del panel | vigente |
| [09-Especificacion Tecnica](09-Especificaci%C3%B3n%20Tecnica.md) | Detalle tecnico de implementacion, componentes y APIs     | vigente |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboracion y mantenimiento de la documentacion de la app.
