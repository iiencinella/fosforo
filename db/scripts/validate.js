const { access, readFile } = require("node:fs/promises");
const path = require("node:path");

const root = process.cwd();
const supabaseDir = path.join(root, "db", "supabase");
const configPath = path.join(supabaseDir, "config.toml");
const migrationsDir = path.join(supabaseDir, "migrations");
const seedPath = path.join(supabaseDir, "seeds", "seed.sql");

const requiredEnv = [
  "SUPABASE_PROJECT_REF",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_DB_PASSWORD",
];

function loadDotEnvFile(content) {
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    if (!key || process.env[key]) {
      continue;
    }

    const value = line.slice(separator + 1).trim();
    process.env[key] = value;
  }
}

async function assertExists(filePath, label) {
  try {
    await access(filePath);
  } catch {
    throw new Error(`Missing ${label}: ${filePath}`);
  }
}

async function main() {
  try {
    const envPath = path.join(root, ".env");
    const envContent = await readFile(envPath, "utf8");
    loadDotEnvFile(envContent);
  } catch {
    // .env is optional when variables are injected by CI/global environment.
  }

  await assertExists(configPath, "Supabase config.toml");
  await assertExists(migrationsDir, "migrations directory");
  await assertExists(seedPath, "seed file");

  const missingEnv = requiredEnv.filter(
    (envKey) => !process.env[envKey]?.trim(),
  );
  const configContent = await readFile(configPath, "utf8");

  if (!configContent.includes('sql_paths = ["./seeds/seed.sql"]')) {
    throw new Error(
      "Invalid config.toml: expected db.seed.sql_paths to include ./seeds/seed.sql",
    );
  }

  if (missingEnv.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnv.join(", ")}. Add them to your global env or .env before running db commands.`,
    );
  }

  console.log("Supabase db scripts validation passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
