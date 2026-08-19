import { describe, expect, it } from "vitest";

import {
  CalendarInputError,
  buildRelatedLinks,
  createUtcDate,
  formatRankLabel,
  formatTypeLabel,
  getColor,
  getFallbackRecordForDate,
  getMonthMatrix,
  getMonthMatrixFromProfiles,
  getReadings,
  getSeason,
  mapDayRecord,
  mapProfileRecord,
  parseDateParam,
  parseMonthParams,
  toIsoDate,
} from "@/lib/calendar";
import type {
  CalendarDayProfileRecord,
  CalendarDayRecord,
} from "@/types/calendar";

const ordinaryRecord: CalendarDayRecord = {
  id: 1,
  reading_date: "2025-05-20",
  rite: "roman",
  region_code: "AR",
  celebration_type: "tiempo_ordinario",
  celebration_name: null,
  cycle: "A",
  week: 20,
  first_reading_ref: "Génesis 3:1-8",
  psalm_ref: "Salmo 31",
  second_reading_ref: null,
  gospel_ref: "Marcos 7:31-37",
  source_year: 2025,
};

const solemnityRecord: CalendarDayRecord = {
  ...ordinaryRecord,
  id: 2,
  reading_date: "2025-12-25",
  celebration_type: "solemnidad",
  celebration_name: "Navidad",
  week: null,
  second_reading_ref: "Hebreos 1:1-6",
};

const profileRecord: CalendarDayProfileRecord = {
  id: 3,
  month_day_key: "05-20",
  rite: "roman",
  region_code: "AR",
  celebration_type: "tiempo_ordinario",
  celebration_name: null,
  liturgical_season: "Tiempo Ordinario",
  liturgical_color: "verde",
  cycle: "A",
  week: 20,
  first_reading_ref: "Génesis 3:1-8",
  psalm_ref: "Salmo 31",
  second_reading_ref: null,
  gospel_ref: "Marcos 7:31-37",
  source_year: 2025,
  is_approximate: true,
  rank_slug: "memoria_facultativa",
  is_marian: false,
  is_argentina: true,
  source_note: "GCatholic Argentina 2026",
  title_2026: "Beata Crescencia Perez, religiosa",
};

describe("calendar helpers", () => {
  it("formats liturgical type labels", () => {
    expect(formatTypeLabel("tiempo_ordinario")).toBe("Tiempo Ordinario");
    expect(formatTypeLabel(null)).toBe("Jornada litúrgica");
    expect(formatRankLabel("memoria_facultativa")).toBe("Memoria facultativa");
  });

  it("validates ISO date params", () => {
    expect(toIsoDate(parseDateParam("2026-05-20"))).toBe("2026-05-20");
    expect(() => parseDateParam("2026-13-20")).toThrow(CalendarInputError);
    expect(() => parseDateParam("20-05-2026")).toThrow(CalendarInputError);
  });

  it("validates month params and falls back to selected date", () => {
    const fallback = createUtcDate(2026, 5, 20);
    expect(toIsoDate(parseMonthParams("2026", "05", fallback))).toBe(
      "2026-05-01",
    );
    expect(toIsoDate(parseMonthParams(null, null, fallback))).toBe(
      "2026-05-01",
    );
    expect(() => parseMonthParams("2026", "99", fallback)).toThrow(
      CalendarInputError,
    );
  });

  it("derives liturgical season and color from celebrations", () => {
    expect(getSeason(ordinaryRecord)).toBe("Tiempo Ordinario");
    expect(getColor(ordinaryRecord)).toBe("verde");
    expect(getSeason(solemnityRecord)).toBe("Tiempo de Navidad");
    expect(getColor(solemnityRecord)).toBe("blanco");
  });

  it("returns ordered readings without empty entries", () => {
    expect(getReadings(ordinaryRecord)).toEqual([
      { label: "Primera lectura", reference: "Génesis 3:1-8" },
      { label: "Salmo", reference: "Salmo 31" },
      { label: "Evangelio", reference: "Marcos 7:31-37" },
    ]);
  });

  it("builds ecosystem links based on the available day information", () => {
    expect(buildRelatedLinks(ordinaryRecord).map((item) => item.label)).toEqual(
      ["Ir a Biblia", "Ir a Misal", "Ir a Oraciones"],
    );
    expect(
      buildRelatedLinks(solemnityRecord).map((item) => item.label),
    ).toContain("Ir a Santopedia");
  });

  it("falls back to matching month/day when exact year is unavailable", () => {
    const fallback = getFallbackRecordForDate(
      [ordinaryRecord, solemnityRecord],
      createUtcDate(2026, 5, 20),
    );

    expect(fallback?.hasExactMatch).toBe(false);
    expect(fallback?.record.reading_date).toBe("2025-05-20");
  });

  it("maps a day record into a stable DTO", () => {
    const mapped = mapDayRecord(
      ordinaryRecord,
      createUtcDate(2026, 5, 20),
      false,
    );

    expect(mapped.celebrationTitle).toContain("Tiempo Ordinario");
    expect(mapped.requestedDate).toBe("2026-05-20");
    expect(mapped.sourceDate).toBe("2025-05-20");
    expect(mapped.readings).toHaveLength(3);
    expect(mapped.relatedLinks).toHaveLength(3);
  });

  it("maps enriched profile metadata into the day dto", () => {
    const mapped = mapProfileRecord(profileRecord, createUtcDate(2026, 5, 20));

    expect(mapped.rankLabel).toBe("Memoria facultativa");
    expect(mapped.isMarian).toBe(false);
    expect(mapped.isArgentina).toBe(true);
    expect(mapped.sourceNote).toBe("GCatholic Argentina 2026");
    expect(mapped.celebrationSubtitle).toContain("Memoria facultativa");
  });

  it("builds a month matrix with resolved days and navigation", () => {
    const matrix = getMonthMatrix(
      createUtcDate(2026, 5, 1),
      createUtcDate(2026, 5, 20),
      [ordinaryRecord],
    );

    expect(matrix.month).toBe(5);
    expect(matrix.totalResolvedDays).toBeGreaterThan(0);
    expect(matrix.metadataSummary.rankedDays).toBe(0);
    expect(matrix.previousMonthHref).toContain("month=04");
    expect(matrix.nextMonthHref).toContain("month=06");
    expect(matrix.days.some((entry) => entry?.isoDate === "2026-05-20")).toBe(
      true,
    );
  });

  it("keeps enriched profile records typed for month-day fallback", () => {
    expect(profileRecord.month_day_key).toBe("05-20");
    expect(profileRecord.liturgical_season).toBe("Tiempo Ordinario");
    expect(profileRecord.liturgical_color).toBe("verde");
  });

  it("uses enriched profile metadata in the month matrix fallback", () => {
    const matrix = getMonthMatrixFromProfiles(
      createUtcDate(2026, 5, 1),
      createUtcDate(2026, 5, 20),
      [],
      [profileRecord],
    );
    const resolvedDay = matrix.days.find(
      (entry) => entry?.isoDate === "2026-05-20",
    );

    expect(resolvedDay?.rankLabel).toBe("Memoria facultativa");
    expect(resolvedDay?.isArgentina).toBe(true);
    expect(resolvedDay?.isMarian).toBe(false);
    expect(matrix.metadataSummary.rankedDays).toBeGreaterThan(0);
    expect(matrix.metadataSummary.argentinaDays).toBeGreaterThan(0);
  });
});
