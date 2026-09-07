---
tags:
  - proyecto/fosforo
  - aplicación
  - fase-2
type: app-owasp
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[09-Especificacion Tecnica|Especificacion Tecnica]]"
  - "[[07-ERM|ERM Vida de Misionero]]"
---

# OWASP - Vida de Misionero (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Perfil de riesgo

La app gestiona progreso espiritual personal por usuario autenticado con escrituras monetizables-en-juego (puntos, rachas). Superficies: endpoints de mutación (completar, preferencias, reportes), lectura de contenido del CMS, eventos RUM. Prioridades: autorización por dueño (RLS), anti-fraude server-side, privacidad en telemetría.

## 2. Controles (SEC-MISION-001..010)

### SEC-MISION-001: Autenticación obligatoria (A01 Broken Access Control / A07)

- Toda página y endpoint verifica la cookie de sesión del Sistema de Logueo en el servidor (SSR guard + verificación en cada API route).
- `user_id` SIEMPRE derivado del token verificado; jamás aceptado del body/query/headers del cliente.
- Sin sesión: páginas 302 a login con `redirect_uri` validado contra whitelist de paths internos (previene open redirect); APIs 401 JSON.
- Cookies de sesión `httpOnly`, `Secure`, `SameSite=Lax` (config del Sistema de Logueo).

### SEC-MISION-002: RLS de progreso, solo dueño (A01)

- RLS habilitado en las 5 tablas del esquema `vida_misionero`; políticas `auth.uid() = user_id` (ver 06-Esquema de Datos).
- Sin `service` keys en el cliente; `service_role` solo en server routes/Edge Functions.
- Prueba de acceso cruzado en tests: usuario A no puede leer/escribir filas de usuario B por ninguna vía (API valida + RLS blinda).
- `content_reports`: el usuario solo ve los suyos; la lectura editorial se hace con `service_role` desde el backend del CMS.

### SEC-MISION-003: Anti-fraude server-side (A04 Unsafe Design / A01)

- Única vía de mutación: `POST /api/misiones/completar` con validación server completa: sesión -> existencia/publicación en CMS -> vigencia por día/semana LOCAL (`tz_offset`) -> idempotencia por `unique(user_id, mission_ref, fecha)`.
- El payload del cliente no tiene autoridad sobre `user_id`, `puntos`, `nivel`, `fecha` (todos derivados server-side); campos extra rechazados (400).
- Completados imposibles (misión expirada, ruta no publicada) rechazados con 404/422; sin "beneficio de la duda" para el cliente.
- Cobertura: TC-MISION-004/005/010/011/017.

### SEC-MISION-004: Rate limiting (A04/A05)

- `/api/misiones/completar`: límite por `user_id`+IP (ventana fija 1 min; 429 con `Retry-After`).
- `/api/reportes`: límite estricto por usuario (previene spam a editores y abuso de campo libre).
- `/api/preferencias`: límite moderado.
- Implementación con el mecanismo compartido del ecosistema (edge/middleware); exceder 429 repetidamente alimenta la moderación (ERM-MISION-001).

### SEC-MISION-005: RUM anónimo / sin PII (A09 Security Logging)

- Eventos RUM con payload cerrado y permit-list: `evento`, `user_id` interno (UUID), `content_ref`, `ts`, `session_id` anónimo. Sin email, nombre, IP en payload, ni texto libre del usuario.
- El texto de reportes NUNCA viaja a RUM ni a logs; permanece en DB con RLS.
- Logs técnicos estructurados sin secretos, sin tokens, sin payloads de usuario; escaneo semanal de PII en streams (ERM-MISION-006).

### SEC-MISION-006: API keys y secretos solo en SSR (A02/A05)

- Service keys de Supabase, endpoint del CMS, Log y Notificaciones: variables de entorno runtime en server/Edge Functions; nunca en bundle cliente ni en el repo.
- El cliente solo recibe datos ya autorizados por el server (no query directo con service key).
- Rotación documentada; detección de secretos en CI (pre-commit + scan).

### SEC-MISION-007: Validación de slugs y parámetros (A03 Injection)

- `GET /ruta/[slug]`: slug validado contra el CMS (lookup); caracteres no permitidos rechazados antes de tocar sistemas internos; 404 controlado si no existe.
- Todos los parámetros de ruta y query validados con esquemas; `mission_ref`, `content_ref` con formato cerrado (charset acotado del CMS).
- Acceso a DB exclusivamente con queries parametrizadas / client de Supabase (sin concatenación de SQL); migraciones versionadas, sin DDL dinámico desde requests.

### SEC-MISION-008: Sanitización de contenido del CMS y de reportes (A03)

- Contenido del CMS se renderiza como HTML controlado por el pipeline del editor (rich text seguro del CMS); en la app, sin `dangerouslySetInnerHTML` con contenido arbitrario; enlaces con `rel="noopener noreferrer"`.
- `descripcion` de reportes: escapada al renderizar (en listados editoriales), longitud <= 1000, sin ejecución de HTML; nunca interpolada en HTML/email sin sanitizar (Notificaciones sanitiza plantillas).
- Cabecera de confianza: el contenido viene del CMS autenticado (mTLS/token de servicio), no de endpoints públicos.

### SEC-MISION-009: Headers de seguridad y CSP (A05 Misconfiguration)

- Headers en todas las respuestas del app (middleware Astro): `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` mínima, `X-Frame-Options: DENY` (o `frame-ancestors 'none'`).
- CSP restringida: `default-src 'self'`; scripts solo `self` + dominios del ecosistema (sin inline scripts sin nonce); connect-src limitado a Supabase, CMS, Log, Notificaciones; `frame-src 'none'`; report-only -> enforce al estabilizar.
- Sin directory listing, sin debug endpoints en producción, errores genéricos al cliente (sin stack traces).

### SEC-MISION-010: Protección de sesión y CSRF en mutaciones (A07)

- Mutaciones (`POST/PUT`) exigen `SameSite=Lax` de la cookie + token anti-CSRF (double-submit o patrón del ecosistema) cuando la cookie de sesión no alcance sola.
- Origen verificado en server (`Origin`/`Referer` contra dominio propio) en los 3 endpoints de mutación.
- Cierre de sesión revoca en el Sistema de Logueo; re-login obligatorio tras expiración sin acciones silenciosas.

## 3. Mapeo OWASP Top 10 (2021) -> controles

| Riesgo OWASP                      | Controles                             |
| --------------------------------- | ------------------------------------- |
| A01 Broken Access Control         | SEC-MISION-001, 002, 003              |
| A02 Cryptographic Failures        | SEC-MISION-006 (+ TLS/HSTS en 009)    |
| A03 Injection                     | SEC-MISION-007, 008                   |
| A04 Insecure Design               | SEC-MISION-003, 004                   |
| A05 Security Misconfiguration     | SEC-MISION-006, 009                   |
| A07 Identification/Auth Failures  | SEC-MISION-001, 010                   |
| A09 Security Logging & Monitoring | SEC-MISION-005 (+ Log del ecosistema) |

## 4. Checklist de release (obligatorio antes de producción)

1. RLS verificado en las 5 tablas + test de acceso cruzado verde.
2. Tests anti-fraude e idempotencia (TC-MISION-004/005/010/011) verdes en CI.
3. Rate limits activos en los 3 endpoints de mutación.
4. CSP en enforce (o documentado por qué sigue report-only), headers de seguridad verificados.
5. Escaneo de secretos y de PII en logs/RUM sin hallazgos.
6. Revisión de dependencias (audit) sin vulnerabilidades high/critical.
7. Cookies con flags correctos verificados (httpOnly/Secure/SameSite).
8. Confirmación de que ningún log imprime `descripcion` de reportes ni tokens.
