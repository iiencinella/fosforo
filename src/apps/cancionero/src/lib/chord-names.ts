export type ChordNotation = "anglo" | "espanola";

export type ParsedChordName = {
  notation: ChordNotation;
  root: string;
  rootIndex: number;
  suffix: string;
  bass?: string;
};

const ANGLO_ROOTS: Record<string, string> = {
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  A: "A",
  B: "B",
};
const SPANISH_ROOTS: Record<string, string> = {
  DO: "C",
  RE: "D",
  MI: "E",
  FA: "F",
  SOL: "G",
  LA: "A",
  SI: "B",
};
const CHROMATIC = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const SPANISH_BY_INDEX = [
  "DO",
  "DO#",
  "RE",
  "RE#",
  "MI",
  "FA",
  "FA#",
  "SOL",
  "SOL#",
  "LA",
  "LA#",
  "SI",
];
const SUFFIX_PATTERN =
  /^(?:m|min|maj|minmaj|sus|add|dim|aug|b|#|\+|-|\d|\(|\)|\/)*$/i;

function rootIndex(root: string): number {
  return CHROMATIC.indexOf(root);
}

function parseRoot(
  value: string,
): { notation: ChordNotation; root: string; length: number } | null {
  const upper = value.toUpperCase();
  const spanish = Object.keys(SPANISH_ROOTS)
    .sort((a, b) => b.length - a.length)
    .find((name) => upper.startsWith(name));
  if (spanish)
    return {
      notation: "espanola",
      root: SPANISH_ROOTS[spanish]!,
      length: spanish.length,
    };
  const anglo = upper.match(/^[A-G]/)?.[0];
  if (anglo) return { notation: "anglo", root: ANGLO_ROOTS[anglo]!, length: 1 };
  return null;
}

export function parseChordName(value: string): ParsedChordName | null {
  const input = value.trim().replace(/\s+/g, "");
  if (!input || input.length > 24) return null;
  const parsed = parseRoot(input);
  if (!parsed) return null;

  let cursor = parsed.length;
  let root = parsed.root;
  if (input[cursor] === "#" || input[cursor] === "b") {
    root += input[cursor] === "b" ? "b" : "#";
    cursor += 1;
  }
  const baseIndex = rootIndex(parsed.root);
  const accidentalOffset = root.endsWith("#") ? 1 : root.endsWith("b") ? -1 : 0;
  const index = (baseIndex + accidentalOffset + 12) % 12;

  const rest = input.slice(cursor);
  const slashIndex = rest.indexOf("/");
  const rawSuffix = slashIndex >= 0 ? rest.slice(0, slashIndex) : rest;
  const suffix = rawSuffix === "M" ? "" : rawSuffix;
  const bassRaw = slashIndex >= 0 ? rest.slice(slashIndex + 1) : undefined;
  if (
    !SUFFIX_PATTERN.test(suffix) ||
    (bassRaw !== undefined && !parseChordName(bassRaw))
  )
    return null;
  return {
    notation: parsed.notation,
    root,
    rootIndex: (index + 12) % 12,
    suffix,
    bass: bassRaw,
  };
}

export function isChordNameValid(value: string): boolean {
  return parseChordName(value) !== null;
}

export function toAnglo(value: string): string | null {
  const parsed = parseChordName(value);
  if (!parsed) return null;
  const root = CHROMATIC[parsed.rootIndex]!;
  const bass = parsed.bass ? toAnglo(parsed.bass) : null;
  return `${root}${parsed.suffix}${bass ? `/${bass}` : ""}`;
}

export function transposeChord(
  value: string,
  semitones: number,
): string | null {
  const parsed = parseChordName(value);
  if (!parsed) return null;
  const target = CHROMATIC[(parsed.rootIndex + (semitones % 12) + 12) % 12]!;
  const root =
    parsed.notation === "espanola"
      ? SPANISH_BY_INDEX[CHROMATIC.indexOf(target)]!
      : target;
  const bass = parsed.bass ? transposeChord(parsed.bass, semitones) : null;
  return `${root}${parsed.suffix}${bass ? `/${bass}` : ""}`;
}

export function chordSuggestions(): string {
  return "C, Cm, F#7, DO, DOM, DOm, SOLm o SIb";
}
