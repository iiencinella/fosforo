---
tags:
  - proyecto/fosforo
  - versionado
  - releases
  - changesets
  - semver
type: documentación-tecnica
area: general
status: vigente
created: 2026-08-25
updated: 2026-08-25
related:
  - "[[README|Indice de documentación]]"
  - "[[06-PRD-Maestro|PRD Maestro]]"
  - "[[../01-Arquitectura/Estructura Monorepo|Estructura Monorepo]]"
---

# Control de Versiones y Releases

> [!info] Normativa de versionado del ecosistema Fósforo
> Este documento define como se versionan las aplicaciones y paquetes del monorepo, que se considera un release y cual es el flujo oficial para liberar versiones. Implementado con [Changesets](https://changesets.dev) sobre flujo trunk-based.

---

## Objetivo

Cumplir el requisito del PRD Maestro de "procesos de release claros" con:

- Versiones **SemVer independientes por app y paquete**.
- Trazabilidad de cada release mediante **git tags**, `CHANGELOG.md` por workspace y la documentación de novedades por app.
- Un flujo unico, automatizado con el bot oficial de Changesets, compatible con el despliegue continuo en Vercel.

## Alcance

- Aplicaciones web implementadas en `src/apps/*`.
- Paquetes compartidos en `src/packages/*` (`@repo/*`).
- Reglas anticipadas para mobile (`src/mobile/*`, Expo EAS) y desktop (`src/desktop/*`, Electron), aunque aun no existan workspaces.
- No aplica al paquete raiz ni a tooling local (`.opencode/`, `scripts/`, `db/scripts/`).

---

## Principios

1. **SemVer por workspace**: cada app y paquete tiene su propia versión en su `package.json`. No existe un numero de version global del ecosistema.
2. **Merge a `main` = deploy**: Vercel despliega automaticamente. El release formal (bump + tag + changelog) se consolida en el PR de **Version Packages**.
3. **Tag por release**: formato `<nombre>@<version>`, por ejemplo `biblia@0.2.0` o `@repo/ui@1.0.0`. Los nombres coinciden con el campo `name` del `package.json`.
4. **Nada se publica a npm**: todos los workspaces son privados; los tags y changelogs son internos.
5. **Versiones no visibles a usuarios finales**: el Portal y las apps no exponen numeros de version; son informacion interna de operacion.

---

## Esquema SemVer por plataforma

Formato: `MAJOR.MINOR.PATCH`

| Bump      | Web (Vercel)                                                                                                                                      | Mobile (Expo EAS)                                            | Desktop (Electron)                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| **MAJOR** | Ruptura de contrato publico de API, cambio de rutas/URLs canonicas, remocion de funcionalidad visible, migracion de esquema de datos incompatible | Igual que web + cambios que exigen migracion o reinstalación | Igual que web + cambios de formato de datos locales, protocolo de auto-update o requisitos de sistema |
| **MINOR** | Funcionalidad nueva visible, endpoint nuevo retrocompatible, integracion con capacidad compartida                                                 | Nueva pantalla/flujo, nueva capacidad offline                | Nueva funcionalidad de app, nuevo target de instalador                                                |
| **PATCH** | Correccion de bug, ajuste visual/accesibilidad, mejora de performance sin cambio funcional, actualizacion de dependencias sin impacto funcional   | Bugfix, hotfix por review de store                           | Bugfix, fix de empaquetado/firma                                                                      |

Reglas complementarias:

- Cambios exclusivamente documentales o de CI no generan bump de version de app.
- Contenido editorial (novedades, catalogo del portal) no bumpa version salvo que cambie codigo.
- Antes de la primera version estable (`1.0.0`) se usa `0.x.y`: MINOR puede incluir rupturas, PATCH solo correcciones. El pase a `1.0.0` requiere documentación por app completa segun Definition of Done documental.

---

## Flujo de release (trunk-based)

```text
PR feature ──> merge a main ──> PR "Version Packages" ──> merge ──> tags + deploy Vercel
   │                │                    │
   │                │                    └─ creado/actualizado automaticamente por changesets/action
   └─ agrega .changeset/*.md si el cambio es visible para usuarios u operadores
```

1. **Durante el desarrollo**: todo PR cuyo cambio afecte comportamiento visible debe incluir un archivo changeset generado con:

   ```bash
   pnpm changeset
   ```

   Se elige el workspace afectado (uno o varios), el tipo de bump y una descripcion breve orientada a quien opera o usa la app.

2. **Merge del feature PR a `main`**: el workflow `.github/workflows/release.yml` detecta changesets pendientes y el bot crea o actualiza automaticamente el PR **Version Packages**, que contiene bumps de `package.json`, entradas de `CHANGELOG.md` y la eliminacion de los changesets consumidos.

3. **Merge del PR Version Packages**: el mismo workflow ejecuta el paso de publicacion interna:
   - build completo del monorepo (`turbo run build`);
   - creacion y push de git tags `<nombre>@<version>` via GitHub API;
   - Vercel despliega las apps modificadas por su integracion nativa con GitHub.

4. **Documentación posterior**: quien lidero el cambio registra el detalle en la documentación de la app correspondiente siguiendo la convencion de novedades (ver mas abajo).

### Que constituye un release

Un release es el merge de un PR Version Packages que contenga al menos un bump. Los merges de features entre dos PRs Version Packages son entregas continuas (deploys), pero no generan tag hasta consolidarse.

---

## Convención de changesets en PRs

- Un changeset por unidad de cambio relevante: si un PR toca una app y un package compartido, agregar changesets separados para cada uno.
- Tipo de bump segun la tabla SemVer; ante duda entre MINOR y PATCH, elegir PATCH para fixes y MINOR para cualquier cosa nueva.
- Mensaje en español, imperativo y centrado en el impacto: `Corrige el calculo de la jornada liturgica en fechas de víspera`.
- Si el cambio no merece version (docs, CI, refactor interno invisible), no agregar changeset.

---

## Packages compartidos (`@repo/*`)

- Los packages se versionan igual que las apps y reciben sus propios tags (`@repo/ui@X.Y.Z`).
- Cuando un package cambia de version, Changesets aplica automaticamente un **patch** a cada workspace que lo consuma (comportamiento por defecto de `updateInternalDependencies`). Esto mantiene alineados tags y deploys reales.
- Consecuencia operativa: tocar un package compartido dispara releases en cadena de sus consumidores. Planificar los merges considerando ese efecto.
- Las dependencias internas usan protocolo `workspace:*`; nunca fijar rangos manuales entre workspaces.

---

## Integración con la documentación de apps

- Cada workspace recibe un `CHANGELOG.md` autogenerado junto a su `package.json`. Ese archivo es la bitacora tecnica por version y no se edita a mano.
- La convención de novedades por app (`12-Novedades-YYYY-MM-DD.md` en la carpeta documental de la app) sigue siendo la narrativa de contexto. A partir de la vigencia de este documento, esos archivos deben incluir el campo opcional `version:` en frontmatter cuando el trabajo culmino en un release, por ejemplo `version: biblia@0.2.0`.
- La matriz de estado de `04-Listado-de-Aplicaciones.md` no incorpora versiones: el inventario de versiones vive en git tags y CHANGELOGs.

---

## Reglas futuras: mobile (Expo EAS)

Cuando existan workspaces en `src/mobile/*`:

- El `version` SemVer del `package.json` es la fuente de verdad y se replica en `app.json` (`expo.version`).
- Android `versionCode` debe ser monotónico creciente; convención propuesta: `MAJOR * 10000 + MINOR * 100 + PATCH * 10 + intento` (el intento cubre re-subidas del mismo SemVer por revisión de store).
- iOS `CFBundleVersion` (build number) lo administra EAS Build con auto-increment; `CFBundleShortVersionString` refleja el SemVer.
- Los builds de preview usan canales EAS (`development`, `preview`, `production`); solo el canal production corresponde a un tag `<nombre>@<version>`.

## Reglas futuras: desktop (Electron)

Cuando existan workspaces en `src/desktop/*`:

- El SemVer del `package.json` gobierna instaladores y `electron-updater`; el feed de updates resuelve por version estrictamente mayor.
- Cada release desktop genera ademas un **GitHub Release** por app con los artefactos firmados, anclado al tag `<nombre>@<version>` (habilitar `create-github-releases` en el workflow).
- Checklist de seguridad OWASP desktop cerrado antes del merge del PR Version Packages correspondiente.

---

## Comandos disponibles

| Comando                  | Uso                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| `pnpm changeset`         | Crear un changeset desde el workspace raiz (flujo habitual en cada PR).                            |
| `pnpm changeset:status`  | Ver changesets pendientes y releases que producirian.                                              |
| `pnpm changeset:version` | Ejecutar manualmente la consolidacion de versiones (escape hatch; el flujo normal lo hace el bot). |
| `pnpm release`           | Build completo + creacion de tags locales. Reservado al workflow de CI.                            |

---

## Casos borde

- **Hotfix**: trunk-based no tiene ramas de mantenimiento. Se corrige en un PR a `main` con changeset PATCH; el bot libera la version siguiente. Si el PR Version Packages acumulo otros cambios, pueden mergearse juntos: cada app conserva su propio bump correcto.
- **Rollback de deploy**: revertir el commit en `main` y generar un nuevo PATCH con la correccion; no reutilizar ni borrar tags ya publicados.
- **Rollback de version**: prohibido bajar la version de un workspace; una version publicada es inmutable. El error se corrige hacia adelante.
- **Prereleases**: hoy fuera de alcance. Si se necesitan betas prolongadas, activar modo pre de Changesets documentandolo aqui primero.

---

## Responsabilidades

- **Autores de PR**: agregar changesets cuando corresponda y describir el impacto.
- **Revisores**: verificar presencia y tipo de bump del changeset como parte del code review.
- **Workflow Release**: consolidar versiones, tags y changelogs sin intervencion manual.
- **Owners de app**: mantener sincronizadas las novedades documentales con los releases publicados.

---

## Referencias técnicas

- Configuracion: `.changeset/config.json` (raiz del repo).
- Workflow: `.github/workflows/release.yml`.
- Documentacion Changesets: <https://changesets.dev> - versioning apps: `privatePackages { version: true, tag: true }`.
- Action oficial: <https://github.com/changesets/action>.

---

## Tags

#versionado #releases #semver #changesets #ci-cd #fosforo
