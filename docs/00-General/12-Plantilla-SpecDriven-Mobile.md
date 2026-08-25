---
tags:
  - proyecto/fosforo
  - plantilla
  - spec-driven
  - mobile
type: plantilla-spec
area: general
status: vigente
created: 2026-03-07
updated: 2026-05-07
related:
  - "[[README|Indice de documentación]]"
  - "[[15-Plantilla-Rellenable-SpecDriven-Mobile|Plantilla rellenable Mobile]]"
---

# Plantilla Spec-Driven - Aplicativos Mobile (Android/iOS)

## Objetivo

Definir un marco unico para construir y operar aplicativos Android/iOS con enfoque spec-driven, cubriendo el esquema numerado `00-README.md` a `11-SLA y SLO.md` para apps mobile del ecosistema.

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
11. Go/No-Go por version.

## Estructura documental minima por app Mobile

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
- Validación de la idea y necesidades mobile.
- Estado de implementación y ubicación del codigo.
- Alcance MVP, no-alcance y KPI principal.
- Secuencia documental y dependencias.

## 01) PRD (Producto)

### Secciones minimas

- Problema y objetivo de negocio.
- Segmentos y contexto de uso movil.
- Alcance MVP y no-alcance.
- Experiencias criticas: onboarding, auth, offline/online, notificaciónes.
- KPI principal y metricas de adopcion/retencion.

### Salida requerida

- IDs: `PRD-MOB-001...`
- Priorización por impacto en experiencia movil real.

## 02) SRS (Software)

### Secciones minimas

- Requisitos funcionales (`FR-MOB-*`).
- Requisitos no funcionales (`NFR-MOB-*`).
- Integraciónes (`IR-MOB-*`) con APIs, push y analytics.
- Requisitos de almacenamiento local y sincronización.
- Criterios de aceptación (`CA-MOB-*`).

### NFR recomendados Mobile

- Crash-free sessions objetivo >= 99.5% MVP.
- ANR bajo umbral definido por plataforma.
- Startup time dentro de objetivo por gama de dispositivo.
- Consumo de bateria y red acotado en flujos frecuentes.

## 03) FRD (Detalle funcional)

### Secciones minimas

- Casos de uso por plataforma y estado de conectividad.
- Flujos alternos offline/online y reintentos.
- Reglas de negocio (`RB-MOB-*`).
- Manejo de permisos del dispositivo.
- Estados de UI y errores recuperables/no recuperables.

## 04) Flujos y Secuencias

### Secciones minimas

- Flujo principal de onboarding o tarea critica.
- Flujos secundarios por conectividad.
- Secuencias clave usuario-app-API.
- Reintentos, colas y sincronización.
- Escenarios de error y recuperación.

## 05) Tests Unitarios

### Alcance minimo

- Dominio y reglas de negocio.
- ViewModels/Presenters/UseCases.
- Repositorios y mapeos de datos.
- Validaciónes, formateos y manejo de errores.
- Logica de sincronización basica.

### Politica de calidad sugerida

- Cobertura minima global: >= 70%.
- Cobertura en modulos criticos: >= 85%.
- Trazabilidad de `FR-MOB-*` criticos hacia `TC-MOB-*`.

## 06) Esquema de Datos

### Secciones minimas

- Entidades locales y remotas.
- Campos clave y ownership de datos.
- Estrategia de cache y sincronización.
- Relaciónes y resolucion de conflictos.
- Politicas de persistencia y borrado.

## 07) ERM (Error and Risk Management)

### Secciones minimas

- Riesgos por fragmentación de dispositivos/OS.
- Riesgos por conectividad intermitente.
- Riesgos por release stores.
- Plan de rollback y feature flags.
- Runbooks de incidentes mobile.

## 08) Decisiones de Arquitectura

### Secciones minimas

- Contexto y alcance de decisiones.
- Decisiones sobre estado, sincronización y modulos.
- Alternativas consideradas.
- Riesgos y mitigaciónes tecnicas.
- Relación con permisos, almacenamiento y APIs.

## 09) Especificación Tecnica

### Secciones minimas

- Stack y frameworks principales.
- Arquitectura tecnica y capas.
- Integraciónes, telemetria y push.
- Requisitos de build, release y versionado.
- Consideraciónes UX mobile y accesibilidad base.

## 10) OWASP generalizado para Android/iOS

### Baseline

- OWASP MASVS/MSTG (segun criticidad).

### Controles minimos

- Almacenamiento seguro de credenciales/tokens.
- Cifrado en transito y validación de certificados.
- Proteccion de datos sensibles en logs y backups.
- Hardening contra reverse engineering segun riesgo.
- Seguridad en autenticación, sesion y biometria.
- Validación de deep links y comúnicaciónes inter-app.

### Evidencia requerida

- Checklist `SEC-MOB-*` cerrado por release.
- Validación estatica/dinamica basica.
- Registro de riesgos aceptados y aprobación.

## 11) SLA y SLO

### SLA (externo)

- Expectativas de soporte por version minima.
- Politica de fin de soporte por OS.
- Tiempos de respuesta por severidad.

### SLO (interno)

- SLI de estabilidad, rendimiento y entregabilidad de push.
- Error budget mensual.
- Bloqueo de releases al exceder umbrales de estabilidad.

### SLI sugeridos Mobile

- Crash-free users/sessions.
- ANR rate.
- Tiempo de arranque frio/caliente.
- Exito de login y conversion de onboarding.
- Exito de entrega/recepcion de push.

## 12) Matriz de trazabilidad minima

| PRD         | SRS                      | FRD        | Flujos     | Tests      | Datos       | ERM         | OWASP       | SLO         |
| ----------- | ------------------------ | ---------- | ---------- | ---------- | ----------- | ----------- | ----------- | ----------- |
| PRD-MOB-001 | FR-MOB-001 / NFR-MOB-001 | RB-MOB-001 | FL-MOB-001 | TC-MOB-001 | DATA-MOB-01 | ERM-MOB-001 | SEC-MOB-001 | SLO-MOB-001 |

## 13) Gates de aprobación

- Gate 1: `00-README.md` y `01-PRD.md` completos y aprobados.
- Gate 2: `02-SRS.md`, `03-FRD.md` y `04-Flujos y Secuencias.md` completos y trazables.
- Gate 3: `05-Tests Unitarios.md`, `06-Esquema de Datos.md` y `07-ERM.md` listos.
- Gate 4: `08-Decisiones de Arquitectura.md` y `09-Especificación Tecnica.md` aprobados.
- Gate 5: `10-OWASP.md`, `11-SLA y SLO.md`, changeset, checklist de release cerrados y mapeo de version a stores definido (ver `17-Control-de-Versiones-y-Releases.md`).
