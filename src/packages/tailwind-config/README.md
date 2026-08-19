# `@repo/tailwind-config`

Tokens y configuración visual compartida del monorepo `fosforo`.

## Exports

- `@repo/tailwind-config` -> `shared-styles.css`
- `@repo/tailwind-config/postcss` -> `postcss.config.js`

## Uso

`shared-styles.css` es la fuente de verdad para tokens visuales compartidos: tipografia, color, espaciado, sombras, radios, breakpoints y aliases de compatibilidad.

Las apps y paquetes UI deben consumir estos tokens antes de definir variables propias.
