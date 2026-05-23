import { useRef, useState } from "react";
import { createBackupPayload, downloadBackup, parseBackupFile } from "../utils/backup.js";

function BackupControls({ scoreboard, history, stats, onImportBackup }) {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  function handleExportBackup() {
    const payload = createBackupPayload(scoreboard, history, stats);

    downloadBackup(payload);
    setMessage("Backup JSON exportado com sucesso.");
    setMessageType("success");
  }

  async function handleImportBackup(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const { scoreboard: importedScoreboard, wasRecalculated } = await parseBackupFile(file);
      const shouldImport = confirm(
        "Importar este backup vai substituir o placar e o histórico atuais. Deseja continuar?",
      );

      if (!shouldImport) {
        event.target.value = "";
        return;
      }

      onImportBackup(importedScoreboard);
      setMessage(
        wasRecalculated
          ? "O placar foi recalculado com base no historico importado."
          : "Backup JSON importado com sucesso.",
      );
      setMessageType(wasRecalculated ? "info" : "success");
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <section className="backup-section" aria-labelledby="backup-title">
      <div className="section-heading">
        <div>
          <h2 id="backup-title">Backup dos dados</h2>
          <p>Exporte ou importe um arquivo JSON para versionar o placar manualmente.</p>
        </div>
      </div>

      <div className="backup-actions">
        <button className="backup-export-button" type="button" onClick={handleExportBackup}>
          Exportar backup JSON
        </button>
        <button
          className="backup-import-button"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Importar backup JSON
        </button>
        <input
          ref={fileInputRef}
          className="backup-file-input"
          type="file"
          accept="application/json,.json"
          onChange={handleImportBackup}
        />
      </div>

      {message && <p className={`backup-message backup-message-${messageType}`}>{message}</p>}
    </section>
  );
}

export default BackupControls;
