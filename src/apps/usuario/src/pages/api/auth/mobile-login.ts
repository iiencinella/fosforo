import type { APIRoute } from "astro";
import { z } from "zod";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { log } from "@/lib/log";
import { loginUser } from "@/lib/auth";

const bodySchema = z.object({
  email: z
    .string()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalido"),
  password: z.string().min(8, "Credenciales invalidas").max(72),
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
    const session = await loginUser(parsed.data);
    log.info("Mobile login successful", { email });
    return jsonOk({
      data: {
        accessToken: session.accessToken,
        expiresIn: session.expiresIn,
        userId: session.userId,
      },
    });
  } catch (error) {
    log.warn("Mobile login failed", { error });
    const message =
      error instanceof Error ? error.message : "USERS_INVALID_CREDENTIALS";
    return jsonError(message, 401);
  }
};

export const prerender = false;
