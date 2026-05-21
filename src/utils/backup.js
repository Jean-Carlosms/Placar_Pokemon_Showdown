import { normalizeScoreboard } from "./scoreboard.js";

const BACKUP_VERSION = 1;
const PROJECT_NAME = "Placar_Pokemon_Showdown";

export function createBackupPayload(scoreboard, history, stats) {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    project: PROJECT_NAME,
    data: {
      scoreboard: {
        ...scoreboard,
        history,
      },
      history,
      stats,
    },
    metadata: {
      source: "localStorage",
      format: "manual-json-backup",
    },
  };
}

export function downloadBackup(payload) {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `scoreboard-backup-${getCurrentDateSlug()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function validateBackupPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { isValid: false, message: "O arquivo selecionado não é um JSON válido." };
  }

  if (!payload.version) {
    return { isValid: false, message: "O backup não possui versão do formato." };
  }

  if (!payload.data || typeof payload.data !== "object") {
    return { isValid: false, message: "O backup não possui o bloco de dados." };
  }

  if (!payload.data.scoreboard || typeof payload.data.scoreboard !== "object") {
    return { isValid: false, message: "O backup não possui placar válido." };
  }

  if (!Array.isArray(payload.data.history)) {
    return { isValid: false, message: "O backup não possui histórico válido." };
  }

  return { isValid: true, message: "" };
}

export function parseBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        const validation = validateBackupPayload(payload);

        if (!validation.isValid) {
          reject(new Error(validation.message));
          return;
        }

        resolve(normalizeScoreboard({
          ...payload.data.scoreboard,
          history: payload.data.history,
        }));
      } catch (error) {
        reject(new Error("Não foi possível ler o arquivo JSON selecionado."));
      }
    };

    reader.onerror = () => reject(new Error("Não foi possível abrir o arquivo selecionado."));
    reader.readAsText(file);
  });
}

function getCurrentDateSlug() {
  return new Date().toISOString().slice(0, 10);
}
