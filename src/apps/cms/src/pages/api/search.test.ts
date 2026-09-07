import { beforeEach, describe, expect, it, vi } from "vitest";

const authzMocks = vi.hoisted(() => ({
  requireAppPermission: vi.fn(),
  CMS_APP_SLUG: "cms",
}));

const searchMocks = vi.hoisted(() => ({
  searchEntries: vi.fn(),
}));

vi.mock("@/lib/authz", () => authzMocks);
vi.mock("@/lib/search-repository", () => searchMocks);

import { GET as adminSearch } from "@/pages/api/admin/search";
import { GET as publicSearch } from "@/pages/api/content/search";

const readRepoMocks = vi.hoisted(() => ({
  verifyApiKey: vi.fn(),
  checkRateLimit: vi.fn(),
  touchLastUsed: vi.fn(),
}));

vi.mock("@/lib/content-read-repository", () => ({
  createContentReadRepository: () => readRepoMocks,
}));

const editorSession = {
  token: "editor-token",
  user: { id: "editor-1" },
  profile: { id: "editor-1", roleSlug: "editor" },
};

const results = [
  {
    id: "entry-1",
    contentTypeSlug: "oracion",
    contentTypeName: "Oracion",
    slug: "padre-nuestro",
    status: "published",
    title: "Padre Nuestro",
    publishedAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z",
  },
];

beforeEach(() => {
  authzMocks.requireAppPermission.mockReset();
  searchMocks.searchEntries.mockReset();
  readRepoMocks.verifyApiKey.mockReset();
  readRepoMocks.checkRateLimit.mockReset();
  readRepoMocks.touchLastUsed.mockReset();

  authzMocks.requireAppPermission.mockResolvedValue(editorSession);
  searchMocks.searchEntries.mockResolvedValue(results);
  readRepoMocks.verifyApiKey.mockResolvedValue({
    id: "key-1",
    appName: "misal",
  });
  readRepoMocks.checkRateLimit.mockResolvedValue(true);
});

describe("GET /api/admin/search (FR-CMS-009, UC-CMS-007)", () => {
  it("busca con el token del usuario (RLS por rol)", async () => {
    const response = await adminSearch({
      request: new Request("http://localhost/api/admin/search?q=padre"),
      url: new URL("http://localhost/api/admin/search?q=padre"),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as { results: unknown[] };
    expect(json.results).toHaveLength(1);
    expect(searchMocks.searchEntries).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "padre",
        statuses: null,
        scope: "user",
      }),
    );
  });

  it("422 con query corta (CMS_007)", async () => {
    const response = await adminSearch({
      request: new Request("http://localhost/api/admin/search?q=pa"),
      url: new URL("http://localhost/api/admin/search?q=pa"),
    } as never);

    expect(response.status).toBe(422);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("CMS_007_QUERY_TOO_SHORT");
  });

  it("403 sin permiso cms", async () => {
    authzMocks.requireAppPermission.mockRejectedValue(
      new Error("USERS_UNAUTHORIZED_APP"),
    );

    const response = await adminSearch({
      request: new Request("http://localhost/api/admin/search?q=padre"),
      url: new URL("http://localhost/api/admin/search?q=padre"),
    } as never);

    expect(response.status).toBe(403);
  });
});

describe("GET /api/content/search (CMS-007, publico)", () => {
  it("busca solo publicadas con service scope", async () => {
    const response = await publicSearch({
      request: new Request("http://localhost/api/content/search?q=padre", {
        headers: { authorization: "Bearer clave" },
      }),
      url: new URL("http://localhost/api/content/search?q=padre"),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      total: number;
      results: unknown[];
    };
    expect(json.total).toBe(1);
    expect(searchMocks.searchEntries).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "padre",
        statuses: ["published"],
        scope: "service",
      }),
    );
  });

  it("401 sin API key", async () => {
    const response = await publicSearch({
      request: new Request("http://localhost/api/content/search?q=padre"),
      url: new URL("http://localhost/api/content/search?q=padre"),
    } as never);

    expect(response.status).toBe(401);
  });

  it("429 con rate limit excedido", async () => {
    readRepoMocks.checkRateLimit.mockResolvedValue(false);

    const response = await publicSearch({
      request: new Request("http://localhost/api/content/search?q=padre", {
        headers: { authorization: "Bearer clave" },
      }),
      url: new URL("http://localhost/api/content/search?q=padre"),
    } as never);

    expect(response.status).toBe(429);
  });

  it("422 con query corta (CMS_007)", async () => {
    const response = await publicSearch({
      request: new Request("http://localhost/api/content/search?q=pa", {
        headers: { authorization: "Bearer clave" },
      }),
      url: new URL("http://localhost/api/content/search?q=pa"),
    } as never);

    expect(response.status).toBe(422);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("CMS_007_QUERY_TOO_SHORT");
  });
});
