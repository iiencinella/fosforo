import { describe, expect, it } from "vitest";
import {
  buildFunnel,
  buildVitalsSummary,
  funnelParamsSchema,
  HOURS_MAX,
  type RumFunnelCountRow,
  type RumVitalsDistributionRow,
} from "@/lib/rum-metrics";

describe("buildFunnel (TC-LOG-RUM-011, CA-LOG-RUM-002)", () => {
  const events = ["pageview", "misal.lectio.started", "misal.lectio.completed"];

  it("calcula porcentajes sobre el primer paso y sobre el previo", () => {
    const counts: RumFunnelCountRow[] = [
      { event_name: "pageview", sessions: 1000 },
      { event_name: "misal.lectio.started", sessions: 400 },
      { event_name: "misal.lectio.completed", sessions: 120 },
    ];

    const steps = buildFunnel(events, counts);

    expect(steps).toEqual([
      {
        step: 1,
        event_name: "pageview",
        sessions: 1000,
        pctOfFirst: 100,
        pctOfPrev: 100,
        dropoff: 0,
      },
      {
        step: 2,
        event_name: "misal.lectio.started",
        sessions: 400,
        pctOfFirst: 40,
        pctOfPrev: 40,
        dropoff: 600,
      },
      {
        step: 3,
        event_name: "misal.lectio.completed",
        sessions: 120,
        pctOfFirst: 12,
        pctOfPrev: 30,
        dropoff: 280,
      },
    ]);
  });

  it("con el primer paso en cero, los porcentajes son cero y no divide por cero", () => {
    const counts: RumFunnelCountRow[] = [
      { event_name: "pageview", sessions: 0 },
      { event_name: "misal.lectio.started", sessions: 5 },
    ];

    const steps = buildFunnel(events, counts);

    expect(steps[0]?.pctOfFirst).toBe(0);
    expect(steps[1]?.pctOfFirst).toBe(0);
    expect(steps[1]?.pctOfPrev).toBe(0);
    expect(steps[1]?.sessions).toBe(5);
  });

  it("con eventos sin datos (sin filas del RPC) completa con ceros", () => {
    const steps = buildFunnel(events, []);

    expect(steps.map((step) => step.sessions)).toEqual([0, 0, 0]);
    expect(steps[0]?.pctOfFirst).toBe(0);
  });

  it("redondea porcentajes a un decimal", () => {
    const counts: RumFunnelCountRow[] = [
      { event_name: "pageview", sessions: 3 },
      { event_name: "misal.lectio.started", sessions: 1 },
    ];

    const steps = buildFunnel(events.slice(0, 2), counts);

    expect(steps[1]?.pctOfFirst).toBe(33.3);
    expect(steps[1]?.pctOfPrev).toBe(33.3);
  });
});

describe("buildVitalsSummary", () => {
  const rows: RumVitalsDistributionRow[] = [
    { metric_name: "LCP", rating: "good", count: 75 },
    { metric_name: "LCP", rating: "needs-improvement", count: 20 },
    { metric_name: "LCP", rating: "poor", count: 5 },
    { metric_name: "INP", rating: "good", count: 9 },
    { metric_name: "INP", rating: "poor", count: 1 },
  ];

  it("agrega good% y total por metrica", () => {
    const summary = buildVitalsSummary(rows);

    expect(summary).toEqual([
      { metric_name: "LCP", goodPct: 75, total: 100 },
      { metric_name: "INP", goodPct: 90, total: 10 },
    ]);
  });

  it("con cero muestras devuelve lista vacia", () => {
    expect(buildVitalsSummary([])).toEqual([]);
  });
});

describe("validacion de params (TC-LOG-RUM-015)", () => {
  it("funnel exige entre 2 y 5 eventos", () => {
    expect(
      funnelParamsSchema.safeParse({ events: "pageview,misal.lectio.started" })
        .success,
    ).toBe(true);
    expect(funnelParamsSchema.safeParse({ events: "solo.uno" }).success).toBe(
      false,
    );
    expect(
      funnelParamsSchema.safeParse({
        events: "a.b,c.d,e.f,g.h,i.j,k.l",
      }).success,
    ).toBe(false);
  });

  it("funnel parsea y limpia la lista de eventos", () => {
    const parsed = funnelParamsSchema.safeParse({
      events: " pageview , misal.lectio.started ,",
    });
    if (parsed.success) {
      expect(parsed.data.events).toEqual(["pageview", "misal.lectio.started"]);
    }
  });

  it("limita la ventana de horas", () => {
    expect(HOURS_MAX).toBe(168);
    expect(
      funnelParamsSchema.safeParse({ events: "a.b,c.d", hours: 1000 }).success,
    ).toBe(false);
    expect(
      funnelParamsSchema.safeParse({ events: "a.b,c.d", hours: 24 }).success,
    ).toBe(true);
  });
});
