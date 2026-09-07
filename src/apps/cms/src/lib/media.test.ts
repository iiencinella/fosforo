import { describe, expect, it } from "vitest";
import {
  CMS_004_MEDIA_INVALIDA,
  MEDIA_MAX_BYTES,
  buildMediaPath,
  extensionFor,
  publicMediaUrl,
  searchQuerySchema,
  validateMedia,
} from "@/lib/media";

describe("validateMedia (RB-CMS-009, TC-CMS-017)", () => {
  it("acepta webp y jpeg dentro del limite", () => {
    expect(
      validateMedia({ mimeType: "image/webp", sizeBytes: 1_000_000 }),
    ).toBeNull();
    expect(
      validateMedia({ mimeType: "image/jpeg", sizeBytes: MEDIA_MAX_BYTES }),
    ).toBeNull();
  });

  it("rechaza formatos no soportados con CMS_004", () => {
    expect(validateMedia({ mimeType: "image/png", sizeBytes: 1_000 })).toBe(
      CMS_004_MEDIA_INVALIDA,
    );
    expect(validateMedia({ mimeType: "image/gif", sizeBytes: 1_000 })).toBe(
      CMS_004_MEDIA_INVALIDA,
    );
  });

  it("rechaza archivos vacios y que excedan 2MB", () => {
    expect(validateMedia({ mimeType: "image/webp", sizeBytes: 0 })).toBe(
      CMS_004_MEDIA_INVALIDA,
    );
    expect(
      validateMedia({ mimeType: "image/webp", sizeBytes: MEDIA_MAX_BYTES + 1 }),
    ).toBe(CMS_004_MEDIA_INVALIDA);
  });
});

describe("buildMediaPath", () => {
  it("normaliza el nombre y respeta entry/timestamp", () => {
    const path = buildMediaPath("entry-1", "Padre Nuestro!", "webp");
    expect(path).toMatch(/^entry-1\/\d+-padre-nuestro\.webp$/);
  });

  it("fallback de nombre vacio", () => {
    const path = buildMediaPath("entry-2", "###", "jpg");
    expect(path).toMatch(/^entry-2\/\d+-medio\.jpg$/);
  });
});

describe("extensionFor", () => {
  it("mapea mime a extension", () => {
    expect(extensionFor("image/webp")).toBe("webp");
    expect(extensionFor("image/jpeg")).toBe("jpg");
  });
});

describe("publicMediaUrl", () => {
  it("construye la URL publica del bucket sin dobles slashes", () => {
    expect(publicMediaUrl("https://supabase.co/", "/storage-path/a.webp")).toBe(
      "https://supabase.co/storage/v1/object/public/cms-media/storage-path/a.webp",
    );
  });
});

describe("searchQuerySchema (CMS-007)", () => {
  it("exige minimo 3 caracteres", () => {
    expect(searchQuerySchema.safeParse("pa").success).toBe(false);
    expect(searchQuerySchema.safeParse("padre").success).toBe(true);
  });

  it("rechaza comodines SQL", () => {
    expect(searchQuerySchema.safeParse("pa%dre").success).toBe(false);
    expect(searchQuerySchema.safeParse("pa_dre").success).toBe(false);
  });

  it("rechaza terminos excesivamente largos", () => {
    expect(searchQuerySchema.safeParse("x".repeat(101)).success).toBe(false);
  });
});
