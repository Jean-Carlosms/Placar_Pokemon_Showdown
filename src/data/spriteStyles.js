export const SPRITE_STYLE_STORAGE_KEY = "pokemon-scoreboard-sprite-style";

export const SPRITE_STYLES = {
  staticPixel: {
    id: "staticPixel",
    label: "Pixel Art Estática",
    description: "Sprites estáticas estilo Pokemon Showdown.",
  },
  animatedPixel: {
    id: "animatedPixel",
    label: "Pixel Art Animada",
    description: "GIFs animados do Pokemon Showdown quando disponíveis.",
  },
  officialArtwork: {
    id: "officialArtwork",
    label: "Oficial/Artwork",
    description: "Artwork oficial via PokeAPI sprites quando disponível.",
  },
  smallIcon: {
    id: "smallIcon",
    label: "Ícone pequeno",
    description: "Sprites compactas para listas e visual leve.",
  },
};

export const DEFAULT_SPRITE_STYLE = "staticPixel";

export function getInitialSpriteStyle() {
  const savedStyle = localStorage.getItem(SPRITE_STYLE_STORAGE_KEY);

  return SPRITE_STYLES[savedStyle] ? savedStyle : DEFAULT_SPRITE_STYLE;
}

export function saveSpriteStyle(spriteStyle) {
  const safeStyle = SPRITE_STYLES[spriteStyle] ? spriteStyle : DEFAULT_SPRITE_STYLE;

  localStorage.setItem(SPRITE_STYLE_STORAGE_KEY, safeStyle);
}
