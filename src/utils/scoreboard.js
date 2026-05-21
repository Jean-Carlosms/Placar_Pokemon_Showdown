import { BATTLE_TYPES, PLAYERS } from "../data/players.js";

const PLAYER_IDS = PLAYERS.map((player) => player.id);
const BATTLE_TYPE_IDS = Object.keys(BATTLE_TYPES);

export function createInitialScoreboard() {
  return {
    scores: PLAYER_IDS.reduce((scores, playerId) => {
      scores[playerId] = { single: 0, double: 0 };
      return scores;
    }, {}),
    history: [],
  };
}

export function normalizeScoreboard(savedScoreboard) {
  const cleanScoreboard = createInitialScoreboard();

  PLAYER_IDS.forEach((playerId) => {
    BATTLE_TYPE_IDS.forEach((battleType) => {
      cleanScoreboard.scores[playerId][battleType] = Number(
        savedScoreboard?.scores?.[playerId]?.[battleType] || 0,
      );
    });
  });

  cleanScoreboard.history = Array.isArray(savedScoreboard?.history)
    ? savedScoreboard.history.filter(isValidHistoryEntry)
    : [];

  return cleanScoreboard;
}

export function addWinToScoreboard(scoreboard, playerId, battleType) {
  if (!isValidPlayerId(playerId) || !isValidBattleType(battleType)) {
    return scoreboard;
  }

  return {
    scores: {
      ...scoreboard.scores,
      [playerId]: {
        ...scoreboard.scores[playerId],
        [battleType]: scoreboard.scores[playerId][battleType] + 1,
      },
    },
    history: [
      ...scoreboard.history,
      {
        id: createHistoryId(),
        player: playerId,
        battleType,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export function undoLastWinFromScoreboard(scoreboard) {
  const lastWin = scoreboard.history.at(-1);

  if (!lastWin) {
    return scoreboard;
  }

  return {
    scores: {
      ...scoreboard.scores,
      [lastWin.player]: {
        ...scoreboard.scores[lastWin.player],
        [lastWin.battleType]: Math.max(
          0,
          scoreboard.scores[lastWin.player][lastWin.battleType] - 1,
        ),
      },
    },
    history: scoreboard.history.slice(0, -1),
  };
}

export function calculateStats(scoreboard) {
  const totalMatches = getTotalMatches(scoreboard);

  return {
    totalMatches,
    totalSingle: getBattleTotal(scoreboard, "single"),
    totalDouble: getBattleTotal(scoreboard, "double"),
    percentages: PLAYER_IDS.reduce((percentages, playerId) => {
      percentages[playerId] =
        totalMatches === 0
          ? "0%"
          : `${Math.round((getPlayerTotal(scoreboard, playerId) / totalMatches) * 100)}%`;
      return percentages;
    }, {}),
  };
}

export function getPlayerScore(scoreboard, playerId) {
  const playerScore = scoreboard.scores[playerId] ?? { single: 0, double: 0 };

  return {
    single: playerScore.single,
    double: playerScore.double,
    total: playerScore.single + playerScore.double,
  };
}

function getPlayerTotal(scoreboard, playerId) {
  return getPlayerScore(scoreboard, playerId).total;
}

function getTotalMatches(scoreboard) {
  return PLAYER_IDS.reduce((total, playerId) => total + getPlayerTotal(scoreboard, playerId), 0);
}

function getBattleTotal(scoreboard, battleType) {
  return PLAYER_IDS.reduce(
    (total, playerId) => total + (scoreboard.scores[playerId]?.[battleType] ?? 0),
    0,
  );
}

function isValidHistoryEntry(entry) {
  return (
    entry &&
    isValidPlayerId(entry.player) &&
    isValidBattleType(entry.battleType) &&
    Boolean(entry.timestamp)
  );
}

function isValidPlayerId(playerId) {
  return PLAYER_IDS.includes(playerId);
}

function isValidBattleType(battleType) {
  return BATTLE_TYPE_IDS.includes(battleType);
}

function createHistoryId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
