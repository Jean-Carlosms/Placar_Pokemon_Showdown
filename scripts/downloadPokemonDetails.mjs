import { existsSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const POKEMON_LIST_URL = "https://pokeapi.co/api/v2/pokemon?limit=20000";
const CONCURRENCY = 8;
const MAX_ATTEMPTS = 3;
const BATCH_DELAY_MS = 80;

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outputPath = resolve(projectRoot, "src/data/pokemonDetails.generated.json");
const tmpPath = resolve(projectRoot, "src/data/pokemonDetails.generated.tmp.json");

async function main() {
  console.log(`Buscando lista de Pokemon: ${POKEMON_LIST_URL}`);
  const pokemonList = await fetchJsonWithRetry(POKEMON_LIST_URL);
  const pokemon = Array.isArray(pokemonList.results) ? pokemonList.results : [];

  if (pokemon.length === 0) {
    throw new Error("A PokeAPI retornou uma lista vazia de Pokemon.");
  }

  const mappedPokemon = {};
  let completed = 0;

  await runWithConcurrency(pokemon, CONCURRENCY, async (pokemonItem) => {
    completed += 1;
    console.log(`Baixando Pokemon ${completed}/${pokemon.length}: ${pokemonItem.name}`);

    const rawPokemon = await fetchJsonWithRetry(pokemonItem.url);
    const mappedDetails = mapPokemonDetails(rawPokemon);
    mappedPokemon[mappedDetails.name] = mappedDetails;
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "https://pokeapi.co/api/v2/pokemon",
    count: Object.keys(mappedPokemon).length,
    pokemon: Object.fromEntries(
      Object.entries(mappedPokemon).sort(([a], [b]) => a.localeCompare(b)),
    ),
  };

  writeFileSync(tmpPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  if (!existsSync(tmpPath)) {
    throw new Error("Arquivo temporario nao foi criado.");
  }

  renameSync(tmpPath, outputPath);
  console.log(`Banco local de Pokemon gerado com ${payload.count} registros.`);
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

  if (lastError?.cause?.code === "SELF_SIGNED_CERT_IN_CHAIN") {
    throw new Error(
      "Falha ao baixar Pokemon por certificado self-signed. Em rede corporativa, execute fora da rede, configure NODE_EXTRA_CA_CERTS ou use NODE_TLS_REJECT_UNAUTHORIZED=0 apenas temporariamente para gerar o JSON local.",
    );
  }

  throw lastError;
}

function mapPokemonDetails(rawPokemon) {
  const stats = {
    hp: getStatValue(rawPokemon, "hp"),
    attack: getStatValue(rawPokemon, "attack"),
    defense: getStatValue(rawPokemon, "defense"),
    specialAttack: getStatValue(rawPokemon, "special-attack"),
    specialDefense: getStatValue(rawPokemon, "special-defense"),
    speed: getStatValue(rawPokemon, "speed"),
  };

  return {
    id: rawPokemon.id,
    name: normalizePokemonKey(rawPokemon.name),
    displayName: formatPokemonDisplayName(rawPokemon.name),
    sprite:
      rawPokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default ||
      rawPokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.front_default ||
      rawPokemon.sprites?.front_default ||
      null,
    types: (rawPokemon.types ?? [])
      .slice()
      .sort((a, b) => a.slot - b.slot)
      .map((item) => formatPokemonType(item.type?.name))
      .filter(Boolean),
    height: rawPokemon.height ?? null,
    weight: rawPokemon.weight ?? null,
    baseExperience: rawPokemon.base_experience ?? null,
    abilities: (rawPokemon.abilities ?? [])
      .map((item) => formatAbilityName(item.ability?.name))
      .filter(Boolean),
    stats,
    totalStats: Object.values(stats).reduce((total, value) => total + Number(value || 0), 0),
  };
}

function normalizePokemonKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[']/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatPokemonDisplayName(apiName) {
  return formatWords(apiName);
}

function formatPokemonType(type) {
  return formatWords(type);
}

function formatAbilityName(name) {
  return formatWords(name);
}

function getStatValue(rawPokemon, statName) {
  return rawPokemon.stats?.find((item) => item.stat?.name === statName)?.base_stat ?? null;
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
    .replace(/\s+/g, " ")
    .trim();
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main().catch((error) => {
  console.error(cleanText(error.message || error));
  process.exitCode = 1;
});
