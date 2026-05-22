import { getMovesFromPokemonMap } from "../utils/pokemonMoveStats.js";
import PokemonMoveTooltip from "./PokemonMoveTooltip.jsx";
import PokemonSprite from "./PokemonSprite.jsx";
import PokemonTypeBadges from "./PokemonTypeBadges.jsx";

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
  return (
    <li className="pokemon-mini-card" tabIndex={0}>
      <PokemonSprite
        pokemonName={pokemon}
        className="mini-team-sprite"
        alt={`Sprite de ${pokemon}`}
        fallbackLabel={pokemon}
      />
      <span>{pokemon}</span>
      <PokemonTypeBadges pokemonName={pokemon} />
      <PokemonMoveTooltip pokemonName={pokemon} moves={moves} />
    </li>
  );
}

export default PokemonMiniTeam;
