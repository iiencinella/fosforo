import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VALID_PLATFORMS = ["WEB", "MOVIL", "DESKTOP"];
const PLATFORM_WORKSPACE_DIRS = {
  WEB: "src/apps",
  MOVIL: "src/mobile",
  DESKTOP: "src/desktop",
};

const APP_CATALOG = [
  {
    name: "Auth",
    aliases: ["auth"],
    defaultPhase: "1",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Sistema de Logueo",
    aliases: ["sistema-de-logueo"],
    defaultPhase: "1",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Biblia",
    aliases: ["biblia", "bible"],
    defaultPhase: "1",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Calendario Liturgico",
    aliases: ["calendario", "calendar"],
    defaultPhase: "1",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Fósforo Portal",
    aliases: ["portal", "fosforo-portal", "0101-portal"],
    defaultPhase: "1",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Panel de Administración",
    aliases: ["panel-de-administración", "admin-panel", "administracion"],
    defaultPhase: "1",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Gestion de Usuarios",
    aliases: ["gestion-de-usuarios", "usuarios", "usuario"],
    defaultPhase: "1",
  },
  {
    name: "Motor Liturgico",
    aliases: ["motor-liturgico"],
    defaultPhase: "1",
  },
  {
    name: "Horarios de Misas",
    aliases: ["horarios-de-misas", "horarios"],
    defaultPhase: "1",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Espiritualidad diaria",
    aliases: ["espiritualidad-diaria"],
    defaultPhase: "1",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Sistema de Notificaciónes",
    aliases: ["sistema-de-notificaciónes", "notificaciónes"],
    defaultPhase: "1",
  },
  {
    name: "Sistema de Contenidos (CMS)",
    aliases: ["sistema-de-contenidos", "cms"],
    defaultPhase: "1",
  },
  {
    name: "Log",
    aliases: ["log"],
    defaultPhase: "1",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Misal",
    aliases: ["misal"],
    defaultPhase: "2",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Oraciones",
    aliases: ["oraciones"],
    defaultPhase: "2",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Santopedia",
    aliases: ["santopedia"],
    defaultPhase: "2",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Vida de Misionero",
    aliases: ["vida-de-misionero"],
    defaultPhase: "2",
    defaultPlatforms: ["WEB"],
  },
  {
    name: "Visita 7 Iglesias",
    aliases: ["visita-7-iglesias"],
    defaultPhase: "2",
    defaultPlatforms: ["WEB"],
  },
  { name: "Lectio Divina", aliases: ["lectio-divina"] },
  { name: "Meditvoz", aliases: ["meditvoz"], defaultPhase: "5" },
  {
    name: "Agenda Comunitaria",
    aliases: ["agenda-comunitaria"],
    defaultPhase: "3",
  },
  { name: "Carisma", aliases: ["carisma"], defaultPhase: "3" },
  {
    name: "Historia de mi Iglesia",
    aliases: ["historia-de-mi-iglesia", "historia-iglesia"],
    defaultPhase: "3",
  },
  { name: "Confesiones", aliases: ["confesiones"] },
  { name: "Peticionario", aliases: ["peticionario"] },
  {
    name: "Servicio Sacerdotal al Difunto",
    aliases: ["servicio-sacerdotal-al-difunto"],
  },
  {
    name: "Servicios Pastorales",
    aliases: ["servicios-pastorales"],
    defaultPhase: "3",
  },
  { name: "Newsletter", aliases: ["newsletter"], defaultPhase: "3" },
  {
    name: "Cancionero",
    aliases: ["cancionero"],
    defaultPhase: "4",
    defaultPlatforms: ["WEB"],
  },
  { name: "Donaciónes", aliases: ["donaciónes"], defaultPhase: "4" },
  { name: "Buscador", aliases: ["buscador"], defaultPhase: "4" },
  { name: "Chatbot", aliases: ["chatbot"], defaultPhase: "4" },
  {
    name: "Biblioteca Vaticano",
    aliases: ["biblioteca-vaticano"],
    defaultPhase: "5",
  },
  { name: "Formación", aliases: ["formación"], defaultPhase: "5" },
  { name: "Motus", aliases: ["motus"], defaultPhase: "5" },
  { name: "Emprendedor", aliases: ["emprendedor"], defaultPhase: "5" },
  {
    name: "Bibliotecario IA",
    aliases: ["bibliotecario-ia"],
    defaultPhase: "5",
  },
  {
    name: "Calendario de Adviento",
    aliases: ["calendario-de-adviento"],
    defaultPhase: "5",
  },
  {
    name: "Calendario de Cuaresma",
    aliases: ["calendario-de-cuaresma"],
    defaultPhase: "5",
  },
];

const DOC_LIST_START = "<!-- apps-docs-list:start -->";
const DOC_LIST_END = "<!-- apps-docs-list:end -->";
const MATRIX_START = "<!-- app-status-matrix:start -->";
const MATRIX_END = "<!-- app-status-matrix:end -->";
const APPS_TABLE_START = "<!-- apps-generated-table:start -->";
const APPS_TABLE_END = "<!-- apps-generated-table:end -->";
const IMPLEMENTATION_START = "<!-- app-implementation-status:start -->";
const IMPLEMENTATION_END = "<!-- app-implementation-status:end -->";

function normalizeSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDisplayNameFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseDocFolder(folderName) {
  const match = /^FASE_(\d+)-(.+)$/.exec(folderName);
  if (!match) {
    return null;
  }

  let rawSlug = match[2];
  // Strip leading numeric prefix (e.g. "0101_portal" → "portal")
  rawSlug = rawSlug.replace(/^\d+_/, "");

  return {
    phase: Number(match[1]),
    slug: normalizeSlug(rawSlug),
    folderName,
  };
}

async function readDirectoryNames(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectDocumentedApps(rootDir) {
  const docsRoot = path.join(rootDir, "docs", "02-Aplicaciones");
  const topLevel = await readDirectoryNames(docsRoot);
  const rows = [];

  for (const folderName of topLevel) {
    if (folderName.startsWith("_")) {
      continue;
    }

    const parsed = parseDocFolder(folderName);
    if (!parsed) {
      continue;
    }

    const platformNames = await readDirectoryNames(
      path.join(docsRoot, folderName),
    );
    for (const platform of platformNames) {
      if (!VALID_PLATFORMS.includes(platform)) {
        continue;
      }

      const readmePath = path.join(
        docsRoot,
        folderName,
        platform,
        "00-README.md",
      );
      if (!(await pathExists(readmePath))) {
        continue;
      }

      rows.push({
        phase: parsed.phase,
        slug: parsed.slug,
        platform,
        readmeRelativePath: `../02-Aplicaciones/${folderName}/${platform}/00-README.md`,
      });
    }
  }

  rows.sort((a, b) => {
    if (a.phase !== b.phase) {
      return a.phase - b.phase;
    }
    if (a.slug !== b.slug) {
      return a.slug.localeCompare(b.slug, "es");
    }
    return a.platform.localeCompare(b.platform, "es");
  });

  return rows;
}

async function collectWorkspaces(rootDir) {
  const rows = [];

  for (const [platform, relativeDir] of Object.entries(
    PLATFORM_WORKSPACE_DIRS,
  )) {
    const absoluteDir = path.join(rootDir, relativeDir);
    const names = await readDirectoryNames(absoluteDir);

    for (const name of names) {
      rows.push({
        platform,
        slug: normalizeSlug(name),
        workspacePath: `${relativeDir}/${name}`,
      });
    }
  }

  rows.sort((a, b) => a.workspacePath.localeCompare(b.workspacePath, "es"));
  return rows;
}

function findCatalogEntry(slug) {
  return APP_CATALOG.find((entry) => entry.aliases.includes(slug));
}

function formatDocList(documentedApps) {
  if (documentedApps.length === 0) {
    return ["- Ninguna."];
  }

  return documentedApps.map((entry) => {
    const catalogEntry = findCatalogEntry(entry.slug);
    const displayName = catalogEntry
      ? catalogEntry.name
      : toDisplayNameFromSlug(entry.slug);
    const label =
      entry.platform === "WEB"
        ? displayName
        : `${displayName} (${entry.platform})`;
    return `- [${label}](${entry.readmeRelativePath})`;
  });
}

function formatAppsTable(documentedApps) {
  if (documentedApps.length === 0) {
    return ["Aun no hay aplicaciónes generadas."];
  }

  const lines = [
    "| Fase | App | Plataforma | Ruta |",
    "| --- | --- | --- | --- |",
  ];

  for (const entry of documentedApps) {
    const catalogEntry = findCatalogEntry(entry.slug);
    const displayName = catalogEntry
      ? catalogEntry.name
      : toDisplayNameFromSlug(entry.slug);
    const relativePath = entry.readmeRelativePath
      .replace(/^\.\.\/02-Aplicaciones\//, "./")
      .replace(/00-README\.md$/, "");

    lines.push(
      `| ${entry.phase} | ${displayName} | ${entry.platform} | [${relativePath}](${relativePath}) |`,
    );
  }

  return lines;
}

function joinValues(values) {
  return values.length > 0 ? values.join(", ") : "-";
}

function buildMatrixRows(documentedApps, workspaces) {
  const matchedDocKeys = new Set();
  const matchedWorkspacePaths = new Set();
  const rows = [];

  for (const entry of APP_CATALOG) {
    const docs = documentedApps.filter((item) =>
      entry.aliases.includes(item.slug),
    );
    const workspaceMatches = workspaces.filter((item) =>
      entry.aliases.includes(item.slug),
    );

    for (const doc of docs) {
      matchedDocKeys.add(`${doc.slug}:${doc.platform}:${doc.phase}`);
    }

    for (const workspace of workspaceMatches) {
      matchedWorkspacePaths.add(workspace.workspacePath);
    }

    const effectiveImplemented = workspaceMatches.length > 0;
    const effectiveWorkspace = workspaceMatches.map(
      (item) => item.workspacePath,
    );

    rows.push({
      name: entry.name,
      phase:
        docs.length > 0
          ? joinValues([...new Set(docs.map((item) => String(item.phase)))])
          : (entry.defaultPhase ?? "-"),
      platform:
        docs.length > 0
          ? joinValues([...new Set(docs.map((item) => item.platform))])
          : joinValues(entry.defaultPlatforms ?? []),
      documented: docs.length > 0 ? "Si" : "No",
      implemented: effectiveImplemented ? "Si" : "No",
      workspace: joinValues(effectiveWorkspace),
    });
  }

  const extras = [];

  for (const doc of documentedApps) {
    const docKey = `${doc.slug}:${doc.platform}:${doc.phase}`;
    if (matchedDocKeys.has(docKey)) {
      continue;
    }

    extras.push({
      name: toDisplayNameFromSlug(doc.slug),
      phase: String(doc.phase),
      platform: doc.platform,
      documented: "Si",
      implemented: "No",
      workspace: "-",
    });
  }

  for (const workspace of workspaces) {
    if (matchedWorkspacePaths.has(workspace.workspacePath)) {
      continue;
    }

    extras.push({
      name: toDisplayNameFromSlug(workspace.slug),
      phase: "-",
      platform: workspace.platform,
      documented: "No",
      implemented: "Si",
      workspace: workspace.workspacePath,
    });
  }

  extras.sort((a, b) => a.name.localeCompare(b.name, "es"));
  return rows.concat(extras);
}

function formatMatrix(rows) {
  const lines = [
    "| App | Fase | Plataforma | Documentada | Implementada | Workspace |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  for (const row of rows) {
    lines.push(
      `| ${row.name} | ${row.phase} | ${row.platform} | ${row.documented} | ${row.implemented} | ${row.workspace} |`,
    );
  }

  lines.push("");
  lines.push("- `Documentada`: existe carpeta en `docs/02-Aplicaciones/`.");
  lines.push(
    "- `Implementada`: existe workspace real en `src/apps/`, `src/mobile/` o `src/desktop/`.",
  );
  lines.push("- `Workspace`: ruta relativa del workspace cuando existe.");
  return lines;
}

function formatWorkspaceSummary(workspaces, packageNames) {
  const lines = [];

  for (const [platform, relativeDir] of Object.entries(
    PLATFORM_WORKSPACE_DIRS,
  )) {
    const matches = workspaces
      .filter((entry) => entry.platform === platform)
      .map((entry) => `\`${entry.workspacePath}\``);
    const label = `\`${relativeDir}/\``;

    if (matches.length === 0) {
      lines.push(`- ${label}: sin workspaces implementados actualmente.`);
      continue;
    }

    lines.push(`- ${label}: ${matches.join(", ")}.`);
  }

  const packageList = packageNames.map((name) => `\`${name}\``).join(", ");
  lines.push(
    `- \`src/packages/\`: paquetes compartidos activos ${packageList}.`,
  );
  return lines;
}

async function replaceMarkedBlock(
  filePath,
  startMarker,
  endMarker,
  contentLines,
) {
  const content = await fs.readFile(filePath, "utf8");
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`No se encontraron marcadores validos en ${filePath}`);
  }

  const before = content.slice(0, startIndex + startMarker.length);
  const after = content.slice(endIndex);
  const middle = `\n${contentLines.join("\n")}\n`;
  await fs.writeFile(filePath, `${before}${middle}${after}`, "utf8");
}

export async function syncAppStatusDocs(rootDir = process.cwd()) {
  const documentedApps = await collectDocumentedApps(rootDir);
  const workspaces = await collectWorkspaces(rootDir);
  const packageNames = await readDirectoryNames(
    path.join(rootDir, "src", "packages"),
  );
  const matrixRows = buildMatrixRows(documentedApps, workspaces);

  await replaceMarkedBlock(
    path.join(rootDir, "docs", "00-General", "04-Listado-de-Aplicaciones.md"),
    DOC_LIST_START,
    DOC_LIST_END,
    formatDocList(documentedApps),
  );

  await replaceMarkedBlock(
    path.join(rootDir, "docs", "00-General", "04-Listado-de-Aplicaciones.md"),
    MATRIX_START,
    MATRIX_END,
    formatMatrix(matrixRows),
  );

  await replaceMarkedBlock(
    path.join(rootDir, "docs", "02-Aplicaciones", "00-README.md"),
    APPS_TABLE_START,
    APPS_TABLE_END,
    formatAppsTable(documentedApps),
  );

  await replaceMarkedBlock(
    path.join(rootDir, "docs", "02-Aplicaciones", "00-README.md"),
    IMPLEMENTATION_START,
    IMPLEMENTATION_END,
    formatWorkspaceSummary(workspaces, packageNames),
  );
}

const currentModulePath = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === currentModulePath) {
  syncAppStatusDocs().catch((error) => {
    console.error("Error al sincronizar el estado de apps:", error.message);
    process.exit(1);
  });
}
