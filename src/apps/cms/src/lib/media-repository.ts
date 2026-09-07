import { getSupabaseAuthClient } from "@repo/auth";
import { getSupabaseEnv } from "@repo/env";
import {
  CMS_ENTRY_NOT_FOUND,
  buildMediaPath,
  extensionFor,
  publicMediaUrl,
  validateMedia,
  type MediaMimeType,
} from "@/lib/media";

/**
 * Repositorio de medios (FR-CMS-008). Subida con el cliente del token
 * del usuario: las policies de Storage del paso 8 (admin/editor) y la RLS
 * de content_media hacen cumplir los permisos. Sin fallback: el binario
 * no puede "caer" a memoria.
 */

export type UploadedMedia = {
  id: string;
  entryId: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
};

type MediaRow = {
  id: string;
  entry_id: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
};

function mapMediaRow(row: MediaRow): UploadedMedia {
  const { url } = getSupabaseEnv();
  return {
    id: row.id,
    entryId: row.entry_id,
    storagePath: row.storage_path,
    publicUrl: publicMediaUrl(url, row.storage_path),
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
  };
}

async function entryExists(
  accessToken: string,
  entryId: string,
): Promise<boolean> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_entries")
    .select("id")
    .eq("id", entryId)
    .maybeSingle<{ id: string }>();
  if (error) {
    throw error;
  }
  return data !== null;
}

export async function uploadMedia(
  accessToken: string,
  entryId: string,
  file: {
    bytes: ArrayBuffer;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  },
): Promise<UploadedMedia> {
  const invalid = validateMedia({
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
  });
  if (invalid) {
    throw new Error(invalid);
  }

  if (!(await entryExists(accessToken, entryId))) {
    throw new Error(CMS_ENTRY_NOT_FOUND);
  }

  const mimeType = file.mimeType as MediaMimeType;
  const path = buildMediaPath(entryId, file.fileName, extensionFor(mimeType));

  const supabase = getSupabaseAuthClient({ accessToken });
  const { error: uploadError } = await supabase.storage
    .from("cms-media")
    .upload(path, file.bytes, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error("CMS_MEDIA_UPLOAD_FAILED");
  }

  const { data: row, error: insertError } = await supabase
    .from("content_media")
    .insert({
      entry_id: entryId,
      storage_path: path,
      mime_type: mimeType,
      size_bytes: file.sizeBytes,
    })
    .select("id, entry_id, storage_path, mime_type, size_bytes")
    .single<MediaRow>();

  if (insertError || !row) {
    // Limpieza best-effort del binario si el registro falla.
    await supabase.storage.from("cms-media").remove([path]);
    throw insertError ?? new Error("CMS_MEDIA_REGISTER_FAILED");
  }

  return mapMediaRow(row);
}

export async function listMedia(
  accessToken: string,
  entryId: string,
): Promise<UploadedMedia[]> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_media")
    .select("id, entry_id, storage_path, mime_type, size_bytes")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return ((data ?? []) as MediaRow[]).map(mapMediaRow);
}

export async function deleteMedia(
  accessToken: string,
  mediaId: string,
): Promise<void> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data: row, error: fetchError } = await supabase
    .from("content_media")
    .select("id, entry_id, storage_path, mime_type, size_bytes")
    .eq("id", mediaId)
    .maybeSingle<MediaRow>();

  if (fetchError) {
    throw fetchError;
  }
  if (!row) {
    throw new Error("CMS_MEDIA_NOT_FOUND");
  }

  const { error: removeError } = await supabase.storage
    .from("cms-media")
    .remove([row.storage_path]);
  if (removeError) {
    throw new Error("CMS_MEDIA_DELETE_FAILED");
  }

  const { error } = await supabase
    .from("content_media")
    .delete()
    .eq("id", mediaId);
  if (error) {
    throw error;
  }
}
