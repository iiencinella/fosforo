# `@repo/env`

Acceso compartido a variables de entorno del ecosistema Fósforo.

Unifica el parser de `.env` (antes duplicado en 4 apps), centraliza la
cascade `import.meta.env` → `process.env` → archivo `.env`, y tipa las
variables por dominio.

## Uso básico

```ts
import { requireEnv, readEnv } from "@repo/env";

const token = requireEnv("API_TOKEN"); // lanza Error si falta
const name = readEnv("APP_NAME", "default"); // valor por defecto
```

## Getters por dominio

```ts
import { getSupabaseEnv, getSupabaseFullEnv } from "@repo/env";
import { getAdminEnv } from "@repo/env";
import { getBibliaEnv } from "@repo/env";
import { getPortalEnv } from "@repo/env";
import { isProduction } from "@repo/env";
```

| Getter                        | Variables que resuelve                                                                                     | Requiere             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------- |
| `getSupabaseEnv()`            | `SUPABASE_URL` / `PUBLIC_SUPABASE_URL` + `SUPABASE_ANON_KEY` / `SUPABASE_KEY` / `PUBLIC_SUPABASE_ANON_KEY` | Sí                   |
| `getSupabaseFullEnv()`        | Todo lo anterior + `SUPABASE_SERVICE_ROLE_KEY`                                                             | Sí                   |
| `getSupabaseServiceRoleKey()` | Solo `SUPABASE_SERVICE_ROLE_KEY`                                                                           | Sí                   |
| `readSupabaseEnv()`           | Mismas vars que `getSupabaseEnv()`                                                                         | No (devuelve `null`) |
| `getAdminEnv()`               | `ADMIN_SESSION_COOKIE`, `ADMIN_SESSION_MAX_AGE_SECONDS`, `ADMIN_ALLOWED_EMAIL_DOMAIN` (todas con fallback) | No                   |
| `requireAdminEnv()`           | Mismas vars que `getAdminEnv()`                                                                            | Sí                   |
| `getBibliaEnv()`              | `BIBLIA_INTERNAL_INGESTION_KEY`                                                                            | No (devuelve `null`) |
| `requireBibliaEnv()`          | Mismas vars que `getBibliaEnv()`                                                                           | Sí                   |
| `getPortalEnv()`              | `PUBLIC_PORTAL_WHATSAPP_NUMBER` (con fallback)                                                             | No                   |
| `isProduction()`              | `NODE_ENV === "production"`                                                                                | No                   |

## Schemas Zod

```ts
import { supabaseEnvSchema, adminEnvSchema } from "@repo/env/schemas";
```

## Agregar una nueva variable

Solo se necesita un lugar: el getter correspondiente. No más parsers
duplicados ni naming inconsistente entre apps.

## Apps migradas

horarios, log, usuario, calendario, administracion, biblia, portal
