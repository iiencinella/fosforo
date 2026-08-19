---
tags:
  - proyecto/fosforo
  - guia
  - lectura
  - onboarding
type: guia-lectura
area: general
status: vigente
created: 2026-03-07
updated: 2026-04-05
related:
  - "[[README|Indice de documentación]]"
  - "[[03-Indice-General|Indice General]]"
  - "[[02-Guia-Navegacion|Guia de Navegación]]"
  - "[[../02-Aplicaciones/00-README|Indice de aplicaciónes]]"
---

# Guia de Lectura para Desarrolladores e IA

## Objetivo

Reducir tiempo de onboarding y asegurar que humanos e IAs lean la documentación en el mismo orden, con el mismo vocabulario y con trazabilidad clara de requisitos.

## Ruta canonica de lectura

1. `docs/README.md`
2. `docs/00-General/01-Guia-Lectura-Desarrolladores-e-IA.md` (este documento)
3. `docs/00-General/02-Guia-Navegacion.md`
4. `docs/00-General/03-Indice-General.md`
5. `docs/00-General/06-PRD-Maestro.md`
6. `docs/00-General/07-SRS-Maestro.md`
7. `docs/00-General/08-FRD-Maestro.md`
8. `docs/01-Arquitectura/README.md`
9. `docs/02-Aplicaciones/00-README.md`

## Ruta rapida segun necesidad

Regla general para humanos e IAs: en documentación por app, el prefijo numerico define el orden oficial de lectura, elaboración y mantenimiento. Solo conviene saltar pasos cuando el alcance del cambio este claramente acotado.

### Si vas a construir una app nueva

1. `docs/02-Aplicaciones/_Plantilla-App/00-README.md`
2. Ejecutar script de scaffolding documental:
   - `pnpm docs:new-app --fase <N> --plataforma <WEB|MOVIL|DESKTOP> --nombre "<NOMBRE APP>"`
   - Salida: `docs/02-Aplicaciones/FASE_<N>-<NOMBRE>/<PLATAFORMA>/`
   - Indice actualizado: `docs/02-Aplicaciones/00-README.md`
3. Plantilla base por plataforma:
   - Web: `docs/00-General/11-Plantilla-SpecDriven-Web.md`
   - Mobile: `docs/00-General/12-Plantilla-SpecDriven-Mobile.md`
   - Desktop: `docs/00-General/13-Plantilla-SpecDriven-Desktop.md`
4. Plantilla rellenable por plataforma:
   - Web: `docs/00-General/14-Plantilla-Rellenable-SpecDriven-Web.md`
   - Mobile: `docs/00-General/15-Plantilla-Rellenable-SpecDriven-Mobile.md`
   - Desktop: `docs/00-General/16-Plantilla-Rellenable-SpecDriven-Desktop.md`

### Si vas a mantener arquitectura/plataforma

1. `docs/01-Arquitectura/README.md`
2. `docs/01-Arquitectura/Estructura Monorepo.md`
3. `docs/01-Arquitectura/Stack Tecnologico.md`
4. Documento de plataforma (Web/Mobile/Desktop)

### Si vas a refactorizar una app existente

1. `docs/02-Aplicaciones/[App]/00-README.md`
2. `docs/02-Aplicaciones/[App]/01-PRD.md`
3. `docs/02-Aplicaciones/[App]/02-SRS.md`
4. `docs/02-Aplicaciones/[App]/03-FRD.md`
5. `docs/02-Aplicaciones/[App]/04-Flujos y Secuencias.md`
6. `docs/02-Aplicaciones/[App]/05-Tests Unitarios.md`
7. `docs/02-Aplicaciones/[App]/06-Esquema de Datos.md`
8. `docs/02-Aplicaciones/[App]/07-ERM.md`
9. `docs/02-Aplicaciones/[App]/08-Decisiones de Arquitectura.md`
10. `docs/02-Aplicaciones/[App]/09-Especificación Tecnica.md`
11. `docs/02-Aplicaciones/[App]/10-OWASP.md`
12. `docs/02-Aplicaciones/[App]/11-SLA y SLO.md`

## Ruta canonica por app

1. `00-README.md`: contexto, owners, alcance y mapa documental.
2. `01-PRD.md`: necesidad de producto y objetivos.
3. `02-SRS.md`: requisitos verificables.
4. `03-FRD.md`: comportamiento funcional y reglas.
5. `04-Flujos y Secuencias.md`: recorridos y escenarios.
6. `05-Tests Unitarios.md`: validación derivada de requisitos y flujos.
7. `06-Esquema de Datos.md`: entidades, relaciónes e integridad.
8. `07-ERM.md`: riesgos, errores, runbooks y continuidad.
9. `08-Decisiones de Arquitectura.md`: decisiones clave y trade-offs.
10. `09-Especificación Tecnica.md`: stack, modulos e implementación.
11. `10-OWASP.md`: controles y evidencias de seguridad.
12. `11-SLA y SLO.md`: compromisos operativos y objetivos de servicio.

## Convenciones para lectura asistida por IA

- Usar IDs estables: `PRD-*`, `FR-*`, `NFR-*`, `RB-*`, `IR-*`, `CA-*`, `TC-*`, `SEC-*`, `SLO-*`.
- Mantener tablas de trazabilidad compactas y actualizadas.
- Evitar duplicar reglas de negocio en varios documentos sin referencia cruzada.
- Actualizar primero los documentos maestros y luego los documentos por app.
- Registrar cambios relevantes cuando afecten alcance.

## Definition of Ready documental

- PRD con alcance MVP y no-alcance definidos.
- SRS y FRD con criterios verificables.
- ERM y SLA/SLO con owners.
- Estrategia de pruebas unitarias y checklist OWASP base definidos.

## Definition of Done documental

- Requisitos trazados a pruebas y seguridad.
- Gates de aprobación cerrados.
- Referencias en indices actualizadas.
- Documento marcado con estado y fecha de ultima revision.
