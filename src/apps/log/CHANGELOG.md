# log

## 0.1.0

### Minor Changes

- 80e9840: Agrega el dashboard de producto RUM separado del panel operativo: ruta /dashboard-producto con top paginas, distribucion de Web Vitals (LCP/INP/CLS), actividad diaria y eventos por app; endpoints /api/dashboard/producto, /producto/funnel (embudos de 2 a 5 eventos con sesiones unicas y porcentajes) y /producto/retention (serie diaria como proxy de retencion por decision de privacidad ADR-LOG-RUM-004). Acceso para roles dev/ops/product via el RBAC unificado. Agregaciones en Postgres via RPCs nuevos (get_rum_top_pages, get_rum_vitals_distribution, get_rum_events_by_app, get_rum_funnel, get_rum_daily_sessions) con migracion incluida.
- e747f40: Agrega la ingesta anonima de RUM: endpoints POST /api/rum y POST /api/rum/vitals con taxonomia whitelist de eventos, validacion anti-PII de metadata, rate limit anonimo por cliente (1000/min, patron de ventana fija), sampling configurable por app desde rum_sampling_config, actualizacion de sesiones anonimas y descarte silencioso de eventos sin consentimiento. Incluye repositorio con fallback en memoria solo para desarrollo local.
- 4049ef3: Unifica el modelo de roles del ecosistema en el RBAC compartido (profiles.role_id -> roles + permissions): la app log deja de resolver dev/ops via app_metadata del JWT y ahora resuelve el rol desde el perfil del usuario, incorporando los roles de plataforma dev, ops y product. Incluye migracion de policies RLS de log_entries y helpers SQL current_user_role_slug() y user_has_app_permission().

### Patch Changes

- Updated dependencies [1a836d6]
- Updated dependencies [28da401]
- Updated dependencies [4049ef3]
  - @repo/ui@0.2.0
  - @repo/auth@0.1.0

## 0.0.2

### Patch Changes

- Updated dependencies [1434aae]
  - @repo/ui@0.1.0
