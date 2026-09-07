---
tags:
  - proyecto/fosforo
  - srs
  - plataforma
  - catalogo
type: catalogo-capacidades
area: plataforma
status: draft
created: 2026-03-07
updated: 2026-09-05
related:
  - "[[README|Indice componentes compartidos]]"
---

# Catalogo de Capacidades Compartidas

## Objetivo

Definir las capacidades reutilizables del ecosistema, sus consumidores esperados y el tipo de contrato que requieren antes de construirse.

## Catalogo inicial

| Capacidad                          | Tipo                | Consumidores principales                                       | Resultado esperado                                  |
| ---------------------------------- | ------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| Identidad y acceso                 | Servicio + paquete  | Portal, apps autenticadas, admin                               | SSO, roles, sesiones y auditoria consistentes       |
| Datos y taxonomias compartidas     | Modelo + contratos  | Contenido, comúnidad, buscador, chatbot                        | Interoperabilidad y IDs consistentes                |
| Notificaciónes y plantillas        | Servicio            | Agenda, Carisma, Donaciónes, Portal, Peticionario, Emprendedor | Entregas multicanal con preferencias y trazabilidad |
| Búsqueda y conocimiento compartido | Servicio + pipeline | Buscador, Chatbot, Portal, apps de contenido                   | Descubrimiento unificado e indexación segura        |
| Pagos y transacciones              | Servicio + SDK      | Donaciónes, Emprendedor, Peticionario                          | Cobros reutilizables, comprobantes y conciliación   |
| Observabilidad y auditoria         | Servicio + esquema  | Todas las apps                                                 | Logs, metricas, alertas y trazabilidad operativa    |
| Design system y navegación global  | Paquetes UI + shell | Web, mobile, desktop, Portal                                   | Consistencia visual y de navegación cross-app       |

## Regla de adopcion

Una funcionalidad debe formalizarse como componente compartido cuando cumpla al menos dos de las siguientes condiciones:

- La consumen o la consumiran dos o mas aplicaciónes.
- Requiere contratos o politicas unificadas a nivel ecosistema.
- Su mantenimiento aislado por aplicación aumenta riesgo operativo o inconsistencia de UX.
- Su dominio exige seguridad, auditoria o compliance común.

## Mapeo con paquetes y documentación de apps (estado 2026-09-05)

| Capacidad                          | Paquetes activos relaciónados                                 | Documentación de app asociada                                                     | Estado   |
| ---------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------- |
| Identidad y acceso                 | `@repo/mobile-auth-client`                                    | `FASE_1-Sistema-de-Logueo/WEB` (draft)                                            | Draft    |
| Datos y taxonomias compartidas     | `@repo/api-utils`                                             | Sin app dedicada; consumida por CMS y Motor Liturgico                             | Draft    |
| Notificaciónes y plantillas        | `notification-core` (shell vacio, sin implementación)         | `FASE_2-Sistema-de-Notificaciones/WEB` (draft)                                    | Draft    |
| Búsqueda y conocimiento compartido | Sin paquete implementado hoy                                  | Sin app dedicada; Santopedia la declara como dependencia futura                   | Objetivo |
| Pagos y transacciones              | Sin paquete implementado hoy                                  | Sin app asociada                                                                  | Objetivo |
| Observabilidad y auditoria         | `@repo/api-utils/log-client` (SDK de ingesta)                 | `FASE_1-0105_log/WEB` (vigente; extendida a RUM y analiticas en draft 2026-09-05) | Vigente  |
| Design system y navegación global  | `@repo/ui`, `@repo/tailwind-config`                           | Transversal; sin app dedicada                                                     | Vigente  |
| Tooling de workspace               | `@repo/eslint-config`, `@repo/typescript-config`, `@repo/env` | Transversal; sin app dedicada                                                     | Vigente  |

## Observaciónes del estado actual

- El repositorio ya tiene paquetes compartidos técnicos y de UI activos en `src/packages/`.
- Las capacidades Identidad, Notificaciones y Contenidos/Motor tienen documentación de app en estado draft desde 2026-09-05 (ver `docs/plans/2026-09-05-plan-maestro-fase-2-ecosistema.md`).
- `notification-core` es un shell sin código fuente; su implementación queda pendiente según el SRS y la app `Sistema de Notificaciones`.
- `@repo/eslint-config` y `@repo/typescript-config` son capacidades de tooling del monorepo; no reemplazan SRS funcionales, pero si deben considerarse activos compartidos vigentes.
