---
tags:
  - proyecto/fosforo
  - capacidades-compartidas
  - variables-de-entorno
  - configuracion
type: guia
area: arquitectura
status: vigente
created: 2026-08-23
updated: 2026-08-23
related:
  - "[[README|Capacidades Compartidas]]"
  - "[[../Stack Tecnologico|Stack tecnologico]]"
  - "[[SRS-Observabilidad-y-Auditoria|SRS Observabilidad y Auditoria]]"
---

# Guía de Variables de Entorno

Esta guía es la fuente de verdad para nombrar, declarar, documentar y desplegar variables de entorno en el monorepo `fosforo`. Aplica a todas las aplicaciones (`src/apps/*`), paquetes compartidos (`src/packages/*`) y proyectos de Vercel.

## Principios

1. **Una variable, un nombre canónico.** Los alias están deprecados y se eliminan después de la transición.
2. **Server-only sin prefijo.** `PUBLIC_` se reserva exclusivamente para variables que llegan al bundle del cliente.
3. **Nunca instanciar clientes con variables de entorno a nivel de módulo.** Si falta una variable, el error debe ocurrir al usar el cliente, no al cargar el bundle (evita 500 globales en Vercel).
4. **Toda variable nueva se declara en tres lugares:** código vía `@repo/env`, `.env.example` raíz y esta guía.
5. **Cambiar una variable en Vercel exige redesplegar** para que aplique en los deployments existentes.

## Convención de nombres

| Regla                                | Formato        | Ejemplo                          |
| ------------------------------------ | -------------- | -------------------------------- |
| Server-only (default)                | `SCOPE_NOMBRE` | `SUPABASE_URL`, `RESEND_API_KEY` |
| Expuesta al cliente web (Astro)      | `PUBLIC_`      | `PUBLIC_PORTAL_WHATSAPP_NUMBER`  |
| Expuesta al cliente mobile (Expo)    | `EXPO_PUBLIC_` | `EXPO_PUBLIC_API_BASE_URL`       |
| Por aplicación (colisión entre apps) | `APP_NOMBRE`   | `BIBLIA_INTERNAL_INGESTION_KEY`  |
| Sistema / runtime                    | reservado      | `NODE_ENV`                       |

Notas:

- Mayúsculas y guiones bajos únicamente.
- El prefijo por app solo se usa si la variable es exclusiva de una app y podría colisionar; las capacidades compartidas usan el scope del paquete (`SUPABASE_*`, `LOGS_*`, `ADMIN_*`).
- No introducir alias nuevos bajo ninguna circunstancia.

## Paquete `@repo/env`

Toda lectura de variables del servidor pasa por `src/packages/env` (`@repo/env`). Nunca leer `process.env` directamente desde una app (excepciones vigentes: `NODE_ENV` en `common.ts`, `log-client.ts` y sesiones de `log`).

API principal:

| Función                                             | Uso                                                                                                                               |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `readEnv("CLAVE")`                                  | Lee la variable; devuelve `""` si falta. Resuelve alias deprecados con warning.                                                   |
| `requireEnv("CLAVE")`                               | Igual que `readEnv`, pero lanza `MissingEnvError` si falta.                                                                       |
| `requireEnvValues("A", "B", ...)`                   | Valida varias variables juntas y lanza un único error agregado con todas las faltantes. Preferir esta para grupos (ej. Supabase). |
| `getSupabaseEnv()` / `getSupabaseFullEnv()`         | Cliente anónimo / con service role. Valida formato con esquemas Zod.                                                              |
| `readSupabaseEnv()`                                 | Versión tolerante: devuelve `null` si falta algo.                                                                                 |
| `getAdminEnv()`, `getBibliaEnv()`, `getPortalEnv()` | Getters por dominio, con defaults seguros.                                                                                        |

Los esquemas Zod viven en `@repo/env/schemas` y son la validación canónica de los valores.

### Patrón obligatorio de inicialización perezosa

```ts
// Bien: factory con cache, resuelve env recien en el primer uso
let cachedClient: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (!cachedClient) {
    const { url, anonKey } = getSupabaseEnv();
    cachedClient = createClient(url, anonKey);
  }
  return cachedClient;
}
```

```ts
// Mal: crash global si falta la variable (500 en todas las rutas)
const { url, anonKey } = getSupabaseEnv();
export const supabase = createClient(url, anonKey);
```

Referencias vigentes del patrón correcto: `src/apps/biblia/src/db/supabase.ts`, `src/apps/log/src/lib/supabase.ts`, `src/apps/horarios/src/lib/supabase.ts`.

## Catálogo canónico de variables

Variables compartidas de plataforma:

| Variable                        | Descripción                                                    | Usada por                                                              | Requerida              |
| ------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------- |
| `SUPABASE_URL`                  | URL del proyecto Supabase                                      | biblia, calendario, cancionero, horarios, log, usuario, administracion | Sí donde aplica        |
| `SUPABASE_ANON_KEY`             | Clave anónima (RLS activo)                                     | Mismas que arriba                                                      | Sí donde aplica        |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clave service role. **Solo server**, operaciones privilegiadas | cancionero, horarios, log, usuario, administracion                     | Según app              |
| `LOGS_API_URL`                  | Base URL de la API de logs (app log)                           | biblia, cancionero, portal, usuario                                    | No (logging opcional)  |
| `LOGS_API_KEY`                  | API key de ingesta de logs                                     | Mismas que arriba                                                      | No (logging opcional)  |
| `ADMIN_SESSION_COOKIE`          | Nombre de cookie de sesión admin                               | administracion                                                         | Sí para administracion |
| `ADMIN_SESSION_MAX_AGE_SECONDS` | TTL de sesión admin en segundos                                | administracion                                                         | Sí para administracion |
| `ADMIN_ALLOWED_EMAIL_DOMAIN`    | Dominio permitido para admins (vacío = todos)                  | administracion                                                         | No                     |

Por aplicación:

| Variable                        | App                                             | Requerida                         |
| ------------------------------- | ----------------------------------------------- | --------------------------------- |
| `BIBLIA_INTERNAL_INGESTION_KEY` | biblia (API interna de ingesta)                 | Sí para habilitar ingesta         |
| `CALENDARIO_API_URL`            | cancionero (consume API de calendario)          | No (degrada sin tiempo litúrgico) |
| `PUBLIC_PORTAL_WHATSAPP_NUMBER` | portal                                          | No (tiene default en código)      |
| `RESEND_API_KEY`                | portal (emails)                                 | Sí para feedback/contacto         |
| `FEEDBACK_EMAIL_TO`             | portal (destinatario)                           | Sí para feedback/contacto         |
| `EXPO_PUBLIC_API_BASE_URL`      | mobile (futuro, vía `@repo/mobile-auth-client`) | Sí para mobile                    |
| `EXPO_PUBLIC_DEMO_USER_ID`      | mobile (futuro)                                 | No                                |

Solo locales (CLI, CI, scripts; **no configurar en Vercel**):

| Variable                | Uso               |
| ----------------------- | ----------------- |
| `SUPABASE_PROJECT_REF`  | CLI de Supabase   |
| `SUPABASE_ACCESS_TOKEN` | CLI de Supabase   |
| `SUPABASE_DB_PASSWORD`  | CLI / migraciones |

## Matriz por proyecto Vercel

Estado objetivo tras la unificación (Production y Preview):

| Proyecto                                 | Variables requeridas                                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `fosforo-biblia`                         | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BIBLIA_INTERNAL_INGESTION_KEY`, `LOGS_API_URL`, `LOGS_API_KEY`                       |
| `fosforo-calendario`                     | `SUPABASE_URL`, `SUPABASE_ANON_KEY`                                                                                        |
| `fosforo-cancionero`                     | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CALENDARIO_API_URL`, `LOGS_API_URL`, `LOGS_API_KEY`     |
| `horariosdemisas-prod`                   | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`                                                           |
| `fosforo-log`                            | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`                                                           |
| `fosforo-portal`                         | `RESEND_API_KEY`, `FEEDBACK_EMAIL_TO`, `LOGS_API_URL`, `LOGS_API_KEY`                                                      |
| `fosforo-usuario`                        | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `LOGS_API_URL`, `LOGS_API_KEY`                                                        |
| `fosforo-administracion` (cuando exista) | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ADMIN_SESSION_COOKIE`, `ADMIN_SESSION_MAX_AGE_SECONDS`, `ADMIN_ALLOWED_EMAIL_DOMAIN` |

Reglas de higiene en Vercel:

- Las claves y tokens se marcan como **Sensitive**.
- El entorno Development queda reservado para trabajo local con archivos `.env.local` (gitignored); no duplicar en Vercel salvo necesidad real.
- Después de crear o modificar variables: **Redeploy** del proyecto (sin cache si el problema es de build).

## Alias deprecados (transición)

Mientras dure la transición, `@repo/env` resuelve estos alias emitiendo un warning y los elimina en una versión futura:

| Alias deprecado            | Canónica            |
| -------------------------- | ------------------- |
| `PUBLIC_SUPABASE_URL`      | `SUPABASE_URL`      |
| `PUBLIC_SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY` |
| `SUPABASE_KEY`             | `SUPABASE_ANON_KEY` |
| `LOGS_INGEST_API_KEY`      | `LOGS_API_KEY`      |

Plan de remoción:

1. Alinear todos los proyectos de Vercel con las canónicas.
2. Verificar en logs de build/dev que no queden warnings de alias.
3. Eliminar el soporte de alias de `reader.ts` y limpiar variables alias de Vercel.

## Checklist: agregar una variable nueva

1. Definir nombre según convención y decidir si es client-exposed.
2. Leerla desde `@repo/env` (agregar getter de dominio si corresponde) y nunca a nivel de módulo.
3. Agregarla a `.env.example` raíz con comentario de alcance.
4. Documentarla en el catálogo de esta guía y en la matriz del proyecto afectado.
5. Configurarla en Vercel (Production y Preview) y redesplegar.
6. Si reemplaza una existente: sumarla a la tabla de alias deprecados con fecha de remoción.

## Limpieza detectada (pendiente de ejecutar)

Variables presentes en Vercel pero sin uso en código (candidatas a remover tras verificación):

- `AUTH_COOKIE_DOMAIN`: presente en varios proyectos, sin lecturas en el repo.
- `ADMIN_*`: presentes en proyectos que no son administracion (copiado masivo histórico); inofensivas pero ruidosas.
- `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`: mover a política local-only (CLI), remover de runtime cuando el flujo de deploy lo permita.

Infraestructura adicional: `horariosdemisas-prod` corre Node 20.x mientras `package.json` exige `>=22.12.0`; alinear versión de Node en Vercel antes del próximo deploy de horarios.
