# logueo

## 0.1.0

### Minor Changes

- 6552eaa: Nueva app de identidad del ecosistema (Fase 1): login, registro y cuenta unica delegando en @repo/auth y Supabase Auth. Endpoints /api/auth/{login,logout,register,session,me,consents} con cookies de sesion del ecosistema, logout con alcance local o global (revocacion de todas las sesiones), consentimientos por categoria con RLS por dueno (migracion de tabla consents incluida), auditoria de login/logout en audit_log, middleware con secure headers y RUM integrado via @repo/analytics con banner de consentimiento (PUBLIC_RUM_API_URL agregada a globalEnv de turbo). Formularios SSR con redirects 303; APIs JSON para session/me/consents.

### Patch Changes

- Updated dependencies [7476b07]
- Updated dependencies [1a836d6]
- Updated dependencies [28da401]
- Updated dependencies [4049ef3]
  - @repo/analytics@0.1.0
  - @repo/ui@0.2.0
  - @repo/auth@0.1.0
