/**
 * Script para extraer lecturas litúrgicas de EWTN para2026
 * y generar SQL para actualizar la base de datos.
 *
 * Ejecución: npx tsx src/apps/biblia/src/scripts/fetch-ewtn-readings.ts
 *
 * IMPORTANTE: Este script hace365 peticiones HTTP con delay entre cada una.
 * Tiempo estimado: ~15-20 minutos.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const EWTN_BASE = "https://www.ewtn.com/daily-readings";
const YEAR = 2026;
const DELAY_MS = 2000; // 2 segundos entre peticiones

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

function translateReference(englishRef: string): string {
  if (!englishRef) return "";

  let result = englishRef.trim();

  // Replace book names (longest first to avoid partial matches)
  const sortedBooks = Object.keys(BOOK_MAP).sort((a, b) => b.length - a.length);

  for (const book of sortedBooks) {
    const spanish = BOOK_MAP[book];
    // Use word boundary matching
    const escaped = book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "g");
    result = result.replace(regex, spanish);
  }

  return result;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDaysInYear(year: number): Date[] {
  const days: Date[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  return days;
}

function formatDateForUrl(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface DayReading {
  date: string;
  title: string;
  reading1: string;
  psalm: string;
  reading2: string | null;
  gospel: string;
}

async function fetchReadingsForDate(date: Date): Promise<DayReading | null> {
  const dateStr = formatDateForUrl(date);
  const url = `${EWTN_BASE}/${dateStr}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.error(`Error fetching ${dateStr}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extract title (celebration name)
    const titleMatch = html.match(
      /<h2[^>]*class="[^"]*daily-readings-title[^"]*"[^>]*>([^<]+)<\/h2>/,
    );
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Extract readings from the structured data (JSON-LD)
    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );

    if (!jsonLdMatch) {
      console.error(`No JSON-LD found for ${dateStr}`);
      return null;
    }

    const jsonLd = JSON.parse(jsonLdMatch[1]);
    const body = jsonLd.articleBody || "";

    // Parse the body to extract readings
    const reading1Match = body.match(
      /First Reading\n\n([^\n]+)\n[\s\S]*?(?=Responsorial Psalm|Second Reading|Gospel)/,
    );
    const psalmMatch = body.match(
      /Responsorial Psalm\n\n([^\n]+)\n[\s\S]*?(?=Second Reading|Gospel)/,
    );
    const reading2Match = body.match(
      /Second Reading\n\n([^\n]+)\n[\s\S]*?(?=Gospel)/,
    );
    const gospelMatch = body.match(/Gospel\n\n([^\n]+)\n/);

    return {
      date: dateStr,
      title: title || jsonLd.headline || "",
      reading1: reading1Match ? reading1Match[1].trim() : "",
      psalm: psalmMatch ? psalmMatch[1].trim() : "",
      reading2: reading2Match ? reading2Match[1].trim() : null,
      gospel: gospelMatch ? gospelMatch[1].trim() : "",
    };
  } catch (error) {
    console.error(`Error processing ${dateStr}:`, error);
    return null;
  }
}

async function main() {
  console.log(`Fetching liturgical readings for ${YEAR} from EWTN...`);
  console.log(
    `This will take approximately ${Math.round((365 * DELAY_MS) / 60000)} minutes.\n`,
  );

  const days = getDaysInYear(YEAR);
  const readings: DayReading[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const dateStr = formatDateForUrl(day);

    process.stdout.write(`\r[${i + 1}/${days.length}] Fetching ${dateStr}...`);

    const reading = await fetchReadingsForDate(day);

    if (reading) {
      readings.push(reading);
      successCount++;
    } else {
      errorCount++;
    }

    // Add delay between requests
    if (i < days.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n\nDone! ${successCount} successful, ${errorCount} errors.`);

  // Generate SQL statements
  const sqlStatements: string[] = [];

  sqlStatements.push("-- Actualizar lecturas litúrgicas para 2026");
  sqlStatements.push("-- Generado automáticamente desde EWTN");
  sqlStatements.push(`-- Fecha de generación: ${new Date().toISOString()}\n`);

  for (const reading of readings) {
    const reading1Es = translateReference(reading.reading1);
    const psalmEs = translateReference(reading.psalm);
    const reading2Es = reading.reading2
      ? translateReference(reading.reading2)
      : null;
    const gospelEs = translateReference(reading.gospel);

    // Escape single quotes for SQL
    const escape = (s: string | null) => (s ? s.replace(/'/g, "''") : "NULL");

    const values = [
      `'${reading.date}'`,
      "'roman'",
      "'AR'",
      `'${escape(reading.title)}'`,
      `'${escape(reading1Es)}'`,
      `'${escape(psalmEs)}'`,
      reading2Es ? `'${escape(reading2Es)}'` : "NULL",
      `'${escape(gospelEs)}'`,
    ];

    sqlStatements.push(
      `UPDATE liturgy_daily_readings SET celebration_name = ${values[3]}, first_reading_ref = ${values[4]}, psalm_ref = ${values[5]}, second_reading_ref = ${values[6]}, gospel_ref = ${values[7]} WHERE reading_date = ${values[0]} AND rite = ${values[1]} AND region_code = ${values[2]};`,
    );
  }

  // Write SQL file
  const sqlContent = sqlStatements.join("\n");
  const outputPath = join(
    process.cwd(),
    "src/apps/biblia/src/scripts/2026-readings-update.sql",
  );

  writeFileSync(outputPath, sqlContent, "utf-8");
  console.log(`\nSQL file written to: ${outputPath}`);

  // Also write JSON for reference
  const jsonPath = join(
    process.cwd(),
    "src/apps/biblia/src/scripts/2026-readings.json",
  );
  writeFileSync(jsonPath, JSON.stringify(readings, null, 2), "utf-8");
  console.log(`JSON file written to: ${jsonPath}`);
}

main().catch(console.error);
