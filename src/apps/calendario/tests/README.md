# Pruebas operativas de Calendario

## Unitarias

```bash
pnpm --filter=calendario test:unit
```

Incluyen validadores, mapeadores, estados de error, health degradado y protección contra filtrado de errores internos.

## Integración Supabase

Requiere `SUPABASE_URL` y una clave pública disponibles en el proceso. No usa `service_role` ni deja registros persistentes.

```bash
CALENDARIO_RUN_INTEGRATION=true pnpm --filter=calendario test:integration
```

Valida lectura pública, cobertura de 365 perfiles y rechazo de escrituras por RLS.

## E2E HTTP

Con el servidor Astro levantado:

```bash
CALENDARIO_E2E_BASE_URL=http://localhost:4321 pnpm --filter=calendario test:e2e
```

Valida páginas, widget, health, contratos diarios/mensuales, headers de cache y errores de entrada.
