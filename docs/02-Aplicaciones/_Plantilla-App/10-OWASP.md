---
tags:
  - proyecto/fosforo
  - plantilla
  - owasp
  - seguridad
  - aplicación
type: plantilla-app-owasp
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-04-05
related:
  - "[[00-README|Plantilla App]]"
---

# OWASP - [NOMBRE_APP]

## 1. Ficha

- ID base: `SEC-[APP]-*`
- Plataforma: [Web|Mobile|Desktop]
- Owner seguridad: [NOMBRE]
- Fecha: [YYYY-MM-DD]

## 2. Baseline aplicable

- Web: OWASP Top 10 + ASVS.
- Mobile: OWASP MASVS/MSTG.
- Desktop: ASVS + hardening del framework.

## 3. Checklist de controles

| ID            | Control                               | Estado     | Evidencia |
| ------------- | ------------------------------------- | ---------- | --------- | ------------- |
| SEC-[APP]-001 | Autenticación y sesion seguras        | [Pendiente | OK]       | [LINK_O_PATH] |
| SEC-[APP]-002 | Autorización por rol/recurso          | [Pendiente | OK]       | [LINK_O_PATH] |
| SEC-[APP]-003 | Validación y sanitización de entradas | [Pendiente | OK]       | [LINK_O_PATH] |
| SEC-[APP]-004 | Proteccion de datos sensibles         | [Pendiente | OK]       | [LINK_O_PATH] |
| SEC-[APP]-005 | Logging y auditoria de seguridad      | [Pendiente | OK]       | [LINK_O_PATH] |

## 4. Riesgo aceptado

- Excepcion: [DESCRIBIR]
- Justificación: [DESCRIBIR]
- Aprobado por: [NOMBRE]
- Fecha: [YYYY-MM-DD]

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad     | Requisito relaciónado |
| ------------- | --------------------- |
| SEC-[APP]-001 | NFR-[APP]-003         |
