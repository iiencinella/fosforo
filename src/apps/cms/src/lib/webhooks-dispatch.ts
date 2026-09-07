import {
  buildPublishPayload,
  buildWebhookHeaders,
  anonymousSessionId,
} from "@/lib/webhooks";
import { createWebhooksRepository } from "@/lib/webhooks-repository";
import { invalidateContentType } from "@/lib/content-cache";

/**
 * Despacho de publicacion (FR-CMS-010, RB-CMS-010, IR-CMS-004/006/007).
 *
 * Secuencia al publicar una entrada (fire-and-forget, nunca bloquea ni
 * rompe la transicion):
 *   1. invalida el cache del content type (paso 7, RB-CMS-010);
 *   2. emite el webhook firmado a cada suscripcion activa con hasta
 *      WEBHOOK_MAX_ATTEMPTS intentos y backoff;
 *   3. reporta el evento de producto cms.entry.published al RUM.
 *
 * Notificacion a revisores/editores (IR-CMS-004): queda ligada a la app
 * Sistema de Notificaciones (plantillas + API de eventos, pendiente de
 * construir); el audit_log de la transicion ya deja trazabilidad.
 */

export const WEBHOOK_MAX_ATTEMPTS = 3;
const BACKOFF_MS = [1_000, 2_000];

export type PublishDispatchInput = {
  contentTypeSlug: string;
  slug: string;
};

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function deliverOnce(
  targetUrl: string,
  secret: string,
  body: string,
): Promise<boolean> {
  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: buildWebhookHeaders(secret, body),
      body,
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function deliverWithRetries(
  targetUrl: string,
  secret: string,
  body: string,
): Promise<boolean> {
  for (let attempt = 1; attempt <= WEBHOOK_MAX_ATTEMPTS; attempt += 1) {
    const delivered = await deliverOnce(targetUrl, secret, body);
    if (delivered) {
      return true;
    }
    const backoff = BACKOFF_MS[attempt - 1];
    if (backoff) {
      await sleep(backoff);
    }
  }
  return false;
}

async function reportRumEvent(
  contentTypeSlug: string,
  slug: string,
): Promise<void> {
  const rumApiUrl = process.env.PUBLIC_RUM_API_URL;
  if (!rumApiUrl) {
    return;
  }
  try {
    await fetch(`${rumApiUrl.replace(/\/$/, "")}/api/rum`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        app: "cms",
        event_name: "cms.entry.published",
        page_path: `/${contentTypeSlug}/${slug}`,
        session_id_anon: anonymousSessionId(),
        metadata: { content_type: contentTypeSlug, slug },
        has_consent: true,
      }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch (error) {
    console.warn(`[cms] RUM event failed: ${String(error)}`);
  }
}

export async function runPublishNotifications(
  input: PublishDispatchInput,
): Promise<{ delivered: number; failed: number }> {
  const { body } = buildPublishPayload(input.contentTypeSlug, input.slug);

  // 1. Invalidacion de cache (RB-CMS-010) antes de avisar a consumidores.
  invalidateContentType(input.contentTypeSlug);

  const repository = createWebhooksRepository();
  const subscriptions = await repository.listActiveForEvent("entry.published");

  let delivered = 0;
  let failed = 0;
  for (const subscription of subscriptions) {
    const ok = await deliverWithRetries(
      subscription.targetUrl,
      subscription.secret,
      body,
    );
    if (ok) {
      delivered += 1;
    } else {
      failed += 1;
    }
  }

  // 2. Evento de producto al RUM (IR-CMS-006, CA-CMS-006).
  await reportRumEvent(input.contentTypeSlug, input.slug);

  if (subscriptions.length > 0) {
    console.info(
      `[cms] webhook entry.published: ${delivered} entregados, ${failed} fallidos`,
    );
  }
  return { delivered, failed };
}

/** Fire-and-forget: la transicion no espera ni falla por el despacho. */
export function queuePublishNotifications(input: PublishDispatchInput): void {
  void runPublishNotifications(input).catch((error) => {
    console.warn(`[cms] publish dispatch failed: ${String(error)}`);
  });
}
