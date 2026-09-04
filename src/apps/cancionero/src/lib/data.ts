import type {
  ChordPosition,
  LiturgicalTime,
  SongDetail,
  SongStatus,
  SongSummary,
} from "@/lib/types";

const nowIso = new Date().toISOString();

export const FALLBACK_TIMES: LiturgicalTime[] = [
  {
    id: "adviento",
    nombre: "Adviento",
    momentosMisa: [
      "Entrada",
      "Salmo",
      "Aleluya",
      "Ofertorio",
      "Comunion",
      "Salida",
    ],
  },
  {
    id: "navidad",
    nombre: "Navidad",
    momentosMisa: [
      "Entrada",
      "Gloria",
      "Salmo",
      "Ofertorio",
      "Comunion",
      "Salida",
    ],
  },
  {
    id: "cuaresma",
    nombre: "Cuaresma",
    momentosMisa: [
      "Entrada",
      "Acto penitencial",
      "Salmo",
      "Ofertorio",
      "Comunion",
      "Salida",
    ],
  },
  {
    id: "pascua",
    nombre: "Pascua",
    momentosMisa: [
      "Entrada",
      "Gloria",
      "Salmo",
      "Ofertorio",
      "Comunion",
      "Salida",
    ],
  },
  {
    id: "tiempo-ordinario",
    nombre: "Tiempo Ordinario",
    momentosMisa: [
      "Entrada",
      "Salmo",
      "Ofertorio",
      "Santo",
      "Comunion",
      "Salida",
    ],
  },
];

const FALLBACK_SONG_DETAILS: SongDetail[] = [
  {
    id: "fallback-001",
    titulo: "Ven, ven Senor no tardes",
    letra: "Ven, ven Senor no tardes\nVen, ven que te esperamos",
    acordes: [
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 5, nombre: "D" },
      { linea: 0, posicion: 18, nombre: "Em" },
      { linea: 1, posicion: 0, nombre: "G" },
      { linea: 1, posicion: 5, nombre: "D" },
      { linea: 1, posicion: 16, nombre: "G" },
    ],
    version: 1,
    pdfUrl: null,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    observacionesContribucion: null,
    estado: "publicado",
    fechaContribucion: nowIso,
    fechaModeracion: nowIso,
    etiquetas: [
      { tiempoLiturgico: "Adviento", momentoMisa: "Entrada" },
      { tiempoLiturgico: "Adviento", momentoMisa: "Salida" },
    ],
  },
  {
    id: "fallback-002",
    titulo: "Pescador de hombres",
    letra: "Tu has venido a la orilla\nNo has buscado ni a sabios ni a ricos",
    acordes: [
      { linea: 0, posicion: 0, nombre: "C" },
      { linea: 0, posicion: 21, nombre: "G" },
      { linea: 1, posicion: 7, nombre: "Am" },
      { linea: 1, posicion: 22, nombre: "F" },
      { linea: 1, posicion: 33, nombre: "G" },
    ],
    version: 1,
    pdfUrl: null,
    youtubeUrl: null,
    observacionesContribucion: null,
    estado: "publicado",
    fechaContribucion: nowIso,
    fechaModeracion: nowIso,
    etiquetas: [
      { tiempoLiturgico: "Tiempo Ordinario", momentoMisa: "Comunion" },
      { tiempoLiturgico: "Tiempo Ordinario", momentoMisa: "Salida" },
    ],
  },
  {
    id: "fallback-003",
    titulo: "Perdon, oh Dios mio",
    letra: "Perdon, oh Dios mio\nPerdon e indulgencia",
    acordes: [
      { linea: 0, posicion: 0, nombre: "Am" },
      { linea: 0, posicion: 10, nombre: "G" },
      { linea: 1, posicion: 0, nombre: "Dm" },
      { linea: 1, posicion: 9, nombre: "E7" },
    ],
    version: 1,
    pdfUrl: null,
    youtubeUrl: null,
    observacionesContribucion:
      "Puede revisarse para Cuaresma en celebraciones penitenciales.",
    estado: "pendiente",
    fechaContribucion: nowIso,
    fechaModeracion: null,
    etiquetas: [
      { tiempoLiturgico: "Cuaresma", momentoMisa: "Acto penitencial" },
    ],
  },
];

export function getFallbackSongDetails() {
  return FALLBACK_SONG_DETAILS;
}

function plainLyricsFromChordModel(letra: string): string {
  return letra.replace(/\s+/g, " ").trim();
}

function tokenizeForSearch(value: string): string[] {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}

function normalizeMatcher(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeQuery(value: string): string[] {
  return tokenizeForSearch(value);
}

export function normalizeLiturgicalValue(value: string): string {
  return normalizeMatcher(value);
}

export function toSongSummary(song: SongDetail): SongSummary {
  const lyrics = plainLyricsFromChordModel(song.letra);
  const excerpt = lyrics.length > 140 ? `${lyrics.slice(0, 140)}...` : lyrics;

  return {
    id: song.id,
    titulo: song.titulo,
    version: song.version,
    excerpt,
    estado: song.estado,
    updatedAt: song.fechaModeracion ?? song.fechaContribucion ?? nowIso,
    etiquetas: song.etiquetas,
  };
}

export function filterFallbackSongs(params: {
  q?: string;
  tiempo?: string;
  momento?: string;
  includePending?: boolean;
  motor?: "A" | "B" | "C";
}): SongSummary[] {
  const motor = params.motor ?? "A";
  const q = (params.q ?? "").trim();
  const tiempo = (params.tiempo ?? "").trim();
  const momento = (params.momento ?? "").trim();

  const tokens = tokenizeForSearch(q);
  const normalizedTime = tiempo.length > 0 ? normalizeMatcher(tiempo) : "";
  const normalizedMoment = momento.length > 0 ? normalizeMatcher(momento) : "";

  return FALLBACK_SONG_DETAILS.filter((song) => {
    if (!params.includePending && song.estado !== "publicado") {
      return false;
    }

    if (motor === "A" && tokens.length > 0) {
      const title = song.titulo;
      const lyrics = plainLyricsFromChordModel(song.letra);
      if (
        !tokens.some(
          (token) =>
            title.toLowerCase().includes(token) ||
            lyrics.toLowerCase().includes(token),
        )
      ) {
        return false;
      }
    }

    if (motor === "B" && normalizedTime.length > 0) {
      const matchesTag = song.etiquetas.some((tag) => {
        const tagTime = normalizeMatcher(tag.tiempoLiturgico);
        const tagMoment =
          normalizedMoment.length > 0 ? normalizeMatcher(tag.momentoMisa) : "";
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
        (tag) => normalizeMatcher(tag.momentoMisa) === normalizedMoment,
      );
      if (!matchesTag) {
        return false;
      }
    }

    return true;
  }).map(toSongSummary);
}

export function getFallbackSongById(id: string): SongDetail | null {
  return FALLBACK_SONG_DETAILS.find((song) => song.id === id) ?? null;
}

export function getFallbackAllSongs(): SongDetail[] {
  return FALLBACK_SONG_DETAILS;
}

export function getFallbackPendingSongs(): SongSummary[] {
  return FALLBACK_SONG_DETAILS.filter(
    (song) => song.estado === "pendiente",
  ).map(toSongSummary);
}

export function getFallbackHealth() {
  const totalCanciones = FALLBACK_SONG_DETAILS.length;
  const totalPublicadas = FALLBACK_SONG_DETAILS.filter(
    (song) => song.estado === "publicado",
  ).length;
  const totalPendientes = FALLBACK_SONG_DETAILS.filter(
    (song) => song.estado === "pendiente",
  ).length;

  return {
    source: "fallback" as const,
    totalCanciones,
    totalPublicadas,
    totalPendientes,
    totalTiempos: FALLBACK_TIMES.length,
  };
}

export function isModerableStatus(status: SongStatus): boolean {
  return status === "pendiente";
}

export function emptyChordList(): ChordPosition[] {
  return [];
}
