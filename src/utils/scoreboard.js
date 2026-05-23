import { BATTLE_TYPES, PLAYERS } from "../data/players.js";

export const DEFAULT_SEASON_ID = "season-current";
export const DEFAULT_SEASON_NAME = "Temporada Atual";

const PLAYER_IDS = PLAYERS.map((player) => player.id);
const BATTLE_TYPE_IDS = Object.keys(BATTLE_TYPES);

export function createInitialScoreboard() {
  return {
    scores: createEmptyScores(),
    history: [],
    seasons: [createSeason(DEFAULT_SEASON_NAME, DEFAULT_SEASON_ID)],
    activeSeasonId: DEFAULT_SEASON_ID,
  };
}

export function normalizeScoreboard(savedScoreboard) {
  const cleanScoreboard = createInitialScoreboard();
  const hasHistory = Array.isArray(savedScoreboard?.history);
  const normalizedHistory = hasHistory
    ? savedScoreboard.history.filter(isValidHistoryEntry).map(normalizeHistoryEntry)
    : [];
  const normalizedGlobalScores = hasHistory
    ? calculateScoresFromHistory(normalizedHistory)
    : normalizeScores(savedScoreboard?.scores);
  const savedSeasons = Array.isArray(savedScoreboard?.seasons) ? savedScoreboard.seasons : [];
  const seasons = savedSeasons.length > 0
    ? savedSeasons.map((season) => normalizeSeason(season, normalizedHistory, hasHistory))
    : [
        {
          ...createSeason(DEFAULT_SEASON_NAME, DEFAULT_SEASON_ID),
          scores: normalizedGlobalScores,
        },
      ];
  const activeSeasonId = seasons.some((season) => season.id === savedScoreboard?.activeSeasonId)
    ? savedScoreboard.activeSeasonId
    : seasons[0]?.id ?? DEFAULT_SEASON_ID;

  return {
    ...cleanScoreboard,
    scores: normalizedGlobalScores,
    history: normalizedHistory,
    seasons,
    activeSeasonId,
  };
}

export function addWinToScoreboard(scoreboard, playerId, battleType, metadata = {}) {
  if (!isValidPlayerId(playerId) || !isValidBattleType(battleType)) {
    return scoreboard;
  }

  if (hasReplayId(scoreboard.history, metadata?.replay?.replayId)) {
    return scoreboard;
  }

  const activeSeasonId = getSafeActiveSeasonId(scoreboard);
  const historyEntry = {
    id: createHistoryId(),
    player: playerId,
    winnerId: playerId,
    battleType,
    seasonId: activeSeasonId,
    createdAt: metadata.playedAt || new Date().toISOString(),
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  return {
    ...scoreboard,
    scores: incrementScore(scoreboard.scores, playerId, battleType),
    seasons: scoreboard.seasons.map((season) =>
      season.id === activeSeasonId
        ? { ...season, scores: incrementScore(season.scores, playerId, battleType) }
        : season,
    ),
    history: [...scoreboard.history, historyEntry],
  };
}

export function hasReplayId(history, replayId) {
  if (!replayId) {
    return false;
  }

  return (Array.isArray(history) ? history : []).some(
    (item) => item?.replay?.replayId === replayId,
  );
}

export function undoLastWinFromScoreboard(scoreboard) {
  const lastWin = scoreboard.history.at(-1);

  if (!lastWin) {
    return scoreboard;
  }

  return {
    ...scoreboard,
    scores: decrementScore(scoreboard.scores, lastWin.player, lastWin.battleType),
    seasons: scoreboard.seasons.map((season) =>
      season.id === lastWin.seasonId
        ? { ...season, scores: decrementScore(season.scores, lastWin.player, lastWin.battleType) }
        : season,
    ),
    history: scoreboard.history.slice(0, -1),
  };
}

export function createSeasonInScoreboard(scoreboard, seasonName) {
  const cleanSeasonName = seasonName.trim();

  if (!cleanSeasonName) {
    return scoreboard;
  }

  const season = createSeason(cleanSeasonName);

  return {
    ...scoreboard,
    seasons: [...scoreboard.seasons, season],
    activeSeasonId: season.id,
  };
}

export function selectSeasonInScoreboard(scoreboard, seasonId) {
  if (!scoreboard.seasons.some((season) => season.id === seasonId)) {
    return scoreboard;
  }

  return {
    ...scoreboard,
    activeSeasonId: seasonId,
  };
}

export function getActiveSeason(scoreboard) {
  return (
    scoreboard.seasons.find((season) => season.id === scoreboard.activeSeasonId) ??
    scoreboard.seasons[0] ??
    createSeason(DEFAULT_SEASON_NAME, DEFAULT_SEASON_ID)
  );
}

export function getActiveSeasonScoreboard(scoreboard) {
  const activeSeason = getActiveSeason(scoreboard);

  return {
    scores: activeSeason.scores,
    history: getHistoryForSeason(scoreboard, activeSeason.id),
  };
}

export function getHistoryForSeason(scoreboard, seasonId) {
  return scoreboard.history.filter((entry) => entry.seasonId === seasonId);
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

function createSeason(name, id = createSeasonId()) {
  return {
    id,
    name,
    createdAt: new Date().toISOString(),
    scores: createEmptyScores(),
  };
}

function normalizeSeason(season, history, shouldRecalculateScores) {
  const id = String(season?.id || createSeasonId());
  const seasonHistory = history.filter((entry) => entry.seasonId === id);
  const scores = shouldRecalculateScores
    ? calculateScoresFromHistory(seasonHistory)
    : normalizeScores(season?.scores);

  return {
    id,
    name: String(season?.name || DEFAULT_SEASON_NAME),
    createdAt: season?.createdAt || new Date().toISOString(),
    scores,
  };
}

function createEmptyScores() {
  return PLAYER_IDS.reduce((scores, playerId) => {
    scores[playerId] = { single: 0, double: 0 };
    return scores;
  }, {});
}

function normalizeScores(savedScores) {
  const scores = createEmptyScores();

  PLAYER_IDS.forEach((playerId) => {
    BATTLE_TYPE_IDS.forEach((battleType) => {
      scores[playerId][battleType] = Number(savedScores?.[playerId]?.[battleType] || 0);
    });
  });

  return scores;
}

export function calculateScoresFromHistory(history) {
  return (Array.isArray(history) ? history : []).reduce((scores, entry) => {
    const winnerId = entry?.winnerId ?? entry?.player;
    const battleType = entry?.battleType;

    if (!scores[winnerId] || !isValidBattleType(battleType)) {
      return scores;
    }

    scores[winnerId][battleType] += 1;
    return scores;
  }, createEmptyScores());
}

function normalizeHistoryEntry(entry) {
  return {
    ...entry,
    seasonId: entry.seasonId || DEFAULT_SEASON_ID,
  };
}

function incrementScore(scores, playerId, battleType) {
  return {
    ...scores,
    [playerId]: {
      ...scores[playerId],
      [battleType]: scores[playerId][battleType] + 1,
    },
  };
}

function decrementScore(scores, playerId, battleType) {
  return {
    ...scores,
    [playerId]: {
      ...scores[playerId],
      [battleType]: Math.max(0, scores[playerId][battleType] - 1),
    },
  };
}

function getSafeActiveSeasonId(scoreboard) {
  return getActiveSeason(scoreboard).id;
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

function createSeasonId() {
  return `season-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
