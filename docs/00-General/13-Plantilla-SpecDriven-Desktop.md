---
tags:
  - proyecto/fosforo
  - plantilla
  - spec-driven
  - desktop
type: plantilla-spec
area: general
status: vigente
created: 2026-03-07
updated: 2026-05-07
related:
  - "[[README|Indice de documentación]]"
  - "[[16-Plantilla-Rellenable-SpecDriven-Desktop|Plantilla rellenable Desktop]]"
---

# Plantilla Spec-Driven - Aplicativos de Escritorio

## Objetivo

Establecer un estandar para especificar, desarrollar y operar aplicativos de escritorio (Windows/macOS/Linux) usando el esquema numerado `00-README.md` a `11-SLA y SLO.md`.

## Flujo Spec-Driven (obligatorio)

1. Descubrimiento, contexto y `00-README.md` base.
2. `01-PRD.md` aprobado.
3. `02-SRS.md` trazable a producto.
4. `03-FRD.md` completo.
5. `04-Flujos y Secuencias.md` validado.
6. `05-Tests Unitarios.md` definido a partir de flujos criticos.
7. `06-Esquema de Datos.md` y `07-ERM.md` definidos.
8. `08-Decisiones de Arquitectura.md` y `09-Especificación Tecnica.md` cerrados.
9. `10-OWASP.md` aprobado.
10. `11-SLA y SLO.md` aprobado.
11. Go/No-Go para instalador y release.

## Estructura documental minima por app Desktop

- `00-README.md`
- `01-PRD.md`
- `02-SRS.md`
- `03-FRD.md`
- `04-Flujos y Secuencias.md`
- `05-Tests Unitarios.md`
- `06-Esquema de Datos.md`
- `07-ERM.md`
- `08-Decisiones de Arquitectura.md`
- `09-Especificación Tecnica.md`
- `10-OWASP.md`
- `11-SLA y SLO.md`

## 00) README

### Secciones minimas

- Metadatos, owners y estado.
- Descripcion de la app en el ecosistema.
- Validación de la idea y contexto operativo.
- Estado de implementación y ubicación del codigo.
- Alcance MVP, no-alcance y KPI principal.
- Secuencia documental y dependencias.

## 01) PRD (Producto)

### Secciones minimas

- Problema y objetivo de negocio.
- Usuarios objetivo y contexto operativo.
- Alcance MVP y no-alcance.
- Requisitos de distribucion (instalador, actualizaciónes, firma).
- KPI principal y metricas de adopcion/estabilidad.

### Salida requerida

- IDs: `PRD-DESK-001...`
- Criterios de exito por flujo principal.

## 02) SRS (Software)

### Secciones minimas

- Requisitos funcionales (`FR-DESK-*`).
- Requisitos no funcionales (`NFR-DESK-*`).
- Integraciónes (`IR-DESK-*`) con APIs, archivos locales y servicios OS.
- Requisitos de instalación, actualización y compatibilidad.
- Criterios de aceptación (`CA-DESK-*`).

### NFR recomendados Desktop

- Estabilidad por sesion y tasa de crash objetivo.
- Startup time aceptable por SO y perfil de hardware.
- Uso de memoria/CPU dentro de limites definidos.
- Compatibilidad minima de versiones de SO soportadas.

## 03) FRD (Detalle funcional)

### Secciones minimas

- Casos de uso por sistema operativo.
- Flujos alternos de instalación/actualización.
- Reglas de negocio (`RB-DESK-*`).
- Manejo de errores del sistema de archivos/red/permisos.
- Politicas de recuperación ante cierres inesperados.

## 04) Flujos y Secuencias

### Secciones minimas

- Flujo principal del usuario.
- Flujos de instalación, actualización y recuperación.
- Secuencias clave app-sistema operativo-servicios.
- Escenarios de error local y remoto.
- Recuperación y continuidad operativa.

## 05) Tests Unitarios

### Alcance minimo

- Logica de dominio y reglas de negocio.
- Servicios de integración local.
- Validaciónes y manejo de errores.
- Seguridad de canales internos (IPC/eventos) cuando aplique.

### Politica de calidad sugerida

- Cobertura minima global: >= 70%.
- Cobertura en modulos criticos: >= 85%.
- Trazabilidad de `FR-DESK-*` criticos hacia `TC-DESK-*`.

## 06) Esquema de Datos

### Secciones minimas

- Entidades locales y remotas.
- Configuraciónes persistidas y versionado.
- Relaciónes, archivos y estructuras auxiliares.
- Reglas de integridad.
- Estrategia de migración o compatibilidad de datos.

## 07) ERM (Error and Risk Management)

### Secciones minimas

- Riesgos por empaquetado y firma de binarios.
- Riesgos por permisos locales y almacenamiento.
- Riesgos de compatibilidad por SO/version.
- Plan de rollback por version.
- Runbooks de soporte tecnico por severidad.

## 08) Decisiones de Arquitectura

### Secciones minimas

- Contexto y alcance de decisiones.
- Decisiones sobre runtime, modulos e integraciónes.
- Alternativas consideradas.
- Riesgos y mitigaciónes tecnicas.
- Relación con distribucion, actualizaciónes y seguridad.

## 09) Especificación Tecnica

### Secciones minimas

- Stack y runtime principal.
- Arquitectura tecnica y modulos.
- Integraciónes con OS, archivos e IPC.
- Requisitos de build, firma y release.
- Consideraciónes UX desktop y accesibilidad base.

## 10) OWASP generalizado para Desktop

### Baseline

- OWASP ASVS + hardening específico del runtime/framework.

### Controles minimos

- Politicas de autenticación y autorización robustas.
- Almacenamiento local seguro de datos y secretos.
- Cifrado en transito hacia APIs remotas.
- Validación de entradas y rutas de archivos.
- Firma de binarios y validación de actualizaciónes.
- Logging de seguridad y auditoria de acciones sensibles.

### Controles adicionales si se usa Electron

- `contextIsolation` habilitado.
- `sandbox` habilitado.
- `nodeIntegration` deshabilitado en renderer.
- CSP estricta y validación de IPC.

### Evidencia requerida

- Checklist `SEC-DESK-*` por release.
- Evidencia de hardening aplicado.
- Riesgos aceptados con aprobación explicita.

## 11) SLA y SLO

### SLA (externo)

- Politica de soporte por version.
- Tiempos de respuesta por severidad.
- Politica de actualizaciónes criticas.

### SLO (interno)

- SLI de estabilidad, rendimiento y exito de actualización.
- Error budget mensual.
- Regla de pausa de releases al exceder umbrales.

### SLI sugeridos Desktop

- Crash rate por sesion.
- Tiempo de inicio de la app.
- Uso promedio/p95 de memoria y CPU.
- Exito de instalación/actualización.

## 12) Matriz de trazabilidad minima

| PRD          | SRS                        | FRD         | Flujos      | Tests       | Datos        | ERM          | OWASP        | SLO          |
| ------------ | -------------------------- | ----------- | ----------- | ----------- | ------------ | ------------ | ------------ | ------------ |
| PRD-DESK-001 | FR-DESK-001 / NFR-DESK-001 | RB-DESK-001 | FL-DESK-001 | TC-DESK-001 | DATA-DESK-01 | ERM-DESK-001 | SEC-DESK-001 | SLO-DESK-001 |

## 13) Gates de aprobación

- Gate 1: `00-README.md` y `01-PRD.md` completos y aprobados.
- Gate 2: `02-SRS.md`, `03-FRD.md` y `04-Flujos y Secuencias.md` completos y trazables.
- Gate 3: `05-Tests Unitarios.md`, `06-Esquema de Datos.md` y `07-ERM.md` listos.
- Gate 4: `08-Decisiones de Arquitectura.md` y `09-Especificación Tecnica.md` aprobados.
- Gate 5: `10-OWASP.md`, `11-SLA y SLO.md`, instalador y rollback validados.
