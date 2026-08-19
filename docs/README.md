---
tags:
  - proyecto/fosforo
  - indice
  - documentación
type: indice-documental
area: general
status: vigente
created: 2026-03-07
updated: 2026-05-06
related: []
---

# Documentación - Ecosistema Fósforo

> Punto de entrada unico para humanos e IAs.

## Ruta recomendada (primera lectura)

1. [Guia de lectura para Desarrolladores e IA](00-General/01-Guia-Lectura-Desarrolladores-e-IA.md)
2. [Guia de navegación](00-General/02-Guia-Navegacion.md)
3. [Indice general](00-General/03-Indice-General.md)
4. [PRD Maestro](00-General/06-PRD-Maestro.md)
5. [SRS Maestro](00-General/07-SRS-Maestro.md)
6. [FRD Maestro](00-General/08-FRD-Maestro.md)
7. [Arquitectura](01-Arquitectura/README.md)
8. [Aplicaciones](02-Aplicaciones/00-README.md)
9. [Legal y Licencias](03-Legal/README.md)

## Bloques documentales

### 1) Introductorio — Onboarding para desarrolladores

- [01-Guia-Lectura-Desarrolladores-e-IA](00-General/01-Guia-Lectura-Desarrolladores-e-IA.md)
- [02-Guia-Navegacion](00-General/02-Guia-Navegacion.md)
- [03-Indice-General](00-General/03-Indice-General.md)
- [04-Listado-de-Aplicaciones](00-General/04-Listado-de-Aplicaciones.md)
- [05-Licencias-y-Contribucion](00-General/05-Licencias-y-Contribucion.md)

### 2) Documentos del proyecto — Especificaciónes

- [06-PRD-Maestro](00-General/06-PRD-Maestro.md)
- [07-SRS-Maestro](00-General/07-SRS-Maestro.md)
- [08-FRD-Maestro](00-General/08-FRD-Maestro.md)
- [09-Guia-UI-UX-Base](00-General/09-Guia-UI-UX-Base.md)
- [10-Matriz-de-Trazabilidad](00-General/10-Matriz-de-Trazabilidad.md)

### 3) Templates — Spec-driven (referencia)

- [11-Plantilla-SpecDriven-Web](00-General/11-Plantilla-SpecDriven-Web.md)
- [12-Plantilla-SpecDriven-Mobile](00-General/12-Plantilla-SpecDriven-Mobile.md)
- [13-Plantilla-SpecDriven-Desktop](00-General/13-Plantilla-SpecDriven-Desktop.md)

### 4) Templates — Spec-driven (rellenables)

- [14-Plantilla-Rellenable-SpecDriven-Web](00-General/14-Plantilla-Rellenable-SpecDriven-Web.md)
- [15-Plantilla-Rellenable-SpecDriven-Mobile](00-General/15-Plantilla-Rellenable-SpecDriven-Mobile.md)
- [16-Plantilla-Rellenable-SpecDriven-Desktop](00-General/16-Plantilla-Rellenable-SpecDriven-Desktop.md)

### 5) Arquitectura — Stack y estructura

- [01-Arquitectura/README](01-Arquitectura/README.md)
- [Stack Tecnologico](01-Arquitectura/Stack%20Tecnologico.md)
- [Estructura Monorepo](01-Arquitectura/Estructura%20Monorepo.md)

### 6) Arquitectura — Plataformas

- [Arquitectura Web](01-Arquitectura/Arquitectura%20Web.md)
- [Arquitectura Mobile](01-Arquitectura/Arquitectura%20Mobile.md)
- [Arquitectura Desktop](01-Arquitectura/Arquitectura%20Desktop.md)

### 7) Arquitectura — Capacidades compartidas

- [Capacidades Compartidas/README](01-Arquitectura/Capacidades%20Compartidas/README.md)
- [Catalogo de Capacidades](01-Arquitectura/Capacidades%20Compartidas/Catalogo-de-Capacidades-Compartidas.md)
- [SRS Identidad y Acceso](01-Arquitectura/Capacidades%20Compartidas/SRS-Identidad-y-Acceso.md)
- [SRS Datos y Taxonomias](01-Arquitectura/Capacidades%20Compartidas/SRS-Datos-y-Taxonomias-Compartidas.md)
- [SRS Notificaciónes](01-Arquitectura/Capacidades%20Compartidas/SRS-Notificaciónes-y-Plantillas.md)
- [SRS Búsqueda y Conocimiento](01-Arquitectura/Capacidades%20Compartidas/SRS-Búsqueda-y-Conocimiento-Compartido.md)
- [SRS Pagos y Transacciones](01-Arquitectura/Capacidades%20Compartidas/SRS-Pagos-y-Transacciones-Compartidas.md)
- [SRS Observabilidad](01-Arquitectura/Capacidades%20Compartidas/SRS-Observabilidad-y-Auditoria.md)
- [SRS Design System](01-Arquitectura/Capacidades%20Compartidas/SRS-Design-System-y-Navegacion-Global.md)

### 8) Aplicaciones

- [02-Aplicaciones/00-README](02-Aplicaciones/00-README.md)
- [Plantilla App](02-Aplicaciones/_Plantilla-App/00-README.md)

Orden canonico por app:

1. `00-README.md`
2. `01-PRD.md`
3. `02-SRS.md`
4. `03-FRD.md`
5. `04-Flujos y Secuencias.md`
6. `05-Tests Unitarios.md`
7. `06-Esquema de Datos.md`
8. `07-ERM.md`
9. `08-Decisiones de Arquitectura.md`
10. `09-Especificación Tecnica.md`
11. `10-OWASP.md`
12. `11-SLA y SLO.md`

Dependencias clave:

- `01-PRD.md` genera `02-SRS.md`.
- `02-SRS.md` genera `03-FRD.md` y alimenta datos/arquitectura.
- `03-FRD.md` genera `04-Flujos y Secuencias.md`, que a su vez genera `05-Tests Unitarios.md`.
- `06-Esquema de Datos.md` y `07-ERM.md` alimentan `08-Decisiones de Arquitectura.md`.
- `08-Decisiones de Arquitectura.md` genera `09-Especificación Tecnica.md` y sirve de base para `10-OWASP.md`.
- `11-SLA y SLO.md` deriva de `01-PRD.md` y consolida compromisos técnicos y operativos.

Scaffold automatizado:

```bash
pnpm docs:new-app --fase <N> --plataforma <WEB|MOVIL|DESKTOP> --nombre "<NOMBRE APP>"
```

Sincronización de indices y matriz de estado:

```bash
pnpm docs:sync-app-status
```

Este comando regenera la lista de apps documentadas, la matriz de estado de aplicaciónes y el resumen de workspaces implementados.

Cada aplicación documentada debe respetar ese orden y mantener la trazabilidad entre documentos. El prefijo numerico no es cosmetico: define el orden oficial de lectura, elaboración y mantenimiento.

### 9) Legal y Licencias

- [03-Legal/README](03-Legal/README.md)
- [Respuestas tipo - Espanol](03-Legal/RESPUESTAS-LICENCIA.md)
- [Plantillas de respuesta - Ingles](03-Legal/LICENSE-RESPONSE-TEMPLATES.en.md)
