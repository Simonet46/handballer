/**
 * Prueba de humo del motor: simula N carreras completas con semilla fija y
 * muestra la distribución de veredictos y la ruta de clubes.
 *
 *   node scripts/smoke-test.mjs [carreras]
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  POSITIONS,
  advanceCareer,
  createCareer,
  createRng,
  loadUniverse,
  shareText,
  startableCountries
} from "../src/game-engine.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => JSON.parse(readFileSync(join(root, "data", name), "utf8"));

const universe = loadUniverse({ leagues: read("leagues.json"), countries: read("countries.json") });
console.log(`universo: ${universe.clubs} clubes en ${universe.leagues} ligas`);
console.log(`países jugables: ${startableCountries().map((c) => c.name).join(", ")}\n`);

const runs = Number(process.argv[2]) || 300;
const verdicts = new Map();
const scores = [];
let sample = null;

for (let index = 0; index < runs; index += 1) {
  const rng = createRng(index + 1);
  const country = startableCountries()[index % startableCountries().length];
  const position = POSITIONS[index % POSITIONS.length];
  const career = createCareer(
    { lastName: "TEST", number: 7, country: country.code, position: position.code, pace: 2 },
    rng
  );

  let guard = 0;
  while (!career.ended && guard++ < 60) {
    const options = career.pendingEvent?.choices ?? [];
    const chosen = options.length ? options[Math.floor(rng() * options.length)].id : null;
    advanceCareer(career, chosen, rng);
  }
  if (!career.ended) throw new Error(`carrera ${index} no terminó en ${guard} pasos`);

  verdicts.set(career.verdict.title, (verdicts.get(career.verdict.title) || 0) + 1);
  scores.push(career.score);
  if (index === 0) sample = career;
}

scores.sort((a, b) => a - b);
const percentile = (p) => scores[Math.floor((scores.length - 1) * p)];

console.log(`${runs} carreras completadas`);
console.log(`score  p10=${percentile(0.1)}  mediana=${percentile(0.5)}  p90=${percentile(0.9)}  max=${scores.at(-1)}`);
console.log("\nveredictos:");
for (const [title, count] of [...verdicts].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(count).padStart(4)}  ${(count * 100 / runs).toFixed(1).padStart(5)}%  ${title}`);
}

console.log("\n--- carrera de ejemplo ---");
console.log(`${sample.player.lastName} (${sample.player.positionName}, ${sample.player.countryName})`);
for (const season of sample.timeline) {
  const line = `  ${season.year} ${String(season.age).padStart(2)}a  ${season.club.padEnd(30)} ` +
    `${season.league?.padEnd(24) ?? "".padEnd(24)} VAL ${season.rating}  ` +
    `${season.matches}pj ${season.goals}g`;
  // Cada honour es {key, params, name}: el name viene sin traducir, alcanza acá.
  console.log(season.honours.length ? `${line}   🏆 ${season.honours.map((h) => h.name).join(", ")}` : line);
}
console.log(`\n${shareText(sample)}`);
