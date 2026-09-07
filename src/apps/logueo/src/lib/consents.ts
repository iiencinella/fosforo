import {
  getSupabaseAuthClient,
  getUserProfileById,
  type UserProfile,
} from "@repo/auth";
import { z } from "zod";

/**
 * Consentimientos de comunicacion por categoria (FR-AUTH-004).
 * Se leen y escriben con el cliente del token del usuario: la RLS de la
 * tabla consents garantiza que cada usuario solo toque sus filas.
 */

export const CONSENT_CATEGORIES = [
  "product",
  "liturgical",
  "community",
] as const;

export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

export const consentCategorySchema = z.enum(CONSENT_CATEGORIES);

export const consentUpdateSchema = z.object({
  category: consentCategorySchema,
  optedIn: z.boolean(),
});

export type ConsentRow = {
  category: ConsentCategory;
  optedIn: boolean;
  updatedAt: string | null;
};

type ConsentsRow = {
  category: string;
  opted_in: boolean;
  updated_at: string;
};

export async function listConsents(accessToken: string): Promise<ConsentRow[]> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("consents")
    .select("category, opted_in, updated_at");

  if (error) {
    throw new Error("LOGUEO_CONSENTS_READ_FAILED");
  }

  const byCategory = new Map(
    ((data ?? []) as ConsentsRow[]).map((row) => [
      row.category,
      { optedIn: row.opted_in, updatedAt: row.updated_at },
    ]),
  );

  return CONSENT_CATEGORIES.map((category) => ({
    category,
    optedIn: byCategory.get(category)?.optedIn ?? false,
    updatedAt: byCategory.get(category)?.updatedAt ?? null,
  }));
}

export async function updateConsent(
  accessToken: string,
  category: ConsentCategory,
  optedIn: boolean,
): Promise<ConsentRow> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data: session } = await supabase.auth.getUser(accessToken);
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("LOGUEO_SESSION_EXPIRED");
  }

  const { error } = await supabase.from("consents").upsert({
    user_id: userId,
    category,
    opted_in: optedIn,
  });

  if (error) {
    throw new Error("LOGUEO_CONSENTS_WRITE_FAILED");
  }

  return { category, optedIn, updatedAt: new Date().toISOString() };
}

export type ProfileUpdateInput = {
  name?: string;
  avatarUrl?: string;
};

export async function updateProfile(
  accessToken: string,
  userId: string,
  input: ProfileUpdateInput,
): Promise<UserProfile> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const update: Record<string, string> = {};
  if (input.name !== undefined) {
    update.name = input.name;
  }
  if (input.avatarUrl !== undefined) {
    update.avatar_url = input.avatarUrl;
  }
  if (Object.keys(update).length === 0) {
    throw new Error("LOGUEO_PROFILE_NOTHING_TO_UPDATE");
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", userId);

  if (error) {
    throw new Error("LOGUEO_PROFILE_UPDATE_FAILED");
  }

  return getUserProfileById(userId, accessToken);
}
