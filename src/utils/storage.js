import { createInitialScoreboard, normalizeScoreboard } from "./scoreboard.js";

export const STORAGE_KEY = "pokemonShowdownScoreboard";

export function loadScoreboard() {
  const savedScoreboard = localStorage.getItem(STORAGE_KEY);

  if (!savedScoreboard) {
    return createInitialScoreboard();
  }

  try {
    return normalizeScoreboard(JSON.parse(savedScoreboard));
  } catch (error) {
    console.warn("Nao foi possivel carregar o placar salvo.", error);
    return createInitialScoreboard();
  }
}

export function saveScoreboard(scoreboard) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scoreboard));
}
