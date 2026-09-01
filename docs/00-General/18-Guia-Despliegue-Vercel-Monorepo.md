---
tags:
  - proyecto/fosforo
  - vercel
  - monorepo
  - deploy
type: guia-despliegue
area: general
status: vigente
created: 2026-08-31
updated: 2026-09-01
related:
  - "[[17-Control-de-Versiones-y-Releases|Control de Versiones y Releases]]"
  - "[[../01-Arquitectura/Estructura Monorepo|Estructura Monorepo]]"
---

# Guia de Despliegue Vercel en Monorepo

## Objetivo

Estandarizar el despliegue por app en Vercel para evitar builds innecesarios en PRs y asegurar que cada proyecto construya solo su workspace afectado.

## Regla de oro

- Un proyecto de Vercel por app web en `src/apps/*`.
- Cada proyecto debe apuntar a su `Root Directory` especifico.
- Cada proyecto debe usar build filtrado por workspace.
- Cada proyecto debe tener regla de skip por cambios afectados.

## Configuracion obligatoria por proyecto Vercel

En Vercel Dashboard > Project Settings > Build and Deployment:

1. Root Directory: `src/apps/<app>`
2. Framework Preset: auto-detectado (Astro) o equivalente del proyecto
3. Install Command: `pnpm install --frozen-lockfile`
4. Build Command: `pnpm turbo run build --filter=<app>`
5. Ignored Build Step: usar `ignoreCommand` definido en `vercel.json` del app
6. Root Directory > Skip deployment: habilitado

## Configuracion versionada en codigo

Cada app web tiene su `vercel.json` con este patron:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm turbo run build --filter=<app>",
  "ignoreCommand": "pnpm dlx turbo-ignore <app> --fallback=HEAD^1"
}
```

Semantica de `ignoreCommand` con `turbo-ignore`:

- Exit code `0`: la app no tiene cambios desde el ultimo deploy, Vercel salta el build.
- Exit code `1`: la app tiene cambios (o no se pudo determinar), Vercel ejecuta el build.

`turbo-ignore` compara contra `VERCEL_GIT_PREVIOUS_SHA` (el commit del ultimo deployment del proyecto) y resuelve el workspace por nombre. El flag `--fallback=HEAD^1` cubre el primer deploy o un redeploy sin commit previo comparable. A diferencia de `turbo query affected` (que compara contra el merge-base con la rama por defecto y siempre devuelve "sin cambios" en un push a main), `turbo-ignore` usa la comparacion correcta para deploys de Vercel y falla a favor de buildar ante cualquier duda.

## Mapa de apps web actuales

| App            | Workspace name   | Root Directory            | Archivo versionado                    |
| -------------- | ---------------- | ------------------------- | ------------------------------------- |
| Administracion | `administracion` | `src/apps/administracion` | `src/apps/administracion/vercel.json` |
| Biblia         | `biblia`         | `src/apps/biblia`         | `src/apps/biblia/vercel.json`         |
| Calendario     | `calendario`     | `src/apps/calendario`     | `src/apps/calendario/vercel.json`     |
| Cancionero     | `cancionero`     | `src/apps/cancionero`     | `src/apps/cancionero/vercel.json`     |
| Horarios       | `horarios`       | `src/apps/horarios`       | `src/apps/horarios/vercel.json`       |
| Log            | `log`            | `src/apps/log`            | `src/apps/log/vercel.json`            |
| Portal         | `portal`         | `src/apps/portal`         | `src/apps/portal/vercel.json`         |
| Usuario        | `usuario`        | `src/apps/usuario`        | `src/apps/usuario/vercel.json`        |

## Checklist rapido para onboarding de una app nueva

1. Crear `src/apps/<app>/vercel.json` con `buildCommand` e `ignoreCommand` filtrados.
2. Crear o vincular proyecto en Vercel apuntando a `src/apps/<app>`.
3. Copiar variables de entorno necesarias (Preview + Production).
4. Habilitar `Skip deployment` en Root Directory.
5. Abrir PR de verificacion y confirmar que apps no afectadas queden en skipped.

## Diagnostico rapido de problemas frecuentes

- Si Vercel compila todo el monorepo: revisar `Root Directory` del proyecto.
- Si no se saltea builds no afectados: revisar `ignoreCommand` y nombre del workspace en `package.json`.
- Si falla import de paquetes internos (`@repo/ui`, etc.): usar build via Turbo con `--filter=<app>` y mantener dependencias declaradas como `workspace:*`.
- Si hay 404 post-deploy: primero confirmar que el deployment termino en `Ready`; si fallo build, Vercel puede mostrar pagina de no encontrado del deployment.
