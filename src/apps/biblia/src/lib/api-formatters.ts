import type {
  BibliaLiturgyRow,
  BibliaReadRow,
  BibliaSearchRow,
} from "@/db/supabase";

export function formatReadRows(rows: BibliaReadRow[]) {
  return rows.map((row) => ({
    versionCode: row.version_code,
    bookSlug: row.book_slug,
    bookName: row.book_name,
    chapter: row.chapter_number,
    verse: row.verse_number,
    text: row.verse_text,
    reference: `${row.book_name} ${row.chapter_number},${row.verse_number}`,
  }));
}

export function formatSearchRows(rows: BibliaSearchRow[]) {
  return rows.map((row) => ({
    versionCode: row.version_code,
    bookSlug: row.book_slug,
    bookName: row.book_name,
    chapter: row.chapter_number,
    verse: row.verse_number,
    reference: row.reference_label,
    text: row.verse_text,
    rank: row.rank,
  }));
}

export function formatLiturgyRow(row: BibliaLiturgyRow) {
  return {
    fecha: row.reading_date,
    tipo: row.celebration_type,
    nombre: row.celebration_name,
    ciclo: row.cycle,
    semana: row.week,
    primera: row.first_reading_ref,
    salmo: row.psalm_ref,
    segunda: row.second_reading_ref,
    evangelio: row.gospel_ref,
  };
}
