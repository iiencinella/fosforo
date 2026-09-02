import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@repo/env";
import { getAccessTokenFromRequest } from "./cookies.js";

export type ProfileRow = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role_id: number | null;
  created_at?: string;
  updated_at?: string;
};

export type RoleRow = {
  id: number;
  slug: string;
  name?: string;
  description?: string;
  hierarchy_level?: number;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  roleId: number | null;
  roleSlug: string;
};

let cachedClient: SupabaseClient | null = null;

export type SupabaseAuthClientOptions = {
  accessToken?: string;
};

export function getSupabaseAuthClient(
  options: SupabaseAuthClientOptions = {},
): SupabaseClient {
  if (options.accessToken) {
    const { url, anonKey } = getSupabaseEnv();
    return createClient(url, anonKey, {
      global: {
        headers: { Authorization: `Bearer ${options.accessToken}` },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  if (cachedClient) return cachedClient;
  const { url, anonKey } = getSupabaseEnv();
  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cachedClient;
}

export async function getSessionFromToken(token: string) {
  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error("USERS_SESSION_EXPIRED");
  }

  return data.user;
}

export async function getUserProfileById(
  userId: string,
  accessToken?: string,
): Promise<UserProfile> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, avatar_url, role_id")
    .eq("id", userId)
    .single<ProfileRow>();

  if (error || !data) {
    throw new Error("USERS_PROFILE_NOT_FOUND");
  }

  let roleSlug = "usuario";
  let roleId: number | null = data.role_id;

  if (data.role_id) {
    const { data: roleData } = await supabase
      .from("roles")
      .select("id, slug")
      .eq("id", data.role_id)
      .single<RoleRow>();

    if (roleData?.slug) {
      roleSlug = roleData.slug;
      roleId = roleData.id;
    }
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatarUrl: data.avatar_url,
    roleId,
    roleSlug,
  };
}

export type SessionBundle = {
  token: string;
  user: { id: string; email?: string | null };
  profile: UserProfile;
};

export async function getSessionFromRequest(
  request: Request,
): Promise<SessionBundle | null> {
  const token = getAccessTokenFromRequest(request);
  if (!token) return null;

  try {
    const user = await getSessionFromToken(token);
    const profile = await getUserProfileById(user.id, token);
    return { token, user, profile };
  } catch (error) {
    console.error("[auth] getSessionFromRequest falló:", error);
    return null;
  }
}

export async function requireSession(request: Request): Promise<SessionBundle> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    throw new Error("USERS_SESSION_EXPIRED");
  }
  return session;
}

export async function requireAdminSession(
  request: Request,
): Promise<SessionBundle> {
  const session = await requireSession(request);
  if (session.profile.roleSlug !== "admin") {
    throw new Error("USERS_ROLE_ASSIGNMENT_DENIED");
  }
  return session;
}

export async function hasAppPermission(
  userId: string,
  appSlug: string,
  accessToken: string,
): Promise<boolean> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("id", userId)
    .single<{ role_id: number | null }>();

  if (profileError || !profile?.role_id) return false;

  const { data: permission, error } = await supabase
    .from("permissions")
    .select("can_access")
    .eq("role_id", profile.role_id)
    .eq("app_slug", appSlug)
    .maybeSingle<{ can_access: boolean }>();

  return !error && permission?.can_access === true;
}

export async function requireAppPermission(
  request: Request,
  appSlug: string,
): Promise<SessionBundle> {
  const session = await requireSession(request);
  if (session.profile.roleSlug === "admin") return session;

  if (!(await hasAppPermission(session.user.id, appSlug, session.token))) {
    throw new Error("USERS_UNAUTHORIZED_APP");
  }

  return session;
}
