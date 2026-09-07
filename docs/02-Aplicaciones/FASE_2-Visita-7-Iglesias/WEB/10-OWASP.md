---
tags:
  - proyecto/fosforo
  - aplicacion
  - visita-7-iglesias
  - web
  - fase-2
  - owasp
type: app-owasp
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[08-Decisiones de Arquitectura]]"
  - "[[09-Especificacion Tecnica]]"
  - "[[11-SLA y SLO]]"
---

# OWASP - Visita 7 Iglesias

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Contexto de amenazas

La app expone: (1) endpoints de escritura de peregrinación autenticados, (2) consumo de contenido del CMS renderizado en HTML, (3) iframes de mapas embebidos, (4) telemetría RUM. Las amenazas principales son abuso de endpoints de escritura (spam de marcas), escalación de lectura entre usuarios (progreso ajeno), inyección vía contenido del CMS y fuga de credenciales (API keys de CMS/mapas en el cliente).

## Controles de seguridad

| ID          | Control                                                    | OWASP ref (ASVS/categoría)     | Criterio verificable                                                                                                                                                                                                                             | Estado    |
| ----------- | ---------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| SEC-V7I-001 | Auth obligatoria para marcar visitas                       | V2 Authentication              | Todo `POST /api/peregrinaciones*` valida sesión server-side (middleware Better Auth); sin sesión responde 401 (V7I-001) y **no existe** camino de escritura anónima; testeado en TC-V7I-007.                                                     | Pendiente |
| SEC-V7I-002 | RLS en `visita7`: peregrinaciones y visitas solo del dueño | V4 Access Control              | RLS habilitado en `pilgrimages`, `pilgrimage_visits` y `preferences` con `user_id = auth.uid()` (y join para visitas); un usuario autenticado no puede leer ni escribir peregrinaciones ajenas ni con IDs manipulados (probado con 403/0 filas). | Pendiente |
| SEC-V7I-003 | Idempotencia anti-duplicado server-side                    | V4 Access Control / integridad | `UNIQUE (pilgrimage_id, church_ref)` + `on conflict do nothing` en BD: re-marcar no duplica filas ni altera progreso aunque se replique el request (RB-V7I-002; testeado en TC-V7I-006).                                                         | Pendiente |
| SEC-V7I-004 | Rate limiting en endpoints de escritura                    | V4 API abuse                   | `/api/peregrinaciones*` y `/api/reportes` con rate limit por IP+sesión (ej. 30 req/min); 429 al exceder; protege el pico del Jueves Santo y el spam de marcas/reportes.                                                                          | Pendiente |
| SEC-V7I-005 | Headers de seguridad                                       | V14 Configuración              | HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` sin `geolocation` salvo consentimiento explícito, `X-Frame-Options`/`frame-ancestors` para la app; verificados en despliegue.  | Pendiente |
| SEC-V7I-006 | RUM anónimo sin PII                                        | V9 Comunicaciones/privacidad   | Eventos `v7i.*` solo transportan `itinerary_ref`, `church_ref`, progreso x/7 y duración; prohibido enviar user_id, email, coordenadas o texto libre; checklist de privacidad en cada release (ERM-V7I-005).                                      | Pendiente |
| SEC-V7I-007 | API keys solo en SSR (mapas y CMS sin keys expuestas)      | V14 Secretos                   | API key del CMS y URLs de mapa con credenciales viven solo en variables de entorno server-side (`ASTRO` SSR); nunca en `import.meta.env` accesible desde cliente ni en el HTML servido; el mapa al cliente llega como iframe público sin key.    | Pendiente |
| SEC-V7I-008 | Validación de slugs e IDs                                  | V5 Validación                  | `[slug]` validado contra formato (kebab-case, longitud) y existencia en CMS (404, V7I-005); `pilgrimage_id` y `church_ref` validados por formato (uuid / content_ref) y **pertenencia** al itinerario y al usuario (422/403, V7I-002).           | Pendiente |
| SEC-V7I-009 | Sanitización de contenido del CMS (XSS)                    | V5 Inyección                   | Todo texto del CMS (títulos, direcciones, oraciones) se renderiza como texto seguro (Astro/React escapan por defecto); prohibido `dangerouslySetInnerHTML`/`set:html` sin sanitización previa; reportes guardados como texto plano escapado.     | Pendiente |
| SEC-V7I-010 | CSP con iframe de mapas restringido por origen             | V14 Headers/CSP                | `Content-Security-Policy` con `frame-src` limitado al origen del proveedor de mapas usado por el CMS, `script-src 'self'` (+ dominios del ecosistema), `connect-src` a Supabase/Log/CMS interno; sin `unsafe-inline` para scripts.               | Pendiente |

## Notas transversales

- La superficie pública de lectura (itinerarios, fichas) no requiere auth y es cacheable: el riesgo se concentra en escritura, cubierta por SEC-V7I-001/002/003/004.
- El consentimiento de geolocalización (UC-V7I-007) es opt-in y se refleja en `Permissions-Policy`: sin consentimiento, el navegador ni siquiera expone la API de geolocalización a la app.
- Los reportes (`/api/reportes`) son insert-only y anónimos (`session_hash`): no almacenan user_id ni email (coherente con SEC-V7I-006).
- Revisión OWASP obligatoria pre-Jueves Santo junto con la verificación de contenido (ERM-V7I-001) y load test (ERM-V7I-002).
