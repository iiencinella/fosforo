import { contentSlugSchema } from "@/lib/content-types";
import { z } from "zod";

/**
 * Medios del CMS (FR-CMS-008, RB-CMS-009, NFR-CMS-006, SEC-CMS-009).
 * Logica pura de validacion y construccion de rutas de Storage.
 */

export const MEDIA_MAX_BYTES = 2_097_152; // 2 MB
export const MEDIA_ALLOWED_MIME = ["image/webp", "image/jpeg"] as const;

export type MediaMimeType = (typeof MEDIA_ALLOWED_MIME)[number];

/** CMS_004: Formato no soportado o excede 2MB (03-FRD §4). */
export const CMS_004_MEDIA_INVALIDA = "CMS_004_MEDIA_INVALIDA";
export const CMS_ENTRY_NOT_FOUND = "CMS_ENTRY_NOT_FOUND";
export const CMS_007_QUERY_TOO_SHORT = "CMS_007_QUERY_TOO_SHORT";
export const CMS_QUERY_TOO_LONG = "CMS_QUERY_TOO_LONG";

export type MediaValidationInput = {
  mimeType: string;
  sizeBytes: number;
};

/**
 * Valida tipo y tamano del medio (RB-CMS-009: webp/jpeg <= 2MB).
 * Devuelve null si es valido; CMS_004 si no.
 */
export function validateMedia(input: MediaValidationInput): string | null {
  if (!(MEDIA_ALLOWED_MIME as readonly string[]).includes(input.mimeType)) {
    return CMS_004_MEDIA_INVALIDA;
  }
  if (input.sizeBytes < 1 || input.sizeBytes > MEDIA_MAX_BYTES) {
    return CMS_004_MEDIA_INVALIDA;
  }
  return null;
}

export const mediaUploadSchema = z.object({
  entry_id: z.uuid(),
});

export function buildMediaPath(
  entryId: string,
  fileName: string,
  extension: string,
): string {
  const safeName = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const stamp = Date.now();
  const base = safeName.length > 0 ? safeName : "medio";
  return `${entryId}/${stamp}-${base}.${extension}`;
}

export function extensionFor(mimeType: MediaMimeType): string {
  return mimeType === "image/webp" ? "webp" : "jpg";
}

/** URL publica de un medio del bucket (bucket publico, paso 8). */
export function publicMediaUrl(
  supabaseUrl: string,
  storagePath: string,
): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/cms-media/${storagePath.replace(/^\//, "")}`;
}

export const searchQuerySchema = z
  .string()
  .trim()
  .min(3, "Termino de busqueda demasiado corto")
  .max(100)
  .refine((value) => !value.includes("%") && !value.includes("_"), {
    message: "La busqueda no admite comodines",
  });

export const searchContentTypeSchema = contentSlugSchema;
