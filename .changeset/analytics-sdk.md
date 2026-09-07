---
"@repo/analytics": minor
---

Nuevo paquete compartido del SDK de RUM del ecosistema. API publica: init, track, captureVitals, setConsent, hasConsent, respectDNTStatus e isTrackingActive. Captura automatica de pageviews, Web Vitals (LCP/INP/CLS con umbrales estandar) y errores de frontend; envio via sendBeacon con fallback a fetch keepalive (y de cola llena a fetch); sesion anonima por sessionStorage; consentimiento y DNT respetados; sampling opcional del lado cliente (el default 100/10/100 vive en el servidor). Nunca lanza hacia la app anfitriona y hace no-op en SSR. Incluye script size:check que verifica el limite de 5KB gzip (2114 B actual).
