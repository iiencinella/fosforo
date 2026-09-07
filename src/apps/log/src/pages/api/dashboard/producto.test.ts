import { beforeEach, describe, expect, it, vi } from "vitest";

const requireRoleMock = vi.hoisted(() => vi.fn());

const metricsMocks = vi.hoisted(() => ({
  getTopPages: vi.fn(),
  getVitalsDistribution: vi.fn(),
  getDailySessions: vi.fn(),
  getEventsByApp: vi.fn(),
  getFunnelCounts: vi.fn(),
  buildFunnel: vi.fn(),
  buildVitalsSummary: vi.fn(),
}));

vi.mock("@/lib/authz", () => ({
  requireRole: requireRoleMock,
  requireSession: vi.fn(),
}));

vi.mock("@/lib/rum-metrics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rum-metrics")>();
  return {
    ...actual,
    getTopPages: metricsMocks.getTopPages,
    getVitalsDistribution: metricsMocks.getVitalsDistribution,
    getDailySessions: metricsMocks.getDailySessions,
    getEventsByApp: metricsMocks.getEventsByApp,
    getFunnelCounts: metricsMocks.getFunnelCounts,
  };
});

import { GET as getSummary } from "@/pages/api/dashboard/producto";
import { GET as getFunnel } from "@/pages/api/dashboard/producto/funnel";
import { GET as getRetention } from "@/pages/api/dashboard/producto/retention";

beforeEach(() => {
  requireRoleMock.mockReset();
  metricsMocks.getTopPages.mockReset();
  metricsMocks.getVitalsDistribution.mockReset();
  metricsMocks.getDailySessions.mockReset();
  metricsMocks.getEventsByApp.mockReset();
  metricsMocks.getFunnelCounts.mockReset();
  metricsMocks.buildFunnel.mockReset();
  metricsMocks.buildVitalsSummary.mockReset();

  // por defecto: acceso permitido y datos vacios
  requireRoleMock.mockResolvedValue({ role: "product" });
  metricsMocks.getTopPages.mockResolvedValue([]);
  metricsMocks.getVitalsDistribution.mockResolvedValue([]);
  metricsMocks.getDailySessions.mockResolvedValue([]);
  metricsMocks.getEventsByApp.mockResolvedValue([]);
  metricsMocks.getFunnelCounts.mockResolvedValue([]);
  metricsMocks.buildFunnel.mockImplementation(
    (
      events: string[],
      counts: Array<{ event_name: string; sessions: number }>,
    ) =>
      events.map((event_name, index) => ({
        step: index + 1,
        event_name,
        sessions: counts[index]?.sessions ?? 0,
        pctOfFirst: 0,
        pctOfPrev: 0,
        dropoff: 0,
      })),
  );
  metricsMocks.buildVitalsSummary.mockImplementation(
    (rows: Array<{ metric_name: string; rating: string; count: number }>) => {
      const byMetric = new Map<string, { good: number; total: number }>();
      for (const row of rows) {
        const entry = byMetric.get(row.metric_name) ?? { good: 0, total: 0 };
        entry.total += row.count;
        if (row.rating === "good") entry.good += row.count;
        byMetric.set(row.metric_name, entry);
      }
      return Array.from(byMetric.entries()).map(([metric_name, entry]) => ({
        metric_name,
        total: entry.total,
        goodPct: entry.total > 0 ? (entry.good / entry.total) * 100 : 0,
      }));
    },
  );
});

describe("acceso al dashboard de producto (RB-LOG-RUM-004, TC-LOG-RUM-012)", () => {
  it.each([
    ["producto", getSummary],
    ["funnel", getFunnel],
    ["retention", getRetention],
  ] as const)("%s: 403 sin rol autorizado", async (_name, handler) => {
    requireRoleMock.mockRejectedValue(new Error("LOG_ACCESS_DENIED"));

    const response = await handler({
      request: new Request("http://localhost/api/dashboard/producto"),
      url: new URL("http://localhost/api/dashboard/producto"),
    } as never);

    expect(response.status).toBe(403);
  });

  it.each([
    ["dev", getSummary],
    ["ops", getSummary],
    ["product", getSummary],
  ] as const)(
    "%s puede acceder al resumen de producto",
    async (_role, handler) => {
      requireRoleMock.mockResolvedValue({ role: "dev" });

      const response = await handler({
        request: new Request("http://localhost/api/dashboard/producto"),
        url: new URL("http://localhost/api/dashboard/producto"),
      } as never);

      expect(response.status).toBe(200);
      const json = (await response.json()) as { ok: boolean };
      expect(json.ok).toBe(true);
    },
  );
});

describe("GET /api/dashboard/producto", () => {
  it("devuelve resumen con top pages, vitals, daily y por app", async () => {
    metricsMocks.getTopPages.mockResolvedValue([
      { page_path: "/", count: 500 },
    ]);
    metricsMocks.getVitalsDistribution.mockResolvedValue([
      { metric_name: "LCP", rating: "good", count: 90 },
      { metric_name: "LCP", rating: "poor", count: 10 },
    ]);
    metricsMocks.getDailySessions.mockResolvedValue([
      { day: "2026-09-01", sessions: 40, pageviews: 120 },
    ]);
    metricsMocks.getEventsByApp.mockResolvedValue([
      { app: "misal", count: 300 },
    ]);

    const response = await getSummary({
      request: new Request("http://localhost/api/dashboard/producto"),
      url: new URL("http://localhost/api/dashboard/producto"),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      ok: boolean;
      topPages: Array<{ page_path: string; count: number }>;
      summary: { vitals: Array<{ metric_name: string; goodPct: number }> };
      dailySessions: Array<{ day: string }>;
      eventsByApp: Array<{ app: string }>;
    };
    expect(json.ok).toBe(true);
    expect(json.topPages[0]?.count).toBe(500);
    expect(json.summary.vitals[0]?.goodPct).toBe(90);
    expect(json.dailySessions[0]?.day).toBe("2026-09-01");
    expect(json.eventsByApp[0]?.app).toBe("misal");
  });

  it("propaga el filtro de app y ventana a las consultas", async () => {
    const url = new URL(
      "http://localhost/api/dashboard/producto?app=misal&hours=24",
    );

    await getSummary({
      request: new Request(url),
      url,
    } as never);

    expect(metricsMocks.getTopPages).toHaveBeenCalledWith(24, "misal");
    expect(metricsMocks.getVitalsDistribution).toHaveBeenCalledWith(
      24,
      "misal",
    );
    expect(metricsMocks.getDailySessions).toHaveBeenCalledWith(30, "misal");
    expect(metricsMocks.getEventsByApp).toHaveBeenCalledWith(24);
  });

  it("rechaza params invalidos con 422", async () => {
    const url = new URL("http://localhost/api/dashboard/producto?hours=1000");

    const response = await getSummary({
      request: new Request(url),
      url,
    } as never);

    expect(response.status).toBe(422);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("RUM_INVALID_PARAMS");
  });
});

describe("GET /api/dashboard/producto/funnel (CA-LOG-RUM-002)", () => {
  it("devuelve pasos de embudo con porcentajes", async () => {
    metricsMocks.getFunnelCounts.mockResolvedValue([
      { event_name: "pageview", sessions: 100 },
      { event_name: "misal.lectio.started", sessions: 40 },
    ]);

    const url = new URL(
      "http://localhost/api/dashboard/producto/funnel?events=pageview,misal.lectio.started",
    );
    const response = await getFunnel({
      request: new Request(url),
      url,
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      ok: boolean;
      steps: Array<{ event_name: string; sessions: number }>;
    };
    expect(json.ok).toBe(true);
    expect(json.steps).toHaveLength(2);
    expect(json.steps[0]?.sessions).toBe(100);
    expect(json.steps[1]?.sessions).toBe(40);
  });

  it("rechaza embudos con menos de 2 eventos", async () => {
    const url = new URL(
      "http://localhost/api/dashboard/producto/funnel?events=solo.uno",
    );
    const response = await getFunnel({
      request: new Request(url),
      url,
    } as never);

    expect(response.status).toBe(422);
  });

  it("rechaza embudos con mas de 5 eventos", async () => {
    const url = new URL(
      "http://localhost/api/dashboard/producto/funnel?events=a.b,c.d,e.f,g.h,i.j,k.l",
    );
    const response = await getFunnel({
      request: new Request(url),
      url,
    } as never);

    expect(response.status).toBe(422);
  });
});

describe("GET /api/dashboard/producto/retention", () => {
  it("devuelve la serie diaria con ventana en dias", async () => {
    metricsMocks.getDailySessions.mockResolvedValue([
      { day: "2026-09-01", sessions: 40, pageviews: 120 },
      { day: "2026-09-02", sessions: 55, pageviews: 180 },
    ]);

    const url = new URL(
      "http://localhost/api/dashboard/producto/retention?days=14",
    );
    const response = await getRetention({
      request: new Request(url),
      url,
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      ok: boolean;
      days: number;
      dailySessions: Array<{ day: string; sessions: number }>;
    };
    expect(json.ok).toBe(true);
    expect(json.days).toBe(14);
    expect(json.dailySessions).toHaveLength(2);
    expect(metricsMocks.getDailySessions).toHaveBeenCalledWith(14, undefined);
  });

  it("rechaza dias fuera de rango", async () => {
    const url = new URL(
      "http://localhost/api/dashboard/producto/retention?days=400",
    );
    const response = await getRetention({
      request: new Request(url),
      url,
    } as never);

    expect(response.status).toBe(422);
  });
});
