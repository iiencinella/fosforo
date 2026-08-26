import type { APIRoute } from "astro";
import { Resend } from "resend";
import { z } from "zod";
import { getPortalEnv } from "@repo/env";
import { log } from "@/lib/log";
import { getIp, isRateLimited } from "@/lib/rate-limit";
import { createFeedbackSubmission } from "@/lib/submissions";

const feedbackSchema = z.object({
  name: z.string().trim().min(1).max(100),
  contact_channel: z.string().trim().min(1).max(120),
  category: z.enum(["producto", "contenido", "ux"]),
  message: z.string().trim().min(20).max(1000),
});

function escapeHtml(value: string): string {
  return value.replace(
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
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function buildEmailHtml(payload: {
  name: string;
  contact_channel: string;
  category: string;
  message: string;
}): string {
  const labels: Record<string, string> = {
    producto: "Producto",
    contenido: "Contenido",
    ux: "Experiencia de usuario",
  };

  return `
    <h2>Nuevo feedback recibido</h2>
    <table border="0" cellpadding="8" cellspacing="0" style="font-family:sans-serif">
      <tr><td style="font-weight:700;padding-right:12px">Nombre</td><td>${escapeHtml(payload.name)}</td></tr>
      <tr><td style="font-weight:700;padding-right:12px">Contacto</td><td>${escapeHtml(payload.contact_channel)}</td></tr>
      <tr><td style="font-weight:700;padding-right:12px">Categoría</td><td>${escapeHtml(labels[payload.category] ?? payload.category)}</td></tr>
      <tr><td style="font-weight:700;padding-right:12px;vertical-align:top">Mensaje</td><td>${escapeHtml(payload.message)}</td></tr>
    </table>
    <hr>
    <p style="font-size:12px;color:#666">Enviado desde el formulario de feedback del Portal Fósforo</p>
  `;
}

async function sendEmail(payload: {
  name: string;
  contact_channel: string;
  category: string;
  message: string;
}): Promise<void> {
  const env = getPortalEnv();
  if (!env.resendApiKey || !env.feedbackEmailTo) {
    log.warn(
      "[portal-feedback] Resend no configurado (falta RESEND_API_KEY o FEEDBACK_EMAIL_TO). Feedback solo logueado.",
    );
    return;
  }

  const resend = new Resend(env.resendApiKey);

  const { error } = await resend.emails.send({
    from: "Feedback Portal <onboarding@resend.dev>",
    to: [env.feedbackEmailTo],
    subject: `[Feedback] ${payload.category} - ${payload.name}`,
    html: buildEmailHtml(payload),
  });

  if (error) {
    log.error("[portal-feedback] Error al enviar email:", {
      error: error.message,
    });
  }
}

export const POST: APIRoute = async ({ request }) => {
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
    const payload = (await request.json().catch(() => null)) as {
      name?: string;
      contact_channel?: string;
      category?: string;
      message?: string;
    } | null;

    const parsed = feedbackSchema.safeParse(payload);
    if (!parsed.success) {
      return jsonResponse({ success: false, message: "Datos invalidos" }, 400);
    }

    const validated = parsed.data;

    let submissionId: string;
    try {
      ({ id: submissionId } = await createFeedbackSubmission({
        name: validated.name,
        contactChannel: validated.contact_channel,
        category: validated.category,
        message: validated.message,
      }));
    } catch (error) {
      log.error("[portal-feedback] persistence failed", {
        error: error instanceof Error ? error.message : "unknown_error",
      });
      return jsonResponse(
        {
          success: false,
          message: "No pudimos registrar tu feedback. Intenta nuevamente.",
        },
        503,
      );
    }

    log.info("[portal-feedback] submission persisted", { submissionId });

    await sendEmail(validated);

    return jsonResponse({
      success: true,
      message: "Feedback enviado correctamente.",
    });
  }

  const form = await request.formData();
  const payload = {
    name: String(form.get("name") ?? "").trim(),
    contact_channel: String(form.get("contact_channel") ?? "").trim(),
    category: String(form.get("category") ?? "").trim(),
    message: String(form.get("message") ?? "").trim(),
  };

  const parsed = feedbackSchema.safeParse(payload);
  if (!parsed.success) {
    return new Response("Datos invalidos", { status: 400 });
  }

  const validated = parsed.data;
  let submissionId: string;
  try {
    ({ id: submissionId } = await createFeedbackSubmission({
      name: validated.name,
      contactChannel: validated.contact_channel,
      category: validated.category,
      message: validated.message,
    }));
  } catch (error) {
    log.error("[portal-feedback] persistence failed", {
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return new Response("No pudimos registrar tu feedback", { status: 503 });
  }

  log.info("[portal-feedback] submission persisted", { submissionId });

  await sendEmail(validated);

  return new Response(null, {
    status: 303,
    headers: {
      Location: "/feedback?ok=1",
    },
  });
};

export const prerender = false;
