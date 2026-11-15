# @repo/auth

## 0.1.0

### Minor Changes

- 28da401: Agrega los roles editoriales del CMS al RBAC del ecosistema: editor (hierarchy_level 30) y revisor (31), con migracion que los siembra en public.roles (idempotente, on conflict do update) y otorga permisos de acceso a la app cms para admin, editor y revisor en public.permissions. El revisor queda por encima del editor en jerarquia porque autoriza la publicacion (RB-CMS-004: el editor no puede publicar ni archivar).
- 4049ef3: Unifica el modelo de roles del ecosistema en el RBAC compartido (profiles.role_id -> roles + permissions): la app log deja de resolver dev/ops via app_metadata del JWT y ahora resuelve el rol desde el perfil del usuario, incorporando los roles de plataforma dev, ops y product. Incluye migracion de policies RLS de log_entries y helpers SQL current_user_role_slug() y user_has_app_permission().
