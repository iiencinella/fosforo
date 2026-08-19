import { z } from "zod";
import { getSupabaseAuthClient } from "@repo/auth";
import { log } from "./log";

const assignRoleSchema = z.object({
  roleSlug: z.string().min(2).max(60),
});

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role_id: number | null;
  created_at: string;
};

type RoleRow = {
  id: number;
  slug: string;
  name: string;
};

type AuditRow = {
  id: number;
  user_id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
};

type UserRoleInsert = {
  user_id: string;
  role_id: number;
  assigned_by: string;
  assigned_at: string;
};

type AuditInsert = {
  user_id: string;
  action: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
};

export async function listUsers() {
  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, avatar_url, role_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    log.error("Admin operation failed", { operation: "listUsers", error });
    throw new Error("USERS_ADMIN_LIST_FAILED");
  }

  const profileRows = (data ?? []) as AdminUserRow[];

  const roleIds = [
    ...new Set(profileRows.map((item) => item.role_id).filter(Boolean)),
  ] as number[];
  let rolesById = new Map<number, RoleRow>();

  if (roleIds.length > 0) {
    const { data: roles } = await supabase
      .from("roles")
      .select("id, slug, name")
      .in("id", roleIds);

    const roleRows = (roles ?? []) as RoleRow[];

    rolesById = new Map(roleRows.map((role) => [role.id, role]));
  }

  return profileRows.map((row) => {
    const role = row.role_id ? rolesById.get(row.role_id) : undefined;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatar_url,
      role: role?.slug ?? "usuario",
      roleLabel: role?.name ?? "Usuario",
      createdAt: row.created_at,
    };
  });
}

export async function getUserById(userId: string) {
  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, avatar_url, role_id, created_at")
    .eq("id", userId)
    .single<AdminUserRow>();

  if (error || !data) {
    log.error("Admin operation failed", { operation: "getUserById", error });
    throw new Error("USERS_USER_NOT_FOUND");
  }

  let roleSlug = "usuario";
  let roleLabel = "Usuario";

  if (data.role_id) {
    const { data: roleData } = await supabase
      .from("roles")
      .select("id, slug, name")
      .eq("id", data.role_id)
      .single<RoleRow>();

    if (roleData) {
      roleSlug = roleData.slug;
      roleLabel = roleData.name;
    }
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatarUrl: data.avatar_url,
    role: roleSlug,
    roleLabel,
    createdAt: data.created_at,
  };
}

export async function assignRole(
  targetUserId: string,
  payload: { roleSlug: string },
  actorUserId: string,
  ipAddress: string | null,
) {
  const supabase = getSupabaseAuthClient();
  const parsed = assignRoleSchema.parse(payload);

  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id, slug")
    .eq("slug", parsed.roleSlug)
    .single<RoleRow>();

  if (roleError || !roleData) {
    log.error("Admin operation failed", {
      operation: "assignRole",
      error: roleError,
    });
    throw new Error("USERS_ROLE_NOT_FOUND");
  }

  const { data: currentProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role_id")
    .eq("id", targetUserId)
    .single<{ id: string; role_id: number | null }>();

  if (profileError || !currentProfile) {
    log.error("Admin operation failed", {
      operation: "assignRole",
      error: profileError,
    });
    throw new Error("USERS_USER_NOT_FOUND");
  }

  const currentRoleId = currentProfile.role_id;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role_id: roleData.id, updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  if (updateError) {
    log.error("Admin operation failed", {
      operation: "assignRole",
      error: updateError,
    });
    throw new Error("USERS_ROLE_ASSIGNMENT_FAILED");
  }

  const roleAssignment: UserRoleInsert = {
    user_id: targetUserId,
    role_id: roleData.id,
    assigned_by: actorUserId,
    assigned_at: new Date().toISOString(),
  };

  await supabase.from("user_roles").insert(roleAssignment);

  const auditRecord: AuditInsert = {
    user_id: targetUserId,
    action: "role_changed",
    metadata: {
      actorUserId,
      previousRoleId: currentRoleId,
      nextRoleId: roleData.id,
      nextRoleSlug: roleData.slug,
    },
    ip_address: ipAddress,
    created_at: new Date().toISOString(),
  };

  await supabase.from("audit_log").insert(auditRecord);

  return {
    userId: targetUserId,
    roleSlug: roleData.slug,
  };
}

export async function listAuditEvents(limit = 100) {
  const supabase = getSupabaseAuthClient();
  const safeLimit = Math.min(Math.max(limit, 1), 500);

  const { data, error } = await supabase
    .from("audit_log")
    .select("id, user_id, action, metadata, ip_address, created_at")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    log.error("Admin operation failed", {
      operation: "listAuditEvents",
      error,
    });
    throw new Error("USERS_AUDIT_LOG_FAILED");
  }

  return (data ?? []) as AuditRow[];
}
