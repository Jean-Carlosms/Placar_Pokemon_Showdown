import { BATTLE_TYPES } from "../data/players.js";
import PokemonMiniTeam from "./PokemonMiniTeam.jsx";

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
          <HistoryItem key={entry.id} entry={entry} getPlayerName={getPlayerName} />
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

function HistoryItem({ entry, getPlayerName }) {
  const replay = entry.replay;
  const teams = replay?.teams;
  const hasTeams = teams && (Array.isArray(teams.jean) || Array.isArray(teams.felipe));

  return (
    <li className="history-item">
      <span className="timeline-dot" aria-hidden="true" />
      <div className="history-main">
        <div className="history-card-header">
          <span className="history-date">{formatDateTime(entry.timestamp)}</span>
          <span className={`battle-badge ${entry.battleType}`}>{BATTLE_TYPES[entry.battleType]}</span>
          <span className="history-card-spacer" aria-hidden="true" />
        </div>
        <div className="history-summary">
          <strong>{getPlayerName(entry.player)}</strong>
          {entry.source === "pokemon-showdown-replay" && (
            <small>
              Replay importado
              {replay?.format ? ` - ${replay.format}` : entry.format ? ` - ${entry.format}` : ""}
              {replay?.turns ? ` - ${replay.turns} turnos` : entry.turns ? ` - ${entry.turns} turnos` : ""}
            </small>
          )}
        </div>
        {hasTeams && (
          <div className="history-teams">
            <PokemonMiniTeam title="Time Jean Carlos" pokemons={teams.jean} />
            <PokemonMiniTeam title="Time Felipe Eckert" pokemons={teams.felipe} />
          </div>
        )}
      </div>
    </li>
  );
}

function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default MatchHistory;
