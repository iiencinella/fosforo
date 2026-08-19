---
tags:
  - proyecto/fosforo
  - plantilla
  - rellenable
  - spec-driven
  - mobile
type: plantilla-rellenable
area: general
status: vigente
created: 2026-03-07
updated: 2026-05-07
related:
  - "[[README|Indice de documentación]]"
  - "[[12-Plantilla-SpecDriven-Mobile|Plantilla referencia Mobile]]"
---

# Plantilla Rellenable Spec-Driven - Mobile (Android/iOS)

## Ficha del documento

- Proyecto/App: [NOMBRE_APP]
- Tipo de app: Mobile (Android/iOS)
- Owner de producto: [NOMBRE]
- Owner tecnico: [NOMBRE]
- QA owner: [NOMBRE]
- Seguridad owner: [NOMBRE]
- Estado: [draft|review|approved]
- Version: [v0.1]
- Fecha: [YYYY-MM-DD]

## 00) README

### Metadatos

- Plataforma: [MOVIL]
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

### Segmentos/JTBD mobile

- Segmento 1: [DESCRIBIR]
- Segmento 2: [DESCRIBIR]
- JTBD 1: [DESCRIBIR]

### Requisitos de producto priorizados

| ID          | Requisito   | Prioridad | Justificación |
| ----------- | ----------- | --------- | ------------- |
| PRD-MOB-001 | [DESCRIBIR] | [Must]    | [DESCRIBIR]   |

## 02) SRS

### Requisitos funcionales

| ID         | Requisito   | Criterio verificable |
| ---------- | ----------- | -------------------- |
| FR-MOB-001 | [DESCRIBIR] | [DESCRIBIR]          |

### Requisitos no funcionales

| ID          | Requisito              | Objetivo       |
| ----------- | ---------------------- | -------------- |
| NFR-MOB-001 | Crash-free sessions    | [>= 99.5% MVP] |
| NFR-MOB-002 | ANR rate               | [OBJETIVO]     |
| NFR-MOB-003 | Startup time           | [OBJETIVO]     |
| NFR-MOB-004 | Consumo de bateria/red | [OBJETIVO]     |

### Integraciónes

| ID         | Integración          | Contrato    | Version |
| ---------- | -------------------- | ----------- | ------- |
| IR-MOB-001 | [API/Push/Analytics] | [DESCRIBIR] | [v1]    |

## 03) FRD

### Casos de uso

| ID         | Caso de uso | Flujo principal | Excepciones |
| ---------- | ----------- | --------------- | ----------- |
| UC-MOB-001 | [DESCRIBIR] | [DESCRIBIR]     | [DESCRIBIR] |

### Reglas de negocio

| ID         | Regla       |
| ---------- | ----------- |
| RB-MOB-001 | [DESCRIBIR] |

### Offline/online

- Estrategia sincronización: [DESCRIBIR]
- Conflictos de datos: [DESCRIBIR]
- Reintentos: [DESCRIBIR]

## 04) Flujos y Secuencias

### Flujo principal

1. [PASO_1]
2. [PASO_2]
3. [PASO_3]

### Flujos alternos

- Flujo offline: [DESCRIBIR]
- Flujo con reintento: [DESCRIBIR]

### Secuencia clave

1. Usuario: [ACCION]
2. App: [RESPUESTA]
3. API/Servicio: [RESPUESTA]
4. App: [RESULTADO]

## 05) Tests Unitarios

### Estrategia

[DESCRIBIR]

### Matriz de casos de prueba

| ID         | Requisito trazado | Tipo test | Estado      |
| ---------- | ----------------- | --------- | ----------- |
| TC-MOB-001 | FR-MOB-001        | Unitario  | [Pendiente] |

### Umbrales CI

- Cobertura global: [>= 70%]
- Cobertura modulos criticos: [>= 85%]

## 06) Esquema de Datos

### Entidades principales

| Entidad     | Proposito   | Campos clave |
| ----------- | ----------- | ------------ |
| [ENTIDAD_1] | [DESCRIBIR] | [campo_1]    |

### Relaciónes y sincronización

- [ENTIDAD_1] 1:N [ENTIDAD_2]
- Estrategia de sincronización: [DESCRIBIR]

## 07) ERM

| ID          | Riesgo/Error | Tipo     | Severidad | Mitigación  | Owner    |
| ----------- | ------------ | -------- | --------- | ----------- | -------- |
| ERM-MOB-001 | [DESCRIBIR]  | [Riesgo] | [P1]      | [DESCRIBIR] | [NOMBRE] |

### Runbooks

- Runbook crash spike: [LINK_O_PATH]
- Runbook ANR spike: [LINK_O_PATH]

## 08) Decisiones de Arquitectura

### Contexto

- Alcance de la decision: [DESCRIBIR]

### Decisiones clave

| ID          | Decision    | Motivo      | Impacto     |
| ----------- | ----------- | ----------- | ----------- |
| ADR-MOB-001 | [DESCRIBIR] | [DESCRIBIR] | [DESCRIBIR] |

## 09) Especificación Tecnica

### Herramientas y tecnologias

- Framework principal: [DESCRIBIR]
- Lenguaje principal: [DESCRIBIR]
- Telemetria/push: [DESCRIBIR]

### Arquitectura tecnica

- Patron de arquitectura: [DESCRIBIR]
- Modulos principales: [DESCRIBIR]

## 10) OWASP (Mobile)

### Checklist baseline MASVS/MSTG

| ID          | Control                               | Estado      | Evidencia     |
| ----------- | ------------------------------------- | ----------- | ------------- |
| SEC-MOB-001 | Storage seguro de secretos/tokens     | [Pendiente] | [LINK_O_PATH] |
| SEC-MOB-002 | Cifrado en transito y certificado     | [Pendiente] | [LINK_O_PATH] |
| SEC-MOB-003 | Proteccion de datos sensibles en logs | [Pendiente] | [LINK_O_PATH] |
| SEC-MOB-004 | Deep links seguros                    | [Pendiente] | [LINK_O_PATH] |
| SEC-MOB-005 | Hardening segun riesgo                | [Pendiente] | [LINK_O_PATH] |

## 11) SLA y SLO

### SLA

- SLA-001: [DESCRIBIR]
- SLA-002: [DESCRIBIR]

### SLO / SLI

| ID          | SLI                   | Objetivo   | Ventana   |
| ----------- | --------------------- | ---------- | --------- |
| SLO-MOB-001 | Crash-free sessions   | [OBJETIVO] | [mensual] |
| SLO-MOB-002 | ANR rate              | [OBJETIVO] | [mensual] |
| SLO-MOB-003 | Startup time          | [OBJETIVO] | [mensual] |
| SLO-MOB-004 | Push delivery success | [OBJETIVO] | [mensual] |

## 12) Trazabilidad compacta

| PRD         | SRS        | FRD        | Flujos     | Test       | Datos       | ERM         | Seguridad   | SLO         |
| ----------- | ---------- | ---------- | ---------- | ---------- | ----------- | ----------- | ----------- | ----------- |
| PRD-MOB-001 | FR-MOB-001 | RB-MOB-001 | FL-MOB-001 | TC-MOB-001 | DATA-MOB-01 | ERM-MOB-001 | SEC-MOB-001 | SLO-MOB-001 |

## 13) Gates

- [ ] Gate 1: `00-README.md` y `01-PRD.md` aprobados
- [ ] Gate 2: `02-SRS.md`, `03-FRD.md` y `04-Flujos y Secuencias.md` trazables
- [ ] Gate 3: `05-Tests Unitarios.md`, `06-Esquema de Datos.md` y `07-ERM.md` listos
- [ ] Gate 4: `08-Decisiones de Arquitectura.md` y `09-Especificación Tecnica.md` aprobados
- [ ] Gate 5: `10-OWASP.md`, `11-SLA y SLO.md` y rollback definidos
