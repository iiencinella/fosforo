import { promises as fs } from "node:fs";
import path from "node:path";
import { syncAppStatusDocs } from "./docs-sync-app-status.mjs";

const VALID_PLATFORMS = new Set(["WEB", "MOVIL", "DESKTOP"]);
const MAX_APP_FOLDER_SUFFIX_LENGTH = 80;

const WINDOWS_RESERVED_NAMES = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
]);

function toAppCode(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toFolderName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\.+/g, "-")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateFolderSuffix(suffix) {
  if (!suffix) {
    return "Error: el nombre de la app no deja un sufijo valido para carpeta.";
  }
  if (suffix.length > MAX_APP_FOLDER_SUFFIX_LENGTH) {
    return `Error: el nombre normalizado supera ${MAX_APP_FOLDER_SUFFIX_LENGTH} caracteres.`;
  }
  if (WINDOWS_RESERVED_NAMES.has(suffix.toUpperCase())) {
    return `Error: el nombre '${suffix}' es reservado en Windows.`;
  }
  return "";
}

function parseArgs(argv) {
  const flags = { fase: "", nombre: "", plataforma: "" };
  const rest = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--fase") {
      flags.fase = argv[i + 1] || "";
      i += 1;
      continue;
    }
    if (arg === "--nombre") {
      flags.nombre = argv[i + 1] || "";
      i += 1;
      continue;
    }
    if (arg === "--plataforma") {
      flags.plataforma = (argv[i + 1] || "").toUpperCase();
      i += 1;
      continue;
    }
    rest.push(arg);
  }

  if (flags.fase && flags.nombre && flags.plataforma) {
    return flags;
  }

  if (rest.length >= 3) {
    const [fase, plataforma, ...nombreParts] = rest;
    return {
      fase,
      plataforma: plataforma.toUpperCase(),
      nombre: nombreParts.join(" ").trim(),
    };
  }

  return { fase: "", nombre: "", plataforma: "" };
}

function usage() {
  console.log("Uso:");
  console.log(
    '  pnpm docs:new-app --fase <N> --plataforma <WEB|MOVIL|DESKTOP> --nombre "<NOMBRE APP>"',
  );
  console.log('  pnpm docs:new-app <N> <WEB|MOVIL|DESKTOP> "<NOMBRE APP>"');
}

function parsePhaseAndName(folderName) {
  const match = /^FASE_(\d+)-(.+)$/.exec(folderName);
  if (!match) {
    return null;
  }
  return {
    phase: Number(match[1]),
    appName: match[2],
  };
}

function toDisplayName(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function buildIndexRows(targetRoot) {
  const topLevel = await fs.readdir(targetRoot, { withFileTypes: true });
  const rows = [];

  for (const entry of topLevel) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name.startsWith("_")) {
      continue;
    }

    const parsed = parsePhaseAndName(entry.name);
    if (!parsed) {
      continue;
    }

    const appDir = path.join(targetRoot, entry.name);
    const platformEntries = await fs.readdir(appDir, { withFileTypes: true });

    for (const platformEntry of platformEntries) {
      if (!platformEntry.isDirectory()) {
        continue;
      }
      if (!VALID_PLATFORMS.has(platformEntry.name)) {
        continue;
      }

      const relativePath = `./${entry.name}/${platformEntry.name}/`;
      rows.push({
        phase: parsed.phase,
        appName: parsed.appName,
        displayName: toDisplayName(parsed.appName),
        platform: platformEntry.name,
        relativePath,
      });
    }
  }

  rows.sort((a, b) => {
    if (a.phase !== b.phase) {
      return a.phase - b.phase;
    }
    if (a.appName !== b.appName) {
      return a.appName.localeCompare(b.appName, "es");
    }
    return a.platform.localeCompare(b.platform, "es");
  });

  return rows;
}

async function updateIndex(targetRoot) {
  const rows = await buildIndexRows(targetRoot);
  const indexPath = path.join(targetRoot, "00-README.md");

  const lines = [
    "# Indice - Aplicaciones",
    "",
    "> Este indice se actualiza automaticamente con `pnpm docs:new-app` y `pnpm docs:sync-app-status`.",
    "",
    "> El indice refleja aplicaciónes con documentación generada. No implica que ya exista un workspace implementado en `src/apps/`, `src/mobile/` o `src/desktop/`.",
    "",
    "## Estructura",
    "",
    "- Carpeta app: `FASE_[N]-[NOMBRE]`",
    "- Carpeta plataforma: `WEB`, `MOVIL` o `DESKTOP`",
    "",
    "## Orden canonico de documentos por app",
    "",
    "| Documento | Se basa en | Genera |",
    "| --- | --- | --- |",
    "| `01-PRD.md` | Idea | `02-SRS.md` |",
    "| `02-SRS.md` | `01-PRD.md` | `03-FRD.md` |",
    "| `03-FRD.md` | `02-SRS.md` | `04-Flujos y Secuencias.md` |",
    "| `04-Flujos y Secuencias.md` | `03-FRD.md` | `05-Tests Unitarios.md` |",
    "| `06-Esquema de Datos.md` / `07-ERM.md` | `02-SRS.md` | `08-Decisiones de Arquitectura.md` |",
    "| `08-Decisiones de Arquitectura.md` | `02-SRS.md` + `03-FRD.md` | `09-Especificación Tecnica.md` |",
    "| `10-OWASP.md` | `08-Decisiones de Arquitectura.md` | Definiciones tecnicas y controles |",
    "| `11-SLA y SLO.md` | `01-PRD.md` | Definiciones tecnicas y operativas |",
    "",
    "Notas:",
    "",
    "- `07-ERM.md` se mantiene como documento obligatorio del ecosistema y acompana el eje de datos/arquitectura para riesgos, operación y continuidad.",
    "- El prefijo numerico define el orden de lectura, elaboración y mantenimiento dentro de cada app.",
    "",
    "## Aplicaciones generadas",
    "",
    "<!-- apps-generated-table:start -->",
  ];

  if (rows.length === 0) {
    lines.push("Aun no hay aplicaciónes generadas.");
  } else {
    lines.push("| Fase | App | Plataforma | Ruta |");
    lines.push("| --- | --- | --- | --- |");
    for (const row of rows) {
      lines.push(
        `| ${row.phase} | ${row.displayName} | ${row.platform} | [${row.relativePath}](${row.relativePath}) |`,
      );
    }
  }

  lines.push("<!-- apps-generated-table:end -->");
  lines.push("");

  lines.push("## Estado actual de implementación del repo");
  lines.push("");
  lines.push("<!-- app-implementation-status:start -->");
  lines.push("<!-- app-implementation-status:end -->");
  lines.push("");
  lines.push(
    "Cuando se implemente una app nueva, su workspace debe crearse en `src/<plataforma>/` y mantenerse alineado con su carpeta documental en `docs/02-Aplicaciones/`.",
  );
  lines.push("");

  await fs.writeFile(indexPath, `${lines.join("\n")}`, "utf8");
}

async function copyTemplateMarkdownTree(sourceDir, targetDir, replacements) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(targetPath, { recursive: true });
      await copyTemplateMarkdownTree(sourcePath, targetPath, replacements);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!entry.name.toLowerCase().endsWith(".md")) {
      continue;
    }

    const content = await fs.readFile(sourcePath, "utf8");
    const replaced = content
      .replace(/\[NOMBRE_APP\]/g, replacements.nombre)
      .replace(/\[APP\]/g, replacements.appCode)
      .replace(/\[Web\|Mobile\|Desktop\]/g, replacements.plataforma);

    await fs.writeFile(targetPath, replaced, "utf8");
  }
}

async function main() {
  const { fase, nombre, plataforma } = parseArgs(process.argv.slice(2));

  if (!/^\d+$/.test(fase)) {
    console.error("Error: la fase debe ser numerica.");
    usage();
    process.exit(1);
  }

  if (Number(fase) <= 0) {
    console.error("Error: la fase debe ser mayor que cero.");
    usage();
    process.exit(1);
  }

  if (!nombre.trim()) {
    console.error("Error: el nombre de la app es obligatorio.");
    usage();
    process.exit(1);
  }

  if (!VALID_PLATFORMS.has(plataforma)) {
    console.error("Error: plataforma invalida. Opciones: WEB, MOVIL, DESKTOP.");
    usage();
    process.exit(1);
  }

  const root = process.cwd();
  const templateDir = path.join(
    root,
    "docs",
    "02-Aplicaciones",
    "_Plantilla-App",
  );
  const targetRoot = path.join(root, "docs", "02-Aplicaciones");
  const folderSuffix = toFolderName(nombre);
  const folderValidationError = validateFolderSuffix(folderSuffix);
  if (folderValidationError) {
    console.error(folderValidationError);
    process.exit(1);
  }

  const appFolderName = `FASE_${fase}-${folderSuffix}`;
  const appDir = path.join(targetRoot, appFolderName);
  const platformDir = path.join(appDir, plataforma);
  const appCode = toAppCode(nombre);

  try {
    const templateStat = await fs.stat(templateDir);
    if (!templateStat.isDirectory()) {
      throw new Error("Plantilla no valida");
    }
  } catch {
    console.error(`Error: no existe la plantilla base en ${templateDir}`);
    process.exit(1);
  }

  await fs.mkdir(targetRoot, { recursive: true });

  try {
    await fs.stat(platformDir);
    console.error(`Error: la ruta destino ya existe: ${platformDir}`);
    process.exit(1);
  } catch {
    // Ruta disponible.
  }

  await fs.mkdir(platformDir, { recursive: true });
  await copyTemplateMarkdownTree(templateDir, platformDir, {
    nombre,
    appCode,
    plataforma,
  });

  await updateIndex(targetRoot);
  await syncAppStatusDocs(root);

  console.log("Documentación creada con exito:");
  console.log(`- ${platformDir}`);
  console.log(`- ${path.join(targetRoot, "00-README.md")}`);
  console.log(
    "Archivos: 00-README.md, 01-PRD.md, 02-SRS.md, 03-FRD.md, 04-Flujos y Secuencias.md, 05-Tests Unitarios.md, 06-Esquema de Datos.md, 07-ERM.md, 08-Decisiones de Arquitectura.md, 09-Especificación Tecnica.md, 10-OWASP.md, 11-SLA y SLO.md",
  );
}

main().catch((error) => {
  console.error("Error inesperado:", error.message);
  process.exit(1);
});
