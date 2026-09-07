import { beforeEach, describe, expect, it, vi } from "vitest";

const repoMocks = vi.hoisted(() => ({
  list: vi.fn(),
  createTaxonomy: vi.fn(),
  createTerm: vi.fn(),
  getEntryTermIds: vi.fn(),
  setEntryTerms: vi.fn(),
  listEntryIdsByTermSlug: vi.fn(),
}));

const authzMocks = vi.hoisted(() => ({
  requireAppPermission: vi.fn(),
  requireAdminSession: vi.fn(),
  requireSession: vi.fn(),
  CMS_APP_SLUG: "cms",
}));

vi.mock("@/lib/taxonomies-repository", () => ({
  createTaxonomiesRepository: () => repoMocks,
  flattenTerms: (taxonomies: Array<{ terms: unknown[] }>) =>
    taxonomies.flatMap((taxonomy) => taxonomy.terms),
}));

vi.mock("@/lib/authz", () => authzMocks);

import { GET, POST } from "@/pages/api/admin/taxonomies";
import { POST as postTerm } from "@/pages/api/admin/taxonomies/terms";
import { POST as postEntryTerms } from "@/pages/api/admin/entries/[id]/terms";

const adminSession = {
  token: "admin-token",
  user: { id: "admin-1" },
  profile: { id: "admin-1", roleSlug: "admin" },
};

const editorSession = {
  token: "editor-token",
  user: { id: "editor-1" },
  profile: { id: "editor-1", roleSlug: "editor" },
};

const revisorSession = {
  token: "revisor-token",
  user: { id: "revisor-1" },
  profile: { id: "revisor-1", roleSlug: "revisor" },
};

const taxonomy = {
  id: "3f1e2b2a-1b2c-4d3e-8f90-1a2b3c4d5e6f",
  name: "Liturgia",
  slug: "liturgia",
  createdAt: "2026-09-07T00:00:00.000Z",
  updatedAt: "2026-09-07T00:00:00.000Z",
  terms: [
    {
      id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      taxonomyId: "3f1e2b2a-1b2c-4d3e-8f90-1a2b3c4d5e6f",
      taxonomySlug: "liturgia",
      taxonomyName: "Liturgia",
      name: "Adviento",
      slug: "adviento",
    },
  ],
};

beforeEach(() => {
  for (const mock of Object.values(repoMocks)) {
    mock.mockReset();
  }
  authzMocks.requireAppPermission.mockReset();
  authzMocks.requireAdminSession.mockReset();

  authzMocks.requireAppPermission.mockResolvedValue(editorSession);
  authzMocks.requireAdminSession.mockResolvedValue(adminSession);
  repoMocks.list.mockResolvedValue([taxonomy]);
  repoMocks.createTaxonomy.mockResolvedValue(taxonomy);
  repoMocks.createTerm.mockResolvedValue(taxonomy.terms[0]);
  repoMocks.getEntryTermIds.mockResolvedValue([]);
  repoMocks.setEntryTerms.mockImplementation(
    async (_token: string, _entryId: string, termIds: string[]) => termIds,
  );
});

describe("GET /api/admin/taxonomies (FR-CMS-003)", () => {
  it("lista taxonomias con terminos para roles del cms", async () => {
    const response = await GET({
      request: new Request("http://localhost/api/admin/taxonomies"),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as { taxonomies: unknown[] };
    expect(json.taxonomies).toHaveLength(1);
  });

  it("403 sin permiso cms", async () => {
    authzMocks.requireAppPermission.mockRejectedValue(
      new Error("USERS_UNAUTHORIZED_APP"),
    );

    const response = await GET({
      request: new Request("http://localhost/api/admin/taxonomies"),
    } as never);

    expect(response.status).toBe(403);
  });
});

describe("POST /api/admin/taxonomies (UC-CMS-010)", () => {
  it("201 con admin", async () => {
    const response = await POST({
      request: new Request("http://localhost/api/admin/taxonomies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Temas", slug: "temas" }),
      }),
    } as never);

    expect(response.status).toBe(201);
    expect(repoMocks.createTaxonomy).toHaveBeenCalledWith(
      "admin-token",
      { name: "Temas", slug: "temas" },
      { actorId: "admin-1" },
    );
  });

  it("403 con editor (RB-CMS-004: solo admin gestiona taxonomias)", async () => {
    authzMocks.requireAdminSession.mockRejectedValue(
      new Error("USERS_ROLE_ASSIGNMENT_DENIED"),
    );

    const response = await POST({
      request: new Request("http://localhost/api/admin/taxonomies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Temas", slug: "temas" }),
      }),
    } as never);

    expect(response.status).toBe(403);
  });

  it("409 con slug duplicado", async () => {
    repoMocks.createTaxonomy.mockRejectedValue(
      new Error("CMS_TAXONOMY_SLUG_DUPLICADO"),
    );

    const response = await POST({
      request: new Request("http://localhost/api/admin/taxonomies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Liturgia", slug: "liturgia" }),
      }),
    } as never);

    expect(response.status).toBe(409);
  });

  it("form-data redirige 303 al panel", async () => {
    repoMocks.createTaxonomy.mockResolvedValue({
      ...taxonomy,
      name: "Temas",
      slug: "temas",
    });

    const formData = new FormData();
    formData.set("name", "Temas");
    formData.set("slug", "temas");

    const response = await POST({
      request: new Request("http://localhost/api/admin/taxonomies", {
        method: "POST",
        body: formData,
      }),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      `/admin/taxonomies?ok=${encodeURIComponent("temas")}`,
    );
  });
});

describe("POST /api/admin/taxonomies/terms (UC-CMS-010)", () => {
  it("201 con admin y taxonomia existente", async () => {
    const response = await postTerm({
      request: new Request("http://localhost/api/admin/taxonomies/terms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          taxonomy_id: "3f1e2b2a-1b2c-4d3e-8f90-1a2b3c4d5e6f",
          name: "Cuaresma",
          slug: "cuaresma",
        }),
      }),
    } as never);

    expect(response.status).toBe(201);
  });

  it("409 con termino duplicado", async () => {
    repoMocks.createTerm.mockRejectedValue(new Error("CMS_TERM_DUPLICADO"));

    const response = await postTerm({
      request: new Request("http://localhost/api/admin/taxonomies/terms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          taxonomy_id: "3f1e2b2a-1b2c-4d3e-8f90-1a2b3c4d5e6f",
          name: "Adviento",
          slug: "adviento",
        }),
      }),
    } as never);

    expect(response.status).toBe(409);
  });

  it("404 si la taxonomia no existe", async () => {
    repoMocks.createTerm.mockRejectedValue(new Error("CMS_TAXONOMY_NOT_FOUND"));

    const response = await postTerm({
      request: new Request("http://localhost/api/admin/taxonomies/terms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          taxonomy_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          name: "x",
          slug: "x",
        }),
      }),
    } as never);

    expect(response.status).toBe(404);
  });
});

describe("POST /api/admin/entries/[id]/terms (FR-CMS-003)", () => {
  it("asigna terminos con editor (JSON)", async () => {
    const response = await postEntryTerms({
      request: new Request("http://localhost/api/admin/entries/entry-1/terms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          term_ids: [
            "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
            "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
          ],
        }),
      }),
      params: { id: "entry-1" },
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as { termIds: string[] };
    expect(json.termIds).toEqual([
      "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    ]);
  });

  it("403 con revisor (RB-CMS-004: el revisor no edita)", async () => {
    authzMocks.requireAppPermission.mockResolvedValue(revisorSession);

    const response = await postEntryTerms({
      request: new Request("http://localhost/api/admin/entries/entry-1/terms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          term_ids: ["a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"],
        }),
      }),
      params: { id: "entry-1" },
    } as never);

    expect(response.status).toBe(403);
  });

  it("422 con term_ids invalidos (no uuid)", async () => {
    const response = await postEntryTerms({
      request: new Request("http://localhost/api/admin/entries/entry-1/terms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ term_ids: ["no-uuid"] }),
      }),
      params: { id: "entry-1" },
    } as never);

    expect(response.status).toBe(422);
  });

  it("form-data con checkboxes redirige 303", async () => {
    const formData = new FormData();
    formData.append("term_ids", "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d");
    formData.append("term_ids", "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e");

    const response = await postEntryTerms({
      request: new Request("http://localhost/api/admin/entries/entry-1/terms", {
        method: "POST",
        body: formData,
      }),
      params: { id: "entry-1" },
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "/admin/entries/entry-1?ok=terms",
    );
    expect(repoMocks.setEntryTerms).toHaveBeenCalledWith(
      "editor-token",
      "entry-1",
      [
        "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
        "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
      ],
      { actorId: "editor-1" },
    );
  });
});
