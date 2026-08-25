---
tags:
  - proyecto/fosforo
  - plantilla
  - rellenable
  - spec-driven
  - web
type: plantilla-rellenable
area: general
status: vigente
created: 2026-03-07
updated: 2026-05-07
related:
  - "[[README|Indice de documentación]]"
  - "[[11-Plantilla-SpecDriven-Web|Plantilla referencia Web]]"
---

# Plantilla Rellenable Spec-Driven - Web

## Ficha del documento

- Proyecto/App: [NOMBRE_APP]
- Tipo de app: Web
- Owner de producto: [NOMBRE]
- Owner tecnico: [NOMBRE]
- QA owner: [NOMBRE]
- Seguridad owner: [NOMBRE]
- Estado: [draft|review|approved]
- Version: [v0.1]
- Fecha: [YYYY-MM-DD]

## 00) README

### Metadatos

- Plataforma: [WEB]
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

### Segmentos/JTBD

- Segmento 1: [DESCRIBIR]
- Segmento 2: [DESCRIBIR]
- JTBD 1: [DESCRIBIR]

### Requisitos de producto priorizados

| ID          | Requisito   | Prioridad | Justificación |
| ----------- | ----------- | --------- | ------------- |
| PRD-WEB-001 | [DESCRIBIR] | [Must]    | [DESCRIBIR]   |

### Riesgos de negocio

| Riesgo      | Impacto | Mitigación  | Owner    |
| ----------- | ------- | ----------- | -------- |
| [DESCRIBIR] | [Alto]  | [DESCRIBIR] | [NOMBRE] |

## 02) SRS

### Requisitos funcionales

| ID         | Requisito   | Criterio verificable |
| ---------- | ----------- | -------------------- |
| FR-WEB-001 | [DESCRIBIR] | [DESCRIBIR]          |

### Requisitos no funcionales

| ID          | Requisito        | Objetivo                     |
| ----------- | ---------------- | ---------------------------- |
| NFR-WEB-001 | Disponibilidad   | [99.5% MVP / 99.9% post-MVP] |
| NFR-WEB-002 | Latencia API p95 | [< 300 ms]                   |
| NFR-WEB-003 | Carga inicial    | [< 3 s]                      |
| NFR-WEB-004 | Accesibilidad    | [WCAG 2.1 AA]                |

### Integraciónes

| ID         | Integración | Contrato              | Version |
| ---------- | ----------- | --------------------- | ------- |
| IR-WEB-001 | [DESCRIBIR] | [OpenAPI/Evento/etc.] | [v1]    |

## 03) FRD

### Casos de uso

| ID         | Caso de uso | Flujo principal | Excepciones |
| ---------- | ----------- | --------------- | ----------- |
| UC-WEB-001 | [DESCRIBIR] | [DESCRIBIR]     | [DESCRIBIR] |

### Reglas de negocio

| ID         | Regla       |
| ---------- | ----------- |
| RB-WEB-001 | [DESCRIBIR] |

### Validaciónes y errores

- Validación 1: [DESCRIBIR]
- Error esperado 1: [CODIGO] - [MENSAJE]

## 04) Flujos y Secuencias

### Flujo principal

1. [PASO_1]
2. [PASO_2]
3. [PASO_3]

### Flujos alternos

- Flujo alterno 1: [DESCRIBIR]
- Flujo alterno 2: [DESCRIBIR]

### Secuencia clave

1. Usuario: [ACCION]
2. Sistema: [RESPUESTA]
3. Usuario: [ACCION]
4. Sistema: [RESPUESTA]

## 05) Tests Unitarios

### Estrategia

[DESCRIBIR]

### Matriz de casos de prueba

| ID         | Requisito trazado | Tipo test | Estado      |
| ---------- | ----------------- | --------- | ----------- |
| TC-WEB-001 | FR-WEB-001        | Unitario  | [Pendiente] |

### Umbrales CI

- Cobertura global: [>= 70%]
- Cobertura modulos criticos: [>= 85%]

## 06) Esquema de Datos

### Entidades principales

| Entidad     | Proposito   | Campos clave |
| ----------- | ----------- | ------------ |
| [ENTIDAD_1] | [DESCRIBIR] | [campo_1]    |

### Relaciónes

- [ENTIDAD_1] 1:N [ENTIDAD_2]

### Reglas de integridad

- [REGLA_1]

## 07) ERM

| ID          | Riesgo/Error | Tipo     | Severidad | Mitigación  | Owner    |
| ----------- | ------------ | -------- | --------- | ----------- | -------- |
| ERM-WEB-001 | [DESCRIBIR]  | [Riesgo] | [P1]      | [DESCRIBIR] | [NOMBRE] |

### Runbooks

- Runbook P1: [LINK_O_PATH]
- Runbook P2: [LINK_O_PATH]

## 08) Decisiones de Arquitectura

### Contexto

- Alcance de la decision: [DESCRIBIR]

### Decisiones clave

| ID          | Decision    | Motivo      | Impacto     |
| ----------- | ----------- | ----------- | ----------- |
| ADR-WEB-001 | [DESCRIBIR] | [DESCRIBIR] | [DESCRIBIR] |

### Alternativas consideradas

- Alternativa A: [DESCRIBIR]

## 09) Especificación Tecnica

### Herramientas y tecnologias

- Framework principal: [DESCRIBIR]
- Lenguaje principal: [DESCRIBIR]
- Testing: [DESCRIBIR]

### Arquitectura tecnica

- Patron de arquitectura: [DESCRIBIR]
- Modulos principales: [DESCRIBIR]

## 10) OWASP (Web)

### Checklist baseline

| ID          | Control                       | Estado      | Evidencia     |
| ----------- | ----------------------------- | ----------- | ------------- |
| SEC-WEB-001 | Auth/Sesion segura            | [Pendiente] | [LINK_O_PATH] |
| SEC-WEB-002 | Autorización por recurso      | [Pendiente] | [LINK_O_PATH] |
| SEC-WEB-003 | Validación de entradas        | [Pendiente] | [LINK_O_PATH] |
| SEC-WEB-004 | Proteccion XSS/CSRF/SQLi/SSRF | [Pendiente] | [LINK_O_PATH] |
| SEC-WEB-005 | Logging y auditoria           | [Pendiente] | [LINK_O_PATH] |

### Riesgo aceptado

- Excepcion: [DESCRIBIR]
- Aprobado por: [NOMBRE]
- Fecha: [YYYY-MM-DD]

## 11) SLA y SLO

### SLA

- SLA-001: [DESCRIBIR]
- SLA-002: [DESCRIBIR]

### SLO / SLI

| ID          | SLI            | Objetivo   | Ventana   |
| ----------- | -------------- | ---------- | --------- |
| SLO-WEB-001 | Uptime         | [99.5%]    | [mensual] |
| SLO-WEB-002 | Latencia p95   | [< 300 ms] | [mensual] |
| SLO-WEB-003 | Error rate 5xx | [< X%]     | [mensual] |

### Error budget

- Politica: [DESCRIBIR]
- Accion al agotarse: [congelar releases|otro]

## 12) Trazabilidad compacta

| PRD         | SRS        | FRD        | Flujos     | Test       | Datos       | ERM         | Seguridad   | SLO         |
| ----------- | ---------- | ---------- | ---------- | ---------- | ----------- | ----------- | ----------- | ----------- |
| PRD-WEB-001 | FR-WEB-001 | RB-WEB-001 | FL-WEB-001 | TC-WEB-001 | DATA-WEB-01 | ERM-WEB-001 | SEC-WEB-001 | SLO-WEB-001 |

## 13) Gates

- [ ] Gate 1: `00-README.md` y `01-PRD.md` aprobados
- [ ] Gate 2: `02-SRS.md`, `03-FRD.md` y `04-Flujos y Secuencias.md` trazables
- [ ] Gate 3: `05-Tests Unitarios.md`, `06-Esquema de Datos.md` y `07-ERM.md` listos
- [ ] Gate 4: `08-Decisiones de Arquitectura.md` y `09-Especificación Tecnica.md` aprobados
- [ ] Gate 5: `10-OWASP.md`, `11-SLA y SLO.md`, changeset y rollback definidos (ver `17-Control-de-Versiones-y-Releases.md`)
