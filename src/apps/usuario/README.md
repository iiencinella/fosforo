# Usuario

Aplicación web `0104_usuarios` del ecosistema Fósforo. Sistema de identidad, autenticación, autorización y perfiles.

## Stack

- Astro + React
- Supabase Auth
- `@repo/ui`
- `@repo/api-utils`
- Tailwind CSS

## Funcionalidad actual

- Registro y login con email/contraseña
- Recuperación de contraseña
- Sesión JWT con Supabase Auth
- Perfil de usuario
- Panel de administración de usuarios
- Asignación de roles (admin, priest, coordinator, user)
- Endpoint de mobile-login para clientes nativos
- Auditoría de eventos de administración

## Variables de entorno

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Comandos

- `pnpm --filter usuario dev`
- `pnpm --filter usuario build`
- `pnpm --filter usuario check-types`

## Rutas

| Ruta                   | Descripción                         |
| ---------------------- | ----------------------------------- |
| `/`                    | Página principal                    |
| `/perfil`              | Perfil del usuario autenticado      |
| `/auth/login`          | Inicio de sesión                    |
| `/auth/register`       | Registro de usuario                 |
| `/auth/reset-password` | Recuperación de contraseña          |
| `/admin/usuarios`      | Panel de administración de usuarios |
| `/api/auth/*`          | Endpoints de autenticación          |
| `/api/admin/*`         | Endpoints de administración         |
| `/api/users/*`         | Endpoints de perfiles               |

## Documentación

La documentación completa está en `docs/02-Aplicaciones/FASE_1-0104_usuarios/WEB/` (actualmente en estado draft):

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
