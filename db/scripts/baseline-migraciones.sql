-- ============================================================================
-- BASELINE DEL HISTORIAL DE MIGRACIONES DE SUPABASE
-- ============================================================================
-- Problema (verificado 2026-08-25): existen tablas aplicadas en el proyecto
-- remoto cuyo script NO figura en supabase_migrations.schema_migrations. Si
-- alguien corre `supabase db push`, el CLI intentaria re-aplicarlas y fallaria.
--
-- Este baseline REGISTRA esas migraciones como ya aplicadas. No ejecuta DDL:
-- solo inserta filas de historial.
--
-- COMO APLICAR: SQL Editor del proyecto remoto o via MCP con aprobacion
-- explicita del owner. Idempotente por la clave primaria (version).
-- ============================================================================

insert into supabase_migrations.schema_migrations (version, name, statements)
values
  ('202605260001', 'create_usuario_identity_core', null),
  ('202605260002', 'create_log_core', null),
  ('202605261100', 'create_horarios_core', null),
  ('202608190001', 'create_portal_submissions', null)
on conflict (version) do nothing;

-- ---------------------------------------------------------------------------
-- Verificacion: estas consultas deben devolver las 4 filas nuevas ademas de
-- las ya registradas (initial_schema, liturgy_*, admin_panel_*, cancionero,
-- hardening portal/users y log rate limit/metrics).
-- ---------------------------------------------------------------------------
-- select version, name from supabase_migrations.schema_migrations order by version;
