import { useEffect, useMemo, useState } from "react";
import {
  getPokemonSpriteCandidatesByStyle,
  PLACEHOLDER_SPRITE,
} from "../services/pokemonSpriteSources.js";

function PokemonSprite({
  pokemonName,
  pokemonId,
  localSprite,
  sprite,
  spriteCandidates,
  spriteStyle,
  className = "",
  alt,
  fallbackLabel,
  size,
}) {
  const candidates = useMemo(() => {
    return getPokemonSpriteCandidatesByStyle({
      pokemonName,
      pokemonId,
      localSprite,
      spriteCandidates: [sprite, ...(Array.isArray(spriteCandidates) ? spriteCandidates : [])],
      style: spriteStyle,
    });
  }, [localSprite, pokemonId, pokemonName, sprite, spriteCandidates, spriteStyle]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const activeSrc = candidates[candidateIndex] || PLACEHOLDER_SPRITE;
  const isPlaceholder = activeSrc === PLACEHOLDER_SPRITE;

  useEffect(() => {
    setCandidateIndex(0);
    setIsLoaded(false);
  }, [pokemonName, pokemonId, localSprite, sprite, spriteCandidates, spriteStyle]);

  function handleError() {
    setIsLoaded(false);
    setCandidateIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;

      if (nextIndex >= candidates.length) {
        if (import.meta.env.DEV) {
          console.warn("Sprite nao carregou para:", pokemonName, candidates);
        }

        return candidates.indexOf(PLACEHOLDER_SPRITE) >= 0
          ? candidates.indexOf(PLACEHOLDER_SPRITE)
          : currentIndex;
      }

      return nextIndex;
    });
  }

  return (
    <span className={`pokemon-sprite-shell ${className}`.trim()} style={getSizeStyle(size)}>
      {(!isLoaded || isPlaceholder) && (
        <span className="pokemon-sprite-fallback" aria-hidden="true">
          {fallbackLabel || "?"}
        </span>
      )}
      <img
        src={activeSrc}
        alt={alt || `Sprite de ${pokemonName}`}
        className="pokemon-sprite-image"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
      />
    </span>
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
