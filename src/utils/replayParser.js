import { PLAYER_ALIASES } from "../data/playerAliases.js";

export function extractBattleLogFromHtml(htmlText) {
  const document = new DOMParser().parseFromString(htmlText, "text/html");
  const battleLogNode = document.querySelector("script.battle-log-data");

  if (battleLogNode?.textContent) {
    return battleLogNode.textContent.trim();
  }

  const fallbackMatch = htmlText.match(
    /<script[^>]*class=["'][^"']*battle-log-data[^"']*["'][^>]*>([\s\S]*?)<\/script>/i,
  );

  if (fallbackMatch?.[1]) {
    return fallbackMatch[1].trim();
  }

  throw new Error("Não foi possível encontrar os dados da batalha no HTML do replay.");
}

export function parseBattleLogLines(logText) {
  return logText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function normalizeShowdownUsername(username) {
  return String(username || "").trim().toLowerCase();
}

export function normalizePokemonDisplayName(name) {
  return String(name || "")
    .replace(/\s+/g, " ")
    .replace(/^\s+|\s+$/g, "");
}

export function extractPokemonNameFromSwitchLine(line) {
  const parts = line.split("|");
  const details = parts[3] || parts[2] || "";
  const fallbackName = details.includes(":") ? details.split(":").pop() : details;
  const species = (parts[3] || fallbackName).split(",")[0];

  return normalizePokemonDisplayName(species);
}

export function extractTeamsFromBattleLogLines(lines, showdownPlayers) {
  const teamsBySide = { p1: [], p2: [] };

  lines.forEach((line) => {
    const parts = line.split("|");
    const eventType = parts[1];

    if (eventType !== "switch" && eventType !== "drag") {
      return;
    }

    const side = parts[2]?.slice(0, 2);
    const pokemonName = extractPokemonNameFromSwitchLine(line);

    if (!teamsBySide[side] || !pokemonName) {
      return;
    }

    const alreadyAdded = teamsBySide[side].some(
      (name) => normalizePokemonDisplayName(name).toLowerCase() === pokemonName.toLowerCase(),
    );

    if (!alreadyAdded && teamsBySide[side].length < 6) {
      teamsBySide[side].push(pokemonName);
    }
  });

  return Object.entries(showdownPlayers).reduce((teams, [side, username]) => {
    const mappedPlayerId = mapReplayWinnerToPlayer(username);

    if (mappedPlayerId) {
      teams[mappedPlayerId] = teamsBySide[side] ?? [];
    }

    return teams;
  }, {});
}

export function mapReplayWinnerToPlayer(winnerName) {
  return PLAYER_ALIASES[normalizeShowdownUsername(winnerName)] ?? "";
}

export function parsePokemonShowdownReplay(htmlText) {
  const battleLog = extractBattleLogFromHtml(htmlText);
  const lines = parseBattleLogLines(battleLog);
  const parsedReplay = {
    source: "pokemon-showdown-replay",
    format: "",
    battleType: "single",
    gametype: "",
    showdownPlayers: {},
    mappedPlayers: {},
    teams: {},
    winner: "",
    mappedWinnerId: "",
    turns: 0,
    replayId: extractReplayId(htmlText),
    playedAt: extractPlayedAt(htmlText),
  };

  lines.forEach((line) => {
    const parts = line.split("|");
    const eventType = parts[1];

    if (eventType === "gametype") {
      parsedReplay.gametype = parts[2] || "";
    }

    if (eventType === "player") {
      parsedReplay.showdownPlayers[parts[2]] = parts[3] || "";
    }

    if (eventType === "tier") {
      parsedReplay.format = parts[2] || "";
    }

    if (eventType === "turn") {
      parsedReplay.turns = Math.max(parsedReplay.turns, Number(parts[2] || 0));
    }

    if (eventType === "win") {
      parsedReplay.winner = parts[2] || "";
    }
  });

  parsedReplay.mappedPlayers = Object.entries(parsedReplay.showdownPlayers).reduce(
    (mappedPlayers, [side, username]) => {
      mappedPlayers[side] = mapReplayWinnerToPlayer(username);
      return mappedPlayers;
    },
    {},
  );
  parsedReplay.teams = extractTeamsFromBattleLogLines(lines, parsedReplay.showdownPlayers);
  parsedReplay.battleType = getBattleType(parsedReplay.gametype, parsedReplay.format);
  parsedReplay.mappedWinnerId = mapReplayWinnerToPlayer(parsedReplay.winner);

  if (!parsedReplay.winner) {
    throw new Error("Não foi possível identificar o vencedor no replay.");
  }

  if (!parsedReplay.mappedWinnerId) {
    throw new Error(`Não foi possível mapear o vencedor "${parsedReplay.winner}" para Jean ou Felipe.`);
  }

  return parsedReplay;
}

function getBattleType(gametype, format) {
  const normalizedGametype = normalizeShowdownUsername(gametype);
  const normalizedFormat = normalizeShowdownUsername(format);

  if (normalizedGametype === "doubles") {
    return "double";
  }

  if (normalizedGametype === "singles") {
    return "single";
  }

  if (normalizedFormat.includes("doubles")) {
    return "double";
  }

  return "single";
}

function extractReplayId(htmlText) {
  const urlMatch = htmlText.match(/replay\.pokemonshowdown\.com\/([a-z0-9-]+)/i);

  if (urlMatch?.[1]) {
    return urlMatch[1];
  }

  const idMatch = htmlText.match(/([a-z0-9]+(?:battle)?-\d{6,})/i);

  return idMatch?.[1] ?? "";
}

function extractPlayedAt(htmlText) {
  const timeMatch = htmlText.match(/<time[^>]*datetime=["']([^"']+)["']/i);

  if (timeMatch?.[1]) {
    return new Date(timeMatch[1]).toISOString();
  }

  const dateMatch = htmlText.match(/datetime=["']([^"']+)["']/i);

  if (dateMatch?.[1]) {
    return new Date(dateMatch[1]).toISOString();
  }

  return new Date().toISOString();
}
