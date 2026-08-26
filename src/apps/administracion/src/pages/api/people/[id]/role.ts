import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { requireApiAuth } from "@/lib/auth";
import { assignPersonRole } from "@/lib/roles";
import { log } from "@/lib/log";

export const PUT: APIRoute = async ({ request, params }) => {
  const auth = await requireApiAuth(request, ["admin", "editor"]);
  if (!auth.ok) return auth.response;

  const userId = params.id;
  if (!userId) return jsonError("USERS_USER_NOT_FOUND", 404);

  const contentType = request.headers.get("content-type") || "";
  const isForm =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");

  let payload: unknown = null;
  if (isForm) {
    const form = await request.formData();
    payload = {
      roleSlug: form.get("roleSlug"),
    };
  } else {
    payload = await parseJsonBody<unknown>(request);
  }

  if (!payload) return jsonError("Invalid payload", 400);

  try {
    const data = await assignPersonRole(
      userId,
      payload,
      auth.session.token,
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    );
    if (isForm) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/admin/people" },
      });
    }
    return jsonOk({ data });
  } catch (error) {
    if (error instanceof ZodError) {
      if (isForm) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/admin/people?error=Validation" },
        });
      }
      return jsonError("Validation error", 422);
    }

    const message = error instanceof Error ? error.message : "";

    if (message === "USERS_ROLE_ASSIGNMENT_DENIED") {
      if (isForm) {
        return new Response(null, {
          status: 302,
          headers: { Location: `/admin/people?error=${message}` },
        });
      }
      return jsonError(message, 403);
    }

    if (
      message === "USERS_ROLE_NOT_FOUND" ||
      message === "USERS_USER_NOT_FOUND"
    ) {
      if (isForm) {
        return new Response(null, {
          status: 302,
          headers: { Location: `/admin/people?error=${message}` },
        });
      }
      return jsonError(message, 404);
    }

    log.error("Fallo asignando rol de persona", { error, userId });
    if (isForm) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/admin/people?error=ADMIN_PERSON_ROLE_ASSIGN_FAILED",
        },
      });
    }
    return jsonError("ADMIN_PERSON_ROLE_ASSIGN_FAILED", 500);
  }
};

export const POST: APIRoute = async ({ request, params }) =>
  PUT({ request, params } as never);
