---
tags:
  - proyecto/fosforo
  - plantilla
  - aplicación
type: plantilla-app
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-04-17
related:
  - "[[../00-README|Indice de aplicaciónes]]"
---

# [NOMBRE_APP]

## Metadatos

- Plataforma: [WEB|MOVIL|DESKTOP]
- Estado: [draft|vigente|completado]
- Owner producto: [NOMBRE]
- Owner tecnico: [NOMBRE]
- QA owner: [NOMBRE]
- Seguridad owner: [NOMBRE]
- Fecha ultima actualización: [YYYY-MM-DD]

## Descripcion

[DESCRIBIR_PROPOSITO_DE_LA_APP_EN_EL_ECOSISTEMA]

## Validación de la idea

- [VALIDACION_1]
- [VALIDACION_2]
- [VALIDACION_3]

## Arquitectura

- **Frontend:** [DESCRIBIR]
- **Backend:** [DESCRIBIR]
- **Datos:** [DESCRIBIR]
- **Integración:** [DESCRIBIR]

## Estado de implementación

- **Completado:** [DESCRIBIR]
- **En curso:** [DESCRIBIR]
- **Pendiente:** [DESCRIBIR]

## Ubicación del codigo

- App: `[RUTA_APP]`
- Componentes: `[RUTA_COMPONENTES]`
- Estilos: `[RUTA_ESTILOS]`
- Contenido: `[RUTA_CONTENIDO]`
- API: `[RUTA_API]`

## Alcance MVP

- [FUNCIONALIDAD_MVP_1]
- [FUNCIONALIDAD_MVP_2]
- [FUNCIONALIDAD_MVP_3]

## No alcance MVP

- [NO_ALCANCE_1]
- [NO_ALCANCE_2]

## KPI principal

- [KPI_PRINCIPAL]
- [KPI_SECUNDARIO_1]

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------- |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | vigente |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | vigente |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | vigente |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | vigente |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | vigente |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificación Tecnica](09-Especificaci%C3%B3n%20Tecnica.md)      | vigente |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | vigente |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | vigente |

## Documentos complementarios

| Documento                                                        | Descripcion | Estado  |
| ---------------------------------------------------------------- | ----------- | ------- |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)                    | [DESCRIBIR] | vigente |
| [09-Especificación Tecnica](09-Especificaci%C3%B3n%20Tecnica.md) | [DESCRIBIR] | vigente |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
