import { readEnv, requireEnv } from "./reader.js";

export type BibliaEnv = {
  ingestionKey: string;
};

export function getBibliaEnv(): BibliaEnv | null {
  const ingestionKey = readEnv("BIBLIA_INTERNAL_INGESTION_KEY");
  if (!ingestionKey) return null;

  return { ingestionKey };
}

export function requireBibliaEnv(): BibliaEnv {
  const ingestionKey = requireEnv("BIBLIA_INTERNAL_INGESTION_KEY");
  return { ingestionKey };
}
