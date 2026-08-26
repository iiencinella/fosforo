import { beforeEach, describe, expect, it, vi } from "vitest";

const { getBibliaEnvMock } = vi.hoisted(() => ({
  getBibliaEnvMock: vi.fn(),
}));

vi.mock("@repo/env", () => ({
  getBibliaEnv: () => getBibliaEnvMock(),
}));

vi.mock("@/lib/log", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

/**
 * El endpoint lee la clave una unica vez al cargar el modulo, por lo que cada
 * caso reimporta la ruta con el entorno ya configurado.
 */
async function loadPost(): Promise<(ctx: never) => Promise<Response>> {
  vi.resetModules();
  const mod = await import("@/pages/api/internal/ingestion/run");
  return mod.POST as never;
}

function postRequest(init?: { bearer?: string; headerKey?: string }): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (init?.bearer) headers.set("authorization", `Bearer ${init.bearer}`);
  if (init?.headerKey) headers.set("x-biblia-ingestion-key", init.headerKey);
  return new Request("https://biblia.test/api/internal/ingestion/run", {
    method: "POST",
    headers,
    body: JSON.stringify({ source: "ewtn" }),
  });
}

beforeEach(() => {
  getBibliaEnvMock.mockReset();
});

describe("contrato de ingesta interna de biblia", () => {
  it("falla cerrado con 503 si la clave no esta configurada en el entorno", async () => {
    getBibliaEnvMock.mockReturnValue(undefined);
    const POST = await loadPost();

    const response = await POST({
      request: postRequest({ headerKey: "lo-que-sea" }),
    } as never);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("BIBLIA_INGESTION_KEY_NOT_CONFIGURED");
  });

  it("rechaza con 401 cuando no se envia credencial", async () => {
    getBibliaEnvMock.mockReturnValue({ ingestionKey: "clave-segura" });
    const POST = await loadPost();

    const response = await POST({ request: postRequest() } as never);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("BIBLIA_INGESTION_UNAUTHORIZED");
  });

  it("rechaza con 403 una credencial invalida via header dedicado", async () => {
    getBibliaEnvMock.mockReturnValue({ ingestionKey: "clave-segura" });
    const POST = await loadPost();

    const response = await POST({
      request: postRequest({ headerKey: "incorrecta" }),
    } as never);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.code).toBe("BIBLIA_INGESTION_UNAUTHORIZED");
  });

  it("acepta credencial valida via header x-biblia-ingestion-key", async () => {
    getBibliaEnvMock.mockReturnValue({ ingestionKey: "clave-segura" });
    const POST = await loadPost();

    const response = await POST({
      request: postRequest({ headerKey: "clave-segura" }),
    } as never);
    const body = await response.json();

    // La ingesta automatica sigue deshabilitada: la ruta autentica pero
    // responde manual-only hasta habilitar el pipeline.
    expect(response.status).toBe(501);
    expect(body.code).toBe("BIBLIA_INGESTION_MANUAL_ONLY");
  });

  it("acepta credencial valida via Authorization Bearer", async () => {
    getBibliaEnvMock.mockReturnValue({ ingestionKey: "clave-segura" });
    const POST = await loadPost();

    const response = await POST({
      request: postRequest({ bearer: "clave-segura" }),
    } as never);
    const body = await response.json();

    expect(response.status).toBe(501);
    expect(body.code).toBe("BIBLIA_INGESTION_MANUAL_ONLY");
  });
});
