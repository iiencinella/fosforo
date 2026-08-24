# AGENTS.md

## Proposito

Este archivo define las directivas de desarrollo para agentes de IA dentro del monorepo `fosforo`.
Antes de proponer, editar o generar codigo, el agente debe identificar el proyecto afectado, leer su documentación correspondiente y reutilizar la base visual compartida del workspace.

## Regla principal: primero documentación, luego codigo

Antes de implementar cambios, seguir este orden minimo:

1. Leer `docs/README.md`.
2. Leer `docs/00-General/01-Guia-Lectura-Desarrolladores-e-IA.md`.
3. Leer `docs/00-General/02-Guia-Navegacion.md` y `docs/00-General/03-Indice-General.md` si el alcance no esta claro.
4. Leer la documentación especifica del proyecto, app, plataforma o capacidad compartida que se va a tocar.
5. Recien despues revisar el codigo fuente correspondiente.

Si hay conflicto entre codigo y documentación, el agente debe:

- tomar la documentación vigente como fuente de contexto funcional y arquitectonico;
- validar en el codigo el estado real de implementación;
- dejar explicito en su respuesta cuando detecte desalineaciónes.

## Donde esta la documentación del proyecto

### Documentación general del ecosistema

- Punto de entrada: `docs/README.md`
- Onboarding IA/dev: `docs/00-General/01-Guia-Lectura-Desarrolladores-e-IA.md`
- Navegación general: `docs/00-General/02-Guia-Navegacion.md`
- Indice maestro: `docs/00-General/03-Indice-General.md`
- PRD/SRS/FRD maestros: `docs/00-General/06-PRD-Maestro.md`, `docs/00-General/07-SRS-Maestro.md`, `docs/00-General/08-FRD-Maestro.md`

### Arquitectura y decisiones transversales

- Arquitectura general: `docs/01-Arquitectura/README.md`
- Estructura del monorepo: `docs/01-Arquitectura/Estructura Monorepo.md`
- Stack tecnologico: `docs/01-Arquitectura/Stack Tecnologico.md`
- Capacidades compartidas: `docs/01-Arquitectura/Capacidades Compartidas/`
- Sistema visual compartido: `docs/01-Arquitectura/Plan-Unificación-Estilos-Globales.md`

### Documentación por aplicación

- Indice de aplicaciónes: `docs/02-Aplicaciones/00-README.md`
- Cada app tiene su carpeta en `docs/02-Aplicaciones/FASE_<N>-<nombre>/<PLATAFORMA>/`
- El prefijo numerico define el orden oficial de lectura, elaboración y mantenimiento para humanos y agentes de IA.
- Cada app debe revisarse, como minimo, a traves de:
  - `00-README.md`
  - `01-PRD.md`
  - `02-SRS.md`
  - `03-FRD.md`
  - `04-Flujos y Secuencias.md`
  - `05-Tests Unitarios.md`
  - `06-Esquema de Datos.md`
  - `07-ERM.md`
  - `08-Decisiones de Arquitectura.md`
  - `09-Especificación Tecnica.md`
  - `10-OWASP.md`
  - `11-SLA y SLO.md`

Orden canonico esperado por app:

1. `00-README.md`
2. `01-PRD.md`
3. `02-SRS.md`
4. `03-FRD.md`
5. `04-Flujos y Secuencias.md`
6. `05-Tests Unitarios.md`
7. `06-Esquema de Datos.md`
8. `07-ERM.md`
9. `08-Decisiones de Arquitectura.md`
10. `09-Especificación Tecnica.md`
11. `10-OWASP.md`
12. `11-SLA y SLO.md`

### Base de datos

- Documentación operativa DB: `db/README.md`
- Scripts y automatizaciónes: `db/scripts/`
- Para cambios de datos, complementar siempre con la documentación de la app afectada y con las capacidades compartidas relevantes.

## Mapeo esperado entre codigo y documentación

- Si trabajas en `src/apps/<app>`, busca primero su carpeta en `docs/02-Aplicaciones/` bajo plataforma `WEB`.
- Si trabajas en `src/mobile/<app>`, busca primero su carpeta en `docs/02-Aplicaciones/` bajo plataforma `MOVIL`.
- Si trabajas en `src/desktop/<app>`, busca primero su carpeta en `docs/02-Aplicaciones/` bajo plataforma `DESKTOP`.
- Si trabajas en `src/packages/*`, lee `docs/01-Arquitectura/` y, si aplica, `docs/01-Arquitectura/Capacidades Compartidas/`.

Si la documentación de una app no existe o esta incompleta, el agente debe dejarlo indicado y evitar inventar reglas de negocio no respaldadas.

## Skills a usar segun el caso

El agente debe cargar skills antes de implementar cuando el caso aplique.

- `brainstorming`: obligatorio antes de crear features, componentes, flujos o cambios de comportamiento.
- `ecosystem-ui-ux`: obligatorio para UI del ecosistema Fósforo, temas, navegación, view transitions, skeletons, grids y consistencia visual compartida.
- `frontend-design`: usar cuando se construye o rediseña una interfaz completa y se necesita elevar la calidad visual manteniendo el lenguaje del ecosistema.
- `tailwind-css-patterns`: usar para layout, utilidades Tailwind y composicion responsive.
- `astro` o `astro-framework`: usar en apps Astro, rutas, layouts, islands, content collections o view transitions.
- `accessibility`: usar en tareas de accesibilidad, teclado, lector de pantalla, contraste o WCAG.
- `web-design-guidelines`: usar para auditorias UI/UX y revisiones contra buenas practicas de interfaz.
- `supabase`: obligatorio para Auth, Database, Storage, Realtime, SSR con Supabase o flujos de sesion.
- `supabase-postgres-best-practices`: usar para esquema, SQL, performance e indices Postgres.
- `better-auth-best-practices`: usar si se toca autenticación basada en Better Auth.
- `nodejs-backend-patterns`: usar en APIs, servicios, middleware, validación y manejo de errores en backend Node.
- `nodejs-best-practices`: usar para decisiones generales de arquitectura Node y codigo de servidor.
- `turborepo`: usar para pipelines, filtros, cache, workspaces y cambios estructurales del monorepo.
- `vitest`: usar al crear o modificar pruebas unitarias.
- `typescript-advanced-types`: usar cuando haya tipos complejos, generics o utilidades de tipos.
- `deploy-to-vercel`: usar solo en tareas de despliegue a Vercel.

## Regla de estilos: usar `src/packages/ui` como base

Para desarrollar UI o estilos, el agente debe tomar `src/packages/ui` como primera referencia y fuente reutilizable.

- Reutilizar componentes, CSS y patrones existentes antes de crear variantes nuevas.
- Preferir imports compartidos como `@repo/ui`, `@repo/ui/styles.css`, `@repo/ui/foundation.css` y los exports de dominio ya existentes.
- Usar `src/packages/tailwind-config/shared-styles.css` como fuente de verdad para tokens compartidos.
- Evitar duplicar primitives visuales, tokens, cards, headers, shells, filtros, paginación o estados vacios dentro de cada app.
- Si hace falta una nueva primitive reutilizable, implementarla en `src/packages/ui` antes de dejarla aislada en una app.
- Dejar CSS de app solo para reglas estrictamente de dominio.

## Criterios de implementación para el agente

- Mantener consistencia con la documentación y con el design system compartido.
- No crear estilos ad hoc si ya existe una solucion en `src/packages/ui` o en `src/packages/tailwind-config`.
- No asumir que todas las carpetas del monorepo ya tienen implementación; confirmar la estructura real antes de editar.
- Si una tarea afecta arquitectura, auth, DB, estilos compartidos o contratos reutilizables, revisar tambien la documentación transversal antes de cambiar codigo.
- Al finalizar, indicar que documentos respaldaron la implementación y si hay huecos documentales detectados.

## Flujo de trabajo recomendado

Antes, durante y despues de cada cambio, el agente debe seguir este flujo:

1. Identificar el alcance real del cambio y la ruta del proyecto afectado.
2. Leer primero la documentación general y luego la documentación especifica de la app, paquete o capacidad compartida.
3. Revisar si ya existe una solucion reutilizable en `src/packages/ui`, `src/packages/tailwind-config` o en paquetes compartidos relaciónados.
4. Cargar las skills que correspondan al caso antes de implementar.
5. Implementar respetando patrones existentes, contratos, naming y estructura del monorepo.
6. Ejecutar validaciónes proporcionales al cambio realizado.

### Validación minima esperada

- UI o frontend: validar responsive, estados vacios, accesibilidad basica, imports compartidos y ausencia de duplicación innecesaria.
- Tipos o logica TypeScript: correr `pnpm check-types` o el comando equivalente del paquete afectado.
- Lint y estilo: correr `pnpm lint` o el comando equivalente si el cambio lo justifica.
- Tests unitarios: correr `pnpm test:unit` o el scope del proyecto afectado cuando se modifica logica, contratos o comportamiento.
- Base de datos o Supabase: validar scripts y consistencia documental antes de cerrar el cambio.

Si no es posible ejecutar alguna validación, el agente debe indicarlo explicitamente y dejar pasos de verificación manual concretos.

### Cierre esperado en la respuesta final

- Explicar que se cambio y en que rutas.
- Indicar que documentos respaldaron la implementación.
- Mencionar validaciónes ejecutadas y resultados.
- Señalar riesgos, limites o desalineaciónes detectadas entre documentación y codigo.
- Si el usuario acepta los cambios, registrarlo en un archivo de novedades explciando, de manera simple, los cambios realizados y el porqué se aplicaron.

## Convencion de archivo para instrucciones de agentes

La convencion oficial del repositorio es usar `AGENTS.md`.

- No crear variantes paralelas como `AGENT.md` en la raiz.
- Si en el futuro se agregan instrucciones por subcarpeta o skill, mantener el mismo nombre `AGENTS.md`.
- Si aparece un archivo `AGENT.md`, migrar su contenido a `AGENTS.md` y eliminar la duplicación para evitar ambiguedad.

## Convención de ramas

Toda rama se crea desde `main` con el formato `<tipo>/<descripcion-kebab-case>`, espejando el tipo del conventional commit que la rama va a producir.

| Tipo        | Uso                                                  | Ejemplo                            |
| ----------- | ---------------------------------------------------- | ---------------------------------- |
| `feat/`     | Nueva funcionalidad                                  | `feat/log-mvp-completacion`        |
| `fix/`      | Corrección de bug                                    | `fix/turbo-cache-vercel-output`    |
| `refactor/` | Reestructuración sin cambio de comportamiento        | `refactor/env-unificacion`         |
| `chore/`    | Mantenimiento, dependencias, tooling                 | `chore/actualizacion-dependencias` |
| `docs/`     | Solo documentación                                   | `docs/env-sensitive-runtime`       |
| `test/`     | Agregar o corregir pruebas                           | `test/biblia-e2e`                  |
| `hotfix/`   | Corrección urgente de producción (mismo flujo de PR) | `hotfix/health-endpoint`           |

Reglas:

1. kebab-case en minúsculas, sin acentos ni ñ (compatibilidad Windows, URLs y shells).
2. Breve: 2 a 5 palabras que describan el cambio.
3. Si el cambio responde a un issue, prefijar el número: `fix/142-health-endpoint`.
4. Las ramas de ambiente (`preproduction-*`, `dev`) son una clase aparte y no siguen este esquema.
5. Los pushes directos a `main` están bloqueados por el ruleset "proteger-main": todo cambio llega vía Pull Request.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
