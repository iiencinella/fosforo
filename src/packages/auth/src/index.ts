export {
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
  getAccessCookieName,
  getRefreshCookieName,
  buildSessionCookies,
  clearSessionCookies,
} from "./cookies.js";

export {
  getSupabaseAuthClient,
  getSessionFromToken,
  getUserProfileById,
  getSessionFromRequest,
  requireSession,
  requireAdminSession,
  hasAppPermission,
  requireAppPermission,
} from "./session.js";
export type {
  ProfileRow,
  RoleRow,
  UserProfile,
  SessionBundle,
  SupabaseAuthClientOptions,
} from "./session.js";

export {
  ECOSYSTEM_ROLE_SLUGS,
  ECOSYSTEM_ROLE_HIERARCHY,
  PLATFORM_ROLE_SLUGS,
  PLATFORM_ROLE_HIERARCHY,
  isPlatformRoleSlug,
  mapRoleSlugToAppRole,
  canPerformForAppRole,
} from "./role-mapping.js";
export type {
  EcosystemRoleSlug,
  PlatformRoleSlug,
  RoleMap,
  AppRole,
  AppRoleHierarchy,
  RoleMappingOptions,
} from "./role-mapping.js";
