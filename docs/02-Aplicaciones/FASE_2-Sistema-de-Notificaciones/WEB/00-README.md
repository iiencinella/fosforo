---
tags:
  - proyecto/fosforo
  - aplicacion
  - notificaciones
  - plantillas
  - multicanal
type: app-readme
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[../00-README|Indice de aplicaciones]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Notificaciones-y-Plantillas|SRS Notificaciones]]"
---

# Sistema de Notificaciones

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Metadatos

- Plataforma: WEB
- Estado: draft
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-09-05

## Descripcion

El Sistema de Notificaciones es el servicio transversal de notificaciones del ecosistema Fósforo. Orquesta envíos multicanal (email, push, in-app), plantillas versionadas, preferencias de usuario por canal y categoría, cola de envíos con reintentos y trazabilidad por mensaje. Es consumido por todas las apps del ecosistema via eventos o API REST.

Se integra con el Sistema de Logueo (Auth) para validar identidad y permisos de quien solicita envíos, y con la app Log (RUM) para observabilidad de entregas, fallos y latencia. Las apps consumidoras (CMS, Misal, Oraciones, etc.) disparan notificaciones mediante `POST /api/notifications` o eventos, sin necesidad de implementar lógica de canales, plantillas o preferencias.

## Validación de la idea

- Todas las apps del ecosistema necesitan notificar a usuarios (recordatorios de oración, alertas litúrgicas, confirmaciones de publicación, comprobantes de donación).
- Sin un servicio centralizado, cada app duplica lógica de email/push, plantillas, preferencias y manejo de reintentos, generando inconsistencias y deuda técnica.
- Un servicio compartido unifica preferencias de usuario, plantillas versionadas, trazabilidad por mensaje y una cola de envíos con backoff exponencial, reduciendo duplicación y mejorando la entrega.

## Arquitectura

- **Frontend:** Astro 6 SSR + React 19 + Tailwind CSS v4 + `@repo/ui` (componentes compartidos del ecosistema).
- **Backend:** Supabase Edge Functions para envíos async (email, push, in-app); Astro 6 SSR para endpoints de API y panel de administración.
- **Datos:** Supabase PostgreSQL con RLS (Row Level Security) en `notification_templates`, `notification_events`, `notification_preferences`, `notification_queue`.
- **Integración:** Sistema de Logueo (Auth para validar solicitudes y permisos), app Log (RUM para observabilidad de envíos), apps consumidoras via API REST y `@repo/notification-core` (SDK compartido).

## Estado de implementación

- **Completado:** Sin implementación de código. El paquete `src/packages/notification-core` existe como shell vacío sin lógica.
- **En curso:** Documentación de la app dedicada (draft 2026-09-05).
- **Pendiente:** App dedicada en `src/apps/notificaciones/`, implementación de `notification-core`, endpoints de API, plantillas, cola de envíos, preferencias, trazabilidad, tests unitarios y de integración.

## Ubicación del codigo

- App: `src/apps/notificaciones/`
- Componentes: `src/apps/notificaciones/src/components/`
- Estilos: `src/packages/tailwind-config/shared-styles.css` + `@repo/ui`
- Contenido: `src/apps/notificaciones/src/pages/`
- API: `src/apps/notificaciones/src/pages/api/notifications/`
- Paquete compartido: `src/packages/notification-core/`
- Edge Functions (envíos): Supabase Edge Functions desplegadas en el proyecto de Supabase.

## Alcance MVP

- Plantillas versionadas con variables (Mustache/Handlebars) por canal (email, push, in-app).
- Envío multicanal: email, push web, in-app (notificación en la UI del ecosistema).
- Preferencias por usuario: opt-in/opt-out por canal y categoría.
- Cola de envíos con reintentos (máximo 3) y backoff exponencial.
- Trazabilidad por mensaje: pendiente, enviado, entregado, fallido, abierto.
- API de eventos `POST /api/notifications` con payload validado e idempotencia por `event_id`.
- Panel de administración de plantillas (crear, versionar, publicar) para editores/admin.
- Integración RUM con app Log para observabilidad de envíos.

## No alcance MVP

- Automatizaciones de marketing (drip campaigns, segmentación dinámica, journeys).
- A/B testing de plantillas.
- Push nativo mobile (FCM/APNs) — post-MVP, el MVP cubre push web.
- SMS como canal de envío — post-MVP.
- Plantillas multidioma con traducción automática — post-MVP (soporte de plantillas por idioma manual sí está en alcance).
- Programación de envíos recurrentes (cron propio del Sistema de Notificaciones) — post-MVP.

## KPI principal

- Tasa de entrega de email > 98% (mensajes enviados vs. entregados).
- Latencia de envío < 30s (desde encolado hasta envío al proveedor del canal).
- 0 preferencias de usuario ignoradas (todo envío respeta opt-in/opt-out del usuario).
- Tasa de apertura de email > 20% (tracking de `opened` en trazabilidad).

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | draft  |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | draft  |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | draft  |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | draft  |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | draft  |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificación Tecnica](09-Especificaci%C3%B3n%20Tecnica.md)      | draft  |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | draft  |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | draft  |

## Documentos complementarios

| Documento                                                        | Descripcion                                                 | Estado |
| ---------------------------------------------------------------- | ----------------------------------------------------------- | ------ |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)                    | Matriz de pruebas unitarias y de integración por requisito. | draft  |
| [09-Especificación Tecnica](09-Especificaci%C3%B3n%20Tecnica.md) | Stack, módulos, endpoints y consideraciones UI/UX.          | draft  |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
- El SRS de referencia transversal está en `docs/01-Arquitectura/Capacidades Compartidas/SRS-Notificaciones-y-Plantillas.md`.
