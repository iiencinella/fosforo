import { z } from "zod";
import { getSupabaseAuthClient } from "@repo/auth";
import { supabase } from "@/db/supabase";
import { createAuditLog } from "@/lib/admin-data";

export const ECOSYSTEM_APP_SLUGS = [
  "portal",
  "biblia",
  "calendario",
  "horarios",
  "usuario",
  "log",
  "administracion",
  "cancionero",
] as const;

const PROTECTED_ROLE_SLUGS = new Set(["admin", "usuario"]);

export const roleCreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{2,40}$/),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional().nullable(),
  hierarchyLevel: z.number().int().min(1).max(100),
});

export const roleUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional().nullable(),
  hierarchyLevel: z.number().int().min(1).max(100),
});

export const permissionsReplaceSchema = z.object({
  apps: z
    .array(
      z.object({
        appSlug: z.enum(ECOSYSTEM_APP_SLUGS),
        canAccess: z.boolean(),
      }),
    )
    .max(ECOSYSTEM_APP_SLUGS.length),
});

export const assignPersonRoleSchema = z.object({
  roleSlug: z.string().trim().min(2).max(60),
});

export const peopleListQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

type RoleRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  hierarchy_level: number;
  created_at: string;
};

type PermissionRow = {
  role_id: number;
  app_slug: string;
  can_access: boolean;
};

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role_id: number | null;
  created_at: string;
};

function isProtectedRole(slug: string): boolean {
  return PROTECTED_ROLE_SLUGS.has(slug);
}

function mapRole(row: RoleRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    hierarchyLevel: row.hierarchy_level,
    createdAt: row.created_at,
  };
}

export function parseRoleId(input: string | undefined) {
  const roleId = Number(input);
  if (!Number.isInteger(roleId) || roleId <= 0) return null;
  return roleId;
}

export function extractIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return null;
  return forwarded.split(",")[0]?.trim() || null;
}

export async function listRoles() {
  const [
    { data: roles, error: rolesError },
    { data: profiles },
    { data: permissions },
  ] = await Promise.all([
    supabase
      .from("roles")
      .select("id, slug, name, description, hierarchy_level, created_at")
      .order("hierarchy_level", { ascending: true }),
    supabase.from("profiles").select("role_id").not("role_id", "is", null),
    supabase.from("permissions").select("role_id, app_slug, can_access"),
  ]);

  if (rolesError) throw new Error("ADMIN_ROLES_LIST_FAILED");

  const assignedByRoleId = new Map<number, number>();
  for (const row of (profiles ?? []) as Array<{ role_id: number | null }>) {
    if (!row.role_id) continue;
    assignedByRoleId.set(
      row.role_id,
      (assignedByRoleId.get(row.role_id) ?? 0) + 1,
    );
  }

  const enabledAppsByRoleId = new Map<number, number>();
  for (const row of (permissions ?? []) as PermissionRow[]) {
    if (!row.can_access) continue;
    enabledAppsByRoleId.set(
      row.role_id,
      (enabledAppsByRoleId.get(row.role_id) ?? 0) + 1,
    );
  }

  return (roles ?? []).map((row) => {
    const role = mapRole(row as RoleRow);
    return {
      ...role,
      protected: isProtectedRole(role.slug),
      assignedUsers: assignedByRoleId.get(role.id) ?? 0,
      enabledApps: enabledAppsByRoleId.get(role.id) ?? 0,
    };
  });
}

export async function getRoleDetail(roleId: number) {
  const [{ data: role, error: roleError }, { data: permissions }] =
    await Promise.all([
      supabase
        .from("roles")
        .select("id, slug, name, description, hierarchy_level, created_at")
        .eq("id", roleId)
        .maybeSingle(),
      supabase
        .from("permissions")
        .select("app_slug, can_access")
        .eq("role_id", roleId),
    ]);

  if (roleError) throw new Error("ADMIN_ROLE_DETAIL_FAILED");
  if (!role) throw new Error("ADMIN_ROLE_NOT_FOUND");

  const allowed = new Set(
    ((permissions ?? []) as Array<{ app_slug: string; can_access: boolean }>)
      .filter((item) => item.can_access)
      .map((item) => item.app_slug),
  );

  const mapped = mapRole(role as RoleRow);
  return {
    ...mapped,
    protected: isProtectedRole(mapped.slug),
    apps: ECOSYSTEM_APP_SLUGS.map((appSlug) => ({
      appSlug,
      canAccess: allowed.has(appSlug),
    })),
  };
}

export async function createRole(payload: unknown, actorUserId: string) {
  const parsed = roleCreateSchema.parse(payload);

  if (isProtectedRole(parsed.slug)) {
    throw new Error("ADMIN_ROLE_SLUG_RESERVED");
  }

  const { data, error } = await supabase
    .from("roles")
    .insert({
      slug: parsed.slug,
      name: parsed.name,
      description: parsed.description ?? null,
      hierarchy_level: parsed.hierarchyLevel,
    })
    .select("id, slug, name, description, hierarchy_level, created_at")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw new Error("ADMIN_ROLE_DUPLICATED");
    }
    throw new Error("ADMIN_ROLE_CREATE_FAILED");
  }

  await createAuditLog({
    userId: actorUserId,
    action: "create",
    resourceType: "role",
    resourceId: String(data.id),
    details: { slug: parsed.slug },
  });

  return mapRole(data as RoleRow);
}

export async function updateRole(
  roleId: number,
  payload: unknown,
  actorUserId: string,
) {
  const parsed = roleUpdateSchema.parse(payload);

  const { data: current, error: currentError } = await supabase
    .from("roles")
    .select("id, slug")
    .eq("id", roleId)
    .maybeSingle<{ id: number; slug: string }>();

  if (currentError) throw new Error("ADMIN_ROLE_UPDATE_FAILED");
  if (!current) throw new Error("ADMIN_ROLE_NOT_FOUND");

  const { data, error } = await supabase
    .from("roles")
    .update({
      name: parsed.name,
      description: parsed.description ?? null,
      hierarchy_level: parsed.hierarchyLevel,
    })
    .eq("id", roleId)
    .select("id, slug, name, description, hierarchy_level, created_at")
    .single();

  if (error || !data) throw new Error("ADMIN_ROLE_UPDATE_FAILED");

  await createAuditLog({
    userId: actorUserId,
    action: "update",
    resourceType: "role",
    resourceId: String(roleId),
    details: { slug: current.slug },
  });

  return mapRole(data as RoleRow);
}

export async function deleteRole(roleId: number, actorUserId: string) {
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id, slug")
    .eq("id", roleId)
    .maybeSingle<{ id: number; slug: string }>();

  if (roleError) throw new Error("ADMIN_ROLE_DELETE_FAILED");
  if (!role) throw new Error("ADMIN_ROLE_NOT_FOUND");
  if (isProtectedRole(role.slug)) throw new Error("ADMIN_ROLE_PROTECTED");

  const { count, error: countError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role_id", roleId);

  if (countError) throw new Error("ADMIN_ROLE_DELETE_FAILED");
  if ((count ?? 0) > 0) throw new Error("ADMIN_ROLE_HAS_ASSIGNED_USERS");

  const { error } = await supabase.from("roles").delete().eq("id", roleId);
  if (error) throw new Error("ADMIN_ROLE_DELETE_FAILED");

  await createAuditLog({
    userId: actorUserId,
    action: "delete",
    resourceType: "role",
    resourceId: String(roleId),
    details: { slug: role.slug },
  });
}

export async function replaceRolePermissions(
  roleId: number,
  payload: unknown,
  actorUserId: string,
) {
  const parsed = permissionsReplaceSchema.parse(payload);

  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id, slug")
    .eq("id", roleId)
    .maybeSingle<{ id: number; slug: string }>();

  if (roleError) throw new Error("ADMIN_ROLE_PERMISSIONS_UPDATE_FAILED");
  if (!role) throw new Error("ADMIN_ROLE_NOT_FOUND");

  const enabledApps = parsed.apps
    .filter((item) => item.canAccess)
    .map((item) => item.appSlug);

  const { error: clearError } = await supabase
    .from("permissions")
    .delete()
    .eq("role_id", roleId);

  if (clearError) throw new Error("ADMIN_ROLE_PERMISSIONS_UPDATE_FAILED");

  if (enabledApps.length > 0) {
    const { error: insertError } = await supabase.from("permissions").insert(
      enabledApps.map((appSlug) => ({
        role_id: roleId,
        app_slug: appSlug,
        can_access: true,
      })),
    );

    if (insertError) throw new Error("ADMIN_ROLE_PERMISSIONS_UPDATE_FAILED");
  }

  await createAuditLog({
    userId: actorUserId,
    action: "permissions_update",
    resourceType: "role",
    resourceId: String(roleId),
    details: { slug: role.slug, apps: enabledApps },
  });

  return {
    roleId,
    apps: enabledApps,
  };
}

export async function listPeople(
  accessToken: string,
  query: { search?: string; limit?: number | string; offset?: number | string },
) {
  const parsed = peopleListQuerySchema.parse(query);
  const authClient = getSupabaseAuthClient({ accessToken });

  let listQuery = authClient
    .from("profiles")
    .select("id, email, name, avatar_url, role_id, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(parsed.offset, parsed.offset + parsed.limit - 1);

  if (parsed.search) {
    listQuery = listQuery.ilike("email", `%${parsed.search}%`);
  }

  const { data, error, count } = await listQuery;
  if (error) throw new Error("ADMIN_PEOPLE_LIST_FAILED");

  const rows = (data ?? []) as ProfileRow[];
  const roleIds = [
    ...new Set(rows.map((row) => row.role_id).filter(Boolean)),
  ] as number[];
  let roleMap = new Map<number, { slug: string; name: string }>();

  if (roleIds.length > 0) {
    const { data: roles } = await authClient
      .from("roles")
      .select("id, slug, name")
      .in("id", roleIds);

    roleMap = new Map(
      ((roles ?? []) as Array<{ id: number; slug: string; name: string }>).map(
        (role) => [role.id, { slug: role.slug, name: role.name }],
      ),
    );
  }

  return {
    users: rows.map((row) => {
      const role = row.role_id ? roleMap.get(row.role_id) : undefined;
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        avatarUrl: row.avatar_url,
        roleSlug: role?.slug ?? "usuario",
        roleLabel: role?.name ?? "Usuario",
        createdAt: row.created_at,
      };
    }),
    pagination: {
      limit: parsed.limit,
      offset: parsed.offset,
      total: count ?? rows.length,
    },
  };
}

export async function assignPersonRole(
  targetUserId: string,
  payload: unknown,
  accessToken: string,
  ipAddress: string | null,
) {
  const parsed = assignPersonRoleSchema.parse(payload);
  const authClient = getSupabaseAuthClient({ accessToken });

  const { data, error } = await authClient.rpc("assign_user_role", {
    p_target_user_id: targetUserId,
    p_role_slug: parsed.roleSlug,
    p_ip_address: ipAddress,
  });

  if (error || !data) {
    const code = error?.message ?? "ADMIN_PERSON_ROLE_ASSIGN_FAILED";
    if (code === "USERS_ROLE_ASSIGNMENT_DENIED") {
      throw new Error("USERS_ROLE_ASSIGNMENT_DENIED");
    }
    if (code === "USERS_ROLE_NOT_FOUND") {
      throw new Error("USERS_ROLE_NOT_FOUND");
    }
    if (code === "USERS_USER_NOT_FOUND") {
      throw new Error("USERS_USER_NOT_FOUND");
    }
    throw new Error("ADMIN_PERSON_ROLE_ASSIGN_FAILED");
  }

  return {
    userId: targetUserId,
    roleSlug: parsed.roleSlug,
  };
}
