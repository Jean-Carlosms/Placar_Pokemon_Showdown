import { POKEMON_TYPE_FALLBACKS as EXTRA_POKEMON_TYPE_FALLBACKS } from "../data/pokemonTypeFallbacks.js";

const IS_DEV = Boolean(import.meta.env?.DEV);
const POKEAPI_BASE_URL = IS_DEV
  ? "/pokeapi/api/v2/pokemon"
  : "https://pokeapi.co/api/v2/pokemon";
const POKEAPI_SPRITES_GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const POKEMON_SHOWDOWN_SPRITES_BASE_URL = "https://play.pokemonshowdown.com/sprites";

const POKEAPI_SPRITE_IDS = {
  ambipom: 424,
  annihilape: 979,
  arboliva: 930,
  "arceus-dragon": 493,
  armarouge: 936,
  blissey: 242,
  bombirdier: 962,
  "chien-pao": 1002,
  cinderace: 815,
  copperajah: 879,
  diancie: 719,
  dudunsparce: 982,
  eiscue: 875,
  empoleon: 395,
  frosmoth: 873,
  gallade: 475,
  gardevoir: 282,
  "great-tusk": 984,
  hatterene: 858,
  hippowdon: 450,
  infernape: 392,
  "iron-hands": 992,
  "iron-treads": 990,
  "lycanroc-dusk": 745,
  lunala: 792,
  mabosstiff: 943,
  magmar: 126,
  milotic: 350,
  moltres: 146,
  ninetales: 38,
  "ogerpon-hearthflame": 1017,
  okidogi: 1014,
  "oricorio-pa-u": 741,
  "oricorio-pau": 741,
  pecharunt: 1025,
  polteageist: 855,
  quagsire: 195,
  raichu: 26,
  "raging-bolt": 1021,
  regieleki: 894,
  rillaboom: 812,
  scrafty: 560,
  sunflora: 192,
  swampert: 260,
  "tauros-paldea-aqua": 10252,
  "tauros-paldea-aqua-breed": 10252,
  "tauros-paldea-blaze": 10251,
  "tauros-paldea-blaze-breed": 10251,
  "tauros-paldea-combat": 10250,
  "tauros-paldea-combat-breed": 10250,
  "toxtricity-low-key": 849,
  trubbish: 568,
  umbreon: 197,
  vespiquen: 416,
  victreebel: 71,
  "walking-wake": 1009,
};

const POKEAPI_NAME_ALIASES = {
  "lycanroc-dusk": "lycanroc-dusk",
  "ogerpon-hearthflame": "ogerpon-hearthflame-mask",
  "oricorio-pa-u": "oricorio-pau",
  "oricorio-pau": "oricorio-pau",
  "tauros-paldea-aqua": "tauros-paldea-aqua-breed",
  "tauros-paldea-blaze": "tauros-paldea-blaze-breed",
  "tauros-paldea-combat": "tauros-paldea-combat-breed",
  "toxtricity-low-key": "toxtricity-low-key",
};

const SHOWDOWN_SPRITE_NAME_OVERRIDES = {
  "chien-pao": ["chien-pao"],
  "iron-treads": ["iron-treads"],
  "lycanroc-dusk": ["lycanroc-dusk", "lycanrocdusk"],
  "mr-mime": ["mrmime"],
  mrmime: ["mrmime"],
  "nidoran-f": ["nidoranf"],
  nidoranf: ["nidoranf"],
  "nidoran-m": ["nidoranm"],
  nidoranm: ["nidoranm"],
  "ogerpon-hearthflame": ["ogerpon-hearthflame", "ogerpon-hearthflame-mask"],
  "ogerpon-hearthflame-mask": ["ogerpon-hearthflame", "ogerpon-hearthflame-mask"],
  "oricorio-pa-u": ["oricorio-pau", "oricoriopau"],
  "oricorio-pau": ["oricorio-pau", "oricoriopau"],
  "raging-bolt": ["raging-bolt"],
  "tauros-paldea-aqua": ["tauros-paldeaaqua", "tauros-paldea-aqua"],
  "tauros-paldea-aqua-breed": ["tauros-paldeaaqua", "tauros-paldea-aqua"],
  "tauros-paldea-blaze": ["tauros-paldeablaze", "tauros-paldea-blaze"],
  "tauros-paldea-blaze-breed": ["tauros-paldeablaze", "tauros-paldea-blaze"],
  "tauros-paldea-combat": ["tauros-paldeacombat", "tauros-paldea-combat"],
  "tauros-paldea-combat-breed": ["tauros-paldeacombat", "tauros-paldea-combat"],
  "toxtricity-low-key": ["toxtricity-low-key", "toxtricitylowkey"],
};

const POKEMON_TYPE_FALLBACKS = {
  annihilape: ["Fighting", "Ghost"],
  arboliva: ["Grass", "Normal"],
  "arceus-dragon": ["Dragon"],
  armarouge: ["Fire", "Psychic"],
  "chien-pao": ["Dark", "Ice"],
  copperajah: ["Steel"],
  diancie: ["Rock", "Fairy"],
  dudunsparce: ["Normal"],
  empoleon: ["Water", "Steel"],
  frosmoth: ["Ice", "Bug"],
  gardevoir: ["Psychic", "Fairy"],
  "great-tusk": ["Ground", "Fighting"],
  infernape: ["Fire", "Fighting"],
  "iron-hands": ["Fighting", "Electric"],
  ninetales: ["Fire"],
  "ogerpon-hearthflame": ["Grass", "Fire"],
  "ogerpon-hearthflame-mask": ["Grass", "Fire"],
  pecharunt: ["Poison", "Ghost"],
  polteageist: ["Ghost"],
  "raging-bolt": ["Electric", "Dragon"],
  regieleki: ["Electric"],
  sunflora: ["Grass"],
  swampert: ["Water", "Ground"],
  "tauros-paldea-aqua": ["Fighting", "Water"],
  "tauros-paldea-aqua-breed": ["Fighting", "Water"],
  "tauros-paldea-blaze": ["Fighting", "Fire"],
  "tauros-paldea-blaze-breed": ["Fighting", "Fire"],
  "tauros-paldea-combat": ["Fighting"],
  "tauros-paldea-combat-breed": ["Fighting"],
  trubbish: ["Poison"],
  umbreon: ["Dark"],
  vespiquen: ["Bug", "Flying"],
  "walking-wake": ["Water", "Dragon"],
};

const SHOWDOWN_FALLBACK_SPRITES = {
  annihilape: `${POKEMON_SHOWDOWN_SPRITES_BASE_URL}/gen5/annihilape.png`,
  trubbish: `${POKEMON_SHOWDOWN_SPRITES_BASE_URL}/gen5/trubbish.png`,
};

const EXTRA_FALLBACK_SPRITES = {
  annihilape: [
    `${POKEMON_SHOWDOWN_SPRITES_BASE_URL}/ani/annihilape.gif`,
    `${POKEAPI_SPRITES_GITHUB_BASE_URL}/979.png`,
  ],
  trubbish: [
    `${POKEMON_SHOWDOWN_SPRITES_BASE_URL}/ani/trubbish.gif`,
    `${POKEAPI_SPRITES_GITHUB_BASE_URL}/568.png`,
  ],
};

const spriteRequestCache = new Map();
const pokemonTypesCache = new Map();

export async function getPokemonSprite(pokemonName) {
  const normalizedName = normalizePokemonApiName(pokemonName);

  if (spriteRequestCache.has(normalizedName)) {
    return spriteRequestCache.get(normalizedName);
  }

  const spriteRequest = fetchPokemonSprite(normalizedName);
  spriteRequestCache.set(normalizedName, spriteRequest);

  return spriteRequest;
}

async function fetchPokemonSprite(normalizedName) {
  const githubSprite = getGithubSprite(normalizedName);
  const fallbackSprite = getFallbackSprite(normalizedName);
  const apiLookupName = getPokemonApiLookupName(normalizedName);

  if (githubSprite) {
    return githubSprite;
  }

  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/${apiLookupName}`);

    if (!response.ok) {
      return fallbackSprite;
    }

    const pokemon = await response.json();

    return (
      pokemon?.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default ||
      pokemon?.sprites?.versions?.["generation-v"]?.["black-white"]?.front_default ||
      pokemon?.sprites?.front_default ||
      fallbackSprite
    );
  } catch (error) {
    return fallbackSprite;
  }
}

export function getPokemonSpriteFallbacks(pokemonName) {
  const normalizedName = normalizePokemonApiName(pokemonName);

  return [
    getGithubSprite(normalizedName),
    getFallbackSprite(normalizedName),
    ...getPokemonShowdownSpriteCandidates(normalizedName),
    ...(EXTRA_FALLBACK_SPRITES[normalizedName] ?? []),
  ].filter((url, index, urls) => url && urls.indexOf(url) === index);
}

export function getLocalPokemonSprite(pokemonName) {
  return createLocalFallbackSprite(pokemonName);
}

export async function getPokemonTypes(pokemonName) {
  const normalizedName = normalizePokemonApiName(pokemonName);

  if (!normalizedName) {
    return [];
  }

  if (pokemonTypesCache.has(normalizedName)) {
    return pokemonTypesCache.get(normalizedName);
  }

  const fallbackTypes = getPokemonTypeFallback(normalizedName);

  if (fallbackTypes.length > 0) {
    pokemonTypesCache.set(normalizedName, fallbackTypes);
    return fallbackTypes;
  }

  const typesRequest = fetchPokemonTypes(normalizedName);
  pokemonTypesCache.set(normalizedName, typesRequest);

  return typesRequest;
}

async function fetchPokemonTypes(normalizedName) {
  const fallbackTypes = getPokemonTypeFallback(normalizedName);

  try {
    const apiLookupName = getPokemonApiLookupName(normalizedName);
    const response = await fetch(`${POKEAPI_BASE_URL}/${apiLookupName}`);

    if (!response.ok) {
      return fallbackTypes;
    }

    const pokemon = await response.json();

    return (pokemon?.types ?? [])
      .slice()
      .sort((a, b) => a.slot - b.slot)
      .map((item) => formatPokemonType(item?.type?.name))
      .filter(Boolean);
  } catch (error) {
    return fallbackTypes;
  }
}

export function formatPokemonType(type) {
  const normalizedType = String(type || "").trim().toLowerCase();

  if (!normalizedType) {
    return "";
  }

  return normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);
}

function normalizePokemonName(pokemonName) {
  return String(pokemonName || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function normalizePokemonApiName(name) {
  const normalizedName = normalizePokemonName(name)
    .replace(/[♀]/g, "-f")
    .replace(/[♂]/g, "-m")
    .replace(/[’‘'`.]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return POKEAPI_NAME_ALIASES[normalizedName] ?? normalizedName;
}

function getFallbackSprite(normalizedName) {
  return SHOWDOWN_FALLBACK_SPRITES[normalizedName] ?? getPokemonShowdownSpriteCandidates(normalizedName)[0] ?? "";
}

function getGithubSprite(normalizedName) {
  const spriteId = POKEAPI_SPRITE_IDS[normalizedName];

  if (!spriteId) {
    return "";
  }

  return `${POKEAPI_SPRITES_GITHUB_BASE_URL}/${spriteId}.png`;
}

function getPokemonApiLookupName(normalizedName) {
  return POKEAPI_NAME_ALIASES[normalizedName] ?? normalizedName;
}

function getPokemonTypeFallback(normalizedName) {
  const apiLookupName = getPokemonApiLookupName(normalizedName);

  return (
    EXTRA_POKEMON_TYPE_FALLBACKS[normalizedName] ??
    EXTRA_POKEMON_TYPE_FALLBACKS[apiLookupName] ??
    POKEMON_TYPE_FALLBACKS[normalizedName] ??
    POKEMON_TYPE_FALLBACKS[apiLookupName] ??
    []
  );
}

export function normalizePokemonShowdownSpriteName(name) {
  return normalizePokemonApiName(name);
}

export function getPokemonShowdownSpriteCandidates(name) {
  const apiName = normalizePokemonApiName(name);
  const overrideCandidates = SHOWDOWN_SPRITE_NAME_OVERRIDES[apiName] ?? [];
  const spriteId = POKEAPI_SPRITE_IDS[apiName];
  const baseCandidates = [
    apiName,
    apiName.replace(/[’‘'`.]/g, ""),
    apiName.replace(/-/g, ""),
  ];
  const uniqueNames = [...new Set([...overrideCandidates, ...baseCandidates].filter(Boolean))];
  const githubUrls = spriteId
    ? [
        `${POKEAPI_SPRITES_GITHUB_BASE_URL}/${spriteId}.png`,
        `${POKEAPI_SPRITES_GITHUB_BASE_URL}/other/showdown/${spriteId}.gif`,
        `${POKEAPI_SPRITES_GITHUB_BASE_URL}/other/official-artwork/${spriteId}.png`,
      ]
    : [];

  return [
    ...uniqueNames.flatMap((spriteName) => [
      `${POKEMON_SHOWDOWN_SPRITES_BASE_URL}/dex/${spriteName}.png`,
      `${POKEMON_SHOWDOWN_SPRITES_BASE_URL}/gen5/${spriteName}.png`,
      `${POKEMON_SHOWDOWN_SPRITES_BASE_URL}/ani/${spriteName}.gif`,
      `${POKEMON_SHOWDOWN_SPRITES_BASE_URL}/gen5ani/${spriteName}.gif`,
    ]),
    ...githubUrls,
  ];
}

function createLocalFallbackSprite(pokemonName) {
  const normalizedName = normalizePokemonApiName(pokemonName);
  const palette = normalizedName === "trubbish"
    ? { body: "#76a978", shadow: "#4b7454", eye: "#f4f7ff" }
    : { body: "#b7b9c6", shadow: "#6b6f86", eye: "#f4f7ff" };

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" shape-rendering="crispEdges">
      <rect width="96" height="96" fill="transparent"/>
      <rect x="32" y="18" width="32" height="8" fill="${palette.shadow}"/>
      <rect x="24" y="26" width="48" height="8" fill="${palette.body}"/>
      <rect x="18" y="34" width="60" height="30" fill="${palette.body}"/>
      <rect x="26" y="64" width="44" height="10" fill="${palette.shadow}"/>
      <rect x="30" y="40" width="10" height="10" fill="${palette.eye}"/>
      <rect x="56" y="40" width="10" height="10" fill="${palette.eye}"/>
      <rect x="34" y="44" width="4" height="4" fill="#172033"/>
      <rect x="60" y="44" width="4" height="4" fill="#172033"/>
      <rect x="40" y="56" width="16" height="5" fill="#172033"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
