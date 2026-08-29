# Ecosistema Fósforo

[![Tests unitarios](https://github.com/iiencinella/fosforo/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/iiencinella/fosforo/actions/workflows/unit-tests.yml)
[![Build y tipos](https://github.com/iiencinella/fosforo/actions/workflows/build-and-types.yml/badge.svg)](https://github.com/iiencinella/fosforo/actions/workflows/build-and-types.yml)
[![Lint](https://github.com/iiencinella/fosforo/actions/workflows/lint.yml/badge.svg)](https://github.com/iiencinella/fosforo/actions/workflows/lint.yml)

Fósforo es un ecosistema digital comunitario para evangelización, formación y vida fraterna. El repositorio es un monorepo con aplicaciones web, capacidades compartidas, documentación spec-driven y herramientas de desarrollo.

> El proyecto es source-available, comunitario y no comercial. No debe presentarse como Open Source en sentido OSI mientras la licencia mantenga la restricción de uso comercial.

## Por dónde empezar

Elige el recorrido que corresponda a tu objetivo:

| Quiero...                             | Empiezo en...                                                            |
| ------------------------------------- | ------------------------------------------------------------------------ |
| Entender el proyecto                  | [`docs/README.md`](docs/README.md)                                       |
| Entender la arquitectura              | [`docs/01-Arquitectura/README.md`](docs/01-Arquitectura/README.md)       |
| Trabajar en una aplicación            | [`docs/02-Aplicaciones/00-README.md`](docs/02-Aplicaciones/00-README.md) |
| Ejecutar o modificar la base de datos | [`db/README.md`](db/README.md)                                           |
| Proponer código o documentación       | [`CONTRIBUTING.md`](CONTRIBUTING.md)                                     |
| Consultar licencias y atribuciones    | [`docs/03-Legal/README.md`](docs/03-Legal/README.md)                     |

La regla del proyecto es **documentación primero, código después**. Para cambios de alcance amplio, sigue esta ruta:

1. [`docs/README.md`](docs/README.md)
2. [`docs/00-General/01-Guia-Lectura-Desarrolladores-e-IA.md`](docs/00-General/01-Guia-Lectura-Desarrolladores-e-IA.md)
3. [`docs/00-General/02-Guia-Navegacion.md`](docs/00-General/02-Guia-Navegacion.md)
4. [`docs/00-General/03-Indice-General.md`](docs/00-General/03-Indice-General.md)
5. [`docs/01-Arquitectura/README.md`](docs/01-Arquitectura/README.md)
6. [`docs/02-Aplicaciones/00-README.md`](docs/02-Aplicaciones/00-README.md)

En una aplicación, el prefijo numérico define el orden oficial: `00-README.md` → `01-PRD.md` → `02-SRS.md` → `03-FRD.md` → `04-Flujos y Secuencias.md` → `05-Tests Unitarios.md` → `06-Esquema de Datos.md` → `07-ERM.md` → `08-Decisiones de Arquitectura.md` → `09-Especificacion Tecnica.md` → `10-OWASP.md` → `11-SLA y SLO.md`.

## Mapa del repositorio

```text
fosforo/
├── src/
│   ├── apps/              # Aplicaciones web Astro implementadas
│   ├── mobile/            # Futuros workspaces React Native / Expo
│   ├── desktop/           # Futuros workspaces Electron
│   └── packages/          # Paquetes compartidos del ecosistema
├── db/
│   ├── supabase/          # Configuración, migraciones y seeds
│   └── scripts/           # Validación y operaciones DB
├── docs/
│   ├── 00-General/        # Onboarding, visión, requisitos y plantillas
│   ├── 01-Arquitectura/  # Monorepo, plataformas y capacidades comunes
│   ├── 02-Aplicaciones/   # Especificación de cada aplicación
│   └── 03-Legal/          # Licencias, respuestas y atribuciones
├── scripts/               # Automatización documental y de catálogo
├── .github/               # CI, plantillas de issues y pull requests
├── .agents/               # Skills e instrucciones para agentes
├── .opencode/             # Integración local de OpenCode
├── AGENTS.md              # Reglas de trabajo para agentes
├── DESIGN.md              # Criterios visuales y de diseño
├── CONTRIBUTING.md        # Proceso para colaborar
├── package.json           # Comandos raíz y herramientas del monorepo
├── pnpm-workspace.yaml    # Definición de workspaces
└── turbo.json             # Pipeline de Turborepo
```

### Estado actual

- Las aplicaciones web activas están en `src/apps/`: `administracion`, `biblia`, `calendario`, `cancionero`, `horarios`, `log`, `portal` y `usuario`.
- `src/mobile/` y `src/desktop/` están reservados para futuras plataformas.
- Los paquetes compartidos incluyen UI, configuración Tailwind, autenticación mobile, utilidades API, autenticación, notificaciones, entorno, TypeScript y ESLint.
- La relación entre una app documentada y su workspace se mantiene en [`docs/00-General/04-Listado-de-Aplicaciones.md`](docs/00-General/04-Listado-de-Aplicaciones.md).
- `graphify-out/`, logs, coberturas y otros artefactos locales son generados y no forman parte del árbol público versionado.

## Stack y comandos

- Web: Astro, React, Tailwind CSS y TypeScript.
- Mobile: React Native, Expo y Expo Router.
- Desktop: Electron.
- Datos: Supabase/PostgreSQL, Auth, Storage y Realtime.
- Tooling: pnpm, Turborepo y GitHub Actions.

Requisitos: Node.js `>=18` y pnpm `10.33.2`.

```bash
corepack enable
corepack prepare pnpm@10.33.2 --activate
git clone https://github.com/iiencinella/fosforo.git
cd fosforo
pnpm install
cp .env.example .env
```

Comandos habituales:

| Comando                                                                               | Uso                                 |
| ------------------------------------------------------------------------------------- | ----------------------------------- |
| `pnpm dev`                                                                            | Desarrollo del monorepo             |
| `pnpm build`                                                                          | Build de los workspaces             |
| `pnpm lint`                                                                           | Lint                                |
| `pnpm check-types`                                                                    | Chequeo de tipos                    |
| `pnpm test:unit`                                                                      | Tests unitarios                     |
| `pnpm db:scripts:validate`                                                            | Validación de scripts DB            |
| `pnpm docs:sync-app-status`                                                           | Sincronización de índices y estados |
| `pnpm docs:new-app --fase <N> --plataforma <WEB\|MOVIL\|DESKTOP> --nombre "<NOMBRE>"` | Scaffold documental                 |

Para ejecutar una tarea en un workspace concreto, usa el filtro de pnpm/Turborepo, por ejemplo `pnpm build --filter=@repo/ui`.

## Cómo ayudar

1. Lee la documentación correspondiente antes de editar.
2. Comprueba el estado real del código; una app documentada puede no estar implementada.
3. Reutiliza primero `src/packages/ui` y `src/packages/tailwind-config` en cualquier cambio de UI.
4. Actualiza documentación, índices o changelog cuando cambien alcance, contratos, arquitectura o comportamiento.
5. Ejecuta las validaciones proporcionales al cambio y describe sus resultados en el Pull Request.
6. No agregues reglas de negocio sin respaldo documental y no incluyas secretos, `.env` ni artefactos generados.

### Convención de ramas

Toda rama nace desde `main` con el formato `<tipo>/<descripcion-kebab-case>`:

| Tipo        | Uso                                           |
| ----------- | --------------------------------------------- |
| `feat/`     | Nueva funcionalidad                           |
| `fix/`      | Corrección de bug                             |
| `refactor/` | Reestructuración sin cambio de comportamiento |
| `chore/`    | Mantenimiento y tooling                       |
| `docs/`     | Solo documentación                            |
| `test/`     | Pruebas                                       |
| `hotfix/`   | Corrección urgente de producción              |

Ejemplos: `feat/log-mvp-completacion`, `fix/turbo-cache-vercel-output`, `docs/env-sensitive-runtime`. En kebab-case, sin acentos ni ñ. Los pushes directos a `main` están bloqueados: todo cambio llega vía Pull Request. Detalles completos en [`AGENTS.md`](AGENTS.md#convención-de-ramas) y [`CONTRIBUTING.md`](CONTRIBUTING.md).

Consulta [`CONTRIBUTING.md`](CONTRIBUTING.md) para el flujo completo de ramas, validaciones, Pull Requests, licencias y atribuciones.

## Licencias

- Código fuente y scripts: PolyForm Noncommercial 1.0.0.
- Documentación y materiales de contenido: CC BY-NC 4.0.

Consulta [`LICENSE`](LICENSE), [`NOTICE`](NOTICE), [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) y [`docs/03-Legal/README.md`](docs/03-Legal/README.md) antes de reutilizar o aportar material.
# Trigger deploy
