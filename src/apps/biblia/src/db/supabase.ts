import { getSupabaseEnv } from "@repo/env";
import { createClient } from "@supabase/supabase-js";

const { url, anonKey } = getSupabaseEnv();

export const supabase = createClient(url, anonKey);

export type BibliaReadRow = {
  version_code: string;
  book_slug: string;
  book_name: string;
  chapter_number: number;
  verse_number: number;
  verse_text: string;
};

export type BibliaSearchRow = {
  version_code: string;
  book_slug: string;
  book_name: string;
  chapter_number: number;
  verse_number: number;
  reference_label: string;
  verse_text: string;
  rank: number;
};

export type BibliaLiturgyRow = {
  reading_date: string;
  rite: string;
  region_code: string;
  celebration_type: string | null;
  celebration_name: string | null;
  cycle: string | null;
  week: number | null;
  first_reading_ref: string | null;
  psalm_ref: string | null;
  second_reading_ref: string | null;
  gospel_ref: string | null;
  source_year: number | null;
};

export async function readChapterRpc(params: {
  versionCode: string;
  bookSlug: string;
  chapterNumber: number;
}) {
  return supabase.rpc("biblia_read_chapter", {
    p_version_code: params.versionCode,
    p_book_slug: params.bookSlug,
    p_chapter_number: params.chapterNumber,
  });
}

export async function searchVersesRpc(params: {
  versionCode: string;
  query: string;
  limit?: number;
}) {
  return supabase.rpc("biblia_search_verses", {
    p_version_code: params.versionCode,
    p_query: params.query,
    p_limit: params.limit ?? 30,
  });
}

export async function getLiturgyDayRpc(params: {
  date: string;
  rite: string;
  regionCode: string;
}) {
  return supabase.rpc("biblia_get_liturgy_day", {
    p_date: params.date,
    p_rite: params.rite,
    p_region_code: params.regionCode,
  });
}
