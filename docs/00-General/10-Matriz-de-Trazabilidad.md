---
tags:
  - proyecto/fosforo
  - trazabilidad
  - matriz
type: matriz-trazabilidad
area: general
status: vigente
created: 2026-03-07
updated: 2026-04-05
related:
  - "[[README|Indice de documentación]]"
  - "[[06-PRD-Maestro|PRD Maestro]]"
  - "[[07-SRS-Maestro|SRS Maestro]]"
  - "[[08-FRD-Maestro|FRD Maestro]]"
  - "[[../02-Aplicaciones/00-README|Indice de aplicaciónes]]"
---

# Matriz de Trazabilidad

## Objetivo

Esta matriz conecta la documentación general del ecosistema con la documentación interna de cada aplicación.

## Trazabilidad global

| Nivel                  | Documento                                                          | Proposito                                                      |
| ---------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| Vision de producto     | [06-PRD Maestro.md](06-PRD%20Maestro.md)                           | Define alcance, objetivos, fases y dependencias del ecosistema |
| Requisitos de software | [07-SRS Maestro.md](07-SRS%20Maestro.md)                           | Traduce la vision a requisitos verificables                    |
| Requisitos funcionales | [08-FRD Maestro.md](08-FRD%20Maestro.md)                           | Consolida capacidades funcionales transversales                |
| Arquitectura           | [../01-Arquitectura/README.md](../01-Arquitectura/README.md)       | Describe plataforma, monorepo y decisiones técnicas            |
| Aplicaciones           | [../02-Aplicaciones/00-README.md](../02-Aplicaciones/00-README.md) | Centraliza la documentación por app                            |

## Trazabilidad por aplicación

Cada aplicación debe mantener esta estructura minima:

```text
02-Aplicaciones/[App]/
├── 00-README.md
├── 01-PRD.md
├── 02-SRS.md
├── 03-FRD.md
├── 04-Flujos y Secuencias.md
├── 05-Tests Unitarios.md
├── 06-Esquema de Datos.md
├── 07-ERM.md
├── 08-Decisiones de Arquitectura.md
├── 09-Especificación Tecnica.md
├── 10-OWASP.md
└── 11-SLA y SLO.md
```

### Dependencias documentales por app

| Documento                              | Se basa en                         | Genera                             |
| -------------------------------------- | ---------------------------------- | ---------------------------------- |
| `01-PRD.md`                            | Idea                               | `02-SRS.md`                        |
| `02-SRS.md`                            | `01-PRD.md`                        | `03-FRD.md`                        |
| `03-FRD.md`                            | `02-SRS.md`                        | `04-Flujos y Secuencias.md`        |
| `04-Flujos y Secuencias.md`            | `03-FRD.md`                        | `05-Tests Unitarios.md`            |
| `06-Esquema de Datos.md` / `07-ERM.md` | `02-SRS.md`                        | `08-Decisiones de Arquitectura.md` |
| `08-Decisiones de Arquitectura.md`     | `02-SRS.md` + `03-FRD.md`          | `09-Especificación Tecnica.md`     |
| `10-OWASP.md`                          | `08-Decisiones de Arquitectura.md` | Definiciones tecnicas y controles  |
| `11-SLA y SLO.md`                      | `01-PRD.md`                        | Definiciones tecnicas y operativas |

## Regla de lectura

Para humanos e IAs, la regla base es seguir el prefijo numerico de menor a mayor. La interpretación recomendada es:

1. `00-README.md`: contexto y mapa documental.
2. `01-PRD.md`: objetivo y alcance.
3. `02-SRS.md`: requisitos verificables.
4. `03-FRD.md`: comportamiento funcional.
5. `04-Flujos y Secuencias.md`: recorridos y escenarios.
6. `05-Tests Unitarios.md`: validación funcional minima.
7. `06-Esquema de Datos.md`: modelo de datos.
8. `07-ERM.md`: riesgos, errores y continuidad.
9. `08-Decisiones de Arquitectura.md`: decisiones clave.
10. `09-Especificación Tecnica.md`: implementación tecnica.
11. `10-OWASP.md`: seguridad aplicada.
12. `11-SLA y SLO.md`: operación y compromisos de servicio.
