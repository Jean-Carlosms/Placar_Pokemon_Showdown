import { useEffect, useState } from "react";
import {
  getLocalPokemonSprite,
  getPokemonSprite,
  getPokemonSpriteFallbacks,
} from "../services/pokemonApi.js";
import { getMovesFromPokemonMap } from "../utils/pokemonMoveStats.js";
import PokemonMoveTooltip from "./PokemonMoveTooltip.jsx";

function PokemonMiniTeam({ title, pokemons, playerId, movesByPokemon }) {
  return (
    <div className="mini-team">
      <h4>{title}</h4>
      {(!Array.isArray(pokemons) || pokemons.length === 0) && (
        <p>Time não encontrado neste replay.</p>
      )}
      <ul>
        {(Array.isArray(pokemons) ? pokemons : []).map((pokemon) => (
          <MiniPokemon
            key={pokemon}
            pokemon={pokemon}
            moves={getMovesFromPokemonMap(movesByPokemon?.[playerId], pokemon)}
          />
        ))}
      </ul>
    </div>
  );
}

function MiniPokemon({ pokemon, moves }) {
  const [spriteUrl, setSpriteUrl] = useState(() => getLocalPokemonSprite(pokemon));

  useEffect(() => {
    let isMounted = true;

    async function loadSprite() {
      const localSprite = getLocalPokemonSprite(pokemon);
      const loadedSpriteUrl = await getPokemonSprite(pokemon);
      const spriteCandidates = [
        loadedSpriteUrl,
        ...getPokemonSpriteFallbacks(pokemon),
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
  }, [pokemon]);

  return (
    <li className="pokemon-mini-card" tabIndex={0}>
      <img src={spriteUrl} alt={`Sprite de ${pokemon}`} width="36" height="36" />
      <span>{pokemon}</span>
      <PokemonMoveTooltip pokemonName={pokemon} moves={moves} />
    </li>
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

export default PokemonMiniTeam;
