---
"log": minor
---

Agrega la ingesta anonima de RUM: endpoints POST /api/rum y POST /api/rum/vitals con taxonomia whitelist de eventos, validacion anti-PII de metadata, rate limit anonimo por cliente (1000/min, patron de ventana fija), sampling configurable por app desde rum_sampling_config, actualizacion de sesiones anonimas y descarte silencioso de eventos sin consentimiento. Incluye repositorio con fallback en memoria solo para desarrollo local.
