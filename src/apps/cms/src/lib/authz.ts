export {
  getAccessTokenFromRequest,
  getSessionFromRequest,
  requireAppPermission,
  requireSession,
  requireAdminSession,
} from "@repo/auth";

/**
 * Guards del CMS sobre el RBAC del ecosistema (FR-CMS-005):
 * - requireAppPermission(request, "cms"): sesion valida con permiso de
 *   app cms (admin bypasea). Lo usan los endpoints y el middleware.
 * - requireAdminSession(request): solo rol admin (content types,
 *   taxonomias, archivar).
 * El rol editorial concreto (editor/revisor) se resuelve via
 * session.profile.roleSlug y las policies RLS del paso 2.
 */
export const CMS_APP_SLUG = "cms" as const;
