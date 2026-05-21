import { useRef, useState } from "react";
import { BATTLE_TYPES } from "../data/players.js";
import { parsePokemonShowdownReplay } from "../utils/replayParser.js";

function ReplayImport({ players, onRegisterReplayWin }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  function getMappedPlayerName(playerId) {
    return players.find((player) => player.id === playerId)?.name ?? "Não mapeado";
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".html") && file.type !== "text/html") {
      setPreview(null);
      setMessage("Selecione um arquivo HTML de replay do Pokémon Showdown.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsedReplay = parsePokemonShowdownReplay(String(reader.result || ""));
        setPreview(parsedReplay);
        setMessage("Replay lido com sucesso. Confira a prévia antes de registrar.");
        setMessageType("success");
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
      setMessage("Não foi possível ler o arquivo selecionado.");
      setMessageType("error");
      event.target.value = "";
    };

    reader.readAsText(file);
  }

  function handleConfirmImport() {
    if (!preview) {
      return;
    }

    const mappedWinnerName = getMappedPlayerName(preview.mappedWinnerId);
    const shouldRegister = confirm(
      `Registrar vitória de ${mappedWinnerName} em ${BATTLE_TYPES[preview.battleType]}?`,
    );

    if (!shouldRegister) {
      return;
    }

    onRegisterReplayWin(preview.mappedWinnerId, preview.battleType, {
      source: preview.source,
      format: preview.format,
      replayId: preview.replayId,
      turns: preview.turns,
      originalWinner: preview.winner,
      playedAt: preview.playedAt,
    });
    setMessage("Vitória importada do replay com sucesso.");
    setMessageType("success");
    setPreview(null);
  }

  return (
    <section className="replay-section" aria-labelledby="replay-title">
      <div className="section-heading">
        <div>
          <h2 id="replay-title">Importar replay</h2>
          <p>Leia um HTML exportado do Pokémon Showdown e registre a vitória automaticamente.</p>
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
          <h3>Prévia do replay</h3>
          <dl>
            <div>
              <dt>Formato</dt>
              <dd>{preview.format || "Não informado"}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>{BATTLE_TYPES[preview.battleType]}</dd>
            </div>
            <div>
              <dt>Jogador 1</dt>
              <dd>{preview.players.p1 || "Não encontrado"}</dd>
            </div>
            <div>
              <dt>Jogador 2</dt>
              <dd>{preview.players.p2 || "Não encontrado"}</dd>
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
          <button className="replay-confirm-button" type="button" onClick={handleConfirmImport}>
            Registrar vitória do replay
          </button>
        </div>
      )}
    </section>
  );
}

export default ReplayImport;
