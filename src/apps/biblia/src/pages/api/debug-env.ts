import type { APIRoute } from "astro";

export const prerender = false;

const INTERESTING = [
  "SUPABASE_URL",
  "PUBLIC_SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_KEY",
  "LOGS_API_URL",
  "LOGS_API_KEY",
  "BIBLIA_INTERNAL_INGESTION_KEY",
];

export const GET: APIRoute = async () => {
  const metaEnv = import.meta.env as Record<string, unknown>;
  const allKeys = Object.keys(process.env).sort();

  return new Response(
    JSON.stringify(
      {
        interestingInProcessEnv: INTERESTING.filter((k) =>
          Boolean(process.env[k]),
        ),
        interestingInMetaEnv: INTERESTING.filter((k) => Boolean(metaEnv[k])),
        totalProcessEnvKeys: allKeys.length,
        vercelSystemKeys: allKeys.filter((k) => k.startsWith("VERCEL_")),
        nodeEnv: process.env.NODE_ENV ?? null,
        cwd: process.cwd(),
      },
      null,
      2,
    ),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};
