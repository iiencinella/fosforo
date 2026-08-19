import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { log } from "@/lib/log";
import { listUsers } from "@/lib/admin";
import { requireAdminSession } from "@/lib/authz";

export const GET: APIRoute = async ({ request }) => {
  try {
    await requireAdminSession(request);
    const users = await listUsers();
    log.info("Admin users listed");
    return jsonOk({ data: users });
  } catch (error) {
    log.error("Admin users list failed", { error });
    const message =
      error instanceof Error ? error.message : "USERS_ADMIN_LIST_FAILED";

    if (message === "USERS_SESSION_EXPIRED") {
      return jsonError(message, 401);
    }

    if (message === "USERS_ROLE_ASSIGNMENT_DENIED") {
      return jsonError(message, 403);
    }

    return jsonError(message, 400);
  }
};

export const prerender = false;
