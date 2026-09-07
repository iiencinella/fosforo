/**
 * Cola de envio con reintentos y backoff (FR-NOTIF-004, RB-NOTIF-003/004).
 *
 * Reglas:
 * - Idempotencia por event_id: el llamador verifica duplicados con
 *   isDuplicateEvent antes de encolar (la unicidad la refuerza la DB del
 *   paso 7 con unique(event_id)).
 * - Maximo MAX_DELIVERY_ATTEMPTS intentos; al agotarse el item queda en
 *   estado failed sin mas reintentos.
 * - Backoff exponencial de 30s: 30s, 60s, 120s... (cap 15 min).
 * - Estados: pending -> sent | failed. (delivered/opened los marca el
 *   proveedor via webhook; la cola solo los acepta con markDelivered/
 *   markOpened si el item esta en sent.)
 */
import type { NotificationCategory, NotificationChannel } from "./channels.js";

export const MAX_DELIVERY_ATTEMPTS = 3;
const BACKOFF_BASE_MS = 30_000;
const BACKOFF_MAX_MS = 15 * 60_000;

export type QueueItemStatus =
  "pending" | "sent" | "delivered" | "failed" | "opened";

export type QueueItem = {
  eventId: string;
  templateId: string;
  templateVersion: number;
  channel: NotificationChannel;
  category: NotificationCategory;
  recipient: string;
  payload: Record<string, unknown>;
  status: QueueItemStatus;
  attempts: number;
  nextRetryAt: string | null;
  createdAt: string;
  sentAt: string | null;
  lastError: string | null;
};

export type EnqueueInput = {
  eventId: string;
  templateId: string;
  templateVersion: number;
  channel: NotificationChannel;
  category: NotificationCategory;
  recipient: string;
  payload?: Record<string, unknown>;
};

export function isDuplicateEvent(
  existingEventIds: readonly string[],
  eventId: string,
): boolean {
  return existingEventIds.includes(eventId);
}

export function backoffDelayMs(attempt: number): number {
  const delay = BACKOFF_BASE_MS * 2 ** Math.max(0, attempt - 1);
  return Math.min(delay, BACKOFF_MAX_MS);
}

export function enqueue(
  input: EnqueueInput,
  now: Date = new Date(),
): QueueItem {
  return {
    eventId: input.eventId,
    templateId: input.templateId,
    templateVersion: input.templateVersion,
    channel: input.channel,
    category: input.category,
    recipient: input.recipient,
    payload: input.payload ?? {},
    status: "pending",
    attempts: 0,
    nextRetryAt: null,
    createdAt: now.toISOString(),
    sentAt: null,
    lastError: null,
  };
}

export type AttemptResult = {
  success: boolean;
  error?: string;
};

/**
 * Registra un intento de envio. En fallo programa el reintento con backoff
 * mientras queden intentos; al agotarlos, el item queda failed (terminal).
 */
export function recordAttempt(
  item: QueueItem,
  result: AttemptResult,
  now: Date = new Date(),
): QueueItem {
  if (item.status !== "pending") {
    return item;
  }

  const attempts = item.attempts + 1;

  if (result.success) {
    return {
      ...item,
      attempts,
      status: "sent",
      sentAt: now.toISOString(),
      nextRetryAt: null,
      lastError: null,
    };
  }

  const exhausted = attempts >= MAX_DELIVERY_ATTEMPTS;
  return {
    ...item,
    attempts,
    status: exhausted ? "failed" : "pending",
    nextRetryAt: exhausted
      ? null
      : new Date(now.getTime() + backoffDelayMs(attempts)).toISOString(),
    lastError: result.error ?? "unknown_error",
  };
}

export function isRetryDue(item: QueueItem, now: Date = new Date()): boolean {
  if (item.status !== "pending" || item.nextRetryAt === null) {
    return item.status === "pending";
  }
  return new Date(item.nextRetryAt).getTime() <= now.getTime();
}

export function canAttempt(item: QueueItem): boolean {
  return item.status === "pending" && item.attempts < MAX_DELIVERY_ATTEMPTS;
}

/**
 * Confirmaciones del proveedor (webhook): delivered/opened solo desde el
 * estado sent. Cualquier otro estado devuelve el item sin cambios.
 */
export function markDelivered(
  item: QueueItem,
  now: Date = new Date(),
): QueueItem {
  if (item.status !== "sent") {
    return item;
  }
  return { ...item, status: "delivered" };
}

export function markOpened(item: QueueItem): QueueItem {
  if (item.status !== "sent" && item.status !== "delivered") {
    return item;
  }
  return { ...item, status: "opened" };
}
