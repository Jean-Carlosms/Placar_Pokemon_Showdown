import { DEFAULT_SPRITE_STYLE, SPRITE_STYLES } from "../data/spriteStyles.js";
import { getPokemonShowdownSpriteCandidates, normalizePokemonApiName } from "./pokemonApi.js";

const PLACEHOLDER_SPRITE = "/sprites/pokemon/_placeholder.svg";
const SHOWDOWN_BASE_URL = "https://play.pokemonshowdown.com/sprites";
const POKEAPI_SPRITES_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const POKEAPI_FORM_SPRITE_IDS = {
  "tauros-paldea-combat": 10250,
  "tauros-paldea-combat-breed": 10250,
  "tauros-paldea-blaze": 10251,
  "tauros-paldea-blaze-breed": 10251,
  "tauros-paldea-aqua": 10252,
  "tauros-paldea-aqua-breed": 10252,
};

export function normalizePokemonSpriteKey(name) {
  return normalizePokemonApiName(name).replace(/-breed$/, "");
}

export function getPokemonSpriteCandidatesByStyle({
  pokemonName,
  pokemonId,
  localSprite,
  spriteCandidates = [],
  style = DEFAULT_SPRITE_STYLE,
}) {
  const key = normalizePokemonSpriteKey(pokemonName);
  const spritePokemonId = POKEAPI_FORM_SPRITE_IDS[key] ?? pokemonId;
  const local = localSprite || (key ? `/sprites/pokemon/${key}.png` : "");
  const localSmall = key ? `/sprites/pokemon/icons/${key}.png` : "";
  const candidates = (Array.isArray(spriteCandidates) ? spriteCandidates : []).filter(Boolean);
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
  const official = spritePokemonId
    ? [`${POKEAPI_SPRITES_BASE_URL}/other/official-artwork/${spritePokemonId}.png`]
    : [];
  const small = spritePokemonId ? [`${POKEAPI_SPRITES_BASE_URL}/${spritePokemonId}.png`] : [];
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
