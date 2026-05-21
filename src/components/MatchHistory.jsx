import { BATTLE_TYPES } from "../data/players.js";

function MatchHistory({ history, players }) {
  const historyCountLabel = `${history.length} registro${history.length === 1 ? "" : "s"}`;
  const reversedHistory = [...history].reverse();

  function getPlayerName(playerId) {
    return players.find((player) => player.id === playerId)?.name ?? "Jogador";
  }

  return (
    <section className="history-section" aria-labelledby="history-title">
      <div className="section-heading">
        <h2 id="history-title">Histórico de partidas</h2>
        <span>{historyCountLabel}</span>
      </div>

      <ol className="history-list">
        {reversedHistory.map((entry) => (
          <li className="history-item" key={entry.id}>
            <div>
              <strong>{getPlayerName(entry.player)}</strong>
              <span>{formatDateTime(entry.timestamp)}</span>
            </div>
            <span className={`battle-badge ${entry.battleType}`}>{BATTLE_TYPES[entry.battleType]}</span>
          </li>
        ))}
      </ol>

      {history.length === 0 && <p className="empty-history">Nenhuma partida registrada ainda.</p>}
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
