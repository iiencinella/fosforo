export type SongStatus = "pendiente" | "publicado" | "rechazado";

export type SongTag = {
  tiempoLiturgico: string;
  momentoMisa: string;
};

export type ChordPosition = {
  linea: number;
  posicion: number;
  nombre: string;
};

export type SongSummary = {
  id: string;
  titulo: string;
  version: number;
  excerpt: string;
  estado: SongStatus;
  updatedAt: string;
  etiquetas: SongTag[];
};

export type SongDetail = {
  id: string;
  titulo: string;
  version: number;
  letra: string;
  acordes: ChordPosition[];
  pdfUrl: string | null;
  youtubeUrl: string | null;
  observacionesContribucion: string | null;
  estado: SongStatus;
  fechaContribucion: string | null;
  fechaModeracion: string | null;
  etiquetas: SongTag[];
};

export type LiturgicalTime = {
  id: string;
  nombre: string;
  momentosMisa: string[];
};

export type SearchEngine = "A" | "B" | "C";

export type SearchParams = {
  motor?: SearchEngine;
  q?: string;
  tiempo?: string;
  momento?: string;
};

export type ContributionInput = {
  titulo: string;
  letra: string;
  acordes: ChordPosition[];
  observaciones?: string;
  pdfUrl?: string;
  youtubeUrl?: string;
  etiquetas: SongTag[];
  confirmarNuevaVersion?: boolean;
};

export type CreateContributionResult =
  | {
      ok: true;
      id: string;
      version: number;
      source: "database" | "fallback";
    }
  | {
      ok: false;
      code: "CANCION_TITULO_DUPLICADO";
      tituloExistente: string;
      versionExistente: number;
      versionSiguiente: number;
    };

export type ModerationAction = "aprobar" | "rechazar" | "corregir_etiquetas";

export type ModerationInput = {
  accion: ModerationAction;
  motivo?: string;
  etiquetas?: SongTag[];
};

export type RepositoryHealth = {
  source: "database" | "fallback";
  totalCanciones: number;
  totalPublicadas: number;
  totalPendientes: number;
  totalTiempos: number;
};

export type SearchResponse = {
  items: SongSummary[];
  total: number;
  filtersApplied: SearchParams;
  source: "database" | "fallback";
};
