import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().includes("@"),
  password: z.string().min(8),
});

export const churchSchema = z.object({
  name: z.string().trim().min(2).max(200),
  address: z.string().trim().max(300).optional().nullable(),
  city: z.string().trim().min(2).max(120),
  province: z.string().trim().max(120).optional().nullable(),
  country: z.string().trim().max(120).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  phone: z.string().trim().max(60).optional().nullable(),
  email: z.string().trim().includes("@").optional().nullable(),
  website: z
    .string()
    .trim()
    .regex(/^https?:\/\/.+/, "Invalid URL")
    .optional()
    .nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const patchChurchStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

export const scheduleSchema = z.object({
  celebration_type: z.string().trim().min(2).max(100),
  weekday: z.number().int().min(0).max(6),
  start_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Invalid time format"),
  valid_from: z.string().optional().nullable(),
  valid_to: z.string().optional().nullable(),
  notes: z.string().trim().max(300).optional().nullable(),
});
