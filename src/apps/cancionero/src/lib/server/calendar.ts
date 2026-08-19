import { readEnv } from "@repo/env";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function mapSeasonToTimeId(season: string): string | null {
  const normalized = normalize(season);

  if (normalized.includes("adviento")) return "adviento";
  if (normalized.includes("navidad")) return "navidad";
  if (normalized.includes("cuaresma")) return "cuaresma";
  if (normalized.includes("pascua")) return "pascua";
  if (normalized.includes("ordinario")) return "tiempo-ordinario";

  return null;
}

export async function getCurrentLiturgicalTimeId(): Promise<string | null> {
  const baseUrl = readEnv("CALENDARIO_API_URL");
  if (!baseUrl) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const today = new Date().toISOString().slice(0, 10);
    const response = await fetch(`${baseUrl}/api/calendar/day?date=${today}`, {
      signal: controller.signal,
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { liturgicalSeason?: string };
    if (!payload.liturgicalSeason) {
      return null;
    }

    return mapSeasonToTimeId(payload.liturgicalSeason);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
