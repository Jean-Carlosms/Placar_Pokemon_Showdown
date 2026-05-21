import { useEffect, useState } from "react";
import {
  getLocalPokemonSprite,
  getPokemonSprite,
  getPokemonSpriteFallbacks,
} from "../services/pokemonApi.js";

function PokemonMiniTeam({ title, pokemons }) {
  if (!Array.isArray(pokemons) || pokemons.length === 0) {
    return null;
  }

  return (
    <div className="mini-team">
      <h4>{title}</h4>
      <ul>
        {pokemons.map((pokemon) => (
          <MiniPokemon key={pokemon} pokemon={pokemon} />
        ))}
      </ul>
    </div>
  );
}

function MiniPokemon({ pokemon }) {
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
    <li>
      <img src={spriteUrl} alt={`Sprite de ${pokemon}`} width="36" height="36" />
      <span>{pokemon}</span>
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
