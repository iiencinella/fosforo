import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_FILE_NAMES = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
];

const APP_ROOT = process.cwd();

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

function readEnvValue(...keys: string[]): string {
  const runtimeEnv = import.meta.env as Record<string, string | undefined>;
  const fileEnv = getFileEnv();

  for (const key of keys) {
    const value = runtimeEnv[key] || process.env[key] || fileEnv[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return "";
}

export function readEnv(...keys: string[]): string {
  return readEnvValue(...keys);
}

export function requireEnv(...keys: string[]): string {
  const value = readEnvValue(...keys);
  if (!value) {
    throw new Error(
      `Falta variable de entorno: ${keys.join(" / ")}. Verifica tu archivo .env`,
    );
  }
  return value;
}
