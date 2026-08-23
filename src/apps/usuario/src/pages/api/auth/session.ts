import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { log } from "@/lib/log";
import { requireSession } from "@/lib/authz";

export const GET: APIRoute = async ({ request }) => {
  try {
    const session = await requireSession(request);

    return jsonOk({
      data: {
        userId: session.user.id,
        email: session.user.email,
        role: session.profile.roleSlug,
        name: session.profile.name,
      },
    });
  } catch (error) {
    log.warn("Session check failed");
    return jsonError("USERS_SESSION_EXPIRED", 401);
  }
};

export const prerender = false;
