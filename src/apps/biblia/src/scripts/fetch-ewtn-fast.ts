/**
 * Script rápido para extraer lecturas litúrgicas de EWTN para 2026
 * Usa concurrencia limitada para acelerar el proceso.
 *
 * Ejecución: npx tsx src/apps/biblia/src/scripts/fetch-ewtn-fast.ts
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const EWTN_BASE = "https://www.ewtn.com/daily-readings";
const YEAR = 2026;
const CONCURRENCY = 5; // 5 peticiones en paralelo
const DELAY_MS = 1000; // 1 segundo entre batches

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

async function fetchDate(dateStr: string): Promise<Reading | null> {
  try {
    const res = await fetch(`${EWTN_BASE}/${dateStr}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const jsonMatch = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    if (!jsonMatch) return null;

    const json = JSON.parse(jsonMatch[1]);
    const body: string = json.articleBody || "";

    const r1 = body.match(/First Reading\n\n([^\n]+)/);
    const ps = body.match(/Responsorial Psalm\n\n([^\n]+)/);
    const r2 = body.match(/Second Reading\n\n([^\n]+)/);
    const go = body.match(/Gospel\n\n([^\n]+)/);

    return {
      date: dateStr,
      reading1: r1?.[1]?.trim() || "",
      psalm: ps?.[1]?.trim() || "",
      reading2: r2?.[1]?.trim() || null,
      gospel: go?.[1]?.trim() || "",
    };
  } catch {
    return null;
  }
}

async function fetchBatch(dates: string[]): Promise<(Reading | null)[]> {
  return Promise.all(dates.map((d) => fetchDate(d)));
}

async function main() {
  const dates = getAllDates(YEAR);
  const allReadings: Reading[] = [];
  let done = 0;

  console.log(
    `Fetching ${dates.length} days from EWTN (concurrency: ${CONCURRENCY})...`,
  );

  for (let i = 0; i < dates.length; i += CONCURRENCY) {
    const batch = dates.slice(i, i + CONCURRENCY);
    const results = await fetchBatch(batch);

    for (const r of results) {
      if (r) allReadings.push(r);
    }

    done += batch.length;
    process.stdout.write(
      `\r${done}/${dates.length} fetched (${allReadings.length} ok)`,
    );

    if (i + CONCURRENCY < dates.length) await sleep(DELAY_MS);
  }

  console.log(`\n\nGot ${allReadings.length} readings. Generating SQL...`);

  const lines = [
    "-- Actualizar lecturas litúrgicas para 2026 desde EWTN",
    `-- Generado: ${new Date().toISOString()}`,
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
      `UPDATE liturgy_daily_readings SET first_reading_ref = ${esc(r1)}, psalm_ref = ${esc(ps)}, second_reading_ref = ${esc(r2)}, gospel_ref = ${esc(go)} WHERE reading_date = '${r.date}' AND rite = 'roman' AND region_code = 'AR';`,
    );
  }

  const outPath = join(
    process.cwd(),
    "src/apps/biblia/src/scripts/2026-readings.sql",
  );
  writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log(`SQL written to: ${outPath}`);

  const jsonPath = join(
    process.cwd(),
    "src/apps/biblia/src/scripts/2026-readings.json",
  );
  writeFileSync(jsonPath, JSON.stringify(allReadings, null, 2), "utf-8");
  console.log(`JSON written to: ${jsonPath}`);
}

main().catch(console.error);
