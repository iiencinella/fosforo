# Calendario Litúrgico

App web del ecosistema Fósforo para resolver la jornada litúrgica diaria y publicar contratos reutilizables para otras apps.

## Stack

- Astro
- TypeScript
- Tailwind CSS
- `@repo/ui`
- Supabase

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm preview`
- `pnpm check-types`

## Variables requeridas

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Tambien se aceptan `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` como aliases server-side cuando el entorno de despliegue ya usa esa convención.

En desarrollo local, si Astro o el proceso Node no inyectan esas variables en runtime, el calendario también intenta leerlas desde `src/apps/calendario/.env` y `.env.local`.

## Alcance MVP

- Jornada actual
- Vista mensual
- Detalle diario
- Endpoints `day`, `month` y `health`

## Nota sobre build en Windows

El workspace puede fallar en `pnpm build` cuando `@astrojs/vercel` intenta crear symlinks dentro de `.vercel/output` y el entorno Windows no los permite. Si eso ocurre, la recomendación es validar localmente con `pnpm check-types` y `pnpm test:unit`, y ejecutar el build final en CI Linux, WSL o con permisos de symlink habilitados.

## Documentación

La documentación completa está en `docs/02-Aplicaciones/FASE_1-0103_calendario/WEB/`:

| Documento                          | Descripción                                  |
| ---------------------------------- | -------------------------------------------- |
| `00-README.md`                     | Contexto, owners y alcance del producto      |
| `01-PRD.md`                        | Necesidad de producto y objetivos            |
| `02-SRS.md`                        | Requisitos verificables del sistema          |
| `03-FRD.md`                        | Comportamiento funcional y reglas de negocio |
| `04-Flujos y Secuencias.md`        | Recorridos de usuario y escenarios           |
| `05-Tests Unitarios.md`            | Estrategia de validación                     |
| `06-Esquema de Datos.md`           | Entidades y relaciones                       |
| `07-ERM.md`                        | Riesgos, errores y runbooks                  |
| `08-Decisiones de Arquitectura.md` | Decisiones clave y trade-offs                |
| `09-Especificación Tecnica.md`     | Stack, módulos e implementación              |
| `10-OWASP.md`                      | Controles y evidencias de seguridad          |
| `11-SLA y SLO.md`                  | Compromisos operativos                       |
