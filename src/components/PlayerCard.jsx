import { useEffect, useState } from "react";
import {
  getLocalPokemonSprite,
  getPokemonSprite,
  getPokemonSpriteFallbacks,
} from "../services/pokemonApi.js";

function PlayerCard({ player, score, status, isRecentlyScored }) {
  const [spriteUrl, setSpriteUrl] = useState("");
  const [isLoadingSprite, setIsLoadingSprite] = useState(true);
  const statusLabel = status === "leader" ? "Líder atual" : "Empate técnico";

  useEffect(() => {
    let isMounted = true;

    async function loadSprite() {
      const localSprite = getLocalPokemonSprite(player.pokemon);

      if (isMounted) {
        setSpriteUrl(localSprite);
        setIsLoadingSprite(false);
      }

      const loadedSpriteUrl = await getPokemonSprite(player.pokemon);
      const spriteCandidates = [
        loadedSpriteUrl,
        ...getPokemonSpriteFallbacks(player.pokemon),
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
  }, [player.pokemon]);

  function handleSpriteError() {
    setSpriteUrl(getLocalPokemonSprite(player.pokemon));
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
            <div className="sprite-loading" aria-label={`Carregando sprite de ${player.pokemon}`} />
          ) : (
            <img
              className="pokemon-sprite"
              src={spriteUrl}
              alt={`Sprite de ${player.pokemon}`}
              width="112"
              height="112"
              onError={handleSpriteError}
            />
          )}
        </div>
        <div>
          <p className="pokemon-name">{player.pokemon}</p>
          <h2>{player.name}</h2>
          <span className="partner-label">Pokémon parceiro</span>
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
