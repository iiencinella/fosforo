import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { requireApiAuth } from "@/lib/auth";
import { listRoles, createRole } from "@/lib/roles";
import { log } from "@/lib/log";

export const GET: APIRoute = async ({ request }) => {
  const auth = await requireApiAuth(request, ["admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  try {
    const roles = await listRoles();
    return jsonOk({ roles });
  } catch (error) {
    log.error("Fallo listando roles", { error });
    return jsonError("ADMIN_ROLES_LIST_FAILED", 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireApiAuth(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const contentType = request.headers.get("content-type") || "";

  let payload: unknown = null;
  const isForm =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");

  if (isForm) {
    const form = await request.formData();
    payload = {
      slug: form.get("slug"),
      name: form.get("name"),
      description: form.get("description") || null,
      hierarchyLevel: Number(form.get("hierarchyLevel")),
    };
  } else {
    payload = await parseJsonBody<unknown>(request);
  }

  if (!payload) return jsonError("Invalid payload", 400);

  try {
    const role = await createRole(payload, auth.session.userId);
    if (isForm) {
      return new Response(null, {
        status: 302,
        headers: { Location: `/admin/roles/${role.id}` },
      });
    }
    return jsonOk({ role }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      if (isForm) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/admin/roles?error=Validation" },
        });
      }
      return jsonError("Validation error", 422);
    }

    const message = error instanceof Error ? error.message : "";
    if (message === "ADMIN_ROLE_DUPLICATED") {
      if (isForm) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/admin/roles?error=ADMIN_ROLE_DUPLICATED" },
        });
      }
      return jsonError(message, 409);
    }
    if (message === "ADMIN_ROLE_SLUG_RESERVED") {
      if (isForm) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/admin/roles?error=ADMIN_ROLE_SLUG_RESERVED" },
        });
      }
      return jsonError(message, 422);
    }

    log.error("Fallo creando rol", { error });
    if (isForm) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/admin/roles?error=ADMIN_ROLE_CREATE_FAILED" },
      });
    }
    return jsonError("ADMIN_ROLE_CREATE_FAILED", 500);
  }
};
