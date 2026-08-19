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
updated: 2026-03-07
related:
  - "[[README|Indice componentes compartidos]]"
---

# SRS - Observabilidad y Auditoria

## 1. Proposito

Definir la capacidad común de logs, metricas, eventos operativos, alertas y auditoria integrada con el Sistema de Logueo.

## 2. Alcance

Incluye logs estructurados, trazas basicas, metricas de negocio criticas, tableros minimos, alertas y retencion. Excluye analitica avanzada de producto en MVP.

## 3. Requisitos funcionales

- FR-OBS-001: Toda app debe emitir logs estructurados con correlación y contexto minimo.
- FR-OBS-002: Deben definirse eventos auditables obligatorios para accesos, cambios de estado y operaciónes sensibles.
- FR-OBS-003: Deben existir alertas base para errores severos, degradación y fallos de integración.
- FR-OBS-004: Debe exponerse estado de salud y version desplegada por servicio.

## 4. Requisitos no funcionales

- NFR-OBS-001: La recoleccion de telemetria no debe degradar de forma significativa el rendimiento del flujo principal.
- NFR-OBS-002: Los datos de auditoria deben ser inmutables o contar con controles equivalentes.
- NFR-OBS-003: Debe existir retencion acorde al riesgo y tipo de evento.

## 5. Criterios de aceptación

- CA-OBS-001: Una incidencia puede rastrearse entre apps mediante IDs de correlación.
- CA-OBS-002: Un cambio sensible queda visible en auditoria con actor y timestamp.
- CA-OBS-003: Cada app publicada reporta salud y eventos minimos obligatorios.
