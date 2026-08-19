import type { APIRoute } from "astro";
import { z } from "zod";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { log } from "@/lib/log";
import { requestPasswordReset } from "@/lib/auth";

const bodySchema = z.object({
  email: z
    .string()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalido"),
});

export const POST: APIRoute = async ({ request }) => {
  let email: string | undefined;
  try {
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

    email = parsed.data.email;
    const result = await requestPasswordReset(parsed.data.email);
    log.info("Password reset requested", { email });
    return jsonOk({ data: result });
  } catch (error) {
    log.error("Password reset failed", { error });
    const message =
      error instanceof Error ? error.message : "USERS_RESET_PASSWORD_FAILED";
    return jsonError(message, 400);
  }
};

export const prerender = false;
