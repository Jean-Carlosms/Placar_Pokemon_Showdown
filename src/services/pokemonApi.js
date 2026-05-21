const POKEAPI_BASE_URL = import.meta.env.DEV
  ? "/pokeapi/api/v2/pokemon"
  : "https://pokeapi.co/api/v2/pokemon";
const POKEAPI_SPRITES_GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

const POKEAPI_SPRITE_IDS = {
  annihilape: 979,
  arboliva: 930,
  armarouge: 936,
  "chien-pao": 1002,
  copperajah: 879,
  frosmoth: 873,
  "great-tusk": 984,
  "iron-hands": 992,
  ninetales: 38,
  pecharunt: 1025,
  polteageist: 855,
  "raging-bolt": 1021,
  regieleki: 894,
  sunflora: 192,
  swampert: 260,
  trubbish: 568,
  "walking-wake": 1009,
};

const SHOWDOWN_FALLBACK_SPRITES = {
  annihilape: "https://play.pokemonshowdown.com/sprites/gen5/annihilape.png",
  trubbish: "https://play.pokemonshowdown.com/sprites/gen5/trubbish.png",
};

const EXTRA_FALLBACK_SPRITES = {
  annihilape: [
    "https://play.pokemonshowdown.com/sprites/ani/annihilape.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/979.png",
  ],
  trubbish: [
    "https://play.pokemonshowdown.com/sprites/ani/trubbish.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/568.png",
  ],
};

const spriteRequestCache = new Map();

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

  if (githubSprite) {
    return githubSprite;
  }

  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/${normalizedName}`);

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
    ...(EXTRA_FALLBACK_SPRITES[normalizedName] ?? []),
  ].filter(Boolean);
}

export function getLocalPokemonSprite(pokemonName) {
  return createLocalFallbackSprite(pokemonName);
}

function normalizePokemonName(pokemonName) {
  return pokemonName.trim().toLowerCase();
}

export function normalizePokemonApiName(name) {
  return normalizePokemonName(name)
    .replace(/[♀]/g, "-f")
    .replace(/[♂]/g, "-m")
    .replace(/['’.]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function getFallbackSprite(normalizedName) {
  return SHOWDOWN_FALLBACK_SPRITES[normalizedName] ?? "";
}

function getGithubSprite(normalizedName) {
  const spriteId = POKEAPI_SPRITE_IDS[normalizedName];

  if (!spriteId) {
    return "";
  }

  return `${POKEAPI_SPRITES_GITHUB_BASE_URL}/${spriteId}.png`;
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
