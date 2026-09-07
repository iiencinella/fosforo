import { beforeEach, describe, expect, it, vi } from "vitest";

const repoMocks = vi.hoisted(() => ({
  listPublished: vi.fn(),
  getPublished: vi.fn(),
  verifyApiKey: vi.fn(),
  checkRateLimit: vi.fn(),
  touchLastUsed: vi.fn(),
}));

vi.mock("@/lib/content-read-repository", () => ({
  createContentReadRepository: () => repoMocks,
  mapPublishedEntry: (row: {
    id: string;
    slug: string;
    data: Record<string, unknown>;
    published_at: string | null;
    updated_at: string;
    content_types: {
      slug: string;
      name: string;
      fields: Array<{
        name: string;
        label: string;
        type: string;
        required: boolean;
      }>;
    } | null;
    content_entry_terms: Array<{
      content_terms: { slug: string; name: string } | null;
    }> | null;
  }) => ({
    id: row.id,
    contentType: row.content_types?.slug ?? "",
    contentTypeName: row.content_types?.name ?? "",
    slug: row.slug,
    title: String(row.data.titulo ?? row.slug),
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    data: row.data,
    rendered: {},
    terms: (row.content_entry_terms ?? [])
      .map((entryTerm) => entryTerm.content_terms)
      .filter((term): term is { slug: string; name: string } => term !== null),
  }),
  markdownFieldNames: (fields: Array<{ name: string; type: string }>) =>
    fields
      .filter((field) => field.type === "markdown")
      .map((field) => field.name),
}));

import { GET } from "@/pages/api/content/[content_type]";
import { clearCacheForTests } from "@/lib/content-cache";

const keyRow = { id: "key-1", appName: "misal" };

const publishedRow = {
  id: "entry-1",
  slug: "padre-nuestro",
  data: { titulo: "Padre Nuestro", cuerpo: "# Padre nuestro..." },
  published_at: "2026-09-07T00:00:00.000Z",
  updated_at: "2026-09-07T00:00:00.000Z",
  content_types: {
    slug: "oracion",
    name: "Oracion",
    fields: [
      { name: "titulo", label: "Titulo", type: "text", required: true },
      { name: "cuerpo", label: "Cuerpo", type: "markdown", required: true },
    ],
  },
  content_entry_terms: [
    { content_terms: { slug: "adviento", name: "Adviento" } },
  ],
};

function buildContext(
  query: Record<string, string> = {},
  headers: Record<string, string> = {},
) {
  const search = new URLSearchParams(query).toString();
  return {
    request: new Request(
      `http://localhost/api/content/oracion${search ? `?${search}` : ""}`,
      { headers },
    ),
    url: new URL(
      `http://localhost/api/content/oracion${search ? `?${search}` : ""}`,
    ),
    params: { content_type: "oracion" },
  } as never;
}

beforeEach(() => {
  for (const mock of Object.values(repoMocks)) {
    mock.mockReset();
  }
  clearCacheForTests();

  repoMocks.verifyApiKey.mockResolvedValue(keyRow);
  repoMocks.checkRateLimit.mockResolvedValue(true);
  repoMocks.listPublished.mockResolvedValue({
    data: [publishedRow],
    total: 1,
    page: 1,
    limit: 20,
  });
  repoMocks.getPublished.mockResolvedValue(publishedRow);
});

describe("GET /api/content/{content_type} (FR-CMS-006, UC-CMS-008)", () => {
  it("401 sin API key (CMS_005)", async () => {
    const response = await GET(buildContext());

    expect(response.status).toBe(401);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("CMS_005_API_KEY_INVALIDA");
  });

  it("401 con API key invalida o inactiva (CMS_005)", async () => {
    repoMocks.verifyApiKey.mockResolvedValue(null);

    const response = await GET(
      buildContext({}, { authorization: "Bearer mala" }),
    );

    expect(response.status).toBe(401);
  });

  it("429 con rate limit excedido (CMS_006) y retry-after", async () => {
    repoMocks.checkRateLimit.mockResolvedValue(false);

    const response = await GET(
      buildContext({}, { authorization: "Bearer clave" }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("CMS_006_RATE_LIMITED");
  });

  it("404 si el content type no existe", async () => {
    repoMocks.listPublished.mockResolvedValue(null);

    const response = await GET(
      buildContext({}, { authorization: "Bearer clave" }),
    );

    expect(response.status).toBe(404);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("CMS_CONTENT_TYPE_NOT_FOUND");
  });

  it("200 MISS con contenido publicado, rendered sanitizado y headers de cache", async () => {
    const response = await GET(
      buildContext({}, { authorization: "Bearer clave" }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("s-maxage=300");
    expect(response.headers.get("x-cache")).toBe("MISS");

    const json = (await response.json()) as {
      ok: boolean;
      total: number;
      data: Array<{
        slug: string;
        title: string;
        rendered: Record<string, string>;
        terms: Array<{ slug: string }>;
      }>;
    };
    expect(json.ok).toBe(true);
    expect(json.total).toBe(1);
    expect(json.data[0]?.slug).toBe("padre-nuestro");
    expect(json.data[0]?.title).toBe("Padre Nuestro");
    expect(json.data[0]?.rendered.cuerpo).toContain("<h1");
    expect(json.data[0]?.terms[0]?.slug).toBe("adviento");
    expect(repoMocks.checkRateLimit).toHaveBeenCalledWith("key-1", 100, 60);
    expect(repoMocks.touchLastUsed).toHaveBeenCalledWith("key-1");
  });

  it("segunda peticion identica sale de cache (HIT) sin reconsultar", async () => {
    await GET(buildContext({}, { authorization: "Bearer clave" }));
    const calls = repoMocks.listPublished.mock.calls.length;

    const second = await GET(
      buildContext({}, { authorization: "Bearer clave" }),
    );

    expect(second.status).toBe(200);
    expect(second.headers.get("x-cache")).toBe("HIT");
    expect(repoMocks.listPublished.mock.calls.length).toBe(calls);
  });

  it("slug unico se sirve por cache propio (TC-CMS-006)", async () => {
    const response = await GET(
      buildContext(
        { slug: "padre-nuestro" },
        { authorization: "Bearer clave" },
      ),
    );

    expect(response.status).toBe(200);
    const json = (await response.json()) as { entry: { slug: string } };
    expect(json.entry.slug).toBe("padre-nuestro");
    expect(repoMocks.getPublished).toHaveBeenCalledWith(
      "oracion",
      "padre-nuestro",
    );
  });

  it("propaga el filtro de taxonomia al repositorio (FR-CMS-006)", async () => {
    await GET(
      buildContext({ term: "adviento" }, { authorization: "Bearer clave" }),
    );

    expect(repoMocks.listPublished).toHaveBeenCalledWith(
      "oracion",
      expect.objectContaining({ term: "adviento", page: 1, limit: 20 }),
    );
  });

  it("invalida el cache del content type al publicar (RB-CMS-010, simulado)", async () => {
    await GET(buildContext({}, { authorization: "Bearer clave" }));

    // Simula la publicacion de una nueva version: el webhook (paso 9)
    // llamara a invalidateContentType; aqui se verifica que tras invalidar
    // la siguiente peticion vuelve a ser MISS con datos frescos.
    const { invalidateContentType } = await import("@/lib/content-cache");
    invalidateContentType("oracion");

    repoMocks.listPublished.mockResolvedValue({
      data: [publishedRow],
      total: 2,
      page: 1,
      limit: 20,
    });

    const response = await GET(
      buildContext({}, { authorization: "Bearer clave" }),
    );

    expect(response.headers.get("x-cache")).toBe("MISS");
    const json = (await response.json()) as { total: number };
    expect(json.total).toBe(2);
  });
});
