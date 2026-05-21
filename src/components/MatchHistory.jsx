import { BATTLE_TYPES } from "../data/players.js";

function MatchHistory({
  history,
  players,
  historyFilter,
  activeSeasonName,
  onHistoryFilterChange,
}) {
  const historyCountLabel = `${history.length} registro${history.length === 1 ? "" : "s"}`;
  const reversedHistory = [...history].reverse();

  function getPlayerName(playerId) {
    return players.find((player) => player.id === playerId)?.name ?? "Jogador";
  }

  return (
    <section className="history-section" aria-labelledby="history-title">
      <div className="section-heading">
        <div>
          <h2 id="history-title">Histórico de partidas</h2>
          <p>
            {historyFilter === "active"
              ? `Mostrando apenas ${activeSeasonName}.`
              : "Mostrando todas as temporadas."}
          </p>
        </div>
        <span className="history-count">{historyCountLabel}</span>
      </div>

      <div className="history-filter" aria-label="Filtro do histórico">
        <button
          className={historyFilter === "active" ? "active-filter" : ""}
          type="button"
          onClick={() => onHistoryFilterChange("active")}
        >
          Temporada ativa
        </button>
        <button
          className={historyFilter === "all" ? "active-filter" : ""}
          type="button"
          onClick={() => onHistoryFilterChange("all")}
        >
          Todas as temporadas
        </button>
      </div>

      <ol className="history-list">
        {reversedHistory.map((entry) => (
          <li className="history-item" key={entry.id}>
            <span className="timeline-dot" aria-hidden="true" />
            <div>
              <strong>{getPlayerName(entry.player)}</strong>
              <span>{formatDateTime(entry.timestamp)}</span>
              {entry.source === "pokemon-showdown-replay" && (
                <small>
                  Replay importado
                  {entry.format ? ` - ${entry.format}` : ""}
                  {entry.turns ? ` - ${entry.turns} turnos` : ""}
                </small>
              )}
            </div>
            <span className={`battle-badge ${entry.battleType}`}>{BATTLE_TYPES[entry.battleType]}</span>
          </li>
        ))}
      </ol>

      {history.length === 0 && (
        <p className="empty-history">
          Nenhuma partida registrada ainda. Adicione a primeira vitória para começar o placar.
        </p>
      )}
    </section>
  );
}

function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default MatchHistory;
