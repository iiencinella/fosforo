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

export async function listUsers(
  accessToken: string,
  options: { search?: string; limit?: number; offset?: number } = {},
) {
  const supabase = getSupabaseAuthClient({ accessToken });
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);
  const search = options.search?.trim().slice(0, 120);
  let query = supabase
    .from("profiles")
    .select("id, email, name, avatar_url, role_id, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) query = query.ilike("email", `%${search}%`);

  const { data, error, count } = await query;

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

  const users = profileRows.map((row) => {
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

  return {
    users,
    pagination: {
      limit,
      offset,
      total: count ?? users.length,
    },
  };
}

export async function getUserById(userId: string, accessToken: string) {
  const supabase = getSupabaseAuthClient({ accessToken });
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
  ipAddress: string | null,
  accessToken: string,
) {
  const supabase = getSupabaseAuthClient({ accessToken });
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

  const { data: assignment, error: assignmentError } = await supabase.rpc(
    "assign_user_role",
    {
      p_target_user_id: targetUserId,
      p_role_slug: roleData.slug,
      p_ip_address: ipAddress,
    },
  );

  if (assignmentError || !assignment) {
    log.error("Admin operation failed", {
      operation: "assignRole",
      error: assignmentError ? assignmentError.message : "assignment_failed",
    });
    throw new Error(
      assignmentError?.message === "USERS_ROLE_ASSIGNMENT_DENIED"
        ? "USERS_ROLE_ASSIGNMENT_DENIED"
        : "USERS_ROLE_ASSIGNMENT_FAILED",
    );
  }

  return {
    userId: targetUserId,
    roleSlug: roleData.slug,
  };
}

export async function listAuditEvents(limit = 100, accessToken: string) {
  const supabase = getSupabaseAuthClient({ accessToken });
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
