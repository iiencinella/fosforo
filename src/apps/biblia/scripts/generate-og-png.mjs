import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, "..", "public", "og-biblia.svg");
const pngPath = join(__dirname, "..", "public", "og-biblia.png");

const svgBuffer = readFileSync(svgPath);

await sharp(svgBuffer).png().resize(1200, 630).toFile(pngPath);

console.log("Generated og-biblia.png (1200x630)");
