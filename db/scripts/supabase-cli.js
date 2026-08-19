const { spawnSync } = require("node:child_process");
const { mkdirSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const workspaceRoot = process.cwd();
const dbWorkdir = path.join(workspaceRoot, "db");

function loadDotEnv() {
  const envPath = path.join(workspaceRoot, ".env");
  let content = "";

  try {
    content = require("node:fs").readFileSync(envPath, "utf8");
  } catch {
    return;
  }

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

    process.env[key] = line.slice(separator + 1).trim();
  }
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. If you do not have it yet, ask for this credential before running Supabase scripts.`,
    );
  }
  return value;
}

function runSupabase(args, options = {}) {
  const shellQuote = (value) => `'${String(value).replace(/'/g, `'"'"'`)}'`;
  const command = ["npx", "-y", "supabase@latest", ...args]
    .map(shellQuote)
    .join(" ");

  const bashCommand = `export PATH=\"$PATH:/c/Program Files/nodejs\" && ${command}`;

  const result = spawnSync("bash", ["-lc", bashCommand], {
    cwd: workspaceRoot,
    stdio: options.capture ? ["inherit", "pipe", "inherit"] : "inherit",
    encoding: options.capture ? "utf8" : undefined,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return result.stdout || "";
}

function linkProject() {
  const token = getRequiredEnv("SUPABASE_ACCESS_TOKEN");
  const projectRef = getRequiredEnv("SUPABASE_PROJECT_REF");
  const dbPassword = getRequiredEnv("SUPABASE_DB_PASSWORD");

  runSupabase(["login", "--token", token]);
  runSupabase([
    "--workdir",
    dbWorkdir,
    "link",
    "--project-ref",
    projectRef,
    "--password",
    dbPassword,
  ]);
}

function applyMigrations() {
  runSupabase(["--workdir", dbWorkdir, "migration", "up", "--linked"]);
}

function pushSchema() {
  runSupabase(["--workdir", dbWorkdir, "db", "push", "--linked"]);
}

function resetLocalDb() {
  runSupabase(["--workdir", dbWorkdir, "db", "reset"]);
}

function runSeed() {
  runSupabase([
    "--workdir",
    dbWorkdir,
    "db",
    "push",
    "--linked",
    "--include-seed",
    "--yes",
  ]);
}

function generateTypes() {
  const outputPath = path.join(
    workspaceRoot,
    "apps",
    "auth",
    "src",
    "lib",
    "database.types.ts",
  );
  const outputDir = path.dirname(outputPath);
  mkdirSync(outputDir, { recursive: true });

  const types = runSupabase(
    [
      "--workdir",
      dbWorkdir,
      "gen",
      "types",
      "--linked",
      "--lang",
      "typescript",
      "--schema",
      "public",
    ],
    { capture: true },
  );

  writeFileSync(outputPath, types, "utf8");
  process.stdout.write(`Generated types at ${outputPath}\n`);
}

function main() {
  const command = process.argv[2];

  switch (command) {
    case "link":
      linkProject();
      return;
    case "migrate":
      applyMigrations();
      return;
    case "push":
      pushSchema();
      return;
    case "reset":
      resetLocalDb();
      return;
    case "seed":
      runSeed();
      return;
    case "generate-types":
      generateTypes();
      return;
    default:
      throw new Error(
        "Unknown command. Use one of: link, migrate, push, reset, seed, generate-types.",
      );
  }
}

try {
  loadDotEnv();
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
