# Contribuir a Fósforo

Gracias por contribuir al ecosistema `fosforo`.

Este monorepo trabaja con una regla simple: primero documentación, despues codigo.

## Antes de empezar

Lee esta ruta minima antes de proponer cambios:

1. `docs/README.md`
2. `docs/00-General/01-Guia-Lectura-Desarrolladores-e-IA.md`
3. `docs/00-General/02-Guia-Navegacion.md`
4. `docs/00-General/03-Indice-General.md`
5. `docs/01-Arquitectura/README.md`
6. `docs/02-Aplicaciones/00-README.md`

Si tu cambio toca una app o capacidad compartida, continua con su documentación especifica antes de editar codigo.

## Requisitos previos

- Node.js >= 18
- pnpm `10.33.2`
- Git

## Setup del entorno

```bash
git clone https://github.com/iiencinella/fosforo.git
cd fosforo
pnpm install
cp .env.example .env
```

## Estructura actual del monorepo

- `src/apps/` - workspaces web
- `src/mobile/` - workspaces mobile
- `src/desktop/` - workspaces desktop
- `src/packages/` - paquetes compartidos
- `db/` - scripts y utilidades de base de datos
- `docs/` - documentación funcional y tecnica
- `scripts/` - automatizaciónes del workspace
- `AGENTS.md` - directivas para agentes de IA

Para mas detalle: `docs/01-Arquitectura/Estructura Monorepo.md`.

## Reglas de contribucion

- No asumas que una app documentada ya esta implementada; verifica el estado real del repo.
- Si trabajas en UI, reutiliza primero `src/packages/ui` y `src/packages/tailwind-config`.
- Si falta documentación de una app o capacidad, dejalo explicito y evita inventar reglas de negocio.
- Si cambias arquitectura, auth, DB, tooling compartido o contratos reutilizables, revisa tambien la documentación transversal.

## Flujo de trabajo recomendado

1. Crea una rama desde `main` con el formato `<tipo>/<descripcion-kebab-case>` (ver [Convención de ramas en AGENTS.md](AGENTS.md#convención-de-ramas)).
2. Lee la documentación relevante del cambio.
3. Implementa respetando la estructura real del monorepo.
4. Ejecuta validaciónes proporcionales.
5. Actualiza documentación si el cambio altera arquitectura, alcance, contratos o estado de apps.
6. Haz commit y abre un Pull Request contra `main`.

## Validación minima esperada

Segun el tipo de cambio, corre lo que corresponda:

```bash
pnpm check-types
pnpm lint
pnpm test:unit
pnpm build
pnpm db:scripts:validate
```

Si cambias documentación de aplicaciónes o su estado:

```bash
pnpm docs:sync-app-status
```

Si creas una nueva app documental:

```bash
pnpm docs:new-app --fase <N> --plataforma <WEB|MOVIL|DESKTOP> --nombre "<NOMBRE APP>"
```

## Paquetes compartidos activos

Hoy los paquetes vigentes en `src/packages/` son:

- `@repo/ui`
- `@repo/tailwind-config`
- `@repo/mobile-auth-client`
- `@repo/api-utils`
- `@repo/eslint-config`
- `@repo/typescript-config`

Si tu cambio introduce una primitive, helper o contrato reutilizable, evalua primero si debe vivir en uno de estos paquetes.

## Changelog

Usamos `CHANGELOG.md` en la raiz para trazabilidad de cambios relevantes.

Agrega changelog cuando el cambio:

- modifica comportamiento funcional de una app o paquete compartido;
- corrige bugs visibles para usuarios o equipos internos;
- introduce cambios incompatibles o de migración;
- cambia contratos, seguridad, rendimiento o estabilidad de forma significativa.

No hace falta para:

- formato o refactor sin impacto funcional;
- tareas internas menores;
- debugging temporal.

## CI

GitHub Actions valida automaticamente, segun el workflow, combinaciónes de:

- `pnpm build`
- `pnpm check-types`
- `pnpm lint`
- `pnpm test:unit`
- `pnpm db:scripts:validate`
- `pnpm docs:sync-app-status`
- formato y consistencia de los workflows

Si tocas documentación de apps, asegurate de que `pnpm docs:sync-app-status` no deje diffs pendientes. Los workflows de CI usan permisos mínimos de solo lectura y desactivan las credenciales persistentes de checkout; cualquier automatización con permisos de escritura debe revisarse por separado.

## Pull Requests

Al abrir un PR:

- explica que cambiaste y en que rutas;
- indica que documentos respaldaron el cambio;
- resume validaciónes ejecutadas;
- menciona riesgos, limites o desalineaciónes detectadas entre documentación y codigo.

## Licencia

Al contribuir a Fósforo, aceptas el esquema de licencias del repositorio:

- codigo fuente y scripts: PolyForm Noncommercial 1.0.0;
- documentación y materiales de contenido: CC BY-NC 4.0.

Importante: la descripción publica correcta del codigo del repositorio es `source-available`, comunitario y no comercial. No debe describirse como Open Source en sentido OSI mientras mantenga la restricción de uso comercial.

Todo contenido textual o multimedia nuevo, adaptado o importado debe registrarse en `ATTRIBUTIONS.md` usando la plantilla obligatoria de atribución antes del merge.

Consulta:

- `LICENSE`
- `NOTICE`
- `ATTRIBUTIONS.md`
- `docs/03-Legal/README.md`
- `docs/03-Legal/RESPUESTAS-LICENCIA.md`
- `docs/03-Legal/LICENSE-RESPONSE-TEMPLATES.en.md`
