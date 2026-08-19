---
tags:
  - proyecto/fosforo
  - cancionero
  - owasp
  - seguridad
  - aplicación
type: doc-app-owasp
area: aplicaciónes
status: vigente
created: 2026-05-28
updated: 2026-05-28
related:
  - "[[00-README|Cancionero App]]"
---

# OWASP - 0401_cancionero

## 1. Ficha

- ID base: `SEC-0401-CANCIONERO-*`
- Plataforma: WEB
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-05-28

## 2. Baseline aplicable

- **Web:** OWASP Top 10 + ASVS nivel 1 (aplicación interna en MVP).
- **Mobile:** No aplica en MVP (solo web).
- **Desktop:** No aplica en MVP.

## 3. Checklist de controles

| ID                      | Control                               | Estado    | Evidencia                                                                                      |
| ----------------------- | ------------------------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| SEC-0401-CANCIONERO-001 | Autenticación y sesion seguras        | Pendiente | Supabase Auth con JWT; sesión via cookies HttpOnly + Secure                                    |
| SEC-0401-CANCIONERO-002 | Autorización por rol/recurso          | Pendiente | RLS en tablas `canciones` (solo admin ve pendientes); middleware en endpoints de moderación    |
| SEC-0401-CANCIONERO-003 | Validación y sanitización de entradas | Pendiente | Zod schemas en todos los endpoints POST/PUT; escape de HTML en renderizado de letras           |
| SEC-0401-CANCIONERO-004 | Proteccion de datos sensibles         | Pendiente | No se almacenan datos sensibles; solo contenido de canciones y metadatos de auditoría          |
| SEC-0401-CANCIONERO-005 | Logging y auditoria de seguridad      | Pendiente | Tabla `auditoria_moderacion` registra todas las acciones de moderación con usuario y timestamp |

## 4. Riesgo aceptado

- **Excepcion:** Las contribuciones pueden contener URLs a YouTube y PDFs externos. No se valida el contenido de esos recursos externos.
- **Justificación:** El recurso externo es solo un link; el contenido canónico (letra+acordes) se almacena en Supabase y pasa por moderación. El riesgo se mitiga con validación de formato URL y moderación humana.
- **Aprobado por:** Iván Ezequiel Iencinella
- **Fecha:** 2026-05-28

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad               | Requisito relaciónado   |
| ----------------------- | ----------------------- |
| SEC-0401-CANCIONERO-001 | NFR-0401-CANCIONERO-003 |
| SEC-0401-CANCIONERO-002 | NFR-0401-CANCIONERO-003 |
| SEC-0401-CANCIONERO-003 | NFR-0401-CANCIONERO-003 |
| SEC-0401-CANCIONERO-005 | FR-0401-CANCIONERO-009  |
