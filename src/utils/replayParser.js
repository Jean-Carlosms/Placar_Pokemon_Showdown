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

export function parsePokemonShowdownReplay(htmlText) {
  const battleLog = extractBattleLogFromHtml(htmlText);
  const lines = battleLog.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const parsedReplay = {
    source: "pokemon-showdown-replay",
    format: "",
    battleType: "single",
    gametype: "",
    players: {},
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
      parsedReplay.players[parts[2]] = parts[3] || "";
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

export function mapReplayWinnerToPlayer(winnerName) {
  return PLAYER_ALIASES[normalizeAlias(winnerName)] ?? "";
}

function getBattleType(gametype, format) {
  const normalizedGametype = normalizeAlias(gametype);
  const normalizedFormat = normalizeAlias(format);

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

function normalizeAlias(value) {
  return String(value || "").trim().toLowerCase();
}
