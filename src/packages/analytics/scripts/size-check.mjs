// Verificacion de tamano del bundle del SDK (SLO-LOG-RUM-004: < 5KB gzip).
// Falla con exito 1 si el bundle minificado+gzip supera el limite.
import { build } from "esbuild";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { gzipSync } from "node:zlib";

const OUTFILE = "node_modules/.cache/rum-size.mjs";
const LIMIT_BYTES = 5120;

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  format: "esm",
  outfile: OUTFILE,
});

try {
  const raw = readFileSync(OUTFILE);
  const gz = gzipSync(raw);
  console.log(
    `[analytics] bundle: ${raw.length} B raw / ${gz.length} B gzip (limite ${LIMIT_BYTES} B gz)`,
  );
  if (gz.length > LIMIT_BYTES) {
    console.error(
      `[analytics] ERROR: el bundle (${gz.length} B gz) supera el limite de ${LIMIT_BYTES} B gz`,
    );
    process.exit(1);
  }
} finally {
  if (existsSync(OUTFILE)) {
    unlinkSync(OUTFILE);
  }
}
