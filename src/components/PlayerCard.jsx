import PokemonSprite from "./PokemonSprite.jsx";
import PokemonTypeBadges from "./PokemonTypeBadges.jsx";

function PlayerCard({ player, score, status, isRecentlyScored, featuredPokemon, spriteStyle }) {
  const pokemonName = featuredPokemon?.displayName ?? player.defaultPokemon;
  const statusLabel = status === "leader" ? "Líder atual" : "Empate técnico";

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
          <PokemonSprite
            pokemonName={pokemonName}
            spriteStyle={spriteStyle}
            className="pokemon-sprite"
            alt={`Sprite de ${pokemonName}`}
            fallbackLabel={pokemonName}
          />
        </div>
        <div>
          <p className="pokemon-name">Pokémon destaque</p>
          <h2>{player.name}</h2>
          <span className="partner-label">{pokemonName}</span>
          <PokemonTypeBadges pokemonName={pokemonName} />
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

export default PlayerCard;
