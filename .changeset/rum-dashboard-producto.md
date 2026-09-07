---
"log": minor
---

Agrega el dashboard de producto RUM separado del panel operativo: ruta /dashboard-producto con top paginas, distribucion de Web Vitals (LCP/INP/CLS), actividad diaria y eventos por app; endpoints /api/dashboard/producto, /producto/funnel (embudos de 2 a 5 eventos con sesiones unicas y porcentajes) y /producto/retention (serie diaria como proxy de retencion por decision de privacidad ADR-LOG-RUM-004). Acceso para roles dev/ops/product via el RBAC unificado. Agregaciones en Postgres via RPCs nuevos (get_rum_top_pages, get_rum_vitals_distribution, get_rum_events_by_app, get_rum_funnel, get_rum_daily_sessions) con migracion incluida.
