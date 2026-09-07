import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import {
  CMS_APP_SLUG,
  requireAdminSession,
  requireAppPermission,
} from "@/lib/authz";
import { createWebhooksRepository } from "@/lib/webhooks-repository";
import { webhookSubscriptionSchema } from "@/lib/webhooks";

/**
 * Suscripciones de webhook (FR-CMS-010). Solo admin (RB-CMS-004).
 * GET: listar. POST: crear (JSON y form-data). DELETE: ?id= (y via POST
 * con _method=delete para forms del panel).
 */
export const GET: APIRoute = async ({ request }) => {
  let session;
  try {
    session = await requireAppPermission(request, CMS_APP_SLUG);
  } catch {
    return jsonError("CMS_ACCESS_DENIED", 403);
  }

  if (session.profile.roleSlug !== "admin") {
    return jsonError("CMS_ADMIN_REQUIRED", 403);
  }

  const repository = createWebhooksRepository();
  const subscriptions = await repository.list(session.token);

  return jsonOk({ subscriptions });
};

async function handleCreate(request: Request): Promise<Response> {
  let session;
  try {
    session = await requireAdminSession(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("SESSION_EXPIRED")) {
      return jsonError("CMS_SESSION_EXPIRED", 401);
    }
    return jsonError("CMS_ADMIN_REQUIRED", 403);
  }

  const contentTypeHeader = request.headers.get("content-type") ?? "";
  const isFormData = !contentTypeHeader.includes("application/json");

  let raw: unknown;
  if (isFormData) {
    const formData = await request.formData();
    raw = {
      app_name: formData.get("app_name"),
      target_url: formData.get("target_url"),
      secret: formData.get("secret"),
    };
  } else {
    raw = await request.json().catch(() => null);
    if (!raw) {
      return jsonError("CMS_INVALID_JSON", 400);
    }
  }

  const parsed = webhookSubscriptionSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "CMS_INVALID_PAYLOAD",
      422,
    );
  }

  const repository = createWebhooksRepository();
  try {
    const subscription = await repository.create(session.token, parsed.data);

    if (isFormData) {
      return new Response(null, {
        status: 303,
        headers: {
          location: `/admin/webhooks?ok=${encodeURIComponent(subscription.appName)}`,
        },
      });
    }
    return jsonOk({ subscription }, 201);
  } catch {
    return jsonError("CMS_WEBHOOK_CREATE_FAILED", 500);
  }
}

export const POST: APIRoute = async ({ request, url }) => {
  if (url.searchParams.get("_method") === "delete") {
    return handleDelete(request, url);
  }
  return handleCreate(request);
};

async function handleDelete(request: Request, url: URL): Promise<Response> {
  let session;
  try {
    session = await requireAdminSession(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("SESSION_EXPIRED")) {
      return jsonError("CMS_SESSION_EXPIRED", 401);
    }
    return jsonError("CMS_ADMIN_REQUIRED", 403);
  }

  const id = url.searchParams.get("id");
  const returnTo = url.searchParams.get("return_to");
  if (!id) {
    return jsonError("CMS_INVALID_PAYLOAD", 422);
  }

  try {
    await createWebhooksRepository().remove(session.token, id);
    if (returnTo) {
      return new Response(null, {
        status: 303,
        headers: { location: `${returnTo}?ok=webhook_deleted` },
      });
    }
    return jsonOk({ deleted: id });
  } catch {
    return jsonError("CMS_WEBHOOK_DELETE_FAILED", 500);
  }
}

export const DELETE: APIRoute = async ({ request, url }) => {
  return handleDelete(request, url);
};

export const prerender = false;
