---
tags:
  - proyecto/fosforo
  - santopedia
  - owasp
  - seguridad
  - web
type: app-owasp
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[08-Decisiones de Arquitectura|08-Decisiones de Arquitectura]]"
  - "[[11-SLA y SLO|11-SLA y SLO]]"
---

# Santopedia — OWASP

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Alcance

Análisis de seguridad de Santopedia (fase WEB) según OWASP ASVS/Top 10. Se basa en [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md). Superficie de ataque: páginas públicas SSR, dos endpoints de escritura (`/api/favoritos`, `/api/reportes`), integraciones server-side (CMS, Motor, Supabase) y telemetría cliente (RUM).

## 2. Controles

| ID            | Control                                   | Riesgo mitigado                                                    | Implementación                                                                                                                                                                                              | Estado |
| ------------- | ----------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| SEC-SANTO-001 | Gestión de sesión segura                  | A07: identificación y fallos de autenticación                      | Sesiones heredadas del Sistema de Logueo (cookies HttpOnly, Secure, SameSite=Lax); Santopedia no crea ni renueva tokens propios; guards en `/favoritos` y `/api/favoritos`                                  | Diseño |
| SEC-SANTO-002 | RLS estricta en favoritos                 | A01: broken access control                                         | RLS en `santopedia.favorites` (`auth.uid() = user_id` para select/insert/delete); acceso solo server-side; sin service role en cliente                                                                      | Diseño |
| SEC-SANTO-003 | Sanitización de contenido del CMS         | A03: inyección (XSS stored via CMS comprometido o error editorial) | `biografiaHtml` y todo rich text del CMS se sanear con allowlist server-side antes de render; nunca se hace `set:html` sobre contenido crudo                                                                | Diseño |
| SEC-SANTO-004 | Rate limiting en reportes                 | A04/A07: abuso de endpoints públicos                               | Límite por `session_hash` + ventana temporal (ej. 5 reportes/hora); respuesta 429 amable; sin bloquear lectura                                                                                              | Diseño |
| SEC-SANTO-005 | Anonimización de reportes                 | A09: fallos de logging y monitoreo (PII)                           | `reports` solo guarda `session_hash` (HMAC con sal en server, rotación periódica); sin IP, sin user-agent, sin email; tabla insert-only                                                                     | Diseño |
| SEC-SANTO-006 | Security headers                          | Múltiples                                                          | `Strict-Transport-Security` (max-age >= 1 año), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` mínimo                 | Diseño |
| SEC-SANTO-007 | RUM anónimo con consentimiento            | A09 + privacidad (GDPR/LPD)                                        | Sin consentimiento el SDK no se inicializa (cero eventos); eventos tipados con allowlist; sin cookies identificativas; revocación inmediata                                                                 | Diseño |
| SEC-SANTO-008 | Secretos solo en SSR                      | A02: fallos criptográficos / fuga de credenciales                  | API keys de CMS/Motor y credenciales Supabase en variables de entorno del servidor (`import.meta.env` en backend); validación en CI que el bundle cliente no contenga secretos                              | Diseño |
| SEC-SANTO-009 | Validación de slugs (anti path traversal) | A03: inyección / path traversal en `content_ref` y rutas           | Patrón server-side `^[a-z0-9]+(-[a-z0-9]+)*$` en `/santo/[slug]`, `content_ref` de favoritos y reportes; rechazo temprano antes de cualquier uso en rutas, URLs o queries                                   | Diseño |
| SEC-SANTO-010 | CSP                                       | A03: XSS                                                           | `Content-Security-Policy` con nonce para scripts propios; `default-src 'self'`; orígenes explícitos para CMS/Storage de imágenes y SDK RUM; sin `unsafe-inline` (revisar con Astro/React en implementación) | Diseño |

## 3. Consideraciones por superficie

### 3.1 Páginas públicas (SSR)

- Todo parámetro de query (`q`, `categoria`, `siglo`, `pais`, `page`) se valida y normaliza antes de armar queries al CMS; `page` acotado a rango válido.
- Salida codificada: nombres y snippets se renderizan como texto (no HTML) salvo el `biografiaHtml` saneado (SEC-SANTO-003).
- 404/503 controlados: sin stack traces ni mensajes de error internos al usuario.

### 3.2 Endpoints de escritura

- `/api/favoritos`: requiere sesión (SEC-SANTO-001); el `user_id` se toma de la sesión, nunca del body; RLS como segunda barrera (SEC-SANTO-002).
- `/api/reportes`: público pero rate-limited (SEC-SANTO-004), anonimizado (SEC-SANTO-005), con validación de enum y largo; `content_ref` validado por patrón (SEC-SANTO-009).
- Ambos endpoints con `Content-Type: application/json` estricto y rechazo de payloads grandes (límite de body).

### 3.3 Integraciones server-side

- CMS y Motor: llamada siempre con timeouts y retry acotado; errores tipados (sin propagar respuestas crudas del upstream al usuario).
- Supabase: cliente server-side con usuario delegado (sesión) para favoritos; nunca `service_role` en rutas de la app.

### 3.4 Telemetría cliente

- RUM detrás del consentimiento compartido (SEC-SANTO-007); audit anual del allowlist de eventos (ERM-SANTO-005); verificación automática con TC-SANTO-013.

## 4. Verificación

| Verificación                    | Asociada a        | Método                                   |
| ------------------------------- | ----------------- | ---------------------------------------- |
| Sin PII en eventos RUM          | SEC-SANTO-007     | TC-SANTO-013 + auditoría de payload      |
| Reportes sin PII y rate-limited | SEC-SANTO-004/005 | TC-SANTO-014 + prueba de límite          |
| Favoritos aislados por usuario  | SEC-SANTO-002     | TC-SANTO-012 + revisión de políticas RLS |
| Slugs invocados por patrón      | SEC-SANTO-009     | TC-SANTO-002 + fuzzing de slugs          |
| HTML del CMS saneado            | SEC-SANTO-003     | Fixture con HTML peligroso en tests      |
| Sin secretos en bundle cliente  | SEC-SANTO-008     | Chequeo en pipeline (CI)                 |
| Headers de seguridad presentes  | SEC-SANTO-006     | Lighthouse/security headers en QA        |

Pendiente de implementación: cada control pasa de `Diseño` a `Verificado` cuando la app exista y la verificación asociada se ejecute en CI/QA.
