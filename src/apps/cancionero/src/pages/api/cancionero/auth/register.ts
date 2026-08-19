import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import {
  registerUserWithRole,
  registerPayloadSchema,
} from "@/lib/server/register";
import { log } from "@/lib/log";

export const POST: APIRoute = async ({ request }) => {
  let email: string | undefined;
  try {
    const payload = await parseJsonBody<unknown>(request);
    if (!payload) {
      return jsonError("JSON invalido", 400);
    }

    const parsed = registerPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Datos invalidos",
        400,
      );
    }

    email = parsed.data.email;
    const result = await registerUserWithRole(parsed.data);
    log.info("Registration successful", { email });
    return jsonOk({ data: result }, 201);
  } catch (error) {
    log.warn("Registration failed", { email, error });
    const message =
      error instanceof Error ? error.message : "CANCIONERO_REGISTER_FAILED";

    if (message === "CANCIONERO_DUPLICATE_EMAIL") {
      return jsonError(message, 409);
    }
    if (message === "CANCIONERO_ROLE_NOT_FOUND") {
      return jsonError(message, 500);
    }
    return jsonError(message, 400);
  }
};

export const prerender = false;
