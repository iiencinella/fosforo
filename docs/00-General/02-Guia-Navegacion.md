---
tags:
  - proyecto/fosforo
  - navegación
  - guia
type: guia-navegación
area: general
status: vigente
created: 2026-03-07
updated: 2026-05-06
related:
  - "[[README|Indice de documentación]]"
  - "[[01-Guia-Lectura-Desarrolladores-e-IA|Guia de Lectura]]"
---

# Guia de Navegación

## Inicio recomendado para developers e IA

- [Guia de Lectura para Desarrolladores e IA](01-Guia-Lectura-Desarrolladores-e-IA.md)

## Lectura recomendada

1. `00-General/`
2. `01-Arquitectura/`
3. `02-Aplicaciones/`

## Regla para documentación por app

- El prefijo numerico define el orden oficial de lectura, elaboración y mantenimiento.
- Para humanos e IAs, la ruta base por app es `00-README.md` -> `01-PRD.md` -> `02-SRS.md` -> `03-FRD.md` -> `04-Flujos y Secuencias.md` -> `05-Tests Unitarios.md` -> `06-Esquema de Datos.md` -> `07-ERM.md` -> `08-Decisiones de Arquitectura.md` -> `09-Especificación Tecnica.md` -> `10-OWASP.md` -> `11-SLA y SLO.md`.

## Si buscas contexto

- [Indice General](03-Indice-General.md)
- [PRD Maestro](06-PRD-Maestro.md)
- [SRS Maestro](07-SRS-Maestro.md)
- [FRD Maestro](08-FRD-Maestro.md)

## Si buscas arquitectura

- [Arquitectura](../01-Arquitectura/README.md)
- [Estructura Monorepo](../01-Arquitectura/Estructura%20Monorepo.md)
- [Arquitectura Web](../01-Arquitectura/Arquitectura%20Web.md)
- [Arquitectura Mobile](../01-Arquitectura/Arquitectura%20Mobile.md)
- [Arquitectura Desktop](../01-Arquitectura/Arquitectura%20Desktop.md)

## Si buscas una aplicación

- [Listado de Aplicaciones](04-Listado-de-Aplicaciones.md)
- [Indice de aplicaciónes](../02-Aplicaciones/00-README.md)
- [Plantilla base por app](../02-Aplicaciones/_Plantilla-App/00-README.md)

## Si vas a mantener indices documentales

- Regenerar estado de apps: `pnpm docs:sync-app-status`
- Crear nueva documentación de app: `pnpm docs:new-app --fase <N> --plataforma <WEB|MOVIL|DESKTOP> --nombre "<NOMBRE APP>"`

## Si vas a crear desde plantilla

- [Plantilla rellenable Web](14-Plantilla-Rellenable-SpecDriven-Web.md)
- [Plantilla rellenable Mobile](15-Plantilla-Rellenable-SpecDriven-Mobile.md)
- [Plantilla rellenable Desktop](16-Plantilla-Rellenable-SpecDriven-Desktop.md)
