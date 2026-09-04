import { describe, expect, it } from "vitest";
import { isChordNameValid, toAnglo, transposeChord } from "@/lib/chord-names";

describe("chord names", () => {
  it("accepts anglo and Spanish notation", () => {
    expect(isChordNameValid("C")).toBe(true);
    expect(isChordNameValid("DOm")).toBe(true);
    expect(isChordNameValid("SOL#7")).toBe(true);
    expect(isChordNameValid("C/G")).toBe(true);
    expect(isChordNameValid("G!")).toBe(false);
  });

  it("converts Spanish roots to Anglo roots without changing the quality", () => {
    expect(toAnglo("DOM")).toBe("C");
    expect(toAnglo("DOm")).toBe("Cm");
    expect(toAnglo("SIb7")).toBe("A#7");
  });

  it("transposes while preserving the user's notation family", () => {
    expect(transposeChord("C", 2)).toBe("D");
    expect(transposeChord("DOm", 2)).toBe("REm");
    expect(transposeChord("C/G", 2)).toBe("D/A");
  });
});
