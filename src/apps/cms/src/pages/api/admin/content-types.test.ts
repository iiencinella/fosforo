import { beforeEach, describe, expect, it, vi } from "vitest";

const repoMocks = vi.hoisted(() => ({
  list: vi.fn(),
  getBySlug: vi.fn(),
  create: vi.fn(),
}));

const authzMocks = vi.hoisted(() => ({
  requireAppPermission: vi.fn(),
  requireAdminSession: vi.fn(),
  requireSession: vi.fn(),
  CMS_APP_SLUG: "cms",
}));

vi.mock("@/lib/content-types-repository", () => ({
  createContentTypesRepository: () => repoMocks,
}));

vi.mock("@/lib/authz", () => authzMocks);

import { GET, POST } from "@/pages/api/admin/content-types";

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

const validPayload = {
  name: "Oracion",
  slug: "oracion",
  fields: [
    { name: "titulo", label: "Titulo", type: "text", required: true },
    { name: "cuerpo", label: "Cuerpo", type: "markdown" },
  ],
};

const createdRecord = {
  id: "ct-1",
  ...validPayload,
  createdAt: "2026-09-07T00:00:00.000Z",
  updatedAt: "2026-09-07T00:00:00.000Z",
};

beforeEach(() => {
  repoMocks.list.mockReset();
  repoMocks.getBySlug.mockReset();
  repoMocks.create.mockReset();
  authzMocks.requireAppPermission.mockReset();
  authzMocks.requireAdminSession.mockReset();

  repoMocks.list.mockResolvedValue([createdRecord]);
  repoMocks.create.mockResolvedValue(createdRecord);
  authzMocks.requireAppPermission.mockResolvedValue(editorSession);
  authzMocks.requireAdminSession.mockResolvedValue(adminSession);
});

describe("GET /api/admin/content-types (FR-CMS-001)", () => {
  it("lista content types con permiso cms", async () => {
    const response = await GET({
      request: new Request("http://localhost/api/admin/content-types"),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as { contentTypes: unknown[] };
    expect(json.contentTypes).toHaveLength(1);
  });

  it("403 sin permiso de app cms", async () => {
    authzMocks.requireAppPermission.mockRejectedValue(
      new Error("USERS_UNAUTHORIZED_APP"),
    );

    const response = await GET({
      request: new Request("http://localhost/api/admin/content-types"),
    } as never);

    expect(response.status).toBe(403);
  });
});

describe("POST /api/admin/content-types (UC-CMS-001)", () => {
  function jsonRequest(body: unknown) {
    return new Request("http://localhost/api/admin/content-types", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("201 con admin y payload valido; audita la creacion", async () => {
    const response = await POST({
      request: jsonRequest(validPayload),
    } as never);

    expect(response.status).toBe(201);
    const json = (await response.json()) as { contentType: { slug: string } };
    expect(json.contentType.slug).toBe("oracion");
    // El schema aplica default required=false a los campos sin flag.
    expect(repoMocks.create).toHaveBeenCalledWith(
      "admin-token",
      expect.objectContaining({ name: "Oracion", slug: "oracion" }),
      expect.objectContaining({
        action: "content_type_created",
        actorId: "admin-1",
      }),
    );
  });

  it("403 sin rol admin (RB-CMS-004: el revisor tampoco crea)", async () => {
    authzMocks.requireAdminSession.mockRejectedValue(
      new Error("USERS_ROLE_ASSIGNMENT_DENIED"),
    );

    const response = await POST({
      request: jsonRequest(validPayload),
    } as never);

    expect(response.status).toBe(403);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("CMS_ADMIN_REQUIRED");
    expect(repoMocks.create).not.toHaveBeenCalled();
  });

  it("401 sin sesion", async () => {
    authzMocks.requireAdminSession.mockRejectedValue(
      new Error("USERS_SESSION_EXPIRED"),
    );

    const response = await POST({
      request: jsonRequest(validPayload),
    } as never);

    expect(response.status).toBe(401);
  });

  it("422 con payload invalido", async () => {
    const response = await POST({
      request: jsonRequest({
        name: "Oracion",
        slug: "Oracion Invalida",
        fields: [],
      }),
    } as never);

    expect(response.status).toBe(422);
    expect(repoMocks.create).not.toHaveBeenCalled();
  });

  it("422 con JSON de campos malformado en form-data", async () => {
    const formData = new FormData();
    formData.set("name", "Oracion");
    formData.set("slug", "oracion");
    formData.set("fields", "no-json");

    const response = await POST({
      request: new Request("http://localhost/api/admin/content-types", {
        method: "POST",
        body: formData,
      }),
    } as never);

    expect(response.status).toBe(422);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("CMS_FIELDS_INVALID_JSON");
  });

  it("409 con slug duplicado (CMS_001)", async () => {
    repoMocks.create.mockRejectedValue(new Error("CMS_001_SLUG_DUPLICADO"));

    const response = await POST({
      request: jsonRequest(validPayload),
    } as never);

    expect(response.status).toBe(409);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("CMS_001_SLUG_DUPLICADO");
  });

  it("form-data valido redirige 303 al listado (panel SSR)", async () => {
    const formData = new FormData();
    formData.set("name", "Oracion");
    formData.set("slug", "oracion");
    formData.set(
      "fields",
      JSON.stringify([{ name: "cuerpo", label: "Cuerpo", type: "markdown" }]),
    );

    const response = await POST({
      request: new Request("http://localhost/api/admin/content-types", {
        method: "POST",
        body: formData,
      }),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      `/admin/content-types?ok=${encodeURIComponent("oracion")}`,
    );
  });

  it("500 con fallo inesperado de DB", async () => {
    repoMocks.create.mockRejectedValue(new Error("DB down"));

    const response = await POST({
      request: jsonRequest(validPayload),
    } as never);

    expect(response.status).toBe(500);
  });
});
