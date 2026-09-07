---
"log": minor
"@repo/auth": minor
---

Unifica el modelo de roles del ecosistema en el RBAC compartido (profiles.role_id -> roles + permissions): la app log deja de resolver dev/ops via app_metadata del JWT y ahora resuelve el rol desde el perfil del usuario, incorporando los roles de plataforma dev, ops y product. Incluye migracion de policies RLS de log_entries y helpers SQL current_user_role_slug() y user_has_app_permission().
