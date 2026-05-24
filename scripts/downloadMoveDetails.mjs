import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MOVE_LIST_URL = "https://pokeapi.co/api/v2/move?limit=2000";
const CONCURRENCY = 8;
const MAX_ATTEMPTS = 3;
const BATCH_DELAY_MS = 80;

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outputDir = resolve(projectRoot, "public/data");
const outputPath = resolve(outputDir, "moveDetails.generated.json");
const tmpPath = resolve(outputDir, "moveDetails.generated.tmp.json");

async function main() {
  console.log(`Buscando lista de moves: ${MOVE_LIST_URL}`);
  const moveList = await fetchJsonWithRetry(MOVE_LIST_URL);
  const moves = Array.isArray(moveList.results) ? moveList.results : [];

  if (moves.length === 0) {
    throw new Error("A PokeAPI retornou uma lista vazia de moves.");
  }

  const mappedMoves = {};
  let completed = 0;

  await runWithConcurrency(moves, CONCURRENCY, async (move) => {
    completed += 1;
    console.log(`Baixando move ${completed}/${moves.length}: ${move.name}`);

    const rawMove = await fetchJsonWithRetry(move.url);
    const mappedMove = mapMoveDetails(rawMove);
    mappedMoves[mappedMove.name] = mappedMove;
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "https://pokeapi.co/api/v2/move",
    count: Object.keys(mappedMoves).length,
    moves: Object.fromEntries(
      Object.entries(mappedMoves).sort(([a], [b]) => a.localeCompare(b)),
    ),
  };

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(tmpPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  if (!existsSync(tmpPath)) {
    throw new Error("Arquivo temporario nao foi criado.");
  }

  renameSync(tmpPath, outputPath);
  console.log(`Banco local de moves gerado com ${payload.count} moves.`);
  console.log(outputPath);
}

async function runWithConcurrency(items, concurrency, worker) {
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await worker(items[currentIndex], currentIndex);

      if (currentIndex > 0 && currentIndex % concurrency === 0) {
        await delay(BATCH_DELAY_MS);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()),
  );
}

async function fetchJsonWithRetry(url) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} em ${url}`);
      }

      return response.json();
    } catch (error) {
      lastError = error;

      if (attempt < MAX_ATTEMPTS) {
        await delay(250 * attempt);
      }
    }
  }

  throw lastError;
}

function mapMoveDetails(rawMove) {
  const englishEffect = rawMove.effect_entries?.find((entry) => entry.language?.name === "en");
  const englishFlavorTexts = (rawMove.flavor_text_entries ?? []).filter(
    (entry) => entry.language?.name === "en",
  );
  const flavorText = englishFlavorTexts.at(-1)?.flavor_text ?? "";

  return {
    id: rawMove.id,
    name: rawMove.name,
    displayName: formatMoveDisplayName(rawMove.name),
    type: formatPokemonType(rawMove.type?.name),
    damageClass: formatDamageClass(rawMove.damage_class?.name),
    power: rawMove.power ?? null,
    accuracy: rawMove.accuracy ?? null,
    pp: rawMove.pp ?? null,
    priority: rawMove.priority ?? 0,
    target: formatTarget(rawMove.target?.name),
    generation: formatGeneration(rawMove.generation?.name),
    shortEffect: cleanText(englishEffect?.short_effect ?? ""),
    effect: cleanText(englishEffect?.effect ?? ""),
    flavorText: cleanText(flavorText),
  };
}

function formatMoveDisplayName(apiName) {
  if (apiName === "will-o-wisp") {
    return "Will-O-Wisp";
  }

  if (apiName === "u-turn") {
    return "U-turn";
  }

  return formatWords(apiName);
}

function formatPokemonType(type) {
  return formatWords(type);
}

function formatDamageClass(name) {
  return formatWords(name);
}

function formatGeneration(name) {
  return formatWords(name);
}

function formatTarget(name) {
  return formatWords(name);
}

function formatWords(value) {
  return String(value || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function cleanText(text) {
  return String(text || "")
    .replace(/\n|\f/g, " ")
    .replace(/\$effect_chance/g, "chance")
    .replace(/\s+/g, " ")
    .trim();
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
