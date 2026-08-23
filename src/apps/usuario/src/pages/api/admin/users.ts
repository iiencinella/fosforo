import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { log } from "@/lib/log";
import { listUsers } from "@/lib/admin";
import { requireAdminSession } from "@/lib/authz";

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const session = await requireAdminSession(request);
    const limit = Number(url.searchParams.get("limit") || "50");
    const offset = Number(url.searchParams.get("offset") || "0");
    const search = url.searchParams.get("search") ?? undefined;
    const users = await listUsers(session.token, { limit, offset, search });
    log.info("Admin users listed");
    return jsonOk({ data: users });
  } catch (error) {
    log.error("Admin users list failed", { error });
    const message = error instanceof Error ? error.message : "";

    if (message === "USERS_SESSION_EXPIRED") {
      return jsonError(message, 401);
    }

    if (message === "USERS_ROLE_ASSIGNMENT_DENIED") {
      return jsonError(message, 403);
    }

    return jsonError("USERS_ADMIN_LIST_FAILED", 500);
  }
};

export const prerender = false;
