import { useEffect, useState } from "react";
import BackupControls from "./components/BackupControls.jsx";
import Header from "./components/Header.jsx";
import MatchHistory from "./components/MatchHistory.jsx";
import MoveInfoCard from "./components/MoveInfoCard.jsx";
import PokemonInfoCard from "./components/PokemonInfoCard.jsx";
import PlayerCard from "./components/PlayerCard.jsx";
import ReplayImport from "./components/ReplayImport.jsx";
import ScoreControls from "./components/ScoreControls.jsx";
import SeasonControls from "./components/SeasonControls.jsx";
import SpriteStyleSelector from "./components/SpriteStyleSelector.jsx";
import StatsPanel from "./components/StatsPanel.jsx";
import { PLAYERS } from "./data/players.js";
import { getInitialSpriteStyle, saveSpriteStyle } from "./data/spriteStyles.js";
import { getFeaturedPokemonForPlayer } from "./utils/pokemonStats.js";
import {
  addWinToScoreboard,
  calculateStats,
  createSeasonInScoreboard,
  createInitialScoreboard,
  getActiveSeason,
  getActiveSeasonScoreboard,
  getHistoryForSeason,
  getPlayerScore,
  selectSeasonInScoreboard,
  undoLastWinFromScoreboard,
} from "./utils/scoreboard.js";
import { loadScoreboard, saveScoreboard } from "./utils/storage.js";
import { applyTheme, getInitialTheme, getNextTheme, saveTheme } from "./utils/theme.js";

function App() {
  const [scoreboard, setScoreboard] = useState(() => loadScoreboard());
  const [lastScoredPlayer, setLastScoredPlayer] = useState("");
  const [currentTheme, setCurrentTheme] = useState(() => getInitialTheme());
  const [spriteStyle, setSpriteStyle] = useState(() => getInitialSpriteStyle());
  const [historyFilter, setHistoryFilter] = useState("active");

  useEffect(() => {
    saveScoreboard(scoreboard);
  }, [scoreboard]);

  useEffect(() => {
    applyTheme(currentTheme);
    saveTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    saveSpriteStyle(spriteStyle);
  }, [spriteStyle]);

  useEffect(() => {
    if (!lastScoredPlayer) {
      return undefined;
    }

    const timeoutId = setTimeout(() => setLastScoredPlayer(""), 450);

    return () => clearTimeout(timeoutId);
  }, [lastScoredPlayer]);

  function handleAddWin(playerId, battleType, metadata = {}) {
    setScoreboard((currentScoreboard) =>
      addWinToScoreboard(currentScoreboard, playerId, battleType, metadata),
    );
    setLastScoredPlayer(playerId);
  }

  function handleUndoLastWin() {
    setScoreboard((currentScoreboard) => undoLastWinFromScoreboard(currentScoreboard));
  }

  function handleResetScoreboard() {
    const shouldReset = confirm("Tem certeza que deseja resetar o placar?");

    if (!shouldReset) {
      return;
    }

    setScoreboard(createInitialScoreboard());
    setLastScoredPlayer("");
  }

  function handleToggleTheme() {
    setCurrentTheme((theme) => getNextTheme(theme));
  }

  function handleImportBackup(importedScoreboard) {
    setScoreboard(importedScoreboard);
    setLastScoredPlayer("");
  }

  function handleCreateSeason(seasonName) {
    setScoreboard((currentScoreboard) => createSeasonInScoreboard(currentScoreboard, seasonName));
    setHistoryFilter("active");
  }

  function handleSelectSeason(seasonId) {
    setScoreboard((currentScoreboard) => selectSeasonInScoreboard(currentScoreboard, seasonId));
    setHistoryFilter("active");
  }

  const activeSeason = getActiveSeason(scoreboard);
  const activeSeasonScoreboard = getActiveSeasonScoreboard(scoreboard);
  const playerScores = PLAYERS.reduce((scores, player) => {
    scores[player.id] = getPlayerScore(activeSeasonScoreboard, player.id);
    return scores;
  }, {});
  const totals = PLAYERS.map((player) => playerScores[player.id].total);
  const highestScore = Math.max(...totals);
  const isTie = new Set(totals).size === 1;
  const seasonStats = calculateStats(activeSeasonScoreboard);
  const generalStats = calculateStats(scoreboard);
  const visibleHistory =
    historyFilter === "active" ? getHistoryForSeason(scoreboard, activeSeason.id) : scoreboard.history;
  const historySignature = scoreboard.history.map((entry) => entry.id).join("|");
  const featuredPokemonByPlayer = PLAYERS.reduce((featuredPokemon, player) => {
    featuredPokemon[player.id] = getFeaturedPokemonForPlayer(
      player.id,
      scoreboard.history,
      PLAYERS,
      historySignature,
    );
    return featuredPokemon;
  }, {});

  return (
    <main className={`app-shell sprite-style-${spriteStyle}`}>
      <Header currentTheme={currentTheme} onToggleTheme={handleToggleTheme} />

      <SpriteStyleSelector value={spriteStyle} onChange={setSpriteStyle} />

      <section className="scoreboard" aria-label="Placar dos jogadores">
        {PLAYERS.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            score={playerScores[player.id]}
            status={isTie ? "tie" : playerScores[player.id].total === highestScore ? "leader" : "chaser"}
            isRecentlyScored={lastScoredPlayer === player.id}
            featuredPokemon={featuredPokemonByPlayer[player.id]}
            spriteStyle={spriteStyle}
          />
        ))}
      </section>

      <ScoreControls
        players={PLAYERS}
        onAddWin={handleAddWin}
        onUndoLastWin={handleUndoLastWin}
        onResetScoreboard={handleResetScoreboard}
      />

      <SeasonControls
        seasons={scoreboard.seasons}
        activeSeasonId={activeSeason.id}
        onCreateSeason={handleCreateSeason}
        onSelectSeason={handleSelectSeason}
      />

      <ReplayImport
        players={PLAYERS}
        history={scoreboard.history}
        onRegisterReplayWin={handleAddWin}
        spriteStyle={spriteStyle}
      />

      <BackupControls
        scoreboard={scoreboard}
        history={scoreboard.history}
        stats={{ season: seasonStats, general: generalStats }}
        onImportBackup={handleImportBackup}
      />

      <StatsPanel
        seasonName={activeSeason.name}
        seasonStats={seasonStats}
        generalStats={generalStats}
        players={PLAYERS}
      />
      <PokemonInfoCard history={scoreboard.history} spriteStyle={spriteStyle} />
      <MoveInfoCard history={scoreboard.history} />
      <MatchHistory
        history={visibleHistory}
        players={PLAYERS}
        historyFilter={historyFilter}
        activeSeasonName={activeSeason.name}
        onHistoryFilterChange={setHistoryFilter}
        spriteStyle={spriteStyle}
      />
    </main>
  );
}

export default App;
