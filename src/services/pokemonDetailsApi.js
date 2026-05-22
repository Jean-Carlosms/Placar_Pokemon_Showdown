import pokemonDetailsData from "../data/pokemonDetails.generated.json";
import {
  getLocalPokemonSprite,
  getPokemonSpriteFallbacks,
  getPokemonSprite,
  getPokemonTypes,
  normalizePokemonApiName,
} from "./pokemonApi.js";

const IS_DEV = Boolean(import.meta.env?.DEV);
const POKEAPI_POKEMON_BASE_URL = IS_DEV
  ? "/pokeapi/api/v2/pokemon"
  : "https://pokeapi.co/api/v2/pokemon";

const POKEMON_NAME_ALIASES = {
  "ogerpon-hearthflame": "ogerpon-hearthflame-mask",
};

const pokemonDetailsCache = new Map();

export { normalizePokemonApiName };

export async function getPokemonDetails(pokemonName) {
  const apiName = normalizePokemonApiName(pokemonName);

  if (!apiName) {
    return createBasicPokemonFallback(pokemonName);
  }

  if (pokemonDetailsCache.has(apiName)) {
    return pokemonDetailsCache.get(apiName);
  }

  const detailsRequest = fetchPokemonDetails(apiName, pokemonName);
  pokemonDetailsCache.set(apiName, detailsRequest);

  return detailsRequest;
}

async function fetchPokemonDetails(apiName, originalName) {
  const lookupName = getPokemonLookupName(apiName);
  const localPokemon = getLocalPokemon(apiName) ?? getLocalPokemon(lookupName);

  if (localPokemon) {
    const spriteCandidates = getPokemonSpriteCandidates(localPokemon, apiName);

    return {
      ...localPokemon,
      sprite:
        localPokemon.sprite ||
        spriteCandidates[0] ||
        getLocalPokemonSprite(apiName),
      spriteCandidates,
      source: "local-pokemon-database",
    };
  }

  const fallbackPokemon = await createPokemonFallbackFromKnownData(apiName, originalName);

  try {
    const response = await fetch(`${POKEAPI_POKEMON_BASE_URL}/${lookupName}`);

    if (!response.ok) {
      return fallbackPokemon;
    }

    const pokemon = await response.json();

    return {
      ...mapPokemonDetails(pokemon),
      source: "pokeapi",
    };
  } catch (error) {
    return fallbackPokemon;
  }
}

function getLocalPokemon(apiName) {
  return pokemonDetailsData.pokemon?.[apiName] ?? null;
}

function getPokemonLookupName(apiName) {
  return POKEMON_NAME_ALIASES[apiName] ?? apiName;
}

async function createPokemonFallbackFromKnownData(apiName, originalName) {
  const displayName = formatPokemonDisplayName(originalName || apiName);
  const [types, sprite] = await Promise.all([
    getPokemonTypes(apiName),
    getPokemonSprite(apiName),
  ]);

  return {
    ...createBasicPokemonFallback(originalName || apiName),
    displayName,
    sprite: sprite || getLocalPokemonSprite(apiName),
    types,
    spriteCandidates: getPokemonSpriteFallbacks(displayName || apiName),
    source: types.length > 0 || sprite ? "local-fallback" : "basic-fallback",
    isBasicFallback: types.length === 0 && !sprite,
  };
}

function getPokemonSpriteCandidates(pokemon, fallbackName) {
  const localCandidates = Array.isArray(pokemon?.spriteCandidates) ? pokemon.spriteCandidates : [];
  const generatedCandidates = getPokemonSpriteFallbacks(pokemon?.displayName || pokemon?.name || fallbackName);

  return [
    pokemon?.sprite,
    ...localCandidates,
    ...generatedCandidates,
    getLocalPokemonSprite(pokemon?.displayName || pokemon?.name || fallbackName),
  ].filter((url, index, urls) => url && urls.indexOf(url) === index);
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
    name: rawPokemon.name,
    displayName: formatPokemonDisplayName(rawPokemon.name),
    sprite:
      rawPokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default ||
      rawPokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.front_default ||
      rawPokemon.sprites?.front_default ||
      null,
    types: (rawPokemon.types ?? [])
      .slice()
      .sort((a, b) => a.slot - b.slot)
      .map((item) => formatPokemonDisplayName(item.type?.name))
      .filter(Boolean),
    height: rawPokemon.height ?? null,
    weight: rawPokemon.weight ?? null,
    baseExperience: rawPokemon.base_experience ?? null,
    abilities: (rawPokemon.abilities ?? [])
      .map((item) => formatPokemonDisplayName(item.ability?.name))
      .filter(Boolean),
    stats,
    spriteCandidates: getPokemonSpriteFallbacks(rawPokemon.name),
    totalStats: Object.values(stats).reduce((total, value) => total + Number(value || 0), 0),
  };
}

function createBasicPokemonFallback(pokemonName) {
  const apiName = normalizePokemonApiName(pokemonName);

  return {
    unavailable: true,
    isBasicFallback: true,
    source: "basic-fallback",
    name: apiName,
    displayName: formatPokemonDisplayName(pokemonName || apiName),
    sprite: getLocalPokemonSprite(pokemonName || apiName),
    spriteCandidates: getPokemonSpriteFallbacks(pokemonName || apiName),
    types: [],
    height: null,
    weight: null,
    baseExperience: null,
    abilities: [],
    stats: {
      hp: null,
      attack: null,
      defense: null,
      specialAttack: null,
      specialDefense: null,
      speed: null,
    },
    totalStats: null,
    message: "Dados completos deste Pokemon nao estao disponiveis.",
  };
}

function getStatValue(rawPokemon, statName) {
  return rawPokemon.stats?.find((item) => item.stat?.name === statName)?.base_stat ?? null;
}

function formatPokemonDisplayName(name) {
  return String(name || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
