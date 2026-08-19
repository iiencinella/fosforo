import { z } from "zod";
import { isProduction } from "@repo/env";
import {
  FALLBACK_TIMES,
  filterFallbackSongs,
  getFallbackAllSongs,
  getFallbackHealth,
  getFallbackPendingSongs,
  getFallbackSongById,
  toSongSummary,
  tokenizeQuery,
} from "@/lib/data";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { log } from "../log";
import type {
  ChordPosition,
  ContributionInput,
  LiturgicalTime,
  ModerationInput,
  RepositoryHealth,
  SearchParams,
  SearchResponse,
  SongDetail,
  SongSummary,
  SongTag,
} from "@/lib/types";

type SongRow = {
  id: string;
  titulo: string;
  letra: string;
  acordes: unknown;
  pdf_url: string | null;
  youtube_url: string | null;
  observaciones_contribucion: string | null;
  estado: "pendiente" | "publicado" | "rechazado";
  fecha_contribucion: string | null;
  fecha_moderacion: string | null;
  created_at: string;
  updated_at: string;
};

type SongTagRow = {
  cancion_id: string;
  tiempo_liturgico: string;
  momento_misa: string;
};

type LiturgicalTimeRow = {
  id: string;
  nombre: string;
  momentos_misa: unknown;
};

const tagsShape = z.array(
  z.object({
    tiempoLiturgico: z.string(),
    momentoMisa: z.string(),
  }),
);

const chordPositionShape = z.object({
  linea: z.number().int().min(0),
  posicion: z.number().int().min(0),
  nombre: z.string().min(1).max(12),
});

const chordPositionsShape = z.array(chordPositionShape);

let warnedFallback = false;

function normalizeLiturgicalToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function warnFallbackOnce(message: string) {
  if (warnedFallback) return;
  warnedFallback = true;
  log.warn(`[cancionero] ${message}`);
}

function canFallback(): boolean {
  return !isProduction();
}

function parseChordPositions(value: unknown): ChordPosition[] {
  const parsed = chordPositionsShape.safeParse(value);
  if (!parsed.success) return [];
  return parsed.data.map((chord) => ({
    linea: chord.linea,
    posicion: chord.posicion,
    nombre: chord.nombre.trim(),
  }));
}

function normalizeTags(rows: SongTagRow[]): Record<string, SongTag[]> {
  return rows.reduce<Record<string, SongTag[]>>((acc, row) => {
    if (!acc[row.cancion_id]) {
      acc[row.cancion_id] = [];
    }

    acc[row.cancion_id].push({
      tiempoLiturgico: row.tiempo_liturgico,
      momentoMisa: row.momento_misa,
    });

    return acc;
  }, {});
}

function mapSongRow(row: SongRow, tags: SongTag[]): SongDetail {
  return {
    id: row.id,
    titulo: row.titulo,
    letra: row.letra,
    acordes: parseChordPositions(row.acordes),
    pdfUrl: row.pdf_url,
    youtubeUrl: row.youtube_url,
    observacionesContribucion: row.observaciones_contribucion,
    estado: row.estado,
    fechaContribucion: row.fecha_contribucion,
    fechaModeracion: row.fecha_moderacion,
    etiquetas: tags,
  };
}

function mapTimeRow(row: LiturgicalTimeRow): LiturgicalTime {
  const parsedMoments = z.array(z.string()).safeParse(row.momentos_misa);
  return {
    id: row.id,
    nombre: row.nombre,
    momentosMisa: parsedMoments.success ? parsedMoments.data : [],
  };
}

async function getSongTagsBySongIds(songIds: string[]) {
  if (songIds.length === 0) return {} as Record<string, SongTag[]>;
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("etiquetas_cancion")
    .select("cancion_id, tiempo_liturgico, momento_misa")
    .in("cancion_id", songIds);

  if (error) throw error;
  return normalizeTags((data ?? []) as SongTagRow[]);
}

async function listSongsFromDb(params: SearchParams): Promise<SearchResponse> {
  const supabase = getSupabaseServiceClient();
  const motor = params.motor ?? "A";

  let query = supabase
    .from("canciones")
    .select(
      "id, titulo, letra, acordes, pdf_url, youtube_url, observaciones_contribucion, estado, fecha_contribucion, fecha_moderacion, created_at, updated_at",
    )
    .eq("estado", "publicado")
    .order("titulo", { ascending: true });

  if (motor === "A" && params.q && params.q.trim().length > 0) {
    const tokens = tokenizeQuery(params.q);
    if (tokens.length > 0) {
      const orClauses = tokens
        .map((token) => `titulo.ilike.%${token}%,letra.ilike.%${token}%`)
        .join(",");
      query = query.or(orClauses);
    }
  }

  const { data: songsData, error: songsError } = await query;
  if (songsError) throw songsError;

  const rows = (songsData ?? []) as SongRow[];
  const tagsBySongId = await getSongTagsBySongIds(rows.map((row) => row.id));

  const summaries = rows
    .map((row) => mapSongRow(row, tagsBySongId[row.id] ?? []))
    .filter((song) => {
      const normalizedTime =
        params.tiempo && params.tiempo.trim().length > 0
          ? normalizeLiturgicalToken(params.tiempo)
          : "";
      const normalizedMoment =
        params.momento && params.momento.trim().length > 0
          ? normalizeLiturgicalToken(params.momento)
          : "";

      if (motor === "B" && normalizedTime.length > 0) {
        const matchesTag = song.etiquetas.some((tag) => {
          const tagTime = normalizeLiturgicalToken(tag.tiempoLiturgico);
          const tagMoment = normalizeLiturgicalToken(tag.momentoMisa);
          const byTime = tagTime === normalizedTime;
          const byMoment =
            normalizedMoment.length === 0 || tagMoment === normalizedMoment;
          return byTime && byMoment;
        });
        if (!matchesTag) {
          return false;
        }
      }

      if (motor === "C" && normalizedMoment.length > 0) {
        const matchesTag = song.etiquetas.some(
          (tag) =>
            normalizeLiturgicalToken(tag.momentoMisa) === normalizedMoment,
        );
        if (!matchesTag) {
          return false;
        }
      }

      return true;
    })
    .map((song) => toSongSummary(song));

  return {
    items: summaries,
    total: summaries.length,
    filtersApplied: params,
    source: "database",
  };
}

async function getSongByIdFromDb(id: string): Promise<SongDetail | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("canciones")
    .select(
      "id, titulo, letra, acordes, pdf_url, youtube_url, observaciones_contribucion, estado, fecha_contribucion, fecha_moderacion, created_at, updated_at",
    )
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const tagsBySongId = await getSongTagsBySongIds([id]);
  return mapSongRow(data as SongRow, tagsBySongId[id] ?? []);
}

async function listTimesFromDb(): Promise<LiturgicalTime[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("tiempos_liturgicos")
    .select("id, nombre, momentos_misa")
    .order("nombre", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as LiturgicalTimeRow[]).map(mapTimeRow);
}

async function createContributionInDb(
  input: ContributionInput,
  actorUserId: string | null,
): Promise<{ id: string }> {
  const supabase = getSupabaseServiceClient();
  const timestamp = new Date().toISOString();

  const { data: insertData, error: insertError } = await supabase
    .from("canciones")
    .insert({
      titulo: input.titulo,
      letra: input.letra,
      acordes: input.acordes,
      pdf_url: input.pdfUrl || null,
      youtube_url: input.youtubeUrl || null,
      observaciones_contribucion: input.observaciones?.trim() || null,
      estado: "pendiente",
      contribuyente_id: actorUserId,
      fecha_contribucion: timestamp,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  const songId = (insertData as { id: string }).id;

  if (input.etiquetas.length > 0) {
    const payload = input.etiquetas.map((tag) => ({
      cancion_id: songId,
      tiempo_liturgico: tag.tiempoLiturgico,
      momento_misa: tag.momentoMisa,
    }));

    const { error: tagError } = await supabase
      .from("etiquetas_cancion")
      .insert(payload);
    if (tagError) throw tagError;
  }

  return { id: songId };
}

async function listAllFromDb(): Promise<SongDetail[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("canciones")
    .select(
      "id, titulo, letra, acordes, pdf_url, youtube_url, observaciones_contribucion, estado, fecha_contribucion, fecha_moderacion, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (data ?? []) as SongRow[];
  const tagsBySongId = await getSongTagsBySongIds(rows.map((row) => row.id));
  return rows.map((row) => mapSongRow(row, tagsBySongId[row.id] ?? []));
}

async function listPendingFromDb(): Promise<SongSummary[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("canciones")
    .select(
      "id, titulo, letra, acordes, pdf_url, youtube_url, observaciones_contribucion, estado, fecha_contribucion, fecha_moderacion, created_at, updated_at",
    )
    .eq("estado", "pendiente")
    .order("created_at", { ascending: true });

  if (error) throw error;
  const rows = (data ?? []) as SongRow[];
  const tagsBySongId = await getSongTagsBySongIds(rows.map((row) => row.id));
  return rows
    .map((row) => mapSongRow(row, tagsBySongId[row.id] ?? []))
    .map((song) => toSongSummary(song));
}

async function moderateSongInDb(
  songId: string,
  input: ModerationInput,
  actorUserId: string | null,
): Promise<void> {
  const supabase = getSupabaseServiceClient();

  const { data: existing, error: existingError } = await supabase
    .from("canciones")
    .select("id, estado")
    .eq("id", songId)
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) throw new Error("Cancion no encontrada");
  const isReverting =
    input.accion === "aprobar" && existing.estado !== "pendiente";

  if (
    input.accion === "corregir_etiquetas" ||
    (input.etiquetas && input.etiquetas.length > 0)
  ) {
    const tags = tagsShape.parse(input.etiquetas ?? []);
    const { error: deleteError } = await supabase
      .from("etiquetas_cancion")
      .delete()
      .eq("cancion_id", songId);
    if (deleteError) throw deleteError;

    if (tags.length > 0) {
      const { error: insertError } = await supabase
        .from("etiquetas_cancion")
        .insert(
          tags.map((tag) => ({
            cancion_id: songId,
            tiempo_liturgico: tag.tiempoLiturgico,
            momento_misa: tag.momentoMisa,
          })),
        );
      if (insertError) throw insertError;
    }
  }

  if (input.accion === "aprobar") {
    const { error } = await supabase
      .from("canciones")
      .update({
        estado: "publicado",
        moderador_id: actorUserId,
        fecha_moderacion: new Date().toISOString(),
      })
      .eq("id", songId);
    if (error) throw error;
  }

  if (input.accion === "rechazar") {
    const { error } = await supabase
      .from("canciones")
      .update({
        estado: "rechazado",
        moderador_id: actorUserId,
        fecha_moderacion: new Date().toISOString(),
      })
      .eq("id", songId);
    if (error) throw error;
  }
}

async function getHealthFromDb(): Promise<RepositoryHealth> {
  const supabase = getSupabaseServiceClient();
  const [songsResult, timesResult] = await Promise.all([
    supabase.from("canciones").select("estado", { count: "exact" }),
    supabase
      .from("tiempos_liturgicos")
      .select("id", { count: "exact", head: true }),
  ]);

  if (songsResult.error) throw songsResult.error;
  if (timesResult.error) throw timesResult.error;

  const songs = (songsResult.data ?? []) as Array<{ estado: string }>;

  return {
    source: "database",
    totalCanciones: songsResult.count ?? songs.length,
    totalPublicadas: songs.filter((song) => song.estado === "publicado").length,
    totalPendientes: songs.filter((song) => song.estado === "pendiente").length,
    totalTiempos: timesResult.count ?? 0,
  };
}

export async function listSongs(params: SearchParams): Promise<SearchResponse> {
  try {
    return await listSongsFromDb(params);
  } catch (error) {
    if (!canFallback()) {
      throw error;
    }
    warnFallbackOnce(
      `No se pudo consultar canciones en Supabase: ${String(error)}`,
    );
    const items = filterFallbackSongs({
      ...params,
      motor: params.motor ?? "A",
    });
    return {
      items,
      total: items.length,
      filtersApplied: params,
      source: "fallback",
    };
  }
}

export async function getSongById(id: string): Promise<SongDetail | null> {
  try {
    const song = await getSongByIdFromDb(id);
    if (!song || song.estado !== "publicado") {
      return null;
    }
    return song;
  } catch (error) {
    if (!canFallback()) {
      throw error;
    }
    warnFallbackOnce(
      `No se pudo leer cancion por id en Supabase: ${String(error)}`,
    );
    const fallback = getFallbackSongById(id);
    return fallback && fallback.estado === "publicado" ? fallback : null;
  }
}

export async function listLiturgicalTimes(): Promise<{
  items: LiturgicalTime[];
  source: "database" | "fallback";
}> {
  try {
    return {
      items: await listTimesFromDb(),
      source: "database",
    };
  } catch (error) {
    if (!canFallback()) {
      throw error;
    }
    warnFallbackOnce(
      `No se pudo consultar tiempos liturgicos en Supabase: ${String(error)}`,
    );
    return {
      items: FALLBACK_TIMES,
      source: "fallback",
    };
  }
}

export async function createContribution(
  input: ContributionInput,
  actorUserId: string | null = null,
): Promise<{ id: string; source: "database" | "fallback" }> {
  try {
    const result = await createContributionInDb(input, actorUserId);
    return { ...result, source: "database" };
  } catch (error) {
    if (!canFallback()) {
      throw error;
    }
    warnFallbackOnce(
      `No se pudo crear contribucion en Supabase: ${String(error)}`,
    );
    return { id: `fallback-${Date.now()}`, source: "fallback" };
  }
}

export async function listPendingSongs(): Promise<{
  items: SongSummary[];
  source: "database" | "fallback";
}> {
  try {
    return {
      items: await listPendingFromDb(),
      source: "database",
    };
  } catch (error) {
    if (!canFallback()) {
      throw error;
    }
    warnFallbackOnce(
      `No se pudo consultar pendientes en Supabase: ${String(error)}`,
    );
    return {
      items: getFallbackPendingSongs(),
      source: "fallback",
    };
  }
}

export async function listAllSongs(): Promise<{
  items: SongDetail[];
  source: "database" | "fallback";
}> {
  try {
    return {
      items: await listAllFromDb(),
      source: "database",
    };
  } catch (error) {
    if (!canFallback()) {
      throw error;
    }
    warnFallbackOnce(
      `No se pudo consultar todas las canciones en Supabase: ${String(error)}`,
    );
    return {
      items: getFallbackAllSongs(),
      source: "fallback",
    };
  }
}

export async function moderateSong(
  songId: string,
  input: ModerationInput,
  actorUserId: string | null = null,
): Promise<{ source: "database" | "fallback" }> {
  try {
    await moderateSongInDb(songId, input, actorUserId);
    return { source: "database" };
  } catch (error) {
    if (!canFallback()) {
      throw error;
    }
    warnFallbackOnce(
      `No se pudo moderar cancion en Supabase: ${String(error)}`,
    );
    return { source: "fallback" };
  }
}

export async function getRepositoryHealth(): Promise<RepositoryHealth> {
  try {
    return await getHealthFromDb();
  } catch (error) {
    if (!canFallback()) {
      throw error;
    }
    warnFallbackOnce(`No se pudo obtener health en Supabase: ${String(error)}`);
    return getFallbackHealth();
  }
}
