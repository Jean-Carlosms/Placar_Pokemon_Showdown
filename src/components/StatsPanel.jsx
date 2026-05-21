function StatsPanel({ seasonName, seasonStats, generalStats, players }) {
  return (
    <section className="stats-section" aria-labelledby="stats-title">
      <div className="section-heading">
        <div>
          <h2 id="stats-title">Estatísticas</h2>
          <p>Resumo da temporada selecionada e do duelo completo.</p>
        </div>
      </div>

      <StatsGrid title={seasonName} stats={seasonStats} players={players} />
      <StatsGrid title="Geral - todas as temporadas" stats={generalStats} players={players} />
    </section>
  );
}

function StatsGrid({ title, stats, players }) {
  return (
    <div className="stats-block">
      <h3>{title}</h3>
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
    </div>
  );
}

export default StatsPanel;
