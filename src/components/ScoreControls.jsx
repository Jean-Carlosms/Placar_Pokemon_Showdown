function ScoreControls({ players, onAddWin, onUndoLastWin, onResetScoreboard }) {
  return (
    <section className="controls" aria-label="Controles do placar">
      <div className="win-buttons">
        {players.map((player) => (
          <ButtonGroup key={player.id} player={player} onAddWin={onAddWin} />
        ))}
      </div>

      <div className="maintenance-buttons">
        <button className="secondary-button" type="button" onClick={onUndoLastWin}>
          Desfazer última vitória
        </button>
        <button className="danger-button" type="button" onClick={onResetScoreboard}>
          Resetar placar
        </button>
      </div>
    </section>
  );
}

function ButtonGroup({ player, onAddWin }) {
  return (
    <>
      <button type="button" onClick={() => onAddWin(player.id, "single")}>
        +1 {player.shortName} - Single
      </button>
      <button type="button" onClick={() => onAddWin(player.id, "double")}>
        +1 {player.shortName} - Double
      </button>
    </>
  );
}

export default ScoreControls;
