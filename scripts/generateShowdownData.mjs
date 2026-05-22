import { existsSync, mkdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const { Dex } = require("pokemon-showdown");

const MOVE_OUTPUT_PATH = resolve("src/data/moveDetails.generated.json");
const MOVE_TMP_PATH = resolve("src/data/moveDetails.generated.tmp.json");
const POKEMON_OUTPUT_PATH = resolve("src/data/pokemonDetails.generated.json");
const POKEMON_TMP_PATH = resolve("src/data/pokemonDetails.generated.tmp.json");
const SOURCE = "pokemon-showdown-dex";
const SHOWDOWN_SPRITES_BASE_URL = "https://play.pokemonshowdown.com/sprites";
const POKEAPI_SPRITES_GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

const generatedAt = new Date().toISOString();
const moves = buildMoveDatabase();
const pokemon = buildPokemonDatabase();

writeJsonSafely(MOVE_TMP_PATH, MOVE_OUTPUT_PATH, {
  generatedAt,
  source: SOURCE,
  count: Object.keys(moves).length,
  moves,
});

writeJsonSafely(POKEMON_TMP_PATH, POKEMON_OUTPUT_PATH, {
  generatedAt,
  source: SOURCE,
  count: Object.keys(pokemon).length,
  pokemon,
});

console.log(`Pokemon Showdown move data generated: ${Object.keys(moves).length} moves.`);
console.log(`Pokemon Showdown pokemon data generated: ${Object.keys(pokemon).length} Pokemon.`);

function buildMoveDatabase() {
  const entries = Object.entries(Dex.data.Moves ?? {});
  const database = {};

  entries.forEach(([dexId, move]) => {
    if (!move || move.isNonstandard === "CAP") {
      return;
    }

    const details = mapMoveDetails(dexId, {
      ...move,
      ...Dex.moves.get(dexId),
    });
    const key = normalizeKey(details.displayName || dexId);

    if (!key) {
      return;
    }

    database[key] = details;
  });

  return sortObjectByKey(database);
}

function buildPokemonDatabase() {
  const entries = Object.entries(Dex.data.Pokedex ?? {});
  const database = {};

  entries.forEach(([dexId, species]) => {
    if (!species?.name || !species.baseStats) {
      return;
    }

    const details = mapPokemonDetails(dexId, {
      ...species,
      ...Dex.species.get(dexId),
    });
    const key = normalizeKey(details.displayName || dexId);

    if (!key) {
      return;
    }

    database[key] = details;
  });

  return sortObjectByKey(database);
}

function mapMoveDetails(dexId, move) {
  const displayName = formatDisplayName(move.name || dexId);
  const power = Number(move.basePower || 0) > 0 ? Number(move.basePower) : null;
  const accuracy = move.accuracy === true ? null : move.accuracy ?? null;
  const shortEffect = cleanText(move.shortDesc || move.desc || "");
  const effect = cleanText(move.desc || move.shortDesc || "");
  const description = shortEffect || effect || "Descricao nao disponivel no banco local.";

  return {
    id: move.num ?? null,
    name: normalizeKey(displayName),
    displayName,
    type: formatDisplayName(move.type || ""),
    damageClass: formatDamageClass(move.category),
    power,
    accuracy,
    pp: move.pp ?? null,
    priority: move.priority ?? 0,
    target: formatTarget(move.target),
    generation: formatGeneration(move.gen),
    shortEffect,
    effect,
    flavorText: effect || shortEffect,
    description,
    source: SOURCE,
  };
}

function mapPokemonDetails(dexId, species) {
  const displayName = formatDisplayName(species.name || dexId);
  const key = normalizeKey(displayName || dexId);
  const localSprite = `/sprites/pokemon/${key}.png`;
  const spriteCandidates = [localSprite, ...getPokemonSpriteCandidates(species, key)];
  const stats = {
    hp: species.baseStats?.hp ?? null,
    attack: species.baseStats?.atk ?? null,
    defense: species.baseStats?.def ?? null,
    specialAttack: species.baseStats?.spa ?? null,
    specialDefense: species.baseStats?.spd ?? null,
    speed: species.baseStats?.spe ?? null,
  };

  return {
    id: species.num ?? null,
    name: key,
    displayName,
    localSprite,
    sprite: localSprite,
    spriteCandidates,
    types: Array.isArray(species.types) ? species.types : [],
    height: toPokeApiHeight(species.heightm),
    weight: toPokeApiWeight(species.weightkg),
    baseExperience: null,
    abilities: formatAbilities(species.abilities),
    stats,
    totalStats: Object.values(stats).reduce((total, value) => total + Number(value || 0), 0),
    source: SOURCE,
  };
}

function normalizeKey(name) {
  return String(name || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019'`.]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function getShowdownSpriteId(species, key) {
  return normalizeSpriteId(species?.spriteid || species?.id || key);
}

function getPokemonSpriteCandidates(species, key) {
  const ids = new Set();

  [
    getShowdownSpriteId(species, key),
    species?.id,
    species?.spriteid,
    key,
    species?.name,
    normalizeKey(species?.name),
  ].forEach((value) => {
    addSpriteIdVariants(ids, value);
  });

  const showdownUrls = [...ids]
    .filter(Boolean)
    .flatMap((spriteId) => [
      `${SHOWDOWN_SPRITES_BASE_URL}/dex/${spriteId}.png`,
      `${SHOWDOWN_SPRITES_BASE_URL}/gen5/${spriteId}.png`,
      `${SHOWDOWN_SPRITES_BASE_URL}/ani/${spriteId}.gif`,
      `${SHOWDOWN_SPRITES_BASE_URL}/gen5ani/${spriteId}.gif`,
    ]);
  const numericUrls = Number(species?.num || 0) > 0
    ? [
        `${POKEAPI_SPRITES_GITHUB_BASE_URL}/${species.num}.png`,
        `${POKEAPI_SPRITES_GITHUB_BASE_URL}/other/showdown/${species.num}.gif`,
        `${POKEAPI_SPRITES_GITHUB_BASE_URL}/other/official-artwork/${species.num}.png`,
      ]
    : [];

  return [...new Set([...showdownUrls, ...numericUrls])];
}

function addSpriteIdVariants(ids, value) {
  const normalizedId = normalizeSpriteId(value);
  const aliasIds = getSpriteAliases(normalizedId);

  if (!normalizedId) {
    return;
  }

  ids.add(normalizedId);
  ids.add(normalizedId.replace(/-/g, ""));

  aliasIds.forEach((aliasId) => {
    ids.add(aliasId);
    ids.add(aliasId.replace(/-/g, ""));
  });
}

function normalizeSpriteId(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019'`.]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function getSpriteAliases(spriteId) {
  const aliases = {
    farfetchd: ["farfetchd"],
    farfetchdoriginal: ["farfetchd"],
    "farfetch-d": ["farfetchd"],
    "mr-mime": ["mrmime"],
    mrmime: ["mrmime"],
    "nidoran-f": ["nidoranf"],
    nidoranf: ["nidoranf"],
    "nidoran-m": ["nidoranm"],
    nidoranm: ["nidoranm"],
    "oricorio-pa-u": ["oricorio-pau", "oricoriopau"],
    "oricorio-pau": ["oricorio-pau", "oricoriopau"],
    "toxtricity-low-key": ["toxtricity-low-key", "toxtricitylowkey"],
    "lycanroc-dusk": ["lycanroc-dusk", "lycanrocdusk"],
    "ogerpon-hearthflame": ["ogerpon-hearthflame", "ogerpon-hearthflame-mask"],
  };

  return aliases[spriteId] ?? [];
}

function formatDisplayName(name) {
  const rawName = String(name || "").trim();

  if (!rawName) {
    return "";
  }

  return rawName
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(formatDisplayWord)
    .join(" ");
}

function formatDisplayWord(word) {
  if (/^[IVX]+$/i.test(word)) {
    return word.toUpperCase();
  }

  if (word.includes("-")) {
    return word.split("-").map(formatDisplayWord).join("-");
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function formatDamageClass(name) {
  const damageClass = formatDisplayName(name);

  if (damageClass === "Other") {
    return "Status";
  }

  return damageClass || "";
}

function formatTarget(name) {
  return String(name || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(formatDisplayWord)
    .join(" ");
}

function formatGeneration(gen) {
  if (!gen) {
    return "";
  }

  return `Generation ${gen}`;
}

function formatAbilities(abilities) {
  return Object.values(abilities ?? {})
    .filter(Boolean)
    .map(formatDisplayName);
}

function cleanText(text) {
  return String(text || "")
    .replace(/\n|\f/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toPokeApiHeight(heightm) {
  return heightm === undefined || heightm === null ? null : Math.round(Number(heightm) * 10);
}

function toPokeApiWeight(weightkg) {
  return weightkg === undefined || weightkg === null ? null : Math.round(Number(weightkg) * 10);
}

function sortObjectByKey(object) {
  return Object.fromEntries(Object.entries(object).sort(([left], [right]) => left.localeCompare(right)));
}

function writeJsonSafely(tmpPath, outputPath, data) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(tmpPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  if (existsSync(outputPath)) {
    unlinkSync(outputPath);
  }

  renameSync(tmpPath, outputPath);
}
