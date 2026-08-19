---
tags:
  - proyecto/fosforo
  - srs
  - identidad
  - acceso
type: srs-componente
area: plataforma
status: draft
created: 2026-03-07
updated: 2026-03-07
related:
  - "[[README|Indice componentes compartidos]]"
  - "[[../../00-General/06-PRD Maestro|PRD Maestro]]"
---

# SRS - Identidad y Acceso

## 1. Proposito

Definir la capacidad común de autenticación, autorización, sesiones, perfil base y auditoria de acceso para todo el ecosistema.

## 2. Alcance

Incluye SSO, sesiones, recuperación de acceso, consentimiento, perfiles base y roles comúnes. Excluye IAM empresarial avanzada y federación compleja en MVP.

## 3. Requisitos funcionales

- FR-IDA-001: Debe existir una cuenta unica reutilizable por todas las aplicaciónes autenticadas.
- FR-IDA-002: El servicio debe emitir y validar sesiones seguras para web, mobile y desktop.
- FR-IDA-003: Debe soportar roles base y extensiones de permisos por aplicación.
- FR-IDA-004: Debe exponer perfil base, preferencias y consentimientos reutilizables.
- FR-IDA-005: Debe auditar inicios de sesion, cierres, errores y accesos a operaciónes sensibles.

## 4. Requisitos no funcionales

- NFR-IDA-001: Autenticación p95 menor a 500 ms en condiciones normales.
- NFR-IDA-002: Toda credencial y token debe transmitirse y almacenarse segun buenas practicas de seguridad.
- NFR-IDA-003: Los eventos de acceso deben integrarse con el Sistema de Logueo.

## 5. Criterios de aceptación

- CA-IDA-001: Un usuario inicia sesion una vez y accede a apps autorizadas sin recrear cuenta.
- CA-IDA-002: Un rol insuficiente bloquea operaciónes sensibles y deja evento auditable.
- CA-IDA-003: Las preferencias de comunicación quedan disponibles para servicios consumidores.
