import { getSupabaseAuthClient } from "@repo/auth";
import { getSupabaseServiceClient } from "@/lib/supabase";
import {
  WEBHOOK_EVENT,
  type WebhookSubscriptionInput,
  type WebhookSubscriptionRecord,
} from "@/lib/webhooks";

/**
 * Repositorio de suscripciones de webhook. Alta/lista con el token del
 * usuario (RLS: solo admin); lectura para el despacho con service_role
 * (el revisor que publica no necesita leer suscripciones).
 */

type SubscriptionRow = {
  id: string;
  app_name: string;
  target_url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function mapRow(row: SubscriptionRow): WebhookSubscriptionRecord {
  return {
    id: row.id,
    appName: row.app_name,
    targetUrl: row.target_url,
    events: row.events,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const allowMemoryFallback = !import.meta.env.PROD;

let warnedFallback = false;

function warnFallbackOnce(message: string) {
  if (!allowMemoryFallback || warnedFallback) return;
  warnedFallback = true;
  console.warn(`[cms] ${message}`);
}

async function listFromDb(
  accessToken: string,
): Promise<WebhookSubscriptionRecord[]> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_webhook_subscriptions")
    .select(
      "id, app_name, target_url, events, is_active, created_at, updated_at",
    )
    .order("app_name", { ascending: true });

  if (error) {
    throw error;
  }
  return ((data ?? []) as SubscriptionRow[]).map(mapRow);
}

async function createInDb(
  accessToken: string,
  input: WebhookSubscriptionInput,
): Promise<WebhookSubscriptionRecord> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_webhook_subscriptions")
    .insert({
      app_name: input.app_name,
      target_url: input.target_url,
      secret: input.secret,
      events: [WEBHOOK_EVENT],
    })
    .select(
      "id, app_name, target_url, events, is_active, created_at, updated_at",
    )
    .single<SubscriptionRow>();

  if (error) {
    throw error;
  }
  return mapRow(data);
}

async function deleteInDb(accessToken: string, id: string): Promise<void> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { error } = await supabase
    .from("content_webhook_subscriptions")
    .delete()
    .eq("id", id);
  if (error) {
    throw error;
  }
}

async function listActiveForEventFromDb(
  eventName: string,
): Promise<WebhookSubscriptionWithSecret[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("content_webhook_subscriptions")
    .select(
      "id, app_name, target_url, secret, events, is_active, created_at, updated_at",
    )
    .eq("is_active", true)
    .contains("events", [eventName]);

  if (error) {
    throw error;
  }
  return ((data ?? []) as (SubscriptionRow & { secret: string })[]).map(
    (row) => ({
      ...mapRow(row),
      secret: row.secret,
    }),
  );
}

function createFallbackRepository() {
  const subscriptions: (WebhookSubscriptionRecord & { secret: string })[] = [];
  return {
    async list() {
      return [...subscriptions];
    },
    async create(input: WebhookSubscriptionInput) {
      const now = new Date().toISOString();
      const record = {
        id: crypto.randomUUID(),
        appName: input.app_name,
        targetUrl: input.target_url,
        events: [WEBHOOK_EVENT],
        isActive: true,
        createdAt: now,
        updatedAt: now,
        secret: input.secret,
      };
      subscriptions.push(record);
      return record;
    },
    async remove(id: string) {
      const index = subscriptions.findIndex((item) => item.id === id);
      if (index >= 0) subscriptions.splice(index, 1);
    },
    async listActiveForEvent() {
      return [...subscriptions];
    },
  };
}

export type WebhooksRepository = {
  list(accessToken: string): Promise<WebhookSubscriptionRecord[]>;
  create(
    accessToken: string,
    input: WebhookSubscriptionInput,
  ): Promise<WebhookSubscriptionRecord>;
  remove(accessToken: string, id: string): Promise<void>;
  /** Solo para el despacho (service_role): incluye el secreto de firma. */
  listActiveForEvent(
    eventName: string,
  ): Promise<WebhookSubscriptionWithSecret[]>;
};

export type WebhookSubscriptionWithSecret = WebhookSubscriptionRecord & {
  secret: string;
};

export function createWebhooksRepository(): WebhooksRepository {
  return {
    async list(accessToken) {
      try {
        return await listFromDb(accessToken);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB list webhooks failed: ${String(error)}`);
        return createFallbackRepository().list();
      }
    },
    async create(accessToken, input) {
      try {
        return await createInDb(accessToken, input);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB create webhook failed: ${String(error)}`);
        return createFallbackRepository().create(input);
      }
    },
    async remove(accessToken, id) {
      try {
        await deleteInDb(accessToken, id);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB delete webhook failed: ${String(error)}`);
        await createFallbackRepository().remove(id);
      }
    },
    async listActiveForEvent(eventName) {
      try {
        return await listActiveForEventFromDb(eventName);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB list active webhooks failed: ${String(error)}`);
        return createFallbackRepository().listActiveForEvent();
      }
    },
  };
}
