import { useRef, useState } from "react";
import { BATTLE_TYPES } from "../data/players.js";
import { parsePokemonShowdownReplay } from "../utils/replayParser.js";
import PokemonMiniTeam from "./PokemonMiniTeam.jsx";

function ReplayImport({ players, onRegisterReplayWin }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  function getMappedPlayerName(playerId) {
    return players.find((player) => player.id === playerId)?.name ?? "Nao mapeado";
  }

  function hasTeams(parsedReplay) {
    return (
      (parsedReplay?.teams?.jean?.length ?? 0) > 0 ||
      (parsedReplay?.teams?.felipe?.length ?? 0) > 0
    );
  }

  function hasShowdownPlayers(parsedReplay) {
    return Boolean(parsedReplay?.showdownPlayers?.p1 && parsedReplay?.showdownPlayers?.p2);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".html") && file.type !== "text/html") {
      setPreview(null);
      setMessage("Selecione um arquivo HTML de replay do Pokemon Showdown.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsedReplay = parsePokemonShowdownReplay(String(reader.result || ""));

        if (import.meta.env.DEV) {
          console.debug("Parsed replay:", parsedReplay);
        }

        setPreview(parsedReplay);
        setMessage(parsedReplay.warning ?? "Replay lido com sucesso. Confira a previa antes de registrar.");
        setMessageType(parsedReplay.warning ? "error" : "success");
      } catch (error) {
        setPreview(null);
        setMessage(error.message);
        setMessageType("error");
      } finally {
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setPreview(null);
      setMessage("Nao foi possivel ler o arquivo selecionado.");
      setMessageType("error");
      event.target.value = "";
    };

    reader.readAsText(file);
  }

  function handleConfirmImport() {
    if (!preview) {
      return;
    }

    if (!preview.mappedWinnerId) {
      setMessage("Nao foi possivel registrar: vencedor nao mapeado para Jean ou Felipe.");
      setMessageType("error");
      return;
    }

    const mappedWinnerName = getMappedPlayerName(preview.mappedWinnerId);
    const battleTypeLabel = BATTLE_TYPES[preview.battleType];
    const shouldRegister = confirm(`Registrar vitoria de ${mappedWinnerName} em ${battleTypeLabel}?`);

    if (!shouldRegister) {
      return;
    }

    if (!hasTeams(preview)) {
      const shouldRegisterWithoutTeams = confirm(
        "Times nao encontrados. Deseja registrar mesmo assim sem os Pokemon no historico?",
      );

      if (!shouldRegisterWithoutTeams) {
        return;
      }
    }

    onRegisterReplayWin(preview.mappedWinnerId, preview.battleType, {
      source: preview.source,
      playedAt: preview.playedAt,
      replay: {
        replayId: preview.replayId,
        format: preview.format,
        gametype: preview.gametype,
        originalWinner: preview.winner,
        turns: preview.turns,
        showdownPlayers: preview.showdownPlayers,
        mappedPlayers: preview.mappedPlayers,
        teams: preview.teams,
        movesByPokemon: preview.movesByPokemon,
      },
    });
    setMessage("Vitoria importada do replay com sucesso.");
    setMessageType("success");
    setPreview(null);
  }

  return (
    <section className="replay-section" aria-labelledby="replay-title">
      <div className="section-heading">
        <div>
          <h2 id="replay-title">Importar replay</h2>
          <p>Leia um HTML exportado do Pokemon Showdown e registre a vitoria automaticamente.</p>
        </div>
      </div>

      <div className="replay-actions">
        <button
          className="replay-import-button"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Importar replay HTML
        </button>
        <input
          ref={fileInputRef}
          className="backup-file-input"
          type="file"
          accept="text/html,.html"
          onChange={handleFileChange}
        />
      </div>

      {message && <p className={`backup-message backup-message-${messageType}`}>{message}</p>}

      {preview && (
        <div className="replay-preview">
          <h3>Previa do replay</h3>

          {!hasShowdownPlayers(preview) && (
            <p className="backup-message backup-message-error">
              Jogadores nao encontrados no battle-log-data.
            </p>
          )}

          {!hasTeams(preview) && (
            <p className="backup-message backup-message-error">
              Times nao encontrados. O parser nao detectou linhas switch/drag.
            </p>
          )}

          <dl>
            <div>
              <dt>Formato</dt>
              <dd>{preview.format || "Nao informado"}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>{BATTLE_TYPES[preview.battleType]}</dd>
            </div>
            <div>
              <dt>Jogador 1</dt>
              <dd>{preview.showdownPlayers.p1 || "Nao encontrado"}</dd>
            </div>
            <div>
              <dt>Jogador 2</dt>
              <dd>{preview.showdownPlayers.p2 || "Nao encontrado"}</dd>
            </div>
            <div>
              <dt>Vencedor no replay</dt>
              <dd>{preview.winner}</dd>
            </div>
            <div>
              <dt>Vencedor no placar</dt>
              <dd>{getMappedPlayerName(preview.mappedWinnerId)}</dd>
            </div>
            <div>
              <dt>Turnos</dt>
              <dd>{preview.turns}</dd>
            </div>
          </dl>

          <div className="replay-preview-teams">
            <PokemonMiniTeam
              title="Time Jean Carlos"
              playerId="jean"
              pokemons={preview.teams.jean}
              movesByPokemon={preview.movesByPokemon}
            />
            <PokemonMiniTeam
              title="Time Felipe Eckert"
              playerId="felipe"
              pokemons={preview.teams.felipe}
              movesByPokemon={preview.movesByPokemon}
            />
          </div>

          <button
            className="replay-confirm-button"
            type="button"
            onClick={handleConfirmImport}
            disabled={!preview.mappedWinnerId}
          >
            Registrar vitoria do replay
          </button>
        </div>
      )}
    </section>
  );
}

export default ReplayImport;
