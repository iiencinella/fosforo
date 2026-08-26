import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { requireApiAuth } from "@/lib/auth";
import {
  getRoleDetail,
  parseRoleId,
  updateRole,
  deleteRole,
} from "@/lib/roles";
import { log } from "@/lib/log";

export const GET: APIRoute = async ({ request, params }) => {
  const auth = await requireApiAuth(request, ["admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const roleId = parseRoleId(params.id);
  if (!roleId) return jsonError("ADMIN_ROLE_NOT_FOUND", 404);

  try {
    const role = await getRoleDetail(roleId);
    return jsonOk({ role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "ADMIN_ROLE_NOT_FOUND") {
      return jsonError(message, 404);
    }
    log.error("Fallo obteniendo rol", { error, roleId });
    return jsonError("ADMIN_ROLE_DETAIL_FAILED", 500);
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  const auth = await requireApiAuth(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const roleId = parseRoleId(params.id);
  if (!roleId) return jsonError("ADMIN_ROLE_NOT_FOUND", 404);

  const contentType = request.headers.get("content-type") || "";
  const isForm =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");

  let payload: unknown = null;
  if (isForm) {
    const form = await request.formData();
    payload = {
      name: form.get("name"),
      description: form.get("description") || null,
      hierarchyLevel: Number(form.get("hierarchyLevel")),
    };
  } else {
    payload = await parseJsonBody<unknown>(request);
  }

  if (!payload) return jsonError("Invalid payload", 400);

  try {
    const role = await updateRole(roleId, payload, auth.session.userId);
    if (isForm) {
      return new Response(null, {
        status: 302,
        headers: { Location: `/admin/roles/${roleId}` },
      });
    }
    return jsonOk({ role });
  } catch (error) {
    if (error instanceof ZodError) {
      if (isForm) {
        return new Response(null, {
          status: 302,
          headers: { Location: `/admin/roles/${roleId}?error=Validation` },
        });
      }
      return jsonError("Validation error", 422);
    }
    const message = error instanceof Error ? error.message : "";
    if (message === "ADMIN_ROLE_NOT_FOUND") {
      return jsonError(message, 404);
    }
    log.error("Fallo actualizando rol", { error, roleId });
    if (isForm) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/admin/roles/${roleId}?error=ADMIN_ROLE_UPDATE_FAILED`,
        },
      });
    }
    return jsonError("ADMIN_ROLE_UPDATE_FAILED", 500);
  }
};

export const POST: APIRoute = async ({ request, params }) => {
  const action = new URL(request.url).searchParams.get("_action");
  if (action === "delete") {
    return DELETE({ request, params } as never);
  }
  return PUT({ request, params } as never);
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const auth = await requireApiAuth(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const isForm =
    (request.headers.get("content-type") || "").includes(
      "application/x-www-form-urlencoded",
    ) ||
    (request.headers.get("content-type") || "").includes("multipart/form-data");

  const roleId = parseRoleId(params.id);
  if (!roleId) return jsonError("ADMIN_ROLE_NOT_FOUND", 404);

  try {
    await deleteRole(roleId, auth.session.userId);
    if (isForm) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/admin/roles" },
      });
    }
    return jsonOk({ id: roleId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (
      message === "ADMIN_ROLE_NOT_FOUND" ||
      message === "ADMIN_ROLE_PROTECTED" ||
      message === "ADMIN_ROLE_HAS_ASSIGNED_USERS"
    ) {
      if (isForm) {
        return new Response(null, {
          status: 302,
          headers: { Location: `/admin/roles/${roleId}?error=${message}` },
        });
      }
      return jsonError(message, message === "ADMIN_ROLE_NOT_FOUND" ? 404 : 409);
    }
    log.error("Fallo eliminando rol", { error, roleId });
    if (isForm) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/admin/roles/${roleId}?error=ADMIN_ROLE_DELETE_FAILED`,
        },
      });
    }
    return jsonError("ADMIN_ROLE_DELETE_FAILED", 500);
  }
};
