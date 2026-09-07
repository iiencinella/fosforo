import { describe, expect, it } from "vitest";
import {
  backoffDelayMs,
  canAttempt,
  enqueue,
  isDuplicateEvent,
  isRetryDue,
  markDelivered,
  markOpened,
  MAX_DELIVERY_ATTEMPTS,
  recordAttempt,
} from "./queue.js";

const baseInput = {
  eventId: "evt-001",
  templateId: "misal-daily-reminder",
  templateVersion: 1,
  channel: "email" as const,
  category: "liturgical" as const,
  recipient: "ana@ejemplo.com",
  payload: { fecha: "2026-09-06" },
};

const NOW = new Date("2026-09-06T10:00:00Z");

describe("cola con reintentos e idempotencia (FR-NOTIF-004)", () => {
  it("enqueue crea un item pendiente sin intentos", () => {
    const item = enqueue(baseInput, NOW);
    expect(item.status).toBe("pending");
    expect(item.attempts).toBe(0);
    expect(item.nextRetryAt).toBeNull();
    expect(item.createdAt).toBe(NOW.toISOString());
  });

  it("isDuplicateEvent detecta event_id repetido (RB-NOTIF-003)", () => {
    expect(isDuplicateEvent(["evt-001", "evt-002"], "evt-001")).toBe(true);
    expect(isDuplicateEvent(["evt-002"], "evt-001")).toBe(false);
  });

  it("backoff exponencial con cap de 15 minutos", () => {
    expect(backoffDelayMs(1)).toBe(30_000);
    expect(backoffDelayMs(2)).toBe(60_000);
    expect(backoffDelayMs(3)).toBe(120_000);
    expect(backoffDelayMs(10)).toBe(900_000);
  });

  it("recordAttempt con exito marca sent y fija sentAt", () => {
    const sent = recordAttempt(enqueue(baseInput, NOW), { success: true }, NOW);
    expect(sent.status).toBe("sent");
    expect(sent.attempts).toBe(1);
    expect(sent.sentAt).toBe(NOW.toISOString());
    expect(sent.nextRetryAt).toBeNull();
  });

  it("recordAttempt con fallo programa reintento con backoff", () => {
    const retried = recordAttempt(
      enqueue(baseInput, NOW),
      { success: false, error: "smtp_timeout" },
      NOW,
    );
    expect(retried.status).toBe("pending");
    expect(retried.attempts).toBe(1);
    expect(retried.nextRetryAt).toBe(
      new Date(NOW.getTime() + 30_000).toISOString(),
    );
    expect(retried.lastError).toBe("smtp_timeout");
  });

  it("al agotar los intentos el item queda failed sin mas reintentos", () => {
    let item = enqueue(baseInput, NOW);
    for (let i = 0; i < MAX_DELIVERY_ATTEMPTS; i += 1) {
      item = recordAttempt(item, { success: false, error: "down" }, NOW);
    }
    expect(item.status).toBe("failed");
    expect(item.attempts).toBe(MAX_DELIVERY_ATTEMPTS);
    expect(item.nextRetryAt).toBeNull();
    expect(canAttempt(item)).toBe(false);

    const extra = recordAttempt(item, { success: false }, NOW);
    expect(extra).toBe(item);
  });

  it("isRetryDue: sin nextRetryAt un pending esta vencido; con fecha futura no", () => {
    const fresh = enqueue(baseInput, NOW);
    expect(isRetryDue(fresh, NOW)).toBe(true);

    const scheduled = recordAttempt(fresh, { success: false }, NOW);
    expect(isRetryDue(scheduled, NOW)).toBe(false);
    expect(isRetryDue(scheduled, new Date(NOW.getTime() + 31_000))).toBe(true);
    expect(isRetryDue({ ...fresh, status: "sent" }, NOW)).toBe(false);
  });

  it("markDelivered y markOpened solo aplican desde sent", () => {
    const sent = recordAttempt(enqueue(baseInput, NOW), { success: true }, NOW);
    expect(markDelivered(sent).status).toBe("delivered");
    expect(markOpened(sent).status).toBe("opened");

    const pending = enqueue(baseInput, NOW);
    expect(markDelivered(pending)).toBe(pending);
    expect(markOpened(pending)).toBe(pending);

    const failed = recordAttempt(
      recordAttempt(
        recordAttempt(enqueue(baseInput, NOW), { success: false }, NOW),
        { success: false },
        NOW,
      ),
      { success: false },
      NOW,
    );
    expect(markDelivered(failed)).toBe(failed);
  });
});
