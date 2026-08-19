---
tags:
  - proyecto/fosforo
  - srs
  - notificaciónes
  - plantillas
type: srs-componente
area: plataforma
status: draft
created: 2026-03-07
updated: 2026-03-07
related:
  - "[[README|Indice componentes compartidos]]"
---

# SRS - Notificaciónes y Plantillas

## 1. Proposito

Especificar la capacidad transversal para enviar comúnicaciónes por email, SMS y push con preferencias, plantillas y trazabilidad comúnes.

## 2. Alcance

Incluye listas, preferencias, plantillas, eventos disparadores, metricas de entrega y reintentos. Excluye automatizaciónes avanzadas de marketing en MVP.

## 3. Requisitos funcionales

- FR-NOT-001: Las aplicaciónes deben poder solicitar envios mediante eventos o API con payload validado.
- FR-NOT-002: El servicio debe aplicar preferencias, consentimientos y canal adecuado por usuario.
- FR-NOT-003: Las plantillas deben soportar versionado, variables y ownership funcional.
- FR-NOT-004: Debe registrarse estado de envio, entrega, apertura o fallo cuando el canal lo permita.

## 4. Requisitos no funcionales

- NFR-NOT-001: Los envios transaccionales criticos deben priorizarse sobre comúnicaciónes promocionales.
- NFR-NOT-002: Debe existir trazabilidad por mensaje y por evento origen.
- NFR-NOT-003: Las listas y preferencias deben cumplir principios de minimización y consentimiento.

## 5. Criterios de aceptación

- CA-NOT-001: Agenda Comunitaria y Donaciónes pueden disparar comúnicaciónes usando la misma infraestructura.
- CA-NOT-002: Un usuario puede cambiar preferencias sin romper envios obligatorios de seguridad o comprobantes.
- CA-NOT-003: Un fallo de canal queda visible para soporte y observabilidad.
