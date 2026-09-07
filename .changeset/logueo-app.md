---
"logueo": minor
---

Nueva app de identidad del ecosistema (Fase 1): login, registro y cuenta unica delegando en @repo/auth y Supabase Auth. Endpoints /api/auth/{login,logout,register,session,me,consents} con cookies de sesion del ecosistema, logout con alcance local o global (revocacion de todas las sesiones), consentimientos por categoria con RLS por dueno (migracion de tabla consents incluida), auditoria de login/logout en audit_log, middleware con secure headers y RUM integrado via @repo/analytics con banner de consentimiento (PUBLIC_RUM_API_URL agregada a globalEnv de turbo). Formularios SSR con redirects 303; APIs JSON para session/me/consents.
