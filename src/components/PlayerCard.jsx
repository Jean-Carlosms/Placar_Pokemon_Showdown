function PlayerCard({ player, score }) {
  return (
    <article className={`player-card player-card-${player.id}`}>
      <div className="player-heading">
        <img
          className="pokemon-sprite"
          src={player.spriteUrl}
          alt={`Sprite pixel art de ${player.pokemon}`}
          width="96"
          height="96"
        />
        <div>
          <p className="pokemon-name">{player.pokemon}</p>
          <h2>{player.name}</h2>
        </div>
      </div>

      <dl className="score-grid">
        <div>
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
