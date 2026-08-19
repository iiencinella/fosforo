import type { APIRoute } from "astro";
import { jsonError } from "@repo/api-utils";
import { log } from "@/lib/log";
import { logoutUser } from "@/lib/auth";
import { clearSessionCookies, getAccessTokenFromRequest } from "@/lib/session";

export const POST: APIRoute = async ({ request }) => {
  const accessToken = getAccessTokenFromRequest(request);

  if (!accessToken) {
    return jsonError("USERS_SESSION_EXPIRED", 401);
  }

  try {
    await logoutUser(accessToken);
  } catch {
    // no-op: we always clear cookies locally
  }

  const headers = new Headers({ "content-type": "application/json" });
  for (const cookie of clearSessionCookies()) {
    headers.append("set-cookie", cookie);
  }

  log.info("User logged out");
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers,
  });
};

export const prerender = false;
