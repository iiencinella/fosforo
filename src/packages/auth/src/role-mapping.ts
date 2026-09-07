export const ECOSYSTEM_ROLE_SLUGS = [
  "admin",
  "sacerdote",
  "coordinador",
  "musico",
  "usuario",
] as const;

export type EcosystemRoleSlug = (typeof ECOSYSTEM_ROLE_SLUGS)[number];

export const ECOSYSTEM_ROLE_HIERARCHY: Record<EcosystemRoleSlug, number> = {
  admin: 1,
  sacerdote: 20,
  coordinador: 40,
  musico: 60,
  usuario: 100,
};

export const PLATFORM_ROLE_SLUGS = ["dev", "ops", "product"] as const;

export type PlatformRoleSlug = (typeof PLATFORM_ROLE_SLUGS)[number];

export const PLATFORM_ROLE_HIERARCHY: Record<PlatformRoleSlug, number> = {
  dev: 2,
  ops: 3,
  product: 4,
};

export function isPlatformRoleSlug(
  value: string | null | undefined,
): value is PlatformRoleSlug {
  return (
    typeof value === "string" &&
    (PLATFORM_ROLE_SLUGS as readonly string[]).includes(value)
  );
}

export type RoleMap = Partial<Record<EcosystemRoleSlug, string>>;

export type AppRole = string;

export type RoleMappingOptions = {
  unknownRoleFallback?: AppRole;
};

export function mapRoleSlugToAppRole(
  roleSlug: string | null | undefined,
  map: RoleMap,
  options: RoleMappingOptions = {},
): AppRole {
  if (roleSlug && Object.prototype.hasOwnProperty.call(map, roleSlug)) {
    const target = map[roleSlug as EcosystemRoleSlug];
    if (target !== undefined) return target;
  }
  return options.unknownRoleFallback ?? "invitado";
}

export type AppRoleHierarchy = {
  contribute: ReadonlyArray<string>;
  moderate: ReadonlyArray<string>;
};

export function canPerformForAppRole(
  role: AppRole,
  hierarchy: AppRoleHierarchy,
): { canContribute: boolean; canModerate: boolean } {
  return {
    canContribute: hierarchy.contribute.includes(role),
    canModerate: hierarchy.moderate.includes(role),
  };
}
