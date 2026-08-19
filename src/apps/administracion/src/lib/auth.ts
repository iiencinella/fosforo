import { getAdminEnv } from "@repo/env";
import type { AdminRole } from "@/db/supabase";
import { supabase } from "@/db/supabase";

type CookieStore = {
  set: (key: string, value: string, options?: Record<string, unknown>) => void;
  delete: (key: string, options?: Record<string, unknown>) => void;
};

export type AdminSession = {
  token: string;
  userId: string;
  email: string | null;
  role: AdminRole;
};

const { sessionCookie: SESSION_COOKIE, sessionMaxAge: SESSION_MAX_AGE } =
  getAdminEnv();

export function setAdminSessionCookie(cookies: CookieStore, token: string) {
  cookies.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearAdminSessionCookie(cookies: CookieStore) {
  cookies.delete(SESSION_COOKIE, { path: "/" });
}

async function getAdminRole(userId: string): Promise<AdminRole | null> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", userId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.role as AdminRole;
}

export async function getSessionFromRequest(
  request: Request,
  allowedRoles?: AdminRole[],
): Promise<AdminSession | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.split("=")[1];

  const bearerToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  const token = decodeURIComponent(cookieToken ?? bearerToken ?? "");

  if (!token) {
    return null;
  }

  const { data: userData, error: userError } =
    await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return null;
  }

  const role = await getAdminRole(userData.user.id);
  if (!role) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return null;
  }

  return {
    token,
    userId: userData.user.id,
    email: userData.user.email ?? null,
    role,
  };
}

export async function requireApiAuth(
  request: Request,
  allowedRoles?: AdminRole[],
): Promise<
  { ok: true; session: AdminSession } | { ok: false; response: Response }
> {
  const session = await getSessionFromRequest(request, allowedRoles);

  if (!session) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ ok: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
    };
  }

  return { ok: true, session };
}

export async function requirePageAuth(
  Astro: {
    request: Request;
    redirect: (path: string) => Response;
  },
  allowedRoles?: AdminRole[],
) {
  const session = await getSessionFromRequest(Astro.request, allowedRoles);

  if (!session) {
    return { session: null, response: Astro.redirect("/login") };
  }

  return { session, response: null };
}
