import { beforeEach, describe, expect, it, vi } from "vitest";

const repoMocks = vi.hoisted(() => ({
  list: vi.fn(),
  getById: vi.fn(),
  listRevisions: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  transition: vi.fn(),
}));

const typesRepoMocks = vi.hoisted(() => ({
  getBySlug: vi.fn(),
}));

const authzMocks = vi.hoisted(() => ({
  requireAppPermission: vi.fn(),
  CMS_APP_SLUG: "cms",
}));

vi.mock("@/lib/entries-repository", () => ({
  createEntriesRepository: () => repoMocks,
}));

vi.mock("@/lib/content-types-repository", () => ({
  createContentTypesRepository: () => typesRepoMocks,
}));

vi.mock("@/lib/authz", () => authzMocks);

import { GET, POST } from "@/pages/api/admin/entries";
import {
  GET as getEntry,
  PUT as putEntry,
} from "@/pages/api/admin/entries/[id]";
import { POST as transitionPost } from "@/pages/api/admin/entries/[id]/transition";
import { POST as previewPost } from "@/pages/api/admin/preview";

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

const contentType = {
  id: "ct-1",
  name: "Oracion",
  slug: "oracion",
  fields: [{ name: "titulo", label: "Titulo", type: "text", required: true }],
  createdAt: "2026-09-07T00:00:00.000Z",
  updatedAt: "2026-09-07T00:00:00.000Z",
};

const entry = {
  id: "entry-1",
  contentTypeSlug: "oracion",
  contentTypeName: "Oracion",
  slug: "padre-nuestro",
  status: "draft",
  data: { titulo: "Padre Nuestro" },
  authorId: "editor-1",
  publishedAt: null,
  createdAt: "2026-09-07T00:00:00.000Z",
  updatedAt: "2026-09-07T01:00:00.000Z",
};

beforeEach(() => {
  for (const mock of Object.values(repoMocks)) {
    mock.mockReset();
  }
  typesRepoMocks.getBySlug.mockReset();
  authzMocks.requireAppPermission.mockReset();

  authzMocks.requireAppPermission.mockResolvedValue(editorSession);
  typesRepoMocks.getBySlug.mockResolvedValue(contentType);
  repoMocks.list.mockResolvedValue({
    data: [entry],
    total: 1,
    page: 1,
    limit: 20,
  });
  repoMocks.getById.mockResolvedValue(entry);
  repoMocks.listRevisions.mockResolvedValue([
    {
      id: "rev-1",
      revisionNumber: 1,
      status: "draft",
      data: entry.data,
      authorId: "editor-1",
      createdAt: "2026-09-07T00:30:00.000Z",
    },
  ]);
  repoMocks.create.mockResolvedValue(entry);
  repoMocks.update.mockResolvedValue({ ...entry, status: "draft" });
  repoMocks.transition.mockResolvedValue({ ...entry, status: "review" });
});

function jsonContext(
  url: string,
  body: unknown,
  method = "POST",
  params: Record<string, string> = {},
) {
  return {
    request: new Request(`http://localhost${url}`, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    url: new URL(`http://localhost${url}`),
    params,
  } as never;
}

describe("GET /api/admin/entries (FR-CMS-002)", () => {
  it("devuelve el listado con paginacion y filtros", async () => {
    const response = await GET({
      request: new Request(
        "http://localhost/api/admin/entries?status=draft&page=2",
      ),
      url: new URL("http://localhost/api/admin/entries?status=draft&page=2"),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as { total: number };
    expect(json.total).toBe(1);
    expect(repoMocks.list).toHaveBeenCalledWith(
      "editor-token",
      expect.objectContaining({ status: "draft", page: 2 }),
    );
  });

  it("403 sin permiso cms", async () => {
    authzMocks.requireAppPermission.mockRejectedValue(
      new Error("USERS_UNAUTHORIZED_APP"),
    );

    const response = await GET({
      request: new Request("http://localhost/api/admin/entries"),
      url: new URL("http://localhost/api/admin/entries"),
    } as never);

    expect(response.status).toBe(403);
  });
});

describe("POST /api/admin/entries (UC-CMS-002)", () => {
  it("201 con editor y data valida", async () => {
    const response = await POST(
      jsonContext("/api/admin/entries", {
        content_type_slug: "oracion",
        slug: "padre-nuestro",
        data: { titulo: "Padre Nuestro" },
      }),
    );

    expect(response.status).toBe(201);
    expect(repoMocks.create).toHaveBeenCalledWith(
      "editor-token",
      expect.objectContaining({ slug: "padre-nuestro", contentTypeId: "ct-1" }),
      "editor-1",
    );
  });

  it("403 si el rol es revisor (RB-CMS-004: el revisor no crea)", async () => {
    authzMocks.requireAppPermission.mockResolvedValue(revisorSession);

    const response = await POST(
      jsonContext("/api/admin/entries", {
        content_type_slug: "oracion",
        slug: "padre-nuestro",
        data: { titulo: "x" },
      }),
    );

    expect(response.status).toBe(403);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("CMS_ROLE_FORBIDDEN");
  });

  it("422 con campos requeridos faltantes (CMS_002)", async () => {
    // La validacion de data contra los campos del content type vive en el
    // repositorio (validateEntryData); se simula su rechazo.
    repoMocks.create.mockRejectedValue(
      new Error("CMS_002_MISSING_FIELDS: titulo"),
    );

    const response = await POST(
      jsonContext("/api/admin/entries", {
        content_type_slug: "oracion",
        slug: "padre-nuestro",
        data: {},
      }),
    );

    expect(response.status).toBe(422);
    const json = (await response.json()) as { error: string };
    expect(json.error.startsWith("CMS_002_MISSING_FIELDS")).toBe(true);
  });

  it("409 con slug de entrada duplicado", async () => {
    repoMocks.create.mockRejectedValue(new Error("CMS_ENTRY_SLUG_DUPLICADO"));

    const response = await POST(
      jsonContext("/api/admin/entries", {
        content_type_slug: "oracion",
        slug: "padre-nuestro",
        data: { titulo: "x" },
      }),
    );

    expect(response.status).toBe(409);
  });

  it("404 si el content type no existe", async () => {
    typesRepoMocks.getBySlug.mockResolvedValue(null);

    const response = await POST(
      jsonContext("/api/admin/entries", {
        content_type_slug: "fantasma",
        slug: "x",
        data: { titulo: "x" },
      }),
    );

    expect(response.status).toBe(404);
  });
});

describe("GET/PUT /api/admin/entries/[id] (UC-CMS-003)", () => {
  it("GET devuelve entrada y revisiones", async () => {
    const response = await getEntry({
      request: new Request("http://localhost/api/admin/entries/entry-1"),
      params: { id: "entry-1" },
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      entry: { slug: string };
      revisions: unknown[];
    };
    expect(json.entry.slug).toBe("padre-nuestro");
    expect(json.revisions).toHaveLength(1);
  });

  it("PUT guarda con locking optimista y crea revision", async () => {
    const response = await putEntry({
      request: new Request("http://localhost/api/admin/entries/entry-1", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          data: { titulo: "Padre Nuestro v2" },
          expected_updated_at: entry.updatedAt,
        }),
      }),
      params: { id: "entry-1" },
    } as never);

    expect(response.status).toBe(200);
    expect(repoMocks.update).toHaveBeenCalledWith(
      "editor-token",
      "entry-1",
      {
        data: { titulo: "Padre Nuestro v2" },
        expectedUpdatedAt: entry.updatedAt,
      },
      "editor-1",
    );
  });

  it("PUT 409 con conflicto de version (ERM-CMS-001)", async () => {
    repoMocks.update.mockRejectedValue(new Error("CMS_CONFLICT_STALE_UPDATE"));

    const response = await putEntry({
      request: new Request("http://localhost/api/admin/entries/entry-1", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          data: { titulo: "x" },
          expected_updated_at: "viejo",
        }),
      }),
      params: { id: "entry-1" },
    } as never);

    expect(response.status).toBe(409);
  });

  it("PUT 422 con campos requeridos faltantes", async () => {
    repoMocks.update.mockRejectedValue(
      new Error("CMS_002_MISSING_FIELDS: titulo"),
    );

    const response = await putEntry({
      request: new Request("http://localhost/api/admin/entries/entry-1", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          data: {},
          expected_updated_at: entry.updatedAt,
        }),
      }),
      params: { id: "entry-1" },
    } as never);

    expect(response.status).toBe(422);
  });
});

describe("POST /api/admin/entries/[id]/transition (FR-CMS-004)", () => {
  it("revisor aprueba desde review", async () => {
    authzMocks.requireAppPermission.mockResolvedValue(revisorSession);
    repoMocks.transition.mockResolvedValue({ ...entry, status: "published" });

    const response = await transitionPost(
      jsonContext(
        "/api/admin/entries/entry-1/transition",
        {
          action: "approve",
        },
        "POST",
        { id: "entry-1" },
      ),
    );

    expect(response.status).toBe(200);
    expect(repoMocks.transition).toHaveBeenCalledWith(
      "revisor-token",
      "entry-1",
      "approve",
      undefined,
      "revisor-1",
      "revisor",
    );
  });

  it("403 si el rol no habilita la transicion (RB-CMS-004)", async () => {
    repoMocks.transition.mockRejectedValue(new Error("CMS_TRANSITION_INVALID"));

    const response = await transitionPost(
      jsonContext(
        "/api/admin/entries/entry-1/transition",
        {
          action: "approve",
        },
        "POST",
        { id: "entry-1" },
      ),
    );

    expect(response.status).toBe(403);
  });

  it("409 con CMS_003 si la entrada no esta en review", async () => {
    repoMocks.transition.mockRejectedValue(new Error("CMS_003_NOT_IN_REVIEW"));

    const response = await transitionPost(
      jsonContext(
        "/api/admin/entries/entry-1/transition",
        {
          action: "approve",
        },
        "POST",
        { id: "entry-1" },
      ),
    );

    expect(response.status).toBe(409);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("CMS_003_NOT_IN_REVIEW");
  });

  it("422 al rechazar sin motivo", async () => {
    repoMocks.transition.mockRejectedValue(new Error("CMS_REASON_REQUIRED"));

    const response = await transitionPost(
      jsonContext(
        "/api/admin/entries/entry-1/transition",
        {
          action: "reject",
        },
        "POST",
        { id: "entry-1" },
      ),
    );

    expect(response.status).toBe(422);
  });

  it("form-data redirige 303 al detalle (panel SSR)", async () => {
    const formData = new FormData();
    formData.set("action", "submit");

    const response = await transitionPost({
      request: new Request(
        "http://localhost/api/admin/entries/entry-1/transition",
        {
          method: "POST",
          body: formData,
        },
      ),
      params: { id: "entry-1" },
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "/admin/entries/entry-1?ok=submit",
    );
  });
});

describe("POST /api/admin/preview (SEC-CMS-007)", () => {
  it("devuelve HTML sanitizado", async () => {
    const response = await previewPost(
      jsonContext("/api/admin/preview", {
        markdown: "# Titulo\n\n<script>alert(1)</script>",
      }),
    );

    expect(response.status).toBe(200);
    const json = (await response.json()) as { html: string };
    expect(json.html).toContain("<h1");
    expect(json.html).not.toContain("<script");
  });

  it("403 sin permiso cms", async () => {
    authzMocks.requireAppPermission.mockRejectedValue(
      new Error("USERS_UNAUTHORIZED_APP"),
    );

    const response = await previewPost(
      jsonContext("/api/admin/preview", { markdown: "hola" }),
    );

    expect(response.status).toBe(403);
  });
});
