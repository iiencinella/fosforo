import type { APIRoute } from "astro";
import { z } from "zod";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { getAccessTokenFromRequest } from "@/lib/session";
import { updatePassword } from "@/lib/auth";

const bodySchema = z.object({
  password: z.string().min(8).max(72),
});

export const POST: APIRoute = async ({ request }) => {
  const accessToken = getAccessTokenFromRequest(request);
  if (!accessToken) return jsonError("USERS_SESSION_EXPIRED", 401);

  try {
    const payload = await parseJsonBody<unknown>(request);
    const parsed = bodySchema.safeParse(payload);
    if (!parsed.success) return jsonError("USERS_INVALID_PASSWORD", 400);

    return jsonOk({
      data: await updatePassword(accessToken, parsed.data.password),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "USERS_UPDATE_PASSWORD_FAILED";
    return jsonError(
      message === "USERS_SESSION_EXPIRED"
        ? message
        : "USERS_UPDATE_PASSWORD_FAILED",
      message === "USERS_SESSION_EXPIRED" ? 401 : 400,
    );
  }
};

export const prerender = false;
