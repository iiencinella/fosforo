---
tags:
  - proyecto/fosforo
  - calendario
  - runbook
  - operaciones
type: app-runbook
area: aplicaciones
status: vigente
created: 2026-08-25
updated: 2026-08-25
related:
  - "[[00-README|0103 Calendario]]"
  - "[[11-SLA y SLO|SLA y SLO]]"
---

# Runbook Operativo - 0103 Calendario

## Ficha

- Deployment: Vercel, proyecto `fosforo-calendario` (`https://fosforo-calendario.vercel.app`).
- Datos: Supabase PostgreSQL — `public.liturgy_daily_readings` (núcleo), `public.liturgy_day_profiles` (proyección mensual 365 días).
- Acceso público: lectura vía anon key con RLS; escritura denegada para anon/authenticated.

## Verificación diaria (o post-alerta)

1. Health: `GET /api/health` → esperado `200 {"status":"ok"}`. `503 degraded` indica Supabase inalcanzable; revisar credenciales y estado del proyecto.
2. Contrato del día: `GET /api/calendar/day?date=<hoy>` → esperado `200` con `celebrationTitle`.
3. Contrato mensual: `GET /api/calendar/month?year=<año>&month=<mes>` → esperado `200` con 28–31 entradas.
4. Widget embebible: `GET /widget/day` → `200`.

## Gates de tests

```bash
# Unitario + E2E/integración opt-in (requiere .env con SUPABASE_URL y SUPABASE_ANON_KEY)
pnpm --filter calendario test:unit
CALENDARIO_RUN_INTEGRATION=true pnpm --filter calendario exec vitest run tests/integration
CALENDARIO_E2E_BASE_URL=https://fosforo-calendario.vercel.app pnpm --filter calendario exec vitest run tests/e2e
```

Estado verificado 2026-08-25: unit 21 OK · integración remota 3/3 · E2E producción 3/5.

## Problemas conocidos

- **Cache-Control en producción:** el E2E espera `s-maxage=300` pero el deploy responde `public`. El código fuente define la política correcta (`src/pages/api/calendar/day.ts:13`). Investigar build desplegado vs adapter de Vercel antes de tocar código.
- **Ciclo litúrgico nuevo año:** regenerar/enriquecer `liturgy_day_profiles` para el año siguiente antes del Adviento (fuente GCatholic, script de enriquecimiento).

## Escalado

1. Supabase degradado → verificar status.supabase.com y credenciales en Vercel.
2. Datos incorrectos del día → corregir fila en `liturgy_daily_readings`; la proyección se reconstruye desde el núcleo.
3. Sin resolución en 30 min → abrir issue con logs del panel Log (app `calendario`).
