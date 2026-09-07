---
tags:
  - proyecto/fosforo
  - aplicacion
  - motor-liturgico
  - fase-2
  - owasp
  - seguridad
type: app-owasp
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Iván Ezequiel Iencinella
related:
  - "[[00-README|Motor Liturgico]]"
---

# OWASP - Motor Liturgico

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `SEC-MOTOR-LIT-*`
- Plataforma: WEB
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Baseline aplicable

- Web: OWASP Top 10 (2021) + OWASP ASVS Nivel 2.
- El Motor es principalmente un servicio de lectura (API REST GET) con un panel admin autenticado (POST/PUT/DELETE).
- Supabase Auth para autenticacion y RLS para autorizacion a nivel de base de datos.

## 3. Checklist de controles

| ID                | Control                                                                   | Estado    | Evidencia                                                                                    |
| ----------------- | ------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------- |
| SEC-MOTOR-LIT-001 | Autenticacion y sesion seguras (panel admin)                              | Pendiente | Supabase Auth con JWT; sesion expira; cookies httpOnly + secure + sameSite                   |
| SEC-MOTOR-LIT-002 | Autorizacion por rol (editor vs lector publico)                           | Pendiente | RLS en PostgreSQL: SELECT publico, INSERT/UPDATE/DELETE solo para rol `editor` autenticado   |
| SEC-MOTOR-LIT-003 | Validacion y sanitizacion de entradas (fecha, ano, rango)                 | Pendiente | Validacion de formato ISO 8601, rango 2000-2100, rango maximo 31 dias; 400 en caso invalido  |
| SEC-MOTOR-LIT-004 | Rate limiting en endpoints publicos                                       | Pendiente | Rate limiting por IP en `/api/liturgia/*` (ej. 100 req/min); 429 al exceder                  |
| SEC-MOTOR-LIT-005 | Headers de seguridad (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) | Pendiente | Configuracion en Astro 6 SSR; CSP restrictiva para panel admin                               |
| SEC-MOTOR-LIT-006 | Logging y auditoria de seguridad                                          | Pendiente | Logs de escrituras admin (POST/PUT/DELETE) con usuario, timestamp y accion; sin PII          |
| SEC-MOTOR-LIT-007 | RUM sin PII                                                               | Pendiente | Eventos RUM registran solo fecha, endpoint y latencia; no se envian IPs ni datos de usuarios |
| SEC-MOTOR-LIT-008 | Proteccion contra inyeccion SQL                                           | Pendiente | Uso de Supabase client con queries parametrizadas; sin SQL concatenado                       |
| SEC-MOTOR-LIT-009 | Manejo de errores sin fuga de informacion                                 | Pendiente | Respuestas de error 4xx/5xx con mensajes genericos; stack traces solo en logs del servidor   |
| SEC-MOTOR-LIT-010 | CORS configurado para apps del ecosistema                                 | Pendiente | Origins permitidos: dominios del ecosistema Fosforo; bloquear requests de origins externos   |

## 4. Riesgo aceptado

- Excepcion: Los endpoints GET publicos no requieren autenticacion (son de lectura).
- Justificacion: El calendario liturgico es informacion publica; las apps consumidoras necesitan acceso sin friccion. La proteccion se da con rate limiting y CORS.
- Aprobado por: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad         | Requisito relacionado |
| ----------------- | --------------------- |
| SEC-MOTOR-LIT-001 | NFR-MOTOR-LIT-005     |
| SEC-MOTOR-LIT-002 | NFR-MOTOR-LIT-005     |
| SEC-MOTOR-LIT-003 | NFR-MOTOR-LIT-004     |
| SEC-MOTOR-LIT-004 | NFR-MOTOR-LIT-005     |
| SEC-MOTOR-LIT-007 | FR-MOTOR-LIT-008      |
| SEC-MOTOR-LIT-008 | NFR-MOTOR-LIT-005     |
