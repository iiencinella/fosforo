import { z } from "zod";
import { Resend } from "resend";
import { getPortalEnv } from "@repo/env";
import { log } from "@/lib/log";
import { getIp, isRateLimited } from "@/lib/rate-limit";
import { createContactSubmission } from "@/lib/submissions";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z
    .string()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalido"),
  message: z.string().min(1).max(1000),
  privacy: z.union([z.literal(true), z.literal("true")]),
});

function getFieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = typeof issue.path[0] === "string" ? issue.path[0] : "form";

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(issue.message);
    return acc;
  }, {});
}

export function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function buildContactEmailHtml(payload: {
  name: string;
  email: string;
  message: string;
}): string {
  const escapeHtml = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character] ?? character,
    );

  return `
    <h2>Nuevo mensaje de contacto</h2>
    <table border="0" cellpadding="8" cellspacing="0" style="font-family:sans-serif">
      <tr><td style="font-weight:700;padding-right:12px">Nombre</td><td>${escapeHtml(payload.name)}</td></tr>
      <tr><td style="font-weight:700;padding-right:12px">Email</td><td>${escapeHtml(payload.email)}</td></tr>
      <tr><td style="font-weight:700;padding-right:12px;vertical-align:top">Mensaje</td><td>${escapeHtml(payload.message)}</td></tr>
    </table>
    <hr>
    <p style="font-size:12px;color:#666">Enviado desde el formulario de contacto del Portal Fósforo</p>
  `;
}

async function sendContactEmail(payload: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const env = getPortalEnv();
  if (!env.resendApiKey || !env.feedbackEmailTo) {
    log.warn(
      "[portal-contact] Resend no configurado (falta RESEND_API_KEY o FEEDBACK_EMAIL_TO). Mensaje solo logueado.",
    );
    return;
  }

  const resend = new Resend(env.resendApiKey);

  const { error } = await resend.emails.send({
    from: "Contacto Portal <onboarding@resend.dev>",
    to: [env.feedbackEmailTo],
    subject: `[Contacto] ${payload.name}`,
    html: buildContactEmailHtml(payload),
  });

  if (error) {
    log.error("[portal-contact] Error al enviar email:", {
      error: error.message,
    });
  }
}

export async function handleContactPost(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type") || "";
  const ip = getIp(request);
  if (isRateLimited(ip)) {
    return jsonResponse(
      {
        success: false,
        message: "Demasiados intentos. Intenta nuevamente en un minuto.",
      },
      429,
    );
  }

  if (contentType.includes("application/json")) {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          message: "Body JSON invalido",
        },
        400,
      );
    }

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = getFieldErrors(parsed.error);
      return jsonResponse(
        {
          success: false,
          message: "Datos invalidos",
          errors: fieldErrors,
        },
        400,
      );
    }

    const { name, email, message } = parsed.data;

    let submissionId: string;
    try {
      ({ id: submissionId } = await createContactSubmission({
        name,
        email,
        message,
      }));
    } catch (error) {
      log.error("[portal-contact] persistence failed", {
        error: error instanceof Error ? error.message : "unknown_error",
      });
      return jsonResponse(
        {
          success: false,
          message: "No pudimos registrar tu mensaje. Intenta nuevamente.",
        },
        503,
      );
    }

    log.info("[portal-contact] submission persisted", { submissionId });

    await sendContactEmail({ name, email, message });

    return jsonResponse({
      success: true,
      message: "Mensaje enviado correctamente.",
    });
  }

  const form = await request.formData();
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();
  const payload = {
    name:
      `${firstName} ${lastName}`.trim() ||
      String(form.get("name") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    message:
      String(form.get("comment") ?? "").trim() ||
      String(form.get("message") ?? "").trim(),
    privacy: String(form.get("privacy") ?? "").trim(),
  };

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return new Response("Datos invalidos", { status: 400 });
  }

  const { name, email, message } = parsed.data;

  let submissionId: string;
  try {
    ({ id: submissionId } = await createContactSubmission({
      name,
      email,
      message,
    }));
  } catch (error) {
    log.error("[portal-contact] persistence failed", {
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return new Response("No pudimos registrar tu mensaje", { status: 503 });
  }

  log.info("[portal-contact] submission persisted", { submissionId });

  await sendContactEmail({ name, email, message });

  return new Response(null, {
    status: 303,
    headers: {
      Location: "/contacto?ok=1",
    },
  });
}

export function handleContactGet(): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: "/contacto" },
  });
}
