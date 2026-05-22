import { PLAYER_ALIASES } from "../data/playerAliases.js";

export function extractBattleLogFromHtml(htmlText) {
  if (!htmlText || typeof htmlText !== "string") {
    throw new Error("Arquivo HTML vazio ou invalido.");
  }

  if (typeof DOMParser !== "undefined") {
    try {
      const document = new DOMParser().parseFromString(htmlText, "text/html");
      const battleLogNode = document.querySelector("script.battle-log-data");

      if (battleLogNode?.textContent?.trim()) {
        return battleLogNode.textContent.trim();
      }
    } catch {
      // Regex fallbacks keep parser checks working outside the browser.
    }
  }

  const classRegex =
    /<script[^>]*class=["'][^"']*battle-log-data[^"']*["'][^>]*>([\s\S]*?)<\/script>/i;
  const classMatch = htmlText.match(classRegex);

  if (classMatch?.[1]?.trim()) {
    return classMatch[1].trim();
  }

  const genericScriptRegex = /<script[^>]*battle-log-data[^>]*>([\s\S]*?)<\/script>/i;
  const genericMatch = htmlText.match(genericScriptRegex);

  if (genericMatch?.[1]?.trim()) {
    return genericMatch[1].trim();
  }

  throw new Error("Nao foi possivel encontrar battle-log-data no HTML do replay.");
}

export function parseBattleLogLines(logText) {
  return String(logText)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseShowdownLine(line) {
  const parts = String(line).trim().split("|");

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

export function extractPlayersFromBattleLogLines(lines) {
  return lines.reduce((players, line) => {
    const { command, args } = parseShowdownLine(line);

    if (command === "player") {
      const slot = args[0];
      const username = args[1];

      if (["p1", "p2"].includes(slot) && username) {
        players[slot] = username;
      }
    }

    return players;
  }, {});
}

export function mapShowdownPlayers(showdownPlayers) {
  return Object.entries(showdownPlayers).reduce((mappedPlayers, [side, username]) => {
    mappedPlayers[side] = mapReplayWinnerToPlayer(username);
    return mappedPlayers;
  }, {});
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

export function extractMovesFromBattleLogLines(lines, mappedPlayers) {
  const movesByPokemon = { jean: {}, felipe: {} };

  lines.forEach((line) => {
    const { command, args } = parseShowdownLine(line);

    if (command !== "move") {
      return;
    }

    const actor = args[0] || "";
    const moveName = normalizePokemonDisplayName(args[1]);
    const playerSlot = actor.slice(0, 2);
    const playerId = mappedPlayers[playerSlot];
    const pokemonName = normalizePokemonDisplayName(actor.split(":")[1]);

    if (!playerId || !pokemonName || !moveName) {
      return;
    }

    if (!movesByPokemon[playerId]) {
      movesByPokemon[playerId] = {};
    }

    if (!movesByPokemon[playerId][pokemonName]) {
      movesByPokemon[playerId][pokemonName] = [];
    }

    const alreadyAdded = movesByPokemon[playerId][pokemonName].some(
      (registeredMove) => registeredMove.toLowerCase() === moveName.toLowerCase(),
    );

    if (!alreadyAdded) {
      movesByPokemon[playerId][pokemonName].push(moveName);
    }
  });

  return movesByPokemon;
}

export function mapReplayWinnerToPlayer(winnerName) {
  return PLAYER_ALIASES[normalizeShowdownUsername(winnerName)] ?? "";
}

export function parsePokemonShowdownReplay(htmlText) {
  const battleLog = extractBattleLogFromHtml(htmlText);
  const lines = parseBattleLogLines(battleLog);
  const showdownPlayers = extractPlayersFromBattleLogLines(lines);
  const mappedPlayers = mapShowdownPlayers(showdownPlayers);
  const teams = extractTeamsFromBattleLogLines(lines, mappedPlayers);
  const movesByPokemon = extractMovesFromBattleLogLines(lines, mappedPlayers);
  const parsedReplay = {
    source: "pokemon-showdown-replay",
    format: "",
    battleType: "single",
    gametype: "",
    showdownPlayers,
    mappedPlayers,
    teams,
    movesByPokemon,
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

  parsedReplay.battleType = getBattleType(parsedReplay.gametype, parsedReplay.format);
  parsedReplay.mappedWinnerId = mapReplayWinnerToPlayer(parsedReplay.winner);

  const isDev = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV;

  if (isDev) {
    console.debug("Battle log lines count:", lines.length);
    console.debug("First 20 battle log lines:", lines.slice(0, 20));
    console.debug("Extracted showdown players:", parsedReplay.showdownPlayers);
    console.debug("Extracted mapped players:", parsedReplay.mappedPlayers);
    console.debug("Extracted teams:", parsedReplay.teams);
    console.debug("Extracted moves by Pokemon:", parsedReplay.movesByPokemon);
  }

  if (!parsedReplay.winner) {
    throw new Error("Nao foi possivel identificar o vencedor no replay.");
  }

  if (!parsedReplay.mappedWinnerId) {
    throw new Error(`Nao foi possivel mapear o vencedor "${parsedReplay.winner}" para Jean ou Felipe.`);
  }

  const hasJeanTeam = (parsedReplay.teams.jean?.length ?? 0) > 0;
  const hasFelipeTeam = (parsedReplay.teams.felipe?.length ?? 0) > 0;
  const warnings = [];

  if (!parsedReplay.showdownPlayers.p1 || !parsedReplay.showdownPlayers.p2) {
    warnings.push("Jogadores nao encontrados no battle-log-data.");
  }

  if (!hasJeanTeam && !hasFelipeTeam) {
    warnings.push("Times nao encontrados. O parser nao detectou linhas switch/drag.");
  }

  if (warnings.length > 0) {
    parsedReplay.warning = warnings.join(" ");
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
