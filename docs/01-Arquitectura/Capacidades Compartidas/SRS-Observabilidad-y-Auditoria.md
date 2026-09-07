---
tags:
  - proyecto/fosforo
  - srs
  - observabilidad
  - auditoria
type: srs-componente
area: plataforma
status: draft
created: 2026-03-07
updated: 2026-09-05
related:
  - "[[README|Indice componentes compartidos]]"
  - "[[../../02-Aplicaciones/FASE_1-0105_log/WEB/00-README|App Log]]"
---

# SRS - Observabilidad y Auditoria

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Proposito

Definir la capacidad común de logs, metricas, eventos operativos, alertas, auditoria, monitoreo de usuarios reales (RUM) y analitica de producto, materializada en la app `Log` (`src/apps/log`).

## 2. Alcance

Incluye logs estructurados, trazas basicas, metricas de negocio criticas, tableros minimos, alertas, retencion, telemetria RUM (pageviews, Web Vitals, errores de frontend) y eventos de producto anonimizados. Excluye analitica de marketing con perfiles identificables y data warehousing avanzado en MVP.

## 3. Requisitos funcionales

- FR-OBS-001: Toda app debe emitir logs estructurados con correlación y contexto minimo.
- FR-OBS-002: Deben definirse eventos auditables obligatorios para accesos, cambios de estado y operaciónes sensibles.
- FR-OBS-003: Deben existir alertas base para errores severos, degradación y fallos de integración.
- FR-OBS-004: Debe exponerse estado de salud y version desplegada por servicio.
- FR-OBS-010: Toda app web debe reportar pageviews anonimizados y Web Vitals (LCP, INP, CLS) a traves del SDK compartido de RUM.
- FR-OBS-011: El servicio debe aceptar eventos de producto con taxonomia comun (nombres y payload tipados) y muestreo configurable por app.
- FR-OBS-012: Los errores de frontend deben capturarse con contexto de app, version y navegador, sin datos personales.
- FR-OBS-013: Debe existir un dashboard de producto (embudos, retencion, top paginas) separado del dashboard operativo, ambos restringidos a roles dev/ops.

## 4. Requisitos no funcionales

- NFR-OBS-001: La recoleccion de telemetria no debe degradar de forma significativa el rendimiento del flujo principal.
- NFR-OBS-002: Los datos de auditoria deben ser inmutables o contar con controles equivalentes.
- NFR-OBS-003: Debe existir retencion acorde al riesgo y tipo de evento.
- NFR-OBS-010: El SDK RUM debe ser no bloqueante (`sendBeacon`/async), pesar menos de 5 KB comprimido y nunca romper la app anfitriona ante fallo de ingesta.
- NFR-OBS-011: La telemetria RUM debe ser anonima (sin user id crudo ni IP persistida), respetar `Do Not Track` y consentimiento donde la normativa lo exija.
- NFR-OBS-012: La ingesta RUM debe tolerar picos aplicando sampling sin degradar la ingesta de logs operativos.

## 5. Criterios de aceptación

- CA-OBS-001: Una incidencia puede rastrearse entre apps mediante IDs de correlación.
- CA-OBS-002: Un cambio sensible queda visible en auditoria con actor y timestamp.
- CA-OBS-003: Cada app publicada reporta salud y eventos minimos obligatorios.
- CA-OBS-010: Una app nueva del ecosistema reporta pageviews y Web Vitals desde su primer despliegue sin configuracion adicional.
- CA-OBS-011: Un embudo de conversion de Misal u Oraciones puede construirse solo con eventos de producto, sin consultas manuales a la base.
