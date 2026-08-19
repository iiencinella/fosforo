---
tags:
  - proyecto/fosforo
  - plantilla
  - spec-driven
  - web
type: plantilla-spec
area: general
status: vigente
created: 2026-03-07
updated: 2026-05-07
related:
  - "[[README|Indice de documentación]]"
  - "[[14-Plantilla-Rellenable-SpecDriven-Web|Plantilla rellenable Web]]"
---

# Plantilla Spec-Driven - Aplicativos Web

## Objetivo

Estandarizar la definicion, construccion y validación de aplicativos Web usando desarrollo guiado por especificaciónes. Este documento define el flujo y el contenido minimo del esquema numerado `00-README.md` a `11-SLA y SLO.md` para cualquier app web del ecosistema.

## Flujo Spec-Driven (obligatorio)

1. Descubrimiento, contexto y `00-README.md` base.
2. `01-PRD.md` aprobado.
3. `02-SRS.md` trazable a producto.
4. `03-FRD.md` completo.
5. `04-Flujos y Secuencias.md` validado.
6. `05-Tests Unitarios.md` definido a partir de flujos y requisitos criticos.
7. `06-Esquema de Datos.md` y `07-ERM.md` definidos.
8. `08-Decisiones de Arquitectura.md` y `09-Especificación Tecnica.md` cerrados.
9. `10-OWASP.md` aprobado.
10. `11-SLA y SLO.md` aprobado.
11. Go/No-Go para release.

## Estructura documental minima por app Web

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
- Validación de la idea.
- Estado de implementación y ubicación del codigo.
- Alcance MVP, no-alcance y KPI principal.
- Secuencia documental y dependencias.

## 01) PRD (Product Requirements Document)

### Secciones minimas

- Problema, oportunidad y objetivo de negocio.
- Personas/segmentos y jobs-to-be-done.
- Alcance MVP, no-alcance y fases.
- KPI principal y KPIs secundarios.
- Riesgos de negocio y mitigaciónes.

### Salida requerida

- IDs: `PRD-WEB-001...`
- Criterios de exito por funcionalidad prioritaria.

## 02) SRS (Software Requirements Specification)

### Secciones minimas

- Requisitos funcionales (`FR-WEB-*`).
- Requisitos no funcionales (`NFR-WEB-*`).
- Integraciónes (`IR-WEB-*`).
- Restricciones y supuestos técnicos.
- Criterios de aceptación (`CA-WEB-*`).

### NFR recomendados Web

- Disponibilidad objetivo: 99.5% MVP / 99.9% post-MVP (apps criticas).
- API p95 < 300 ms en endpoints frecuentes.
- Carga inicial < 3 s en red movil razonable en flujos criticos.
- Accesibilidad: WCAG 2.1 AA en journeys principales.

## 03) FRD (Functional Requirements Document)

### Secciones minimas

- Casos de uso y flujo principal.
- Flujos alternos y excepciones.
- Reglas de negocio (`RB-WEB-*`).
- Validaciónes de formulario/API y mensajes de error.
- Estados UI y manejo de loading/empty/error.

## 04) Flujos y Secuencias

### Secciones minimas

- Objetivo del flujo.
- Flujo principal paso a paso.
- Flujos secundarios y variantes.
- Secuencias clave usuario-sistema.
- Escenarios de error y recuperación.

## 05) Tests Unitarios

### Alcance minimo

- Capa de dominio/logica de negocio.
- Servicios y adaptadores API.
- Componentes UI criticos.
- Validaciónes y manejo de errores.

### Politica de calidad sugerida

- Cobertura minima global: >= 70%.
- Cobertura en modulos criticos: >= 85%.
- Todo `FR-WEB-*` critico debe mapear a al menos un `TC-WEB-*`.

## 06) Esquema de Datos

### Secciones minimas

- Entidades principales del MVP.
- Campos clave y proposito por entidad.
- Relaciónes entre entidades.
- Reglas de integridad y consistencia.
- Supuestos de persistencia y retencion.

## 07) ERM (Error and Risk Management)

### Secciones minimas

- Registro de riesgos (impacto/probabilidad/owner).
- Catalogo de errores funcionales y técnicos.
- Politica de severidades (P1-P4).
- Runbooks por incidente critico.
- Objetivos RTO/RPO cuando aplique.

## 08) Decisiones de Arquitectura

### Secciones minimas

- Contexto y alcance de decisiones.
- Decisiones clave (`ADR-WEB-*` si aplica).
- Alternativas consideradas.
- Riesgos y mitigaciónes tecnicas.
- Relación con datos, integraciónes y UI.

## 09) Especificación Tecnica

### Secciones minimas

- Herramientas y tecnologias.
- Arquitectura tecnica y modulos.
- Dependencias compartidas.
- Endpoints o contratos relevantes.
- Consideraciónes UI/UX y accesibilidad base.

## 10) OWASP generalizado para Web

### Baseline

- OWASP Top 10 (vigente).
- OWASP ASVS (nivel segun criticidad).

### Controles minimos

- Control de autenticación y sesion.
- Control de autorización por rol/recurso.
- Validación y sanitización de entradas.
- Proteccion XSS, CSRF, SSRF, SQLi e IDOR.
- Rate limiting y proteccion anti-abuso.
- Seguridad de secretos y configuración.
- Logging de seguridad y auditoria.

### Evidencia requerida

- Checklist `SEC-WEB-*` con estado y owner.
- Resultado de pruebas de seguridad basicas.
- Riesgos aceptados con aprobación explicita.

## 11) SLA y SLO

### SLA (externo)

- Compromisos visibles al usuario/cliente.
- Ventanas de mantenimiento.
- Tiempos de respuesta por severidad.

### SLO (interno)

- SLI de disponibilidad, latencia y errores.
- Error budget por periodo.
- Regla de congelamiento de release si se consume error budget.

### SLI sugeridos Web

- Disponibilidad mensual (% uptime).
- Latencia p95/p99 por endpoint.
- Tasa de error 5xx.
- Core Web Vitals (LCP, INP, CLS).

## 12) Matriz de trazabilidad minima

| PRD         | SRS                      | FRD        | Flujos     | Tests      | Datos       | ERM         | OWASP       | SLO         |
| ----------- | ------------------------ | ---------- | ---------- | ---------- | ----------- | ----------- | ----------- | ----------- |
| PRD-WEB-001 | FR-WEB-001 / NFR-WEB-001 | RB-WEB-001 | FL-WEB-001 | TC-WEB-001 | DATA-WEB-01 | ERM-WEB-001 | SEC-WEB-001 | SLO-WEB-001 |

## 13) Gates de aprobación

- Gate 1: `00-README.md` y `01-PRD.md` completos y aprobados.
- Gate 2: `02-SRS.md`, `03-FRD.md` y `04-Flujos y Secuencias.md` completos y trazables.
- Gate 3: `05-Tests Unitarios.md`, `06-Esquema de Datos.md` y `07-ERM.md` listos.
- Gate 4: `08-Decisiones de Arquitectura.md` y `09-Especificación Tecnica.md` aprobados.
- Gate 5: `10-OWASP.md`, `11-SLA y SLO.md` y release checklist cerrados.
