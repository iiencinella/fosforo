import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { log } from "@/lib/log";
import { listAuditEvents } from "@/lib/admin";
import { requireAdminSession } from "@/lib/authz";

export const GET: APIRoute = async ({ request, url }) => {
  try {
    await requireAdminSession(request);

    const limitParam = Number(url.searchParams.get("limit") || "100");
    const events = await listAuditEvents(limitParam);

    return jsonOk({ data: events });
  } catch (error) {
    log.error("Audit log fetch failed", { error });
    const message =
      error instanceof Error ? error.message : "USERS_AUDIT_LOG_FAILED";

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
