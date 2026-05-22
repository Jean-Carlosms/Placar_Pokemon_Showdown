import { useEffect, useMemo, useState } from "react";
import {
  getPokemonShowdownSpriteCandidates,
  getPokemonSpriteFallbacks,
  normalizePokemonApiName,
} from "../services/pokemonApi.js";

const PLACEHOLDER_SPRITE = "/sprites/pokemon/_placeholder.svg";

function PokemonSprite({
  pokemonName,
  sprite,
  spriteCandidates,
  className = "",
  alt,
  fallbackLabel,
  size,
}) {
  const normalizedKey = normalizePokemonApiName(pokemonName);
  const localSprite = normalizedKey ? `/sprites/pokemon/${normalizedKey}.png` : "";
  const candidates = useMemo(() => {
    const urls = [
      localSprite,
      sprite,
      ...(Array.isArray(spriteCandidates) ? spriteCandidates : []),
      ...getPokemonShowdownSpriteCandidates(pokemonName),
      ...getPokemonSpriteFallbacks(pokemonName),
      PLACEHOLDER_SPRITE,
    ].filter(Boolean);

    return [...new Set(urls)];
  }, [localSprite, pokemonName, sprite, spriteCandidates]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const activeSrc = candidates[candidateIndex] || PLACEHOLDER_SPRITE;
  const isPlaceholder = activeSrc === PLACEHOLDER_SPRITE;

  useEffect(() => {
    setCandidateIndex(0);
    setIsLoaded(false);
  }, [pokemonName, sprite, spriteCandidates]);

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
