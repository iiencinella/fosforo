import { describe, expect, it } from "vitest";
import {
  formatLiturgyRow,
  formatReadRows,
  formatSearchRows,
} from "@/lib/api-formatters";

describe("api formatters", () => {
  it("formats read rows", () => {
    const rows = [
      {
        version_code: "pd",
        book_slug: "genesis",
        book_name: "Genesis",
        chapter_number: 1,
        verse_number: 1,
        verse_text: "Al principio...",
      },
    ];

    const output = formatReadRows(rows);
    expect(output).toHaveLength(1);
    expect(output[0]?.reference).toBe("Genesis 1,1");
    expect(output[0]?.text).toBe("Al principio...");
  });

  it("formats search rows", () => {
    const rows = [
      {
        version_code: "pd",
        book_slug: "juan",
        book_name: "Juan",
        chapter_number: 3,
        verse_number: 16,
        reference_label: "Juan 3,16",
        verse_text: "Porque tanto amo Dios...",
        rank: 0.9,
      },
    ];

    const output = formatSearchRows(rows);
    expect(output).toHaveLength(1);
    expect(output[0]?.reference).toBe("Juan 3,16");
    expect(output[0]?.rank).toBe(0.9);
  });

  it("formats liturgy row", () => {
    const row = {
      reading_date: "2025-01-06",
      rite: "roman",
      region_code: "AR",
      celebration_type: "solemnidad",
      celebration_name: "Epifania",
      cycle: "A",
      week: 1,
      first_reading_ref: "Isaias 60:1-6",
      psalm_ref: "Salmo 72",
      second_reading_ref: "Efesios 3:2-3",
      gospel_ref: "Mateo 2:1-12",
      source_year: 2025,
    };

    const output = formatLiturgyRow(row);
    expect(output.fecha).toBe("2025-01-06");
    expect(output.evangelio).toBe("Mateo 2:1-12");
  });
});
