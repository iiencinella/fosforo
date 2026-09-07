---
tags:
  - proyecto/fosforo
  - aplicacion
  - oraciones
  - web
  - fase-2
  - owasp
  - seguridad
type: app-owasp
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[06-Esquema de Datos]]"
  - "[[docs/02-Aplicaciones/FASE_1-Sistema-Logueo|Sistema de Logueo]]"
---

# Oraciones - Web - OWASP (Controles de Seguridad)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Controles

| ID           | Control                             | Detalle de implementación                                                                                                                                                                                        | OWASP ASVS categoría   |
| ------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| SEC-ORAC-001 | Sesión segura via Sistema de Logueo | Sesión gestionada por el Sistema de Logueo (Better Auth) del ecosistema; cookies httpOnly, Secure, SameSite=Lax; la app nunca crea ni renueva sesiones propias                                                   | V3 Autenticación       |
| SEC-ORAC-002 | RLS estricto en datos personales    | `favorites`, `collections`, `collection_items`, `preferences` con RLS `force row_level_security` y políticas `user_id = auth.uid()`; imposible leer/escribir filas ajenas incluso con cliente comprometido       | V4 Autorización        |
| SEC-ORAC-003 | Sanitización del contenido del CMS  | El texto del CMS se renderiza como contenido seguro; cualquier campo que permita HTML se sanea (allowlist de etiquetas básicas) en el render SSR para evitar inyección si el CMS resultara comprometido          | V5 Validación I/O      |
| SEC-ORAC-004 | Rate limiting en reportes           | `POST /api/reportes` limitado por IP + `session_hash` (por ejemplo, 3 reportes/hora de la misma huella) para prevenir spam de reportes y llenado de BD                                                           | V8 Protección de datos |
| SEC-ORAC-005 | Anonimización de reportes           | Se guarda únicamente `session_hash` (hash salteado de sesión/UA); nunca email, user_id ni texto libre de contacto; tabla insert-only (no legible desde la app)                                                   | V8 Privacidad          |
| SEC-ORAC-006 | Headers de seguridad HTTP           | Vercel: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Strict-Transport-Security` con preload, `Permissions-Policy` mínima                     | V14 Configuración      |
| SEC-ORAC-007 | RUM anónimo por diseño              | Eventos sin PII: slugs/categorías y longitudes; prohibido capturar el texto completo de la búsqueda, emails o ids; revisión de payload en cada release (checklist de PR)                                         | V8 Privacidad          |
| SEC-ORAC-008 | API keys solo en SSR                | Claves del CMS y de Supabase solo en server (Astro SSR / server actions); el cliente recibe únicamente el anon key con RLS; nada de secretos en el bundle                                                        | V14 Configuración      |
| SEC-ORAC-009 | Validación y codificación de slugs  | Slugs validados contra el catálogo del CMS; cualquier input fuera del patrón `[a-z0-9-]` no genera consulta; inexistente → 404 (sin reflejar el input en la respuesta)                                           | V5 Validación I/O      |
| SEC-ORAC-010 | CSP estricta                        | Content-Security-Policy: default-src 'self'; origen explícito para CMS/Supabase/Log; nonce para script inline del modo lectura; `object-src 'none'`, `frame-ancestors 'none'`; report-uri en modo shadow inicial | V14 Configuración      |

## Superficie de ataque y análisis

- **Superficie pública**: listados, búsquedas y ficha no requieren sesión. Riesgos relevantes: inyección vía CMS (SEC-ORAC-003), abuso del buscador (rate limiting del API del CMS, ver SLO) y scraping agresivo (también rate limits + cache).
- **Superficie autenticada**: colecciones/favoritos/recordatorios; el hecho de que la app cliente filtre por `user_id` es conveniencia, no seguridad; el boundary de seguridad es la RLS de Supabase (SEC-ORAC-002).
- **Secrets**: ninguna clave con poder de escritura/editorial se expone al cliente (SEC-ORAC-008).
- **Terceros**: el contenido del CMS no se confía a ciegas: se sanea al render (SEC-ORAC-003); Notificaciones recibe la preferencia desde el backend del ecosistema, no desde el cliente.

## Checklist de release (seguridad)

1. Verificar que ningún nuevo mensaje de log/RUM contiene PII (SEC-ORAC-007, ERM-ORAC-004).
2. Verificar migraciones: cada tabla nueva con RLS activada y políticas por `user_id` (SEC-ORAC-002).
3. Verificar headers y CSP en preview de Vercel (SEC-ORAC-006, SEC-ORAC-010).
4. Verificar que no se agregaron oraciones/textos hardcodeados (RB-ORAC-001) para evitar contenido no revisado (ERM-ORAC-001).
