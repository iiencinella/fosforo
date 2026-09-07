import { beforeEach, describe, expect, it, vi } from "vitest";

const authzMocks = vi.hoisted(() => ({
  requireAppPermission: vi.fn(),
  CMS_APP_SLUG: "cms",
}));

const mediaMocks = vi.hoisted(() => ({
  uploadMedia: vi.fn(),
  listMedia: vi.fn(),
  deleteMedia: vi.fn(),
}));

vi.mock("@/lib/authz", () => authzMocks);
vi.mock("@/lib/media-repository", () => mediaMocks);

import { GET, POST } from "@/pages/api/admin/media";

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

const ENTRY_ID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

const uploaded = {
  id: "media-1",
  entryId: ENTRY_ID,
  storagePath: `${ENTRY_ID}/1725-patro.webp`,
  publicUrl: `https://supabase.co/storage/v1/object/public/cms-media/${ENTRY_ID}/1725-patro.webp`,
  mimeType: "image/webp",
  sizeBytes: 120_000,
};

function buildFormRequest(entries: Array<[string, string | File]>) {
  const formData = new FormData();
  for (const [key, value] of entries) {
    formData.append(key, value);
  }
  return new Request("http://localhost/api/admin/media", {
    method: "POST",
    body: formData,
  });
}

function buildContext(
  request: Request,
  url = "http://localhost/api/admin/media",
) {
  return { request, url: new URL(url) } as never;
}

function webpFile(): File {
  return new File([new Uint8Array(1_000)], "patron.webp", {
    type: "image/webp",
  });
}

beforeEach(() => {
  authzMocks.requireAppPermission.mockReset();
  mediaMocks.uploadMedia.mockReset();
  mediaMocks.listMedia.mockReset();
  mediaMocks.deleteMedia.mockReset();

  authzMocks.requireAppPermission.mockResolvedValue(editorSession);
  mediaMocks.uploadMedia.mockResolvedValue(uploaded);
  mediaMocks.listMedia.mockResolvedValue([uploaded]);
});

describe("POST /api/admin/media (UC-CMS-009)", () => {
  it("201 con editor y medio valido", async () => {
    const response = await POST(
      buildContext(
        buildFormRequest([
          ["entry_id", ENTRY_ID],
          ["file", webpFile()],
        ]),
      ),
    );

    expect(response.status).toBe(201);
    const json = (await response.json()) as { media: { storagePath: string } };
    expect(json.media.storagePath).toContain(`${ENTRY_ID}/`);
    expect(mediaMocks.uploadMedia).toHaveBeenCalledWith(
      "editor-token",
      ENTRY_ID,
      expect.objectContaining({ mimeType: "image/webp", sizeBytes: 1_000 }),
    );
  });

  it("403 con revisor (RB-CMS-004: el revisor no sube medios)", async () => {
    authzMocks.requireAppPermission.mockResolvedValue(revisorSession);

    const response = await POST(
      buildContext(
        buildFormRequest([
          ["entry_id", ENTRY_ID],
          ["file", webpFile()],
        ]),
      ),
    );

    expect(response.status).toBe(403);
  });

  it("422 con formato no soportado (CMS_004)", async () => {
    // La validacion vive en uploadMedia (repo); se simula su rechazo.
    mediaMocks.uploadMedia.mockRejectedValue(
      new Error("CMS_004_MEDIA_INVALIDA"),
    );

    const response = await POST(
      buildContext(
        buildFormRequest([
          ["entry_id", ENTRY_ID],
          [
            "file",
            new File([new Uint8Array(10)], "x.png", { type: "image/png" }),
          ],
        ]),
      ),
    );

    expect(response.status).toBe(422);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("CMS_004_MEDIA_INVALIDA");
  });

  it("422 con archivo mayor a 2MB (CMS_004)", async () => {
    mediaMocks.uploadMedia.mockRejectedValue(
      new Error("CMS_004_MEDIA_INVALIDA"),
    );

    const response = await POST(
      buildContext(
        buildFormRequest([
          ["entry_id", ENTRY_ID],
          [
            "file",
            new File([new Uint8Array(2_097_153)], "grande.webp", {
              type: "image/webp",
            }),
          ],
        ]),
      ),
    );

    expect(response.status).toBe(422);
  });

  it("422 sin archivo", async () => {
    const response = await POST(
      buildContext(buildFormRequest([["entry_id", ENTRY_ID]])),
    );

    expect(response.status).toBe(422);
  });

  it("404 si la entrada no existe", async () => {
    mediaMocks.uploadMedia.mockRejectedValue(new Error("CMS_ENTRY_NOT_FOUND"));

    const response = await POST(
      buildContext(
        buildFormRequest([
          ["entry_id", "cccccccc-cccc-4ccc-8ccc-cccccccccccc"],
          ["file", webpFile()],
        ]),
      ),
    );

    expect(response.status).toBe(404);
  });

  it("form-data del panel redirige 303 al editor de la entrada", async () => {
    const response = await POST(
      buildContext(
        buildFormRequest([
          ["entry_id", ENTRY_ID],
          ["file", webpFile()],
          ["return_to", `/admin/entries/${ENTRY_ID}`],
        ]),
      ),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      `/admin/entries/${ENTRY_ID}?ok=media`,
    );
  });

  it("POST con _method=delete elimina el medio (override de form HTML)", async () => {
    mediaMocks.deleteMedia.mockResolvedValue(undefined);

    const response = await POST(
      buildContext(
        new Request("http://localhost/api/admin/media", {
          method: "POST",
          body: new FormData(),
        }),
        `http://localhost/api/admin/media?_method=delete&media_id=media-1&return_to=${encodeURIComponent(`/admin/entries/${ENTRY_ID}`)}`,
      ),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      `/admin/entries/${ENTRY_ID}?ok=media_deleted`,
    );
    expect(mediaMocks.deleteMedia).toHaveBeenCalledWith(
      "editor-token",
      "media-1",
    );
  });
});

describe("GET /api/admin/media", () => {
  it("lista los medios de una entrada", async () => {
    const response = await GET({
      request: new Request(
        `http://localhost/api/admin/media?entry_id=${ENTRY_ID}`,
      ),
      url: new URL(`http://localhost/api/admin/media?entry_id=${ENTRY_ID}`),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as { media: unknown[] };
    expect(json.media).toHaveLength(1);
  });

  it("422 sin entry_id", async () => {
    const response = await GET({
      request: new Request("http://localhost/api/admin/media"),
      url: new URL("http://localhost/api/admin/media"),
    } as never);

    expect(response.status).toBe(422);
  });
});
