import { describe, expect, it } from "vitest";
import {
  getAlertSummary,
  logIngestPayloadSchema,
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
