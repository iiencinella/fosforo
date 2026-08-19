---
tags:
  - proyecto/fosforo
  - arquitectura
  - monorepo
  - turborepo
type: documentación-tecnica
area: arquitectura
status: vigente
created: 2026-03-07
updated: 2026-05-26
related:
  - "[[README|Arquitectura]]"
  - "[[Stack Tecnologico|Stack Tecnologico]]"
---

# Estructura del Monorepo

> [!info] Organización del Ecosistema Fósforo
> Estructura completa del monorepo con Turborepo

---

## 🗂️ Vista General

```
fosforo-ecosystem/
├── src/
│   ├── apps/          # Workspaces web (Astro)
│   ├── mobile/        # Workspaces mobile (React Native / Expo)
│   ├── desktop/       # Workspaces desktop (Electron)
│   └── packages/      # Paquetes compartidos
├── db/                # Scripts SQL y utilidades de base de datos
├── .github/           # CI/CD workflows
├── scripts/           # Automatizaciónes del workspace
├── .agents/           # Skills e instrucciones para agentes
├── .opencode/         # Integración local de OpenCode
└── docs/              # Documentación
```

---

## 📱 src/apps/ - Aplicaciones Web

> `src/apps/` es la raiz real de workspaces web del monorepo.
> La definicion funcional de cada app sigue viviendo en `docs/02-Aplicaciones/`.

### Estructura de Cada App

```
src/apps/[nombre-app]/
├── src/
│   ├── pages/           # Rutas de Astro
│   │   ├── index.astro
│   │   ├── [dynamic].astro
│   │   └── api/         # API endpoints
│   ├── layouts/         # Layouts de Astro
│   ├── components/      # Componentes React
│   ├── lib/             # Utilidades
│   ├── styles/          # CSS/Tailwind
│   └── types/           # TypeScript types
├── public/              # Assets estáticos
├── astro.config.mjs     # Configuración Astro
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

### Listado de Apps Web implementadas

Los siguientes workspaces existen actualmente en `src/apps/`.

| Carpeta       | App                                           | Estado       |
| ------------- | --------------------------------------------- | ------------ |
| `portal/`     | Portal principal                              | Implementado |
| `biblia/`     | Textos bíblicos (Biblia del Pueblo de Dios)   | Implementado |
| `calendario/` | Calendario litúrgico (Rito Romano, región AR) | Implementado |
| `usuario/`    | Identidad, autenticación y perfiles           | Implementado |
| `log/`        | Observabilidad y registro de eventos          | Implementado |
| `cancionero/` | Repertorio musical                            | Implementado |

### Apps documentadas (futuras, Fase 2+)

Las siguientes apps están definidas a nivel documental en `docs/02-Aplicaciones/` pero aún no tienen workspace en `src/apps/`. Se listan como referencia de alcance futuro.

- `santopedia/` - Biblioteca de santos
- `oraciones/` - Colección de oraciones
- `misal/` - Misal Romano
- `lectio-divina/` - Meditación bíblica
- `agenda-comunitaria/` - Eventos parroquiales
- `carisma/` - Movimientos religiosos
- `historia-iglesia/` - Blog parroquial
- `confesiones/` - Preparación sacramental
- `horarios-de-misas/` - Directorio de horarios
- `peticionario/` - Intenciones de oración
- `formacion/` - Plataforma e-learning
- `cancionero/` - Repertorio musical
- `motus/` - Evangelizadores digitales
- `emprendedor/` - E-commerce católico
- `donaciones/` - Donaciones a iglesias
- `newsletter/` - Sistema de notificaciones
- `auth/` - Autenticación y monitoreo de accesos
- `buscador/` - Motor de búsqueda
- `chatbot/` - Asistente IA
- `meditvoz/` - Plataforma de audio
- `vida-de-misionero/` - Blog del proyecto
- `biblioteca-vaticano/` - Biblioteca Vaticana asistida por IA

---

## 📱 src/mobile/ - Apps Mobile (React Native)

Actualmente `src/mobile/` no tiene workspaces implementados. La estructura reservada es:

```
src/mobile/
├── mobile-buscador/
├── mobile-cancionero/
├── ...
```

El único paquete compartido para mobile hoy es `src/packages/mobile-auth-client/`.

### Tecnologías Mobile (objetivo)

- **React Native** - Framework móvil
- **Expo** - Tooling y SDK
- **Expo Router** - Navegación file-based
- **AsyncStorage** - Almacenamiento local

---

## 💻 src/desktop/ - Aplicaciones Escritorio

Actualmente `src/desktop/` no tiene workspaces implementados. La estructura reservada es:

```
src/desktop/
├── fosforo-desktop/          # App principal
├── biblia-desktop/           # Estudio biblico
├── ...
```

### Tecnologías Desktop (objetivo)

- **Electron** - Framework desktop
- **Electron Vite** - Build tool
- **Electron Builder** - Empaquetado
- **electron-updater** - Auto-updates

---

## 📦 src/packages/ - Paquetes Compartidos

```
src/packages/
├── ui/                    # Componentes UI compartidos
├── api-utils/             # Utilidades HTTP compartidas (safeHandler, jsonOk, etc.)
├── auth/                   # Capacidades compartidas de autenticación
├── notification-core/     # Núcleo compartido de notificaciones
├── env/                    # Esquemas y tipos de entorno
├── mobile-auth-client/    # Cliente auth/session para mobile
├── tailwind-config/       # Configuración compartida Tailwind
├── typescript-config/     # Configuración compartida TypeScript
└── eslint-config/         # Configuración compartida ESLint
```

---

## 🔧 Backend actual

- El backend se implementa principalmente con `src/apps/*/src/pages/api/**` (Astro API endpoints).
- `services/` se mantiene como estructura objetivo futura, pero no existe hoy en el monorepo.

---

## 🗄️ db/ - Scripts de Base de Datos

```
db/
├── supabase/              # Configuración, migraciones y seeds
└── scripts/               # Wrapper CLI, seeds legacy y validaciones
```

---

## 🤖 .github/ - CI/CD

```
.github/
├── workflows/
│   ├── build-and-types.yml       # Build y chequeo de tipos
│   ├── lint.yml                  # Lint del workspace
│   └── unit-tests.yml            # Tests unitarios + validación DB scripts
│
├── ISSUE_TEMPLATE/
│   └── license-question.yml
│
└── pull_request_template.md
```

---

## 📚 docs/ - Documentación

```
docs/
├── 00-General/
├── 01-Arquitectura/
├── 02-Aplicaciones/
├── 03-Legal/
└── README.md
```

---

## 🔧 Archivos de Configuración Raíz

```
fosforo-ecosystem/
├── AGENTS.md              # Directivas para agentes de IA
├── turbo.json            # Configuración Turborepo
├── package.json          # Root package
├── pnpm-workspace.yaml   # Workspaces pnpm
├── pnpm-lock.yaml
├── .gitignore
├── .env.example
├── vercel.json
├── README.md
└── skills-lock.json
```

Los secretos `.env`, dependencias instaladas, salidas de build, logs, cobertura y la carpeta local generada `graphify-out/` no forman parte del árbol público versionado. El `.gitignore` los excluye para mantener visibles solo fuentes, documentación y configuración reproducible.

---

## 🔄 Flujo de Trabajo

### Desarrollo Local

```bash
# Instalar dependencias
pnpm install

# Desarrollar un workspace específico
pnpm dev --filter=<workspace>

# Desarrollar el monorepo
pnpm dev

# Build de un workspace específico
pnpm build --filter=<workspace>

# Build todo
pnpm build
```

### Testing

```bash
# Tests de un workspace específico
pnpm test:unit --filter=<workspace>

# Tests de todo el monorepo
pnpm test:unit
```

### Validaciónes operativas

```bash
# Validar tipos del workspace
pnpm check-types

# Validar scripts SQL
pnpm db:scripts:validate
```

---

## Enlaces Relaciónados

- [[Stack Tecnologico]]
- [[README|Arquitectura]]
- [[../README|Indice de documentación]]

---

## Referencias para Desarrollo

### Desarrollo

- [[README|Arquitectura]] - Comandos Turborepo y pnpm
- [[README|Arquitectura]] - Convenciones de archivos y naming
- [[../00-General/10-Matriz-de-Trazabilidad|Matriz de Trazabilidad]] - Organización de tests por app

### Arquitectura

- [[Stack Tecnologico|Stack Tecnologico]] - Tecnologias usadas en cada capa

### Planificación

- [[../00-General/06-PRD-Maestro|PRD Maestro]] - Orden de desarrollo de apps
- [[../00-General/04-Listado-de-Aplicaciones|Listado de Aplicaciones]] - Apps del ecosistema

---

## Tags

#monorepo #estructura #turborepo #arquitectura #organización #fosforo
