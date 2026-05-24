const DATA_URLS = {
  pokemon: "/data/pokemonDetails.generated.json",
  moves: "/data/moveDetails.generated.json",
  abilities: "/data/abilityDetails.generated.json",
};

const EMPTY_POKEMON_DATABASE = {
  generatedAt: null,
  source: "fallback-empty",
  count: 0,
  pokemon: {},
};

const EMPTY_MOVE_DATABASE = {
  generatedAt: null,
  source: "fallback-empty",
  count: 0,
  moves: {},
};

const EMPTY_ABILITY_DATABASE = {
  generatedAt: null,
  source: "fallback-empty",
  count: 0,
  abilities: {},
};

const dataCache = new Map();

export async function loadPokemonDatabase() {
  return loadJsonData(DATA_URLS.pokemon, EMPTY_POKEMON_DATABASE, isValidPokemonDatabase);
}

export async function loadMoveDatabase() {
  return loadJsonData(DATA_URLS.moves, EMPTY_MOVE_DATABASE, isValidMoveDatabase);
}

export async function loadAbilityDatabase() {
  return loadJsonData(DATA_URLS.abilities, EMPTY_ABILITY_DATABASE, isValidAbilityDatabase);
}

async function loadJsonData(url, fallbackData, validate) {
  if (dataCache.has(url)) {
    return dataCache.get(url);
  }

  const request = fetchJsonData(url, fallbackData, validate);
  dataCache.set(url, request);
  return request;
}

async function fetchJsonData(url, fallbackData, validate) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return fallbackData;
    }

    const data = await response.json();

    return validate(data) ? data : fallbackData;
  } catch (error) {
    return fallbackData;
  }
}

function isValidPokemonDatabase(data) {
  return data && typeof data === "object" && data.pokemon && typeof data.pokemon === "object";
}

function isValidMoveDatabase(data) {
  return data && typeof data === "object" && data.moves && typeof data.moves === "object";
}

function isValidAbilityDatabase(data) {
  return data && typeof data === "object" && data.abilities && typeof data.abilities === "object";
}
