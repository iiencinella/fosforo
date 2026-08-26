import { describe, expect, it } from "vitest";
import {
  parseSearchParams,
  searchCelebrationsFromSource,
  getTempleDetailFromSource,
} from "@/lib/search";
import type { SearchDataSource } from "@/types/horarios";

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
        id: "stp-thursday-1800",
        templeId: "santa-teresita-parana",
        type: "adoracion",
        weekday: "thursday",
        startTime: "18:00",
        durationMin: 45,
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

const baseParams = { page: 1, pageSize: 12, sort: "relevance" } as const;

describe("TC-0106-HORARIOS-001 - normaliza query de busqueda", () => {
  it("encuentra templos ignorando acentos y mayusculas", () => {
    const result = searchCelebrationsFromSource(buildSource(), {
      ...baseParams,
      q: "SANTA teresita",
      sort: "relevance",
    });

    expect(result.total).toBe(1);
    expect(result.items[0]?.templeId).toBe("santa-teresita-parana");
  });

  it("busca tambien por direccion normalizada", () => {
    const result = searchCelebrationsFromSource(buildSource(), {
      ...baseParams,
      q: "almafuerte",
      sort: "relevance",
    });

    expect(result.items.map((item) => item.templeId)).toContain(
      "santa-teresita-parana",
    );
  });
});

describe("TC-0106-HORARIOS-003 - filtro por tipo", () => {
  it("retorna solo celebraciones del tipo pedido", () => {
    const result = searchCelebrationsFromSource(buildSource(), {
      ...baseParams,
      type: "misa",
    });

    expect(result.total).toBe(2);
    for (const item of result.items) {
      expect(item.nextCelebration.type).toBe("misa");
    }
  });
});

describe("TC-0106-HORARIOS-004 - franja horaria y casos limite", () => {
  it("morning excluye la celebracion de las 18:00", () => {
    const result = searchCelebrationsFromSource(buildSource(), {
      ...baseParams,
      range: "morning",
    });

    // Solo Santa Teresita tiene celebracion matutina (09:30).
    expect(result.total).toBe(1);
    expect(result.items[0]?.templeId).toBe("santa-teresita-parana");
    expect(
      result.items.some((item) => item.nextCelebration.type === "adoracion"),
    ).toBe(false);
  });

  it("evening incluye 18:00 en adelante", () => {
    const result = searchCelebrationsFromSource(buildSource(), {
      ...baseParams,
      range: "evening",
    });

    const adoracion = result.items.find(
      (item) => item.nextCelebration.type === "adoracion",
    );
    expect(adoracion?.nextCelebration.startTime).toBe("18:00");
  });

  it("afternoon cubre 12:00 a 17:59", () => {
    const source = buildSource();
    source.celebrations.push({
      id: "stp-midday",
      templeId: "santa-teresita-parana",
      type: "misa",
      weekday: "wednesday",
      startTime: "12:00",
      durationMin: 50,
    });

    const result = searchCelebrationsFromSource(source, {
      ...baseParams,
      range: "afternoon",
    });

    expect(result.total).toBe(1);
    expect(result.items[0]?.nextCelebration.startTime).toBe("12:00");
  });

  it("conserva la fecha solicitada en filtros aplicados", () => {
    const result = searchCelebrationsFromSource(buildSource(), {
      ...baseParams,
      date: "2026-08-25",
    });

    expect(result.filtersApplied.date).toBe("2026-08-25");
  });
});

describe("TC-0106-HORARIOS-006 - estado de actualizacion por templo", () => {
  it("propaga el estado del templo al item de resultado", () => {
    const result = searchCelebrationsFromSource(buildSource(), {
      ...baseParams,
    });

    const estados = new Map(
      result.items.map((item) => [item.templeId, item.status]),
    );
    expect(estados.get("santa-teresita-parana")).toBe("updated");
    expect(estados.get("san-vicente-mendoza")).toBe("stale");
  });
});

describe("TC-0106-HORARIOS-007 - orden por cercania", () => {
  it("ordena por distancia haversine cuando hay geolocalizacion", () => {
    // Posicion en Parana, mas cerca de Santa Teresita que de Mendoza.
    const result = searchCelebrationsFromSource(buildSource(), {
      ...baseParams,
      sort: "nearby",
      lat: -31.74,
      lng: -60.52,
    });

    expect(result.items[0]?.templeId).toBe("santa-teresita-parana");
    expect(result.items[0]?.distanceKm).toBeDefined();
    expect(result.items[0]?.distanceKm ?? 0).toBeLessThan(
      result.items[1]?.distanceKm ?? Number.POSITIVE_INFINITY,
    );
  });

  it("envia al final los templos sin distancia calculada", () => {
    const result = searchCelebrationsFromSource(buildSource(), {
      ...baseParams,
      sort: "nearby",
    });

    expect(result.items.at(-1)?.distanceKm).toBeUndefined();
  });
});

describe("TC-0106-HORARIOS-009 - composicion de filtros en AND", () => {
  it("aplica query, ciudad, tipo y franja simultaneamente", () => {
    const result = searchCelebrationsFromSource(buildSource(), {
      ...baseParams,
      q: "teresita",
      city: "parana",
      type: "misa",
      range: "morning",
    });

    expect(result.total).toBe(1);
    expect(result.items[0]?.matchingCelebrations).toBe(1);
    expect(result.filtersApplied.sort).toBe("relevance");
  });

  it("descarta templos que cumplen un solo criterio", () => {
    const result = searchCelebrationsFromSource(buildSource(), {
      ...baseParams,
      city: "mendoza",
      type: "adoracion",
    });

    expect(result.total).toBe(0);
  });
});

describe("TC-0106-HORARIOS-010 - rechazo de parametros invalidos", () => {
  it("rechaza un tipo desconocido", () => {
    const params = new URLSearchParams({ type: "bautismo" });
    expect(() => parseSearchParams(params)).toThrow();
  });

  it("rechaza una fecha con formato invalido", () => {
    const params = new URLSearchParams({ date: "25-08-2026" });
    expect(() => parseSearchParams(params)).toThrow();
  });

  it("rechaza coordenadas fuera de rango", () => {
    const params = new URLSearchParams({ lat: "-91" });
    expect(() => parseSearchParams(params)).toThrow();
  });

  it("normaliza pagina y tamano invalidos sin rechazar", () => {
    const params = new URLSearchParams({ page: "0", pageSize: "999" });
    const parsed = parseSearchParams(params);

    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(12);
  });
});

describe("TC-0106-HORARIOS-005 - detalle de templo", () => {
  it("retorna ficha completa con agenda ordenada", () => {
    const detail = getTempleDetailFromSource(
      buildSource(),
      "santa-teresita-parana",
    );

    expect(detail?.temple.name).toBe("Parroquia Santa Teresita");
    expect(detail?.schedule[0]?.weekday).toBe("thursday");
    expect(detail?.liturgicalLinks.length).toBeGreaterThan(0);
  });

  it("retorna null para ids inexistentes", () => {
    expect(getTempleDetailFromSource(buildSource(), "no-existe")).toBeNull();
  });
});
