import { calculateStats } from "../utils/scoreboard.js";

function StatsPanel({ scoreboard, players }) {
  const stats = calculateStats(scoreboard);

  return (
    <section className="stats-section" aria-labelledby="stats-title">
      <h2 id="stats-title">Estatísticas</h2>
      <dl className="stats-grid">
        <div>
          <dt>Total de partidas</dt>
          <dd>{stats.totalMatches}</dd>
        </div>
        <div>
          <dt>Total de Single Battles</dt>
          <dd>{stats.totalSingle}</dd>
        </div>
        <div>
          <dt>Total de Double Battles</dt>
          <dd>{stats.totalDouble}</dd>
        </div>
        {players.map((player) => (
          <div key={player.id}>
            <dt>Vitórias de {player.shortName}</dt>
            <dd>{stats.percentages[player.id]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default StatsPanel;
