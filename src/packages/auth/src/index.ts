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
} from "./session.js";
export type {
  ProfileRow,
  RoleRow,
  UserProfile,
  SessionBundle,
} from "./session.js";

export {
  ECOSYSTEM_ROLE_SLUGS,
  ECOSYSTEM_ROLE_HIERARCHY,
  mapRoleSlugToAppRole,
  canPerformForAppRole,
} from "./role-mapping.js";
export type {
  EcosystemRoleSlug,
  RoleMap,
  AppRole,
  AppRoleHierarchy,
  RoleMappingOptions,
} from "./role-mapping.js";
