import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import MatchHistory from "./components/MatchHistory.jsx";
import PlayerCard from "./components/PlayerCard.jsx";
import ScoreControls from "./components/ScoreControls.jsx";
import StatsPanel from "./components/StatsPanel.jsx";
import { PLAYERS } from "./data/players.js";
import {
  addWinToScoreboard,
  createInitialScoreboard,
  getPlayerScore,
  undoLastWinFromScoreboard,
} from "./utils/scoreboard.js";
import { loadScoreboard, saveScoreboard } from "./utils/storage.js";

function App() {
  const [scoreboard, setScoreboard] = useState(() => loadScoreboard());

  useEffect(() => {
    saveScoreboard(scoreboard);
  }, [scoreboard]);

  function handleAddWin(playerId, battleType) {
    setScoreboard((currentScoreboard) =>
      addWinToScoreboard(currentScoreboard, playerId, battleType),
    );
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
  }

  return (
    <main className="app-shell">
      <Header />

      <section className="scoreboard" aria-label="Placar dos jogadores">
        {PLAYERS.map((player) => (
          <PlayerCard key={player.id} player={player} score={getPlayerScore(scoreboard, player.id)} />
        ))}
      </section>

      <ScoreControls
        players={PLAYERS}
        onAddWin={handleAddWin}
        onUndoLastWin={handleUndoLastWin}
        onResetScoreboard={handleResetScoreboard}
      />

      <StatsPanel scoreboard={scoreboard} players={PLAYERS} />
      <MatchHistory history={scoreboard.history} players={PLAYERS} />
    </main>
  );
}

export default App;
