import type { APIRoute } from "astro";
import { z } from "zod";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { log } from "@/lib/log";
import { registerUser } from "@/lib/auth";

const registerBodySchema = z.object({
  email: z
    .string()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72),
  name: z.string().min(2, "Nombre demasiado corto").max(80),
});

export const POST: APIRoute = async ({ request }) => {
  let email: string | undefined;
  try {
    const payload = await parseJsonBody<unknown>(request);
    if (!payload) {
      return jsonError("JSON invalido", 400);
    }

    const parsed = registerBodySchema.safeParse(payload);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Datos invalidos",
        400,
      );
    }

    email = parsed.data.email;
    const result = await registerUser(parsed.data);
    log.info("Registration successful", { email });
    return jsonOk({ data: result }, 201);
  } catch (error) {
    log.warn("Registration failed", { email, error });
    const message =
      error instanceof Error ? error.message : "USERS_REGISTER_FAILED";

    if (message === "USERS_DUPLICATE_EMAIL") {
      return jsonError(message, 409);
    }

    return jsonError(message, 400);
  }
};

export const prerender = false;
