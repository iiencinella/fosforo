import { createHmac, randomUUID } from "node:crypto";
import { z } from "zod";

/**
 * Webhook de publicacion del CMS (FR-CMS-010, CA-CMS-005).
 * Logica pura: payload, firma HMAC-SHA256 por suscripcion y schema de
 * alta. El despacho (con reintentos e invalidacion de cache) vive en
 * webhooks-dispatch.ts.
 */

export const WEBHOOK_SIGNATURE_HEADER = "x-cms-signature";
export const WEBHOOK_EVENT_HEADER = "x-cms-event";
export const WEBHOOK_EVENT = "entry.published";

/** Errores del catalogo. */
export const CMS_WEBHOOK_URL_INVALIDA = "CMS_WEBHOOK_URL_INVALIDA";

export const webhookSubscriptionSchema = z
  .object({
    app_name: z.string().trim().min(1).max(100),
    target_url: z
      .string()
      .trim()
      .max(500)
      .regex(/^https:\/\//, "Solo se admiten URLs https"),
    secret: z.string().trim().min(16).max(200),
  })
  .strict();

export type WebhookSubscriptionInput = z.infer<
  typeof webhookSubscriptionSchema
>;

export type WebhookSubscriptionRecord = {
  id: string;
  appName: string;
  targetUrl: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublishPayload = {
  event: typeof WEBHOOK_EVENT;
  content_type: string;
  slug: string;
  timestamp: string;
};

export function buildPublishPayload(
  contentTypeSlug: string,
  slug: string,
  now: Date = new Date(),
): { payload: PublishPayload; body: string } {
  const payload: PublishPayload = {
    event: WEBHOOK_EVENT,
    content_type: contentTypeSlug,
    slug,
    timestamp: now.toISOString(),
  };
  return { payload, body: JSON.stringify(payload) };
}

/** Firma HMAC-SHA256 del body con el secreto de la suscripcion. */
export function signBody(secret: string, body: string): string {
  const mac = createHmac("sha256", secret).update(body).digest("hex");
  return `sha256=${mac}`;
}

/** Verificacion (para tests y consumidores de referencia). */
export function verifySignature(
  secret: string,
  body: string,
  signature: string,
): boolean {
  const expected = signBody(secret, body);
  return signature.length === expected.length && signature === expected;
}

export function buildWebhookHeaders(
  secret: string,
  body: string,
): Record<string, string> {
  return {
    "content-type": "application/json",
    [WEBHOOK_EVENT_HEADER]: WEBHOOK_EVENT,
    [WEBHOOK_SIGNATURE_HEADER]: signBody(secret, body),
  };
}

/** Sesion anonima para el evento RUM del despacho (sin persistencia). */
export function anonymousSessionId(): string {
  return randomUUID().replace(/-/g, "");
}
