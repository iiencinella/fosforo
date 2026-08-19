# `@repo/ui`

Biblioteca UI compartida del monorepo `fosforo`.

## Incluye

- Componentes React reutilizables como `Card`, `Breadcrumbs`, `SectionHeader` y componentes del portal.
- Exports CSS compartidos como `@repo/ui/styles.css`, `@repo/ui/foundation.css`, `@repo/ui/catalog.css`, `@repo/ui/calendar.css` y `@repo/ui/skeleton.css`.
- Componentes Astro para catalogos y enlaces de API.
- Componente reutilizable `TeamMemberAvatar` para mostrar integrantes de equipo con imagen, rol y responsabilidades.

## Uso

Este paquete es la primera referencia para construir UI en el ecosistema. Antes de crear primitives locales en una app, revisar si el componente o estilo ya existe aqui.

### TeamMemberAvatar

Para usar el componente en una app:

1. Importar componente y estilos:

```tsx
import { TeamMemberAvatar } from "@repo/ui";
import "@repo/ui/team-member-avatar.css";
```

2. Pasar props del integrante:

```tsx
<TeamMemberAvatar
  name="Nombre Apellido"
  profession="Rol profesional"
  responsibilities={[
    "Responsabilidad 1",
    "Responsabilidad 2",
    "Responsabilidad 3",
  ]}
  imageSrc={memberPhoto}
  imageAlt="Foto de Nombre Apellido"
  defaultImageSrc={fireLogo}
/>
```

Notas:

- `imageSrc` es opcional.
- Si `imageSrc` no existe, el componente usa `defaultImageSrc` como fallback.
- Si `imageAlt` no se define, se genera automaticamente: `Foto de <name>`.

## Scripts

- `pnpm --filter @repo/ui build:styles`
- `pnpm --filter @repo/ui build:components`
- `pnpm --filter @repo/ui check-types`
- `pnpm --filter @repo/ui lint`
