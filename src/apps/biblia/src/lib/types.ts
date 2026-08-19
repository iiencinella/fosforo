export type BibleVersion = {
  code: string;
  name: string;
  language: string;
  tradition: string;
  license: string;
  provider: string;
  notes?: string;
  default?: boolean;
};

export type NomenclatureEntry = {
  nombre: string;
  abreviatura: string[];
};

export type BibleVerse = {
  numero: number;
  texto: string;
};

export type BibleChapter = {
  numero: number;
  versiculos: BibleVerse[];
};

export type BibleBook = {
  libro: string;
  capitulos: BibleChapter[];
};

export type CuratedPassage = {
  id: string;
  version: string;
  reference: string;
  normalizedReference: string;
  bookId: string;
  chapterStart: number;
  verseStart: number;
  chapterEnd: number;
  verseEnd: number;
  tags: string[];
  verses: Array<{
    version: string;
    bookId: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
};

export type LiturgyReadingDay = {
  fecha: string;
  dia: number;
  tipo: string;
  ciclo?: string;
  semana?: number;
  nombre?: string;
  primera?: string | null;
  salmo?: string | null;
  segunda?: string | null;
  evangelio?: string | null;
};

export type LiturgyDataset = {
  ano: number;
  fechaGeneracion: string;
  descripcion: string;
  estructura: string;
  lecturas: LiturgyReadingDay[];
};
