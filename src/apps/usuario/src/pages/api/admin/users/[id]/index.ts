import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { log } from "@/lib/log";
import { getUserById } from "@/lib/admin";
import { requireAdminSession } from "@/lib/authz";

export const GET: APIRoute = async ({ request, params }) => {
  try {
    await requireAdminSession(request);

    const userId = params.id;
    if (!userId) {
      return jsonError("USERS_USER_NOT_FOUND", 404);
    }

    const user = await getUserById(userId);
    return jsonOk({ data: user });
  } catch (error) {
    log.error("Admin user operation failed", { id: params.id, error });
    const message =
      error instanceof Error ? error.message : "USERS_USER_NOT_FOUND";

    if (message === "USERS_SESSION_EXPIRED") {
      return jsonError(message, 401);
    }

    if (message === "USERS_ROLE_ASSIGNMENT_DENIED") {
      return jsonError(message, 403);
    }

    if (message === "USERS_USER_NOT_FOUND") {
      return jsonError(message, 404);
    }

    return jsonError(message, 400);
  }
};

export const prerender = false;
