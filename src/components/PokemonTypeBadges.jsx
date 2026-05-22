import { useEffect, useState } from "react";
import { getPokemonTypes, normalizePokemonApiName } from "../services/pokemonApi.js";

function PokemonTypeBadges({ pokemonName, types }) {
  const [loadedTypes, setLoadedTypes] = useState(() => (Array.isArray(types) ? types : []));

  useEffect(() => {
    let isMounted = true;

    if (Array.isArray(types)) {
      setLoadedTypes(types);
      return () => {
        isMounted = false;
      };
    }

    async function loadTypes() {
      const pokemonTypes = await getPokemonTypes(pokemonName);

      if (isMounted) {
        setLoadedTypes(pokemonTypes);
      }
    }

    loadTypes();

    return () => {
      isMounted = false;
    };
  }, [pokemonName, types]);

  if (!loadedTypes.length) {
    return null;
  }

  return (
    <div className="pokemon-type-badges" aria-label={`Tipos de ${pokemonName}`}>
      {loadedTypes.map((type) => (
        <span
          className={`pokemon-type-badge type-${normalizePokemonApiName(type) || "unknown"}`}
          key={type}
        >
          {type}
        </span>
      ))}
    </div>
  );
}

export default PokemonTypeBadges;
