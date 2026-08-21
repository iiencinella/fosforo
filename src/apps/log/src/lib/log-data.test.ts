import { describe, expect, it } from "vitest";
import {
  formatLogMetadata,
  getAlertSummary,
  getDashboardMetrics,
  logIngestPayloadSchema,
  logLevelSchema,
  queryLogs,
  type LogEntry,
} from "@/lib/log-data";

const baseLogs: LogEntry[] = [
  {
    id: "a",
    app: "portal",
    level: "error",
    message: "timeout",
    timestamp: new Date("2026-05-26T10:00:00.000Z").toISOString(),
  },
  {
    id: "b",
    app: "portal",
    level: "info",
    message: "ok",
    timestamp: new Date("2026-05-26T10:01:00.000Z").toISOString(),
  },
  {
    id: "c",
    app: "biblia",
    level: "warn",
    message: "fallback",
    timestamp: new Date("2026-05-26T10:02:00.000Z").toISOString(),
  },
];

describe("logIngestPayloadSchema", () => {
  it("accepts valid payload", () => {
    const parsed = logIngestPayloadSchema.safeParse({
      app: "portal",
      level: "error",
      message: "timeout",
      timestamp: new Date().toISOString(),
      metadata: { endpoint: "/api/x" },
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid level", () => {
    const parsed = logIngestPayloadSchema.safeParse({
      app: "portal",
      level: "critical",
      message: "x",
    });

    expect(parsed.success).toBe(false);
  });

  it("TC-002: rejects invalid payload with issue detail", () => {
    const parsed = logIngestPayloadSchema.safeParse({
      app: "portal",
      level: "error",
      message: "",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.length).toBeGreaterThan(0);
    }
  });

  it("TC-003/016: requires app, level and message fields", () => {
    for (const field of ["app", "level", "message"] as const) {
      const payload = {
        app: "portal",
        level: "error",
        message: "timeout",
      };
      delete payload[field];

      const parsed = logIngestPayloadSchema.safeParse(payload);
      expect(parsed.success, `field ${field} should be required`).toBe(false);
    }
  });

  it("TC-017: accepts only the five valid severity levels", () => {
    for (const level of ["debug", "info", "warn", "error", "fatal"]) {
      expect(logLevelSchema.safeParse(level).success).toBe(true);
    }

    for (const level of ["critical", "trace", "ERROR", "", "warning"]) {
      expect(logLevelSchema.safeParse(level).success).toBe(false);
    }
  });
});

describe("queryLogs", () => {
  it("filters by level", () => {
    const result = queryLogs(baseLogs, { level: "error", page: 1, limit: 50 });

    expect(result.total).toBe(1);
    expect(result.data[0]?.id).toBe("a");
  });

  it("filters by search", () => {
    const result = queryLogs(baseLogs, { search: "fall", page: 1, limit: 50 });

    expect(result.total).toBe(1);
    expect(result.data[0]?.id).toBe("c");
  });

  it("TC-008: filters by app", () => {
    const result = queryLogs(baseLogs, { app: "portal", page: 1, limit: 50 });

    expect(result.total).toBe(2);
    expect(result.data.every((item) => item.app === "portal")).toBe(true);
  });

  it("TC-009: filters by date range (since/until)", () => {
    const result = queryLogs(baseLogs, {
      since: "2026-05-26T10:01:00.000Z",
      until: "2026-05-26T10:01:30.000Z",
      page: 1,
      limit: 50,
    });

    expect(result.total).toBe(1);
    expect(result.data[0]?.id).toBe("b");
  });

  it("TC-006: paginates with total count across pages", () => {
    const manyLogs: LogEntry[] = Array.from({ length: 120 }, (_, index) => ({
      id: `log-${index}`,
      app: "portal",
      level: "info",
      message: `m-${index}`,
      timestamp: new Date(Date.now() - index * 1000).toISOString(),
    }));

    const page1 = queryLogs(manyLogs, { page: 1, limit: 50 });
    const page2 = queryLogs(manyLogs, { page: 2, limit: 50 });
    const page3 = queryLogs(manyLogs, { page: 3, limit: 50 });

    expect(page1.total).toBe(120);
    expect(page1.data.length).toBe(50);
    expect(page2.data.length).toBe(50);
    expect(page3.data.length).toBe(20);
    expect(page1.data[0]?.id).not.toBe(page2.data[0]?.id);
  });

  it("respects pagination limit cap", () => {
    const result = queryLogs(baseLogs, { page: 1, limit: 999 });

    expect(result.limit).toBe(50);
  });
});

describe("getAlertSummary", () => {
  it("triggers alert over threshold", () => {
    const now = Date.now();
    const noisy: LogEntry[] = Array.from({ length: 11 }, (_, index) => ({
      id: String(index),
      app: "portal",
      level: "error",
      message: `e-${index}`,
      timestamp: new Date(now - index * 1000).toISOString(),
    }));

    const summary = getAlertSummary(noisy);
    expect(summary.triggered.length).toBe(1);
    expect(summary.triggered[0]?.app).toBe("portal");
  });
});

describe("getDashboardMetrics", () => {
  it("TC-012: computes totals, 24h errors and top apps", () => {
    const now = Date.now();
    const logs: LogEntry[] = [
      {
        id: "1",
        app: "portal",
        level: "error",
        message: "a",
        timestamp: new Date(now - 1000).toISOString(),
      },
      {
        id: "2",
        app: "portal",
        level: "fatal",
        message: "b",
        timestamp: new Date(now - 2000).toISOString(),
      },
      {
        id: "3",
        app: "biblia",
        level: "info",
        message: "c",
        timestamp: new Date(now - 3000).toISOString(),
      },
      {
        id: "4",
        app: "biblia",
        level: "warn",
        message: "d",
        timestamp: new Date(now - 4000).toISOString(),
      },
      // Fuera de ventana 24h: no cuenta para errores 24h.
      {
        id: "5",
        app: "portal",
        level: "error",
        message: "e",
        timestamp: new Date(now - 25 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const metrics = getDashboardMetrics(logs);

    expect(metrics.totalLogs).toBe(5);
    expect(metrics.errorCount24h).toBe(2);
    expect(metrics.topApps[0]).toEqual({ app: "portal", count: 3 });
    expect(metrics.topApps[1]).toEqual({ app: "biblia", count: 2 });
    expect(metrics.errorRate).toBeCloseTo((2 / 5) * 100, 5);
  });

  it("TC-012: returns empty metrics without logs", () => {
    const metrics = getDashboardMetrics([]);

    expect(metrics.totalLogs).toBe(0);
    expect(metrics.errorCount24h).toBe(0);
    expect(metrics.errorRate).toBe(0);
    expect(metrics.topApps).toEqual([]);
  });
});

describe("formatLogMetadata", () => {
  it("TC-011: formats metadata as pretty JSON", () => {
    const formatted = formatLogMetadata({ endpoint: "/api/x", retries: 2 });

    expect(formatted).toBe(
      JSON.stringify({ endpoint: "/api/x", retries: 2 }, null, 2),
    );
    expect(formatted).toContain("\n");
  });

  it("TC-011: falls back to empty object for null or undefined", () => {
    expect(formatLogMetadata(null)).toBe("{}");
    expect(formatLogMetadata(undefined)).toBe("{}");
  });
});
