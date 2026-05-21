import { calculateStats } from "../utils/scoreboard.js";

function StatsPanel({ scoreboard, players }) {
  const stats = calculateStats(scoreboard);

  return (
    <section className="stats-section" aria-labelledby="stats-title">
      <div className="section-heading">
        <div>
          <h2 id="stats-title">Estatísticas</h2>
          <p>Resumo do duelo em tempo real.</p>
        </div>
      </div>

      <dl className="stats-grid">
        <div className="stat-card">
          <dt>Total de partidas</dt>
          <dd>{stats.totalMatches}</dd>
        </div>
        <div className="stat-card">
          <dt>Total de Single Battles</dt>
          <dd>{stats.totalSingle}</dd>
        </div>
        <div className="stat-card">
          <dt>Total de Double Battles</dt>
          <dd>{stats.totalDouble}</dd>
        </div>
        {players.map((player) => (
          <div className="stat-card stat-card-progress" key={player.id}>
            <dt>Vitórias de {player.name}</dt>
            <dd>{stats.percentages[player.id]}</dd>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: stats.percentages[player.id] }} />
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default StatsPanel;
