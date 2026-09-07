import { describe, expect, it } from "vitest";
import {
  buildPublishPayload,
  buildWebhookHeaders,
  signBody,
  verifySignature,
  webhookSubscriptionSchema,
  WEBHOOK_EVENT,
  WEBHOOK_SIGNATURE_HEADER,
} from "@/lib/webhooks";

describe("payload de publicacion (FR-CMS-010)", () => {
  it("tiene la forma del contrato (content_type, slug, timestamp)", () => {
    const { payload } = buildPublishPayload("oracion", "padre-nuestro");
    expect(payload).toEqual({
      event: "entry.published",
      content_type: "oracion",
      slug: "padre-nuestro",
      timestamp: expect.any(String),
    });
    expect(payload.event).toBe(WEBHOOK_EVENT);
  });
});

describe("firma HMAC-SHA256 (x-cms-signature)", () => {
  const secret = "secreto-compartido-16";
  const body = JSON.stringify({ event: "entry.published" });

  it("deterministica y en formato sha256=<hex>", () => {
    expect(signBody(secret, body)).toBe(signBody(secret, body));
    expect(signBody(secret, body)).toMatch(/^sha256=[0-9a-f]{64}$/);
  });

  it("cambia con el secreto o el body", () => {
    expect(signBody("otro-secreto-16-xx", body)).not.toBe(
      signBody(secret, body),
    );
    expect(signBody(secret, body + " ")).not.toBe(signBody(secret, body));
  });

  it("verifySignature acepta la firma correcta y rechaza la manipulada", () => {
    const signature = signBody(secret, body);
    expect(verifySignature(secret, body, signature)).toBe(true);
    expect(verifySignature(secret, body + "x", signature)).toBe(false);
    expect(verifySignature("otro", body, signature)).toBe(false);
  });

  it("buildWebhookHeaders incluye evento y firma", () => {
    const headers = buildWebhookHeaders(secret, body);
    expect(headers["content-type"]).toBe("application/json");
    expect(headers[WEBHOOK_SIGNATURE_HEADER]).toMatch(/^sha256=/);
    expect(headers["x-cms-event"]).toBe("entry.published");
  });
});

describe("webhookSubscriptionSchema (solo admin)", () => {
  const valid = {
    app_name: "misal",
    target_url: "https://misal.fosforo.app/api/webhooks/cms",
    secret: "secreto-compartido-16",
  };

  it("acepta una suscripcion https valida", () => {
    expect(webhookSubscriptionSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza http y URLs vacias (check de DB tambien)", () => {
    expect(
      webhookSubscriptionSchema.safeParse({
        ...valid,
        target_url: "http://misal.fosforo.app/api/webhooks/cms",
      }).success,
    ).toBe(false);
  });

  it("rechaza secretos cortos", () => {
    expect(
      webhookSubscriptionSchema.safeParse({ ...valid, secret: "corto" })
        .success,
    ).toBe(false);
  });
});
