import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("public", "assets");
const destination = resolve("dist-pages", "assets");

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true, force: true });

const expected = [
  "planet.webp",
  "home-bg.webp",
  "seed.webp",
  "scene-luobei.webp",
  "scene-soil.webp",
  "scene-weather.webp",
  "scene-field.webp",
  "scene-harvest.webp",
  "scene-transport.webp",
  "scene-processing.webp",
  "card-01.webp",
  "card-02.webp",
  "card-03.webp",
  "card-04.webp",
  "card-05.webp",
  "card-06.webp",
  "card-07.webp",
  "card-08.webp",
  "card-09.webp",
  "card-10.webp",
  "night-field.wav"
];

const copied = new Set(await readdir(destination));
const missing = expected.filter((file) => !copied.has(file));

if (missing.length > 0) {
  throw new Error(`Static asset copy failed. Missing: ${missing.join(", ")}`);
}

for (const file of expected) {
  const info = await stat(resolve(destination, file));
  if (info.size === 0) {
    throw new Error(`Static asset copy failed. Empty file: ${file}`);
  }
}

console.log(`Verified ${expected.length} static assets in dist-pages/assets.`);
