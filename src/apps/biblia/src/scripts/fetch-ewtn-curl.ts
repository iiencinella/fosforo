/**
 * Script para extraer lecturas litúrgicas de EWTN para 2026
 * Usa curl y parsing directo del JSON embebido.
 */

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const EWTN_BASE = "https://www.ewtn.com/daily-readings";
const YEAR = 2026;
const DELAY_MS = 1500;

const BOOK_MAP: Record<string, string> = {
  Genesis: "Génesis",
  Exodus: "Éxodo",
  Leviticus: "Levítico",
  Numbers: "Números",
  Deuteronomy: "Deuteronomio",
  Joshua: "Josué",
  Judges: "Jueces",
  Ruth: "Rut",
  "1 Samuel": "1 Samuel",
  "2 Samuel": "2 Samuel",
  "1 Kings": "1 Reyes",
  "2 Kings": "2 Reyes",
  "1 Chronicles": "1 Crónicas",
  "2 Chronicles": "2 Crónicas",
  Ezra: "Esdras",
  Nehemiah: "Nehemías",
  Tobit: "Tobías",
  Judith: "Judit",
  Esther: "Ester",
  "1 Maccabees": "1 Macabeos",
  "2 Maccabees": "2 Macabeos",
  Job: "Job",
  Psalms: "Salmo",
  Psalm: "Salmo",
  Proverbs: "Proverbios",
  Ecclesiastes: "Eclesiastés",
  "Song of Solomon": "Cantar de los Cantares",
  "Song of Songs": "Cantar de los Cantares",
  Wisdom: "Sabiduría",
  Sirach: "Eclesiástico",
  Isaiah: "Isaías",
  Jeremiah: "Jeremías",
  Lamentations: "Lamentaciones",
  Baruch: "Baruc",
  Ezekiel: "Ezequiel",
  Daniel: "Daniel",
  Hosea: "Oseas",
  Joel: "Joel",
  Amos: "Amós",
  Obadiah: "Abdías",
  Jonah: "Jonás",
  Micah: "Miqueas",
  Nahum: "Nahum",
  Habakkuk: "Habacuc",
  Zephaniah: "Sofonías",
  Haggai: "Hageo",
  Zechariah: "Zacarías",
  Malachi: "Malaquías",
  Matthew: "Mateo",
  Mark: "Marcos",
  Luke: "Lucas",
  John: "Juan",
  Acts: "Hechos",
  Romans: "Romanos",
  "1 Corinthians": "1 Corintios",
  "2 Corinthians": "2 Corintios",
  Galatians: "Gálatas",
  Ephesians: "Efesios",
  Philippians: "Filipenses",
  Colossians: "Colosenses",
  "1 Thessalonians": "1 Tesalonicenses",
  "2 Thessalonians": "2 Tesalonicenses",
  "1 Timothy": "1 Timoteo",
  "2 Timothy": "2 Timoteo",
  Titus: "Tito",
  Philemon: "Filemón",
  Hebrews: "Hebreos",
  James: "Santiago",
  "1 Peter": "1 Pedro",
  "2 Peter": "2 Pedro",
  "1 John": "1 Juan",
  "2 John": "2 Juan",
  "3 John": "3 Juan",
  Jude: "Judas",
  Revelation: "Apocalipsis",
};

function translateRef(ref: string): string {
  if (!ref) return "";
  let result = ref.trim();
  const sorted = Object.keys(BOOK_MAP).sort((a, b) => b.length - a.length);
  for (const book of sorted) {
    const escaped = book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(`\\b${escaped}\\b`, "g"),
      BOOK_MAP[book],
    );
  }
  return result;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getAllDates(year: number): string[] {
  const dates: string[] = [];
  const d = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  while (d <= end) {
    dates.push(formatDate(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

interface Reading {
  date: string;
  reading1: string;
  psalm: string;
  reading2: string | null;
  gospel: string;
}

function fetchDateCurl(dateStr: string): Reading | null {
  try {
    const cmd = `curl -s -L -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${EWTN_BASE}/${dateStr}"`;
    const html = execSync(cmd, { encoding: "utf-8", timeout: 15000 });

    // Find articleBody in the JSON-LD
    const bodyStart = html.indexOf('"articleBody":"');
    if (bodyStart === -1) return null;

    const start = bodyStart + 15;
    const end = html.indexOf('","', start);
    if (end === -1) return null;

    const rawBody = html.substring(start, end);

    // Unescape JSON string
    const body = rawBody
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");

    // Extract readings using line breaks
    const lines = body.split("\n");
    let reading1 = "";
    let psalm = "";
    let reading2: string | null = null;
    let gospel = "";
    let section = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "First Reading") {
        section = "r1";
        continue;
      }
      if (trimmed === "Responsorial Psalm") {
        section = "ps";
        continue;
      }
      if (trimmed === "Second Reading") {
        section = "r2";
        continue;
      }
      if (trimmed === "Gospel") {
        section = "go";
        continue;
      }

      // First non-empty line after section header is the reference
      if (section === "r1" && !reading1 && trimmed && !/^\d+$/.test(trimmed)) {
        reading1 = trimmed;
      }
      if (section === "ps" && !psalm && trimmed && !/^\d+$/.test(trimmed)) {
        psalm = trimmed;
      }
      if (
        section === "r2" &&
        reading2 === null &&
        trimmed &&
        !/^\d+$/.test(trimmed)
      ) {
        reading2 = trimmed;
      }
      if (section === "go" && !gospel && trimmed && !/^\d+$/.test(trimmed)) {
        gospel = trimmed;
      }
    }

    if (!reading1 && !gospel) return null;

    return { date: dateStr, reading1, psalm, reading2, gospel };
  } catch {
    return null;
  }
}

async function main() {
  const dates = getAllDates(YEAR);
  const allReadings: Reading[] = [];
  let done = 0;
  let errors = 0;

  console.log(`Fetching ${dates.length} days from EWTN...`);
  console.log(
    `Estimated: ~${Math.round((dates.length * (DELAY_MS + 1500)) / 60000)} min\n`,
  );

  for (const dateStr of dates) {
    const reading = fetchDateCurl(dateStr);
    if (reading && (reading.reading1 || reading.gospel)) {
      allReadings.push(reading);
    } else {
      errors++;
    }

    done++;
    if (done % 25 === 0 || done === dates.length) {
      process.stdout.write(
        `\r${done}/${dates.length} (${allReadings.length} ok, ${errors} err)`,
      );
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n\n${allReadings.length} readings fetched. Generating SQL...`);

  const lines = [
    "-- Lecturas litúrgicas 2026 desde EWTN",
    `-- ${new Date().toISOString()} | ${allReadings.length} lecturas`,
    "",
  ];

  for (const r of allReadings) {
    const r1 = translateRef(r.reading1);
    const ps = translateRef(r.psalm);
    const r2 = r.reading2 ? translateRef(r.reading2) : null;
    const go = translateRef(r.gospel);
    const esc = (s: string | null) =>
      s ? `'${s.replace(/'/g, "''")}'` : "NULL";

    lines.push(
      `UPDATE liturgy_daily_readings SET first_reading_ref=${esc(r1)}, psalm_ref=${esc(ps)}, second_reading_ref=${esc(r2)}, gospel_ref=${esc(go)} WHERE reading_date='${r.date}' AND rite='roman' AND region_code='AR';`,
    );
  }

  const outPath = join(
    process.cwd(),
    "src/apps/biblia/src/scripts/2026-readings.sql",
  );
  writeFileSync(outPath, lines.join("\n"), "utf-8");

  const jsonPath = join(
    process.cwd(),
    "src/apps/biblia/src/scripts/2026-readings.json",
  );
  writeFileSync(jsonPath, JSON.stringify(allReadings, null, 2), "utf-8");

  console.log(`SQL: ${outPath}`);
  console.log(`JSON: ${jsonPath}`);
}

main().catch(console.error);
