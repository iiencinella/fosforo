#!/usr/bin/env node
/**
 * Genera API keys de ingesta de logs para las apps del ecosistema Fosforo.
 *
 * - Genera una clave aleatoria (64 hex) por app.
 * - Calcula el hash SHA-256 que se almacena en public.api_keys.
 * - Escribe el SQL listo para aplicar en db/scripts/generated/log-api-keys.sql.
 * - Imprime las claves crudas por consola para copiarlas al .env / Vercel.
 *
 * La clave cruda NUNCA se guarda en el repositorio. El SQL generado contiene
 * solo hashes, por lo que puede versionarse o aplicarse con seguridad.
 *
 * Uso:
 *   node db/scripts/generate-log-api-keys.js
 */

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const APPS = [
  "portal",
  "biblia",
  "calendario",
  "cancionero",
  "horarios",
  "usuario",
  "administracion",
];

const OUTPUT_DIR = path.join(__dirname, "generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "log-api-keys.sql");

function generateKey() {
  return crypto.randomBytes(32).toString("hex");
}

function hashKey(rawKey) {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

function main() {
  const generated = APPS.map((app) => {
    const rawKey = generateKey();
    return { app, rawKey, keyHash: hashKey(rawKey) };
  });

  const sqlLines = [
    "-- API keys de ingesta para la app log (SEC-0105-LOG-007).",
    "-- Generado por db/scripts/generate-log-api-keys.js.",
    "-- Contiene solo hashes SHA-256; las claves crudas se entregan por canal seguro.",
    "",
    ...generated.flatMap(({ app, keyHash }) => [
      `insert into public.api_keys (key_hash, app_name, description, is_active)`,
      `values (`,
      `  '${keyHash}',`,
      `  '${app}',`,
      `  'API key de ingesta para ${app}',`,
      `  true`,
      `)`,
      `on conflict (key_hash) do update`,
      `set`,
      `  app_name = excluded.app_name,`,
      `  description = excluded.description,`,
      `  is_active = excluded.is_active;`,
      "",
    ]),
  ];

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, sqlLines.join("\n"), "utf8");

  console.log("API keys generadas. Copia cada clave al entorno de su app:\n");
  for (const { app, rawKey } of generated) {
    console.log(`  ${app.padEnd(16)} LOGS_API_KEY=${rawKey}`);
  }

  console.log(
    `\nSQL con hashes escrito en: ${path.relative(process.cwd(), OUTPUT_FILE)}`,
  );
  console.log(
    'Aplicalo con: psql "$DATABASE_URL" -f db/scripts/generated/log-api-keys.sql',
  );
}

main();
