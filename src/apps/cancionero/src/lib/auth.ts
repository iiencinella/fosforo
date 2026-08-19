import {
  canPerformForAppRole,
  getSessionFromRequest as sharedGetSessionFromRequest,
  mapRoleSlugToAppRole,
  requireSession as sharedRequireSession,
  type AppRoleHierarchy,
  type RoleMap,
  type SessionBundle,
} from "@repo/auth";

export const CANCIONERO_ROLE_MAP: RoleMap = {
  admin: "admin",
  sacerdote: "sacerdote",
  coordinador: "coordinador",
  musico: "musico",
  usuario: "usuario",
};

export const CANCIONERO_ROLE_HIERARCHY: AppRoleHierarchy = {
  contribute: ["coordinador", "sacerdote", "admin"],
  moderate: ["sacerdote", "admin"],
};

export type CancioneroAppRole =
  | "invitado"
  | "usuario"
  | "musico"
  | "coordinador"
  | "sacerdote"
  | "admin";

export const CANCIONERO_ROLE_LEVEL: Record<CancioneroAppRole, number> = {
  admin: 0,
  sacerdote: 1,
  coordinador: 2,
  musico: 3,
  usuario: 4,
  invitado: 5,
};

export const PAGE_MINIMUM_ROLE: Record<string, CancioneroAppRole> = {
  "/": "invitado",
  "/buscar": "invitado",
  "/canciones/": "invitado",
  "/liturgia": "invitado",
  "/estado": "sacerdote",
  "/perfil": "usuario",
  "/contribuir": "coordinador",
  "/moderacion": "sacerdote",
};

export function getMinimumRoleForPath(path: string): CancioneroAppRole | null {
  if (PAGE_MINIMUM_ROLE.hasOwnProperty(path)) {
    return PAGE_MINIMUM_ROLE[path];
  }
  for (const [pattern, role] of Object.entries(PAGE_MINIMUM_ROLE)) {
    if (
      pattern.length > 1 &&
      pattern.endsWith("/") &&
      path.startsWith(pattern)
    ) {
      return role;
    }
  }
  return null;
}

export function canAccessPage(role: CancioneroAppRole, path: string): boolean {
  const minimumRole = getMinimumRoleForPath(path);
  if (!minimumRole) return true;
  return CANCIONERO_ROLE_LEVEL[role] <= CANCIONERO_ROLE_LEVEL[minimumRole];
}

export function getSessionFromRequest(
  request: Request,
): Promise<SessionBundle | null> {
  return sharedGetSessionFromRequest(request);
}

export async function getAppRoleFromRequest(
  request: Request,
): Promise<CancioneroAppRole> {
  const session = await sharedGetSessionFromRequest(request);
  if (!session) return "invitado";
  return resolveAppRole(session.profile.roleSlug);
}

export function resolveAppRole(
  roleSlug: string | null | undefined,
): CancioneroAppRole {
  return mapRoleSlugToAppRole(
    roleSlug,
    CANCIONERO_ROLE_MAP,
  ) as CancioneroAppRole;
}

export function canContribute(role: CancioneroAppRole): boolean {
  return canPerformForAppRole(role, CANCIONERO_ROLE_HIERARCHY).canContribute;
}

export function canModerate(role: CancioneroAppRole): boolean {
  return canPerformForAppRole(role, CANCIONERO_ROLE_HIERARCHY).canModerate;
}

export async function requireSession(request: Request): Promise<SessionBundle> {
  try {
    return await sharedRequireSession(request);
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("CANCIONERO_SESSION_EXPIRED");
  }
}

export async function requireContributor(
  request: Request,
): Promise<SessionBundle> {
  const session = await requireSession(request);
  const role = resolveAppRole(session.profile.roleSlug);
  if (!canContribute(role)) {
    throw new Error("CANCIONERO_NOT_AUTHORIZED_TO_CONTRIBUTE");
  }
  return session;
}

export async function requireAdmin(request: Request): Promise<SessionBundle> {
  const session = await requireSession(request);
  if (!canModerate(resolveAppRole(session.profile.roleSlug))) {
    throw new Error("CANCIONERO_NOT_AUTHORIZED_TO_MODERATE");
  }
  return session;
}
