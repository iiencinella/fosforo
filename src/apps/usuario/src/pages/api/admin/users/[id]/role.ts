import type { APIRoute } from "astro";
import { z } from "zod";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { log } from "@/lib/log";
import { assignRole } from "@/lib/admin";
import { requireAdminSession } from "@/lib/authz";

const bodySchema = z.object({
  roleSlug: z.string().min(2).max(60),
});

function extractIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return null;
  return forwarded.split(",")[0]?.trim() || null;
}

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const session = await requireAdminSession(request);
    const userId = params.id;
    if (!userId) {
      return jsonError("USERS_USER_NOT_FOUND", 404);
    }

    const payload = await parseJsonBody<unknown>(request);
    if (!payload) {
      return jsonError("JSON invalido", 400);
    }

    const parsed = bodySchema.safeParse(payload);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Datos invalidos",
        400,
      );
    }

    const result = await assignRole(
      userId,
      parsed.data,
      session.user.id,
      extractIp(request),
    );

    log.info("User role updated", { id: userId, role: result.roleSlug });
    return jsonOk({ data: result });
  } catch (error) {
    log.error("Role update failed", { id: params.id, error });
    const message =
      error instanceof Error ? error.message : "USERS_ROLE_ASSIGNMENT_FAILED";

    if (message === "USERS_SESSION_EXPIRED") {
      return jsonError(message, 401);
    }

    if (message === "USERS_ROLE_ASSIGNMENT_DENIED") {
      return jsonError(message, 403);
    }

    if (
      message === "USERS_USER_NOT_FOUND" ||
      message === "USERS_ROLE_NOT_FOUND"
    ) {
      return jsonError(message, 404);
    }

    return jsonError(message, 400);
  }
};

export const prerender = false;
