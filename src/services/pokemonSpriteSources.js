import { DEFAULT_SPRITE_STYLE, SPRITE_STYLES } from "../data/spriteStyles.js";
import { getPokemonShowdownSpriteCandidates, normalizePokemonApiName } from "./pokemonApi.js";

const PLACEHOLDER_SPRITE = "/sprites/pokemon/_placeholder.svg";
const SHOWDOWN_BASE_URL = "https://play.pokemonshowdown.com/sprites";
const POKEAPI_SPRITES_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export function normalizePokemonSpriteKey(name) {
  return normalizePokemonApiName(name);
}

export function getPokemonSpriteCandidatesByStyle({
  pokemonName,
  pokemonId,
  localSprite,
  spriteCandidates = [],
  style = DEFAULT_SPRITE_STYLE,
}) {
  const key = normalizePokemonSpriteKey(pokemonName);
  const local = localSprite || (key ? `/sprites/pokemon/${key}.png` : "");
  const localSmall = key ? `/sprites/pokemon/icons/${key}.png` : "";
  const candidates = Array.isArray(spriteCandidates) ? spriteCandidates : [];
  const safeStyle = SPRITE_STYLES[style] ? style : DEFAULT_SPRITE_STYLE;
  const knownCandidates = [...candidates, ...getPokemonShowdownSpriteCandidates(pokemonName)];
  const showdownStatic = key
    ? [
        `${SHOWDOWN_BASE_URL}/dex/${key}.png`,
        `${SHOWDOWN_BASE_URL}/gen5/${key}.png`,
      ]
    : [];
  const showdownAnimated = key
    ? [
        `${SHOWDOWN_BASE_URL}/ani/${key}.gif`,
        `${SHOWDOWN_BASE_URL}/gen5ani/${key}.gif`,
      ]
    : [];
  const official = pokemonId
    ? [`${POKEAPI_SPRITES_BASE_URL}/other/official-artwork/${pokemonId}.png`]
    : [];
  const small = pokemonId ? [`${POKEAPI_SPRITES_BASE_URL}/${pokemonId}.png`] : [];
  const knownAnimated = knownCandidates.filter(
    (url) => url.includes("/ani/") || url.includes("/gen5ani/") || url.includes("/other/showdown/"),
  );
  const knownOfficial = knownCandidates.filter((url) => url.includes("/other/official-artwork/"));
  const knownSmall = knownCandidates.filter(
    (url) => url.startsWith(POKEAPI_SPRITES_BASE_URL) && !url.includes("/other/"),
  );

  const byStyle = {
    staticPixel: [local, ...showdownStatic, ...knownCandidates],
    animatedPixel: [...knownAnimated, ...showdownAnimated, local, ...showdownStatic, ...knownCandidates],
    officialArtwork: [...official, ...knownOfficial, local, ...showdownStatic, ...knownCandidates],
    smallIcon: [localSmall, ...small, ...knownSmall, local, ...showdownStatic, ...knownCandidates],
  };

  return [...new Set([...byStyle[safeStyle], PLACEHOLDER_SPRITE].filter(Boolean))];
}

export { PLACEHOLDER_SPRITE };
