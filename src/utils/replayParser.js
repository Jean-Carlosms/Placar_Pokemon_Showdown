import { PLAYER_ALIASES } from "../data/playerAliases.js";

export function extractBattleLogFromHtml(htmlText) {
  const fallbackMatch = htmlText.match(
    /<script[^>]*class=["'][^"']*battle-log-data[^"']*["'][^>]*>([\s\S]*?)<\/script>/i,
  );

  if (fallbackMatch?.[1]) {
    return fallbackMatch[1].trim();
  }

  if (typeof DOMParser !== "undefined") {
    const document = new DOMParser().parseFromString(htmlText, "text/html");
    const battleLogNode = document.querySelector("script.battle-log-data");

    if (battleLogNode?.textContent) {
      return battleLogNode.textContent.trim();
    }
  }

  throw new Error("Não foi possível encontrar os dados da batalha no HTML do replay.");
}

export function parseBattleLogLines(logText) {
  return logText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function parseShowdownLine(line) {
  const parts = line.trim().split("|");

  return {
    raw: line,
    command: parts[1] || "",
    args: parts.slice(2),
  };
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
  const { command, args } = parseShowdownLine(line);

  if (command !== "switch" && command !== "drag") {
    return null;
  }

  const position = args[0] || "";
  const details = args[1] || "";
  const playerSlot = position.slice(0, 2);
  const pokemonName = normalizePokemonDisplayName(details.split(",")[0]);

  if (!pokemonName || !["p1", "p2"].includes(playerSlot)) {
    return null;
  }

  return {
    playerSlot,
    pokemonName,
  };
}

export function extractTeamsFromBattleLogLines(lines, mappedPlayers) {
  const teamsBySide = { p1: [], p2: [] };

  lines.forEach((line) => {
    const { command } = parseShowdownLine(line);

    if (command !== "switch" && command !== "drag") {
      return;
    }

    const extractedPokemon = extractPokemonNameFromSwitchLine(line);

    if (!extractedPokemon) {
      return;
    }

    const { playerSlot, pokemonName } = extractedPokemon;
    const alreadyAdded = teamsBySide[playerSlot].some(
      (name) => normalizePokemonDisplayName(name).toLowerCase() === pokemonName.toLowerCase(),
    );

    if (!alreadyAdded && teamsBySide[playerSlot].length < 6) {
      teamsBySide[playerSlot].push(pokemonName);
    }
  });

  return Object.entries(mappedPlayers).reduce((teams, [side, mappedPlayerId]) => {

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
    const { command, args } = parseShowdownLine(line);

    if (command === "gametype") {
      parsedReplay.gametype = args[0] || "";
    }

    if (command === "player") {
      parsedReplay.showdownPlayers[args[0]] = args[1] || "";
    }

    if (command === "tier") {
      parsedReplay.format = args[0] || "";
    }

    if (command === "turn") {
      parsedReplay.turns = Math.max(parsedReplay.turns, Number(args[0] || 0));
    }

    if (command === "win") {
      parsedReplay.winner = args[0] || "";
    }
  });

  parsedReplay.mappedPlayers = Object.entries(parsedReplay.showdownPlayers).reduce(
    (mappedPlayers, [side, username]) => {
      mappedPlayers[side] = mapReplayWinnerToPlayer(username);
      return mappedPlayers;
    },
    {},
  );
  parsedReplay.teams = extractTeamsFromBattleLogLines(lines, parsedReplay.mappedPlayers);
  parsedReplay.battleType = getBattleType(parsedReplay.gametype, parsedReplay.format);
  parsedReplay.mappedWinnerId = mapReplayWinnerToPlayer(parsedReplay.winner);

  if (!parsedReplay.winner) {
    throw new Error("Não foi possível identificar o vencedor no replay.");
  }

  if (!parsedReplay.mappedWinnerId) {
    throw new Error(`Não foi possível mapear o vencedor "${parsedReplay.winner}" para Jean ou Felipe.`);
  }

  if ((parsedReplay.teams.jean?.length ?? 0) === 0 && (parsedReplay.teams.felipe?.length ?? 0) === 0) {
    parsedReplay.warning = "Replay importado, mas nenhum Pokémon foi encontrado nas linhas switch/drag.";
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
