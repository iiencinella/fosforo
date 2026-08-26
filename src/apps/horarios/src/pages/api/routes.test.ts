import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SearchDataSource } from "@/types/horarios";

const getSearchDataSourceMock = vi.fn();

vi.mock("@/lib/repository", () => ({
  getSearchDataSource: () => getSearchDataSourceMock(),
}));

vi.mock("@/lib/log", () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { GET as celebracionesGET } from "@/pages/api/celebraciones";
import { GET as templosGET } from "@/pages/api/templos/[id]";

function buildSource(): SearchDataSource {
  return {
    temples: [
      {
        id: "santa-teresita-parana",
        name: "Parroquia Santa Teresita",
        city: "Parana",
        province: "Entre Rios",
        address: "Av. Almafuerte 420",
        lat: -31.7424,
        lng: -60.5238,
        status: "updated",
      },
      {
        id: "san-vicente-mendoza",
        name: "Parroquia San Vicente Ferrer",
        city: "Mendoza",
        province: "Mendoza",
        address: "Belgrano 240",
        lat: -32.8898,
        lng: -68.8454,
        status: "stale",
      },
    ],
    celebrations: [
      {
        id: "stp-sunday-0930",
        templeId: "santa-teresita-parana",
        type: "misa",
        weekday: "sunday",
        startTime: "09:30",
        durationMin: 60,
      },
      {
        id: "svm-sunday-1930",
        templeId: "san-vicente-mendoza",
        type: "misa",
        weekday: "sunday",
        startTime: "19:30",
        durationMin: 55,
      },
    ],
  };
}

beforeEach(() => {
  getSearchDataSourceMock.mockReset();
});

describe("TC-0106-HORARIOS-002 - GET /api/celebraciones", () => {
  it("retorna lista paginada con metadatos de paginacion", async () => {
    getSearchDataSourceMock.mockResolvedValue(buildSource());

    const response = await celebracionesGET({
      url: new URL("https://horarios.test/api/celebraciones?page=1&pageSize=1"),
    } as never);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.items).toHaveLength(1);
    expect(body.total).toBe(2);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(1);
    expect(body.hasNextPage).toBe(true);
  });

  it("retorna contrato vacio sin resultados (estado empty)", async () => {
    getSearchDataSourceMock.mockResolvedValue({
      temples: [],
      celebrations: [],
    });

    const response = await celebracionesGET({
      url: new URL("https://horarios.test/api/celebraciones?q=nowhere"),
    } as never);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items).toEqual([]);
    expect(body.total).toBe(0);
    expect(body.hasNextPage).toBe(false);
  });

  it("rechaza query invalida con 400 y codigo dedicado", async () => {
    const response = await celebracionesGET({
      url: new URL("https://horarios.test/api/celebraciones?type=invalido"),
    } as never);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.code).toBe("HORARIOS_INVALID_QUERY");
  });

  it("degrada a 500 si el repositorio falla", async () => {
    getSearchDataSourceMock.mockRejectedValue(new Error("supabase down"));

    const response = await celebracionesGET({
      url: new URL("https://horarios.test/api/celebraciones"),
    } as never);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.code).toBe("HORARIOS_SEARCH_ERROR");
  });
});

describe("TC-0106-HORARIOS-005b - GET /api/templos/{id}", () => {
  it("retorna ficha completa del templo", async () => {
    getSearchDataSourceMock.mockResolvedValue(buildSource());

    const response = await templosGET({
      params: { id: "santa-teresita-parana" },
    } as never);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.temple.id).toBe("santa-teresita-parana");
    expect(body.schedule).toHaveLength(1);
    expect(body.liturgicalLinks.length).toBeGreaterThan(0);
  });

  it("retorna 404 para templos inexistentes", async () => {
    getSearchDataSourceMock.mockResolvedValue(buildSource());

    const response = await templosGET({
      params: { id: "fantasma" },
    } as never);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.code).toBe("HORARIOS_TEMPLE_NOT_FOUND");
  });

  it("retorna 400 cuando falta el id", async () => {
    const response = await templosGET({ params: {} } as never);

    expect(response.status).toBe(400);
  });
});
