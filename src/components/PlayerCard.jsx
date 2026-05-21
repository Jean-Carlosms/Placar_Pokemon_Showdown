import { useEffect, useState } from "react";
import {
  getLocalPokemonSprite,
  getPokemonSprite,
  getPokemonSpriteFallbacks,
} from "../services/pokemonApi.js";

function PlayerCard({ player, score, status, isRecentlyScored, featuredPokemon }) {
  const [spriteUrl, setSpriteUrl] = useState("");
  const [isLoadingSprite, setIsLoadingSprite] = useState(true);
  const pokemonName = featuredPokemon?.displayName ?? player.defaultPokemon;
  const statusLabel = status === "leader" ? "Líder atual" : "Empate técnico";

  useEffect(() => {
    let isMounted = true;

    async function loadSprite() {
      setIsLoadingSprite(true);
      const localSprite = getLocalPokemonSprite(pokemonName);

      if (isMounted) {
        setSpriteUrl(localSprite);
        setIsLoadingSprite(false);
      }

      const loadedSpriteUrl = await getPokemonSprite(pokemonName);
      const spriteCandidates = [
        loadedSpriteUrl,
        ...getPokemonSpriteFallbacks(pokemonName),
      ].filter((url, index, urls) => url && url !== localSprite && urls.indexOf(url) === index);
      const displayableSprite = await getFirstLoadableSprite(spriteCandidates);

      if (isMounted && displayableSprite) {
        setSpriteUrl(displayableSprite);
      }
    }

    loadSprite();

    return () => {
      isMounted = false;
    };
  }, [pokemonName]);

  function handleSpriteError() {
    setSpriteUrl(getLocalPokemonSprite(pokemonName));
  }

  return (
    <article
      className={`player-card player-card-${player.id} player-card-${status} ${
        isRecentlyScored ? "score-pulse" : ""
      }`}
    >
      <div className="battle-status" data-status={status}>
        {status === "chaser" ? "Na disputa" : statusLabel}
      </div>

      <div className="player-heading">
        <div className="sprite-frame">
          {isLoadingSprite ? (
            <div className="sprite-loading" aria-label={`Carregando sprite de ${pokemonName}`} />
          ) : (
            <img
              className="pokemon-sprite"
              src={spriteUrl}
              alt={`Sprite de ${pokemonName}`}
              width="112"
              height="112"
              onError={handleSpriteError}
            />
          )}
        </div>
        <div>
          <p className="pokemon-name">Pokémon destaque</p>
          <h2>{player.name}</h2>
          <span className="partner-label">{pokemonName}</span>
          <span className="featured-wins">
            Vitórias com este Pokémon: {featuredPokemon?.wins ?? 0}
          </span>
        </div>
      </div>

      <dl className="score-grid">
        <div className="score-total">
          <dt>Total</dt>
          <dd>{score.total}</dd>
        </div>
        <div>
          <dt>Single Battles</dt>
          <dd>{score.single}</dd>
        </div>
        <div>
          <dt>Double Battles</dt>
          <dd>{score.double}</dd>
        </div>
      </dl>
    </article>
  );
}

async function getFirstLoadableSprite(spriteUrls) {
  for (const spriteUrl of spriteUrls) {
    const canLoad = await canLoadImage(spriteUrl);

    if (canLoad) {
      return spriteUrl;
    }
  }

  return "";
}

function canLoadImage(spriteUrl) {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = spriteUrl;
  });
}

export default PlayerCard;
