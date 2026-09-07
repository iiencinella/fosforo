import { getAccessTokenFromRequest } from "@/lib/auth";
import { getSessionFromToken } from "@/lib/auth-supabase";
import type { PlatformRoleSlug } from "@repo/auth";

export async function requireSession(request: Request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) {
    throw new Error("LOG_SESSION_EXPIRED");
  }

  const session = await getSessionFromToken(token);
  return {
    token,
    user: session.user,
    role: session.role,
  };
}

export async function requireRole(
  request: Request,
  allowed: readonly PlatformRoleSlug[],
) {
  const session = await requireSession(request);
  if (!session.role || !allowed.includes(session.role)) {
    throw new Error("LOG_ACCESS_DENIED");
  }
  return session;
}
