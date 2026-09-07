import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SAMPLING,
  METADATA_MAX_BYTES,
  findPiiViolations,
  rumEventNameSchema,
  rumEventPayloadSchema,
  rumVitalPayloadSchema,
  samplingAllows,
} from "@/lib/rum-data";

const validSessionId = "a1b2c3d4e5f60718293a4b5c6d7e8f90";

describe("taxonomia de eventos (TC-LOG-RUM-015)", () => {
  it("acepta eventos reservados", () => {
    expect(rumEventNameSchema.safeParse("pageview").success).toBe(true);
    expect(rumEventNameSchema.safeParse("frontend.error").success).toBe(true);
  });

  it("acepta eventos namespaced con app registrada", () => {
    expect(rumEventNameSchema.safeParse("misal.lectio.started").success).toBe(
      true,
    );
    expect(
      rumEventNameSchema.safeParse("oraciones.coleccion.created").success,
    ).toBe(true);
    expect(rumEventNameSchema.safeParse("portal.feed.loaded").success).toBe(
      true,
    );
  });

  it("rechaza apps no registradas en la whitelist", () => {
    expect(rumEventNameSchema.safeParse("desconocida.evento").success).toBe(
      false,
    );
  });

  it("rechaza formatos invalidos", () => {
    expect(rumEventNameSchema.safeParse("Misal.lectio").success).toBe(false);
    expect(rumEventNameSchema.safeParse("misal").success).toBe(false);
    expect(rumEventNameSchema.safeParse("misal.").success).toBe(false);
    expect(rumEventNameSchema.safeParse("1abc.evento").success).toBe(false);
    expect(rumEventNameSchema.safeParse("").success).toBe(false);
  });
});

describe("payload de evento (TC-LOG-RUM-001)", () => {
  const base = {
    app: "misal",
    event_name: "pageview",
    page_path: "/dia/2026-09-06",
    session_id_anon: validSessionId,
  };

  it("acepta un payload valido", () => {
    const parsed = rumEventPayloadSchema.safeParse(base);
    expect(parsed.success).toBe(true);
  });

  it("aplica default has_consent=true", () => {
    const parsed = rumEventPayloadSchema.safeParse(base);
    if (parsed.success) {
      expect(parsed.data.has_consent).toBe(true);
    }
  });

  it("rechaza app no registrada", () => {
    const parsed = rumEventPayloadSchema.safeParse({
      ...base,
      app: "app-fantasma",
    });
    expect(parsed.success).toBe(false);
  });

  it("rechaza session_id_anon invalido (TC-LOG-RUM-004)", () => {
    const parsed = rumEventPayloadSchema.safeParse({
      ...base,
      session_id_anon: "no-es-hex",
    });
    expect(parsed.success).toBe(false);
  });

  it("rechaza session_id_anon demasiado corto", () => {
    const parsed = rumEventPayloadSchema.safeParse({
      ...base,
      session_id_anon: "a1b2c3",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("payload de vital (TC-LOG-RUM-003)", () => {
  const base = {
    app: "misal",
    page_path: "/",
    metric_name: "LCP",
    metric_value: 1840,
    rating: "good",
    session_id_anon: validSessionId,
  };

  it("acepta un vital valido", () => {
    const parsed = rumVitalPayloadSchema.safeParse(base);
    expect(parsed.success).toBe(true);
  });

  it("rechaza metric_name invalido (TC-LOG-RUM-015)", () => {
    const parsed = rumVitalPayloadSchema.safeParse({
      ...base,
      metric_name: "TTI",
    });
    expect(parsed.success).toBe(false);
  });

  it("rechaza rating invalido", () => {
    const parsed = rumVitalPayloadSchema.safeParse({
      ...base,
      rating: "excelente",
    });
    expect(parsed.success).toBe(false);
  });

  it("rechaza valor negativo", () => {
    const parsed = rumVitalPayloadSchema.safeParse({
      ...base,
      metric_value: -5,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("deteccion de PII (TC-LOG-RUM-014)", () => {
  it("detecta email en metadata", () => {
    const violations = findPiiViolations({ autor: "juan@ejemplo.com" });
    expect(violations.length).toBeGreaterThan(0);
  });

  it("detecta IPv4 en metadata", () => {
    const violations = findPiiViolations({ origen: "192.168.1.100" });
    expect(violations.length).toBeGreaterThan(0);
  });

  it("detecta IPv6 en metadata", () => {
    const violations = findPiiViolations({
      origen: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
    });
    expect(violations.length).toBeGreaterThan(0);
  });

  it("detecta DNI con separadores en metadata", () => {
    const violations = findPiiViolations({ documento: "12.345.678" });
    expect(violations.length).toBeGreaterThan(0);
  });

  it("detecta PII en objetos anidados", () => {
    const violations = findPiiViolations({
      contexto: { usuario: { contacto: "ana@test.com.ar" } },
    });
    expect(violations).toContain("contexto.usuario.contacto");
  });

  it("no marca metadata limpia", () => {
    const violations = findPiiViolations({
      lectura: "mc 5,1-12",
      version: "RVA",
      duracionMs: 1840,
      capitulo: 5,
    });
    expect(violations).toEqual([]);
  });

  it("no marca valores numericos aunque parezcan 8 digitos", () => {
    const violations = findPiiViolations({ contador: 12345678 });
    expect(violations).toEqual([]);
  });

  it("ignora null y undefined", () => {
    const violations = findPiiViolations({ a: null, b: undefined });
    expect(violations).toEqual([]);
  });
});

describe("sampling (TC-LOG-RUM-005)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("con custom_sampling=0 nunca envia eventos custom", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(
      samplingAllows(
        { ...DEFAULT_SAMPLING, custom: 0 },
        "misal.lectio.started",
      ),
    ).toBe(false);
  });

  it("con custom_sampling=1 siempre envia eventos custom", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.01);
    expect(
      samplingAllows(
        { ...DEFAULT_SAMPLING, custom: 1 },
        "misal.lectio.started",
      ),
    ).toBe(true);
  });

  it("pageview usa el bucket pageview", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(
      samplingAllows({ pageview: 1, custom: 0, error: 0 }, "pageview"),
    ).toBe(true);
    expect(
      samplingAllows({ pageview: 0, custom: 1, error: 1 }, "pageview"),
    ).toBe(false);
  });

  it("frontend.error usa el bucket error", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(
      samplingAllows({ pageview: 0, custom: 1, error: 1 }, "frontend.error"),
    ).toBe(true);
    expect(
      samplingAllows({ pageview: 1, custom: 1, error: 0 }, "frontend.error"),
    ).toBe(false);
  });

  it("defaults: 100% pageview/errores, 10% custom (RB-LOG-RUM-003)", () => {
    expect(DEFAULT_SAMPLING).toEqual({
      pageview: 1,
      custom: 0.1,
      error: 1,
    });
  });
});

describe("limites de metadata", () => {
  it("constante por debajo del tope de DB y razonable", () => {
    expect(METADATA_MAX_BYTES).toBe(8192);
  });
});
