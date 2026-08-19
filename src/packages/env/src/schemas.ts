import { z } from "zod";

export const supabaseEnvSchema = z.object({
  url: z.string().url(),
  anonKey: z.string().min(1),
});

export const supabaseFullEnvSchema = supabaseEnvSchema.extend({
  serviceRoleKey: z.string().min(1),
});

export const adminEnvSchema = z.object({
  sessionCookie: z.string().min(1),
  sessionMaxAge: z.coerce.number().int().positive(),
  allowedEmailDomain: z.string().default(""),
});

export const bibliaEnvSchema = z.object({
  ingestionKey: z.string().min(1),
});

export const portalEnvSchema = z.object({
  whatsappNumber: z.string().min(1),
});
