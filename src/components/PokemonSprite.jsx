import { useEffect, useMemo, useState } from "react";
import {
  getLocalPokemonSprite,
  getPokemonShowdownSpriteCandidates,
  getPokemonSpriteFallbacks,
} from "../services/pokemonApi.js";

function PokemonSprite({
  pokemonName,
  sprite,
  spriteCandidates,
  className = "",
  alt,
  fallbackLabel,
  size,
}) {
  const candidates = useMemo(() => {
    const urls = [
      sprite,
      ...(Array.isArray(spriteCandidates) ? spriteCandidates : []),
      ...getPokemonShowdownSpriteCandidates(pokemonName),
      ...getPokemonSpriteFallbacks(pokemonName),
      getLocalPokemonSprite(pokemonName),
    ].filter(Boolean);

    return [...new Set(urls)];
  }, [pokemonName, sprite, spriteCandidates]);
  const [index, setIndex] = useState(0);
  const currentSprite = candidates[index];

  useEffect(() => {
    setIndex(0);
  }, [pokemonName, sprite, spriteCandidates]);

  function handleError() {
    setIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;

      if (nextIndex >= candidates.length && import.meta.env.DEV) {
        console.warn("Sprite nao carregou para:", pokemonName, candidates);
      }

      return nextIndex;
    });
  }

  if (!currentSprite) {
    return (
      <div className={`pokemon-sprite-fallback ${className}`.trim()} style={getSizeStyle(size)}>
        {fallbackLabel || pokemonName}
      </div>
    );
  }

  return (
    <img
      src={currentSprite}
      alt={alt || `Sprite de ${pokemonName}`}
      className={className}
      width={size}
      height={size}
      loading="lazy"
      style={getSizeStyle(size)}
      onError={handleError}
    />
  );
}

function getSizeStyle(size) {
  if (!size) {
    return undefined;
  }

  return {
    width: size,
    height: size,
  };
}

export default PokemonSprite;
