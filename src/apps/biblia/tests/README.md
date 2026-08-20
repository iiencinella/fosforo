# Pruebas de integración y E2E

## Integración Supabase

Las pruebas verifican el contrato real de Supabase usando únicamente la clave pública:

- lectura de versiones habilitadas;
- RPC de lectura de capítulos;
- fecha sin lecturas litúrgicas;
- aislamiento de `biblia_ingestion_runs` mediante RLS;
- rechazo de escritura pública en `biblia_ingestion_runs`.

Se ejecutan explícitamente para evitar que un `test:unit` toque un proyecto remoto. Requieren `SUPABASE_URL` y una clave pública (`SUPABASE_ANON_KEY`, `SUPABASE_KEY` o `PUBLIC_SUPABASE_ANON_KEY`) disponibles en el proceso:

```bash
BIBLIA_RUN_INTEGRATION=true pnpm --filter=biblia test:integration
```

## E2E HTTP

Las pruebas E2E ejercitan el servidor Astro/Vercel ya levantado, incluyendo páginas, health check, errores de validación, fecha sin liturgia y protección del endpoint interno.

```bash
BIBLIA_E2E_BASE_URL=http://localhost:4321 pnpm --filter=biblia test:e2e
```

No se crean registros persistentes durante estas pruebas. La prueba de permisos intenta una escritura inválida con el rol público y espera que RLS la rechace.
