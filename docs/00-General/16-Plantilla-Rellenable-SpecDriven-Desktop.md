---
tags:
  - proyecto/fosforo
  - plantilla
  - rellenable
  - spec-driven
  - desktop
type: plantilla-rellenable
area: general
status: vigente
created: 2026-03-07
updated: 2026-05-07
related:
  - "[[README|Indice de documentación]]"
  - "[[13-Plantilla-SpecDriven-Desktop|Plantilla referencia Desktop]]"
---

# Plantilla Rellenable Spec-Driven - Desktop

## Ficha del documento

- Proyecto/App: [NOMBRE_APP]
- Tipo de app: Desktop
- Owner de producto: [NOMBRE]
- Owner tecnico: [NOMBRE]
- QA owner: [NOMBRE]
- Seguridad owner: [NOMBRE]
- Estado: [draft|review|approved]
- Version: [v0.1]
- Fecha: [YYYY-MM-DD]

## 00) README

### Metadatos

- Plataforma: [DESKTOP]
- Estado documental: [draft|vigente|completado]
- Fecha ultima actualización: [YYYY-MM-DD]

### Descripcion y contexto

- Descripcion: [DESCRIBIR]
- Validación de la idea: [DESCRIBIR]
- Estado de implementación: [DESCRIBIR]
- Ubicación del codigo: [RUTA]
- KPI principal: [DESCRIBIR]

## 01) PRD

### Objetivo de negocio

[DESCRIBIR]

### Requisitos de producto priorizados

| ID           | Requisito   | Prioridad | Justificación |
| ------------ | ----------- | --------- | ------------- |
| PRD-DESK-001 | [DESCRIBIR] | [Must]    | [DESCRIBIR]   |

### Distribucion y soporte

- Instalador: [MSI/DMG/AppImage/etc.]
- Auto-update: [SI/NO + estrategia]
- Firma de binarios: [SI/NO + estrategia]

## 02) SRS

### Requisitos funcionales

| ID          | Requisito   | Criterio verificable |
| ----------- | ----------- | -------------------- |
| FR-DESK-001 | [DESCRIBIR] | [DESCRIBIR]          |

### Requisitos no funcionales

| ID           | Requisito         | Objetivo   |
| ------------ | ----------------- | ---------- |
| NFR-DESK-001 | Crash rate        | [OBJETIVO] |
| NFR-DESK-002 | Startup time      | [OBJETIVO] |
| NFR-DESK-003 | Uso memoria/CPU   | [OBJETIVO] |
| NFR-DESK-004 | Compatibilidad SO | [OBJETIVO] |

### Integraciónes

| ID          | Integración               | Contrato    | Version |
| ----------- | ------------------------- | ----------- | ------- |
| IR-DESK-001 | [API/Filesystem/IPC/etc.] | [DESCRIBIR] | [v1]    |

## 03) FRD

### Casos de uso

| ID          | Caso de uso | Flujo principal | Excepciones |
| ----------- | ----------- | --------------- | ----------- |
| UC-DESK-001 | [DESCRIBIR] | [DESCRIBIR]     | [DESCRIBIR] |

### Reglas de negocio

| ID          | Regla       |
| ----------- | ----------- |
| RB-DESK-001 | [DESCRIBIR] |

### Errores del sistema local

- Permisos insuficientes: [COMPORTAMIENTO]
- Archivo bloqueado/corrupto: [COMPORTAMIENTO]

## 04) Flujos y Secuencias

### Flujo principal

1. [PASO_1]
2. [PASO_2]
3. [PASO_3]

### Flujos alternos

- Instalación inicial: [DESCRIBIR]
- Actualización/rollback: [DESCRIBIR]

### Secuencia clave

1. Usuario: [ACCION]
2. App: [RESPUESTA]
3. SO/Servicio: [RESPUESTA]
4. App: [RESULTADO]

## 05) Tests Unitarios

### Estrategia

[DESCRIBIR]

### Matriz de casos de prueba

| ID          | Requisito trazado | Tipo test | Estado      |
| ----------- | ----------------- | --------- | ----------- |
| TC-DESK-001 | FR-DESK-001       | Unitario  | [Pendiente] |

### Umbrales CI

- Cobertura global: [>= 70%]
- Cobertura modulos criticos: [>= 85%]

## 06) Esquema de Datos

### Entidades principales

| Entidad     | Proposito   | Campos clave |
| ----------- | ----------- | ------------ |
| [ENTIDAD_1] | [DESCRIBIR] | [campo_1]    |

### Relaciónes y persistencia

- [ENTIDAD_1] 1:N [ENTIDAD_2]
- Estrategia de almacenamiento local: [DESCRIBIR]

## 07) ERM

| ID           | Riesgo/Error | Tipo     | Severidad | Mitigación  | Owner    |
| ------------ | ------------ | -------- | --------- | ----------- | -------- |
| ERM-DESK-001 | [DESCRIBIR]  | [Riesgo] | [P1]      | [DESCRIBIR] | [NOMBRE] |

### Runbooks

- Runbook instalador fallido: [LINK_O_PATH]
- Runbook update fallido: [LINK_O_PATH]

## 08) Decisiones de Arquitectura

### Contexto

- Alcance de la decision: [DESCRIBIR]

### Decisiones clave

| ID           | Decision    | Motivo      | Impacto     |
| ------------ | ----------- | ----------- | ----------- |
| ADR-DESK-001 | [DESCRIBIR] | [DESCRIBIR] | [DESCRIBIR] |

## 09) Especificación Tecnica

### Herramientas y tecnologias

- Runtime/framework principal: [DESCRIBIR]
- Lenguaje principal: [DESCRIBIR]
- Distribucion/build: [DESCRIBIR]

### Arquitectura tecnica

- Patron de arquitectura: [DESCRIBIR]
- Modulos principales: [DESCRIBIR]

## 10) OWASP (Desktop)

### Checklist baseline

| ID           | Control                      | Estado      | Evidencia     |
| ------------ | ---------------------------- | ----------- | ------------- |
| SEC-DESK-001 | Auth/Authz robustas          | [Pendiente] | [LINK_O_PATH] |
| SEC-DESK-002 | Storage local seguro         | [Pendiente] | [LINK_O_PATH] |
| SEC-DESK-003 | Cifrado en transito          | [Pendiente] | [LINK_O_PATH] |
| SEC-DESK-004 | Firma binarios/update seguro | [Pendiente] | [LINK_O_PATH] |
| SEC-DESK-005 | Logging/auditoria            | [Pendiente] | [LINK_O_PATH] |

### Si aplica Electron

- `contextIsolation`: [ON/OFF]
- `sandbox`: [ON/OFF]
- `nodeIntegration`: [OFF/ON]
- CSP: [DESCRIBIR]

## 11) SLA y SLO

### SLA

- SLA-001: [DESCRIBIR]
- SLA-002: [DESCRIBIR]

### SLO / SLI

| ID           | SLI                      | Objetivo   | Ventana   |
| ------------ | ------------------------ | ---------- | --------- |
| SLO-DESK-001 | Crash rate por sesion    | [OBJETIVO] | [mensual] |
| SLO-DESK-002 | Startup time             | [OBJETIVO] | [mensual] |
| SLO-DESK-003 | Exito instalación/update | [OBJETIVO] | [mensual] |

## 12) Trazabilidad compacta

| PRD          | SRS         | FRD         | Flujos      | Test        | Datos        | ERM          | Seguridad    | SLO          |
| ------------ | ----------- | ----------- | ----------- | ----------- | ------------ | ------------ | ------------ | ------------ |
| PRD-DESK-001 | FR-DESK-001 | RB-DESK-001 | FL-DESK-001 | TC-DESK-001 | DATA-DESK-01 | ERM-DESK-001 | SEC-DESK-001 | SLO-DESK-001 |

## 13) Gates

- [ ] Gate 1: `00-README.md` y `01-PRD.md` aprobados
- [ ] Gate 2: `02-SRS.md`, `03-FRD.md` y `04-Flujos y Secuencias.md` trazables
- [ ] Gate 3: `05-Tests Unitarios.md`, `06-Esquema de Datos.md` y `07-ERM.md` listos
- [ ] Gate 4: `08-Decisiones de Arquitectura.md` y `09-Especificación Tecnica.md` aprobados
- [ ] Gate 5: `10-OWASP.md`, `11-SLA y SLO.md` y rollback definidos
