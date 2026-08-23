import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_FILE_NAMES = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
];

const APP_ROOT = process.cwd();

/**
 * Alias deprecados por variable canónica.
 * El nombre canónico es el único que se documenta y configura en Vercel.
 * Los alias siguen resolviéndose durante la transición, pero emiten warning.
 */
export const ENV_ALIASES: Record<string, string[]> = {
  SUPABASE_URL: ["PUBLIC_SUPABASE_URL"],
  SUPABASE_ANON_KEY: ["PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_KEY"],
  LOGS_API_KEY: ["LOGS_INGEST_API_KEY"],
};

const warnedAliases = new Set<string>();

function warnDeprecatedAlias(canonical: string, alias: string): void {
  const cacheKey = `${canonical}<-${alias}`;
  if (warnedAliases.has(cacheKey)) return;
  warnedAliases.add(cacheKey);
  console.warn(
    `[@repo/env] La variable "${alias}" esta deprecada. Usa "${canonical}" en su lugar. El alias se eliminara en una version futura.`,
  );
}

function findWorkspaceRoot(from: string): string {
  let dir = from;
  while (true) {
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = resolve(dir, "..");
    if (parent === dir) return resolve(from, "..", "..", "..");
    dir = parent;
  }
}

let cachedFileEnv: Record<string, string> | undefined;

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};

  const content = readFileSync(filePath, "utf8");
  const entries: Record<string, string> = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    if (!key) continue;

    let value = trimmed.slice(eqIndex + 1).trim();
    const hasQuotes =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));

    if (hasQuotes) value = value.slice(1, -1);

    entries[key] = value;
  }

  return entries;
}

function getFileEnv(): Record<string, string> {
  if (cachedFileEnv) return cachedFileEnv;

  const workspaceRoot = findWorkspaceRoot(APP_ROOT);
  const merged: Record<string, string> = {};

  for (const baseDir of [workspaceRoot, APP_ROOT]) {
    for (const fileName of ENV_FILE_NAMES) {
      Object.assign(merged, parseEnvFile(resolve(baseDir, fileName)));
    }
  }

  cachedFileEnv = merged;
  return merged;
}

type EnvSource = "runtime" | "process" | "file";

function lookup(name: string): { value: string } | null {
  const runtimeEnv = import.meta.env as Record<string, string | undefined>;
  const fileEnv = getFileEnv();

  const value = runtimeEnv[name] || process.env[name] || fileEnv[name];
  if (typeof value === "string" && value.trim().length > 0) {
    return { value };
  }

  return null;
}

/**
 * Resuelve una lista de claves en orden de prioridad.
 * La primera clave se considera la canónica: si el valor llega por un alias
 * deprecado, se emite un warning unico por proceso.
 */
function readEnvValue(...keys: string[]): string {
  const primary = keys[0];
  if (!primary) return "";

  for (const key of keys) {
    const candidates = [key, ...(ENV_ALIASES[key] ?? [])];

    for (const candidate of candidates) {
      const found = lookup(candidate);
      if (found) {
        if (
          candidate !== primary &&
          ENV_ALIASES[primary]?.includes(candidate)
        ) {
          warnDeprecatedAlias(primary, candidate);
        }
        return found.value;
      }
    }
  }

  return "";
}

export class MissingEnvError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(
      `Faltan variables de entorno requeridas: ${missing.join(", ")}. ` +
        "Configuralas en tu .env local o en Vercel (Production/Preview). " +
        "Si cambiaste variables en Vercel, recorda que hay que redesplegar.",
    );
    this.name = "MissingEnvError";
    this.missing = missing;
  }
}

export function readEnv(...keys: string[]): string {
  return readEnvValue(...keys);
}

export function requireEnv(...keys: string[]): string {
  const value = readEnvValue(...keys);
  if (!value) {
    throw new MissingEnvError([keys[0] ?? ""]);
  }
  return value;
}

/**
 * Resuelve multiples variables independientes y valida todas juntas:
 * si falta mas de una, el error las lista todas de una sola vez.
 */
export function requireEnvValues(...keys: string[]): string[] {
  const missing: string[] = [];
  const values = keys.map((key) => {
    const value = readEnvValue(key);
    if (!value) missing.push(key);
    return value;
  });

  if (missing.length > 0) {
    throw new MissingEnvError(missing);
  }

  return values;
}
