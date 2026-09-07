---
"@repo/auth": minor
---

Agrega los roles editoriales del CMS al RBAC del ecosistema: editor (hierarchy_level 30) y revisor (31), con migracion que los siembra en public.roles (idempotente, on conflict do update) y otorga permisos de acceso a la app cms para admin, editor y revisor en public.permissions. El revisor queda por encima del editor en jerarquia porque autoriza la publicacion (RB-CMS-004: el editor no puede publicar ni archivar).
