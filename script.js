const STORAGE_KEY = "pokemonShowdownScoreboard";

const PLAYERS = {
  jean: {
    displayName: "Jean Carlos",
    spriteId: "jean-sprite",
    spriteUrl: "https://play.pokemonshowdown.com/sprites/ani/annihilape.gif",
  },
  felipe: {
    displayName: "Felipe Eckert",
    spriteId: "felipe-sprite",
    spriteUrl: "https://play.pokemonshowdown.com/sprites/ani/trubbish.gif",
  },
};

const BATTLE_LABELS = {
  single: "Single",
  double: "Double",
};

let scoreboard = loadScoreboard();

// Estado base e persistencia local.
function createDefaultScoreboard() {
  return {
    scores: {
      jean: { single: 0, double: 0 },
      felipe: { single: 0, double: 0 },
    },
    history: [],
  };
}

function loadScoreboard() {
  const savedScoreboard = localStorage.getItem(STORAGE_KEY);

  if (!savedScoreboard) {
    return createDefaultScoreboard();
  }

  try {
    return normalizeScoreboard(JSON.parse(savedScoreboard));
  } catch (error) {
    console.warn("Não foi possível carregar o placar salvo.", error);
    return createDefaultScoreboard();
  }
}

function normalizeScoreboard(savedScoreboard) {
  const cleanScoreboard = createDefaultScoreboard();

  Object.keys(PLAYERS).forEach((playerKey) => {
    cleanScoreboard.scores[playerKey].single = Number(
      savedScoreboard?.scores?.[playerKey]?.single || 0,
    );
    cleanScoreboard.scores[playerKey].double = Number(
      savedScoreboard?.scores?.[playerKey]?.double || 0,
    );
  });

  cleanScoreboard.history = Array.isArray(savedScoreboard?.history)
    ? savedScoreboard.history.filter(isValidHistoryEntry)
    : [];

  return cleanScoreboard;
}

function isValidHistoryEntry(entry) {
  return (
    entry &&
    hasKey(PLAYERS, entry.player) &&
    hasKey(BATTLE_LABELS, entry.battleType) &&
    Boolean(entry.timestamp)
  );
}

function hasKey(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function saveScoreboard() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scoreboard));
}

// Acoes do placar.
function addWin(player, battleType) {
  if (!hasKey(PLAYERS, player) || !hasKey(BATTLE_LABELS, battleType)) {
    return;
  }

  scoreboard.scores[player][battleType] += 1;
  scoreboard.history.push({
    id: createHistoryId(),
    player,
    battleType,
    timestamp: new Date().toISOString(),
  });

  saveScoreboard();
  render();
}

function createHistoryId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function undoLastWin() {
  const lastWin = scoreboard.history.pop();

  if (!lastWin) {
    return;
  }

  scoreboard.scores[lastWin.player][lastWin.battleType] = Math.max(
    0,
    scoreboard.scores[lastWin.player][lastWin.battleType] - 1,
  );

  saveScoreboard();
  render();
}

function resetScoreboard() {
  const shouldReset = confirm("Tem certeza que deseja resetar o placar?");

  if (!shouldReset) {
    return;
  }

  scoreboard = createDefaultScoreboard();
  saveScoreboard();
  render();
}

// Calculos usados pelas estatisticas.
function getPlayerTotal(player) {
  return scoreboard.scores[player].single + scoreboard.scores[player].double;
}

function getTotalMatches() {
  return Object.keys(PLAYERS).reduce((total, player) => total + getPlayerTotal(player), 0);
}

function getBattleTotal(battleType) {
  return Object.keys(PLAYERS).reduce(
    (total, player) => total + scoreboard.scores[player][battleType],
    0,
  );
}

function getWinPercentage(player) {
  const totalMatches = getTotalMatches();

  if (totalMatches === 0) {
    return "0%";
  }

  return `${Math.round((getPlayerTotal(player) / totalMatches) * 100)}%`;
}

// Renderizacao da interface.
function render() {
  renderSprites();
  renderScores();
  renderStats();
  renderHistory();
}

function renderSprites() {
  Object.values(PLAYERS).forEach((player) => {
    const sprite = document.getElementById(player.spriteId);
    sprite.src = player.spriteUrl;
  });
}

function renderScores() {
  Object.keys(PLAYERS).forEach((player) => {
    document.getElementById(`${player}-single`).textContent = scoreboard.scores[player].single;
    document.getElementById(`${player}-double`).textContent = scoreboard.scores[player].double;
    document.getElementById(`${player}-total`).textContent = getPlayerTotal(player);
  });
}

function renderStats() {
  document.getElementById("total-matches").textContent = getTotalMatches();
  document.getElementById("total-single").textContent = getBattleTotal("single");
  document.getElementById("total-double").textContent = getBattleTotal("double");
  document.getElementById("jean-percentage").textContent = getWinPercentage("jean");
  document.getElementById("felipe-percentage").textContent = getWinPercentage("felipe");
}

function renderHistory() {
  const historyList = document.getElementById("history-list");
  const historyCount = document.getElementById("history-count");

  historyList.innerHTML = "";
  historyCount.textContent = `${scoreboard.history.length} registro${
    scoreboard.history.length === 1 ? "" : "s"
  }`;

  [...scoreboard.history].reverse().forEach((entry) => {
    const listItem = document.createElement("li");
    const winnerBlock = document.createElement("div");
    const winnerName = document.createElement("strong");
    const dateText = document.createElement("span");
    const battleBadge = document.createElement("span");

    listItem.className = "history-item";
    winnerName.textContent = PLAYERS[entry.player].displayName;
    dateText.textContent = formatDateTime(entry.timestamp);
    battleBadge.className = `battle-badge ${entry.battleType}`;
    battleBadge.textContent = BATTLE_LABELS[entry.battleType];

    winnerBlock.append(winnerName, dateText);
    listItem.append(winnerBlock, battleBadge);
    historyList.appendChild(listItem);
  });
}

function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

// Eventos dos botoes.
function registerEvents() {
  document.querySelectorAll("[data-player][data-battle-type]").forEach((button) => {
    button.addEventListener("click", () => {
      addWin(button.dataset.player, button.dataset.battleType);
    });
  });

  document.getElementById("undo-button").addEventListener("click", undoLastWin);
  document.getElementById("reset-button").addEventListener("click", resetScoreboard);
}

registerEvents();
render();
