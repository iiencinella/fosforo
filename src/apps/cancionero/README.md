# Cancionero

Aplicación web de cancionero litúrgico con búsqueda textual, exploración por tiempo litúrgico/momento de misa y contribución comunitaria moderada.

## Documentación

Ver `docs/02-Aplicaciones/FASE_4-0401_cancionero/WEB/` para la documentación completa.

## Stack

- Astro 6 + React 19
- Tailwind CSS 4
- Supabase (Auth + DB + RLS)
- @repo/ui (sistema visual compartido)
- @repo/env (variables de entorno)
- Despliegue en Vercel (server mode)

## Scripts

```bash
pnpm dev          # Servidor local con --host
pnpm build        # Build producción
pnpm check-types  # Type checking
pnpm test:unit    # Tests unitarios (Vitest)
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CALENDARIO_API_URL` (opcional para detección automática del tiempo litúrgico)

Nota: no hardcodear secretos en el código ni commitear `.env`.

## Estado

MVP privado · Fase 4
