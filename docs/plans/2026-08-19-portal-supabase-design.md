# Plan de implementación: Portal + Supabase

## Objetivo

Completar el contrato documentado del Portal Fósforo usando Supabase para persistir los envíos públicos y su auditoría, manteniendo el catálogo y las novedades como contenido versionado en Git durante el MVP.

## Decisiones de alcance

- `src/content/apps-catalog/` y `src/content/novedades/` continúan siendo la fuente editorial del MVP.
- Supabase será la fuente de verdad para `portal_contact_requests`, `portal_feedback_items` y `portal_submission_audit`.
- El Portal escribirá en Supabase exclusivamente desde endpoints server-side mediante `SUPABASE_SERVICE_ROLE_KEY`.
- El navegador no recibirá claves privilegiadas ni acceso directo a las tablas.
- Los envíos se confirmarán al usuario únicamente después de persistir correctamente el registro principal y su evento inicial de auditoría.
- Resend será una notificación opcional posterior a la persistencia, no el mecanismo de almacenamiento.

## Fases

1. **Esquema y seguridad:** migración versionada, constraints, índices, RLS, grants y políticas.
2. **Persistencia de dominio:** cliente server-side y repositorios tipados para contacto, feedback y auditoría.
3. **Endpoints:** conectar `/api/contact` y `/api/feedback`, normalizar errores y conservar rate limiting.
4. **Privacidad y abuso:** minimizar datos en logs, escapar contenido de email y preparar protección distribuida/anti-spam.
5. **Pruebas:** unitarias para validadores/repositorios/endpoints y smoke tests contra Supabase local o staging.
6. **Operación:** health check, variables de Vercel, migración en staging, preview deployment, runbooks y evidencias OWASP/SLO.

## Contrato de datos

### `portal_contact_requests`

Registra consultas de soporte con `name`, `email`, `message`, `status`, `created_at` y metadatos mínimos de trazabilidad.

### `portal_feedback_items`

Registra aportes con `name`, `contact_channel`, `category`, `message`, `status`, `created_at` y metadatos mínimos de trazabilidad.

### `portal_submission_audit`

Registra la creación y los cambios de procesamiento con `submission_type`, `submission_id`, `event_type`, `actor`, `metadata` y `created_at`.

## Criterios de terminado

- Migración aplicada y verificable en staging.
- RLS habilitado en todas las tablas y sin lectura anónima de envíos.
- Los endpoints persisten datos y auditoría antes de devolver éxito.
- Los errores de Supabase no exponen detalles internos.
- `pnpm check-types --filter=portal` y tests del Portal en verde.
- Smoke tests de salud, contacto y feedback ejecutados en preview.
- Documentación de ERM, OWASP y SLA/SLO actualizada con evidencias reales.
- Variables secretas configuradas únicamente en Vercel/Supabase, nunca en Git.

## Riesgos conocidos

- El rate limiting actual usa memoria local y no es distribuido entre instancias Vercel.
- El build local de Windows puede fallar al crear symlinks de dependencias; se debe validar también en CI/Linux.
- El contrato documental menciona `portal_app_registry`, pero el ADR del MVP mantiene el catálogo en archivos versionados. No se implementará esa tabla hasta que exista una necesidad operativa clara.
