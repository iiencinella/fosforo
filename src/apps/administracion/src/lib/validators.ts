import { z } from "zod";
import {
  CELEBRATION_TYPES,
  buildTempleSlug,
  weekdayDbToIndex,
  weekdayIndexToDb,
} from "@/lib/mappers";

export const loginSchema = z.object({
  email: z.string().trim().includes("@"),
  password: z.string().min(8),
});

/**
 * Contrato del formulario/API del panel. Acepta los nombres historicos de la
 * UI (latitude/longitude/phone/email/status) y produce la fila con la forma
 * exacta de horarios_temples (esquema consolidado).
 */
export const templeSchema = z.object({
  name: z.string().trim().min(2).max(200),
  address: z.string().trim().min(1).max(300),
  city: z.string().trim().min(2).max(120),
  province: z.string().trim().min(1).max(120),
  country: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : "Argentina")),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().trim().max(60).optional(),
  email: z.string().trim().includes("@").max(120).optional(),
  website: z
    .string()
    .trim()
    .regex(/^https?:\/\/.+/, "Invalid URL")
    .optional(),
  notes: z.string().trim().max(500).optional(),
});

export type TempleInput = z.infer<typeof templeSchema>;

export function templeInputToRow(input: TempleInput) {
  return {
    id: buildTempleSlug(input.name, input.city),
    name: input.name,
    address: input.address,
    city: input.city,
    province: input.province,
    country: input.country ?? "Argentina",
    lat: input.latitude,
    lng: input.longitude,
    contact_phone: input.phone ?? null,
    contact_email: input.email ?? null,
    website: input.website ?? null,
    notes: input.notes ?? null,
    status: "review" as const,
    is_active: true,
  };
}

export const templeStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

const timePattern = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

/**
 * Contrato de horarios del panel: weekday 0..6 (0 = Lunes), tipo acotado al
 * catalogo que consume la app publica y duracion obligatoria.
 */
export const scheduleSchema = z.object({
  celebration_type: z.enum(CELEBRATION_TYPES),
  weekday: z.number().int().min(0).max(6),
  start_time: z.string().regex(timePattern, "Invalid time format"),
  duration_min: z.number().int().min(1).max(240).default(45),
  notes: z.string().trim().max(300).optional(),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;

export function scheduleInputToRow(
  input: ScheduleInput,
  id: string,
  templeId?: string,
) {
  return {
    id,
    ...(templeId ? { temple_id: templeId } : {}),
    type: input.celebration_type,
    weekday: weekdayIndexToDb(input.weekday),
    start_time: input.start_time.slice(0, 5),
    duration_min: input.duration_min,
    notes: input.notes ?? null,
    is_active: true,
  };
}

/** Convierte una fila de horarios_celebrations al contrato historico de UI. */
export function scheduleRowToUi(row: {
  id: string;
  type: string;
  weekday: string;
  start_time: string;
  duration_min: number;
  notes: string | null;
  is_active: boolean;
}) {
  return {
    id: row.id,
    celebration_type: row.type,
    weekday: weekdayDbToIndex(row.weekday),
    start_time: row.start_time.slice(0, 5),
    duration_min: row.duration_min,
    notes: row.notes,
    is_active: row.is_active,
  };
}
