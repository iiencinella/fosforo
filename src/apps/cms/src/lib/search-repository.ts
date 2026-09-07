import { getSupabaseAuthClient } from "@repo/auth";
import { getSupabaseServiceClient } from "@/lib/supabase";

/**
 * Repositorio de busqueda (FR-CMS-009, CMS-007). RPC security invoker:
 * con el token del usuario respeta la RLS del rol; con service_role el
 * endpoint publico pasa statuses=['published'].
 */

export type SearchResult = {
  id: string;
  contentTypeSlug: string;
  contentTypeName: string;
  slug: string;
  status: string;
  title: string;
  publishedAt: string | null;
  updatedAt: string;
};

type SearchRow = {
  id: string;
  content_type_slug: string;
  content_type_name: string;
  slug: string;
  status: string;
  title: string;
  published_at: string | null;
  updated_at: string;
};

function mapRow(row: SearchRow): SearchResult {
  return {
    id: row.id,
    contentTypeSlug: row.content_type_slug,
    contentTypeName: row.content_type_name,
    slug: row.slug,
    status: row.status,
    title: row.title,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

export type SearchOptions = {
  query: string;
  contentTypeSlug?: string;
  statuses?: string[] | null;
  limit?: number;
  /** service = API publica (service_role + statuses), user = panel (RLS). */
  scope: "service" | "user";
  accessToken?: string;
};

export async function searchEntries(
  options: SearchOptions,
): Promise<SearchResult[]> {
  const supabase =
    options.scope === "service"
      ? getSupabaseServiceClient()
      : getSupabaseAuthClient({ accessToken: options.accessToken ?? "" });

  const { data, error } = await supabase.rpc("search_content_entries", {
    p_query: options.query,
    p_content_type_slug: options.contentTypeSlug ?? null,
    p_statuses: options.statuses ?? null,
    p_limit: options.limit ?? 20,
  });

  if (error) {
    throw error;
  }
  return ((data ?? []) as SearchRow[]).map(mapRow);
}
