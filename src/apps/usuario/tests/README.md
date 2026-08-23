# Pruebas de Gestión de Usuarios

## Unitarias

```bash
pnpm --filter=usuario test:unit
```

Cubren autenticación, recuperación de contraseña, uso de clientes Supabase ligados al JWT y asignación transaccional de roles.

## Integración Supabase

Requiere `SUPABASE_URL`, `SUPABASE_ANON_KEY` y la variable `USUARIO_RUN_INTEGRATION=true`. Para validar el perfil autenticado, agregar `USUARIO_AUTH_ACCESS_TOKEN` de un usuario de pruebas.

```bash
USUARIO_RUN_INTEGRATION=true pnpm --filter=usuario test:integration
```

## E2E HTTP

Con el servidor levantado:

```bash
USUARIO_E2E_BASE_URL=http://localhost:4321 pnpm --filter=usuario test:e2e
```
