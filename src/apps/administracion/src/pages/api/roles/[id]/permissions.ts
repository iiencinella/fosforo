import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { requireApiAuth } from "@/lib/auth";
import {
  parseRoleId,
  replaceRolePermissions,
  getRoleDetail,
} from "@/lib/roles";
import { log } from "@/lib/log";

export const GET: APIRoute = async ({ request, params }) => {
  const auth = await requireApiAuth(request, ["admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const roleId = parseRoleId(params.id);
  if (!roleId) return jsonError("ADMIN_ROLE_NOT_FOUND", 404);

  try {
    const role = await getRoleDetail(roleId);
    return jsonOk({ apps: role.apps });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "ADMIN_ROLE_NOT_FOUND") {
      return jsonError(message, 404);
    }
    log.error("Fallo listando permisos del rol", { error, roleId });
    return jsonError("ADMIN_ROLE_PERMISSIONS_LIST_FAILED", 500);
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
    const selected = new Set(
      form
        .getAll("apps")
        .map((value) => (typeof value === "string" ? value : ""))
        .filter(Boolean),
    );

    payload = {
      apps: [
        "portal",
        "biblia",
        "calendario",
        "horarios",
        "usuario",
        "log",
        "administracion",
        "cancionero",
      ].map((appSlug) => ({
        appSlug,
        canAccess: selected.has(appSlug),
      })),
    };
  } else {
    payload = await parseJsonBody<unknown>(request);
  }

  if (!payload) return jsonError("Invalid payload", 400);

  try {
    const result = await replaceRolePermissions(
      roleId,
      payload,
      auth.session.userId,
    );
    if (isForm) {
      return new Response(null, {
        status: 302,
        headers: { Location: `/admin/roles/${roleId}` },
      });
    }
    return jsonOk({ data: result });
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
      if (isForm) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/admin/roles?error=ADMIN_ROLE_NOT_FOUND" },
        });
      }
      return jsonError(message, 404);
    }
    log.error("Fallo actualizando permisos del rol", { error, roleId });
    if (isForm) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/admin/roles/${roleId}?error=ADMIN_ROLE_PERMISSIONS_UPDATE_FAILED`,
        },
      });
    }
    return jsonError("ADMIN_ROLE_PERMISSIONS_UPDATE_FAILED", 500);
  }
};

export const POST: APIRoute = async ({ request, params }) =>
  PUT({ request, params } as never);
