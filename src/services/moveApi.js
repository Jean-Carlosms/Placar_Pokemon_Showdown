import { MOVE_DETAIL_FALLBACKS } from "../data/moveFallbacks.js";
import moveDetailsData from "../data/moveDetails.generated.json";

const IS_DEV = Boolean(import.meta.env?.DEV);
const POKEAPI_MOVE_BASE_URL = IS_DEV
  ? "/pokeapi/api/v2/move"
  : "https://pokeapi.co/api/v2/move";

const moveDetailsCache = new Map();

export function normalizeMoveApiName(moveName) {
  return String(moveName || "")
    .trim()
    .toLowerCase()
    .replace(/[']/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatMoveApiName(apiName) {
  return String(apiName || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export async function getMoveDetails(moveName) {
  const apiName = normalizeMoveApiName(moveName);

  if (!apiName) {
    return createBasicFallbackMove(moveName);
  }

  if (moveDetailsCache.has(apiName)) {
    return moveDetailsCache.get(apiName);
  }

  const detailsRequest = fetchMoveDetails(apiName);
  moveDetailsCache.set(apiName, detailsRequest);

  return detailsRequest;
}

async function fetchMoveDetails(apiName) {
  const localMove = getLocalMove(apiName);

  if (localMove) {
    return {
      ...localMove,
      source: "local-move-database",
    };
  }

  const fallbackMove = getMoveFallback(apiName);

  if (fallbackMove) {
    return {
      ...fallbackMove,
      source: "local-fallback",
    };
  }

  try {
    const response = await fetch(`${POKEAPI_MOVE_BASE_URL}/${apiName}`);

    if (!response.ok) {
      return createBasicFallbackMove(apiName);
    }

    const move = await response.json();

    return {
      ...mapMoveDetails(move),
      source: "pokeapi",
    };
  } catch (error) {
    return createBasicFallbackMove(apiName);
  }
}

function mapMoveDetails(move, fallbackMove) {
  const englishEffect = move.effect_entries?.find((entry) => entry.language?.name === "en");
  const englishFlavorTexts = (move.flavor_text_entries ?? []).filter(
    (entry) => entry.language?.name === "en",
  );
  const flavorText = englishFlavorTexts.at(-1)?.flavor_text ?? fallbackMove?.flavorText ?? "";

  return {
    id: move.id ?? fallbackMove?.id ?? null,
    name: move.name,
    displayName: formatMoveApiName(move.name),
    type: formatMoveApiName(move.type?.name) || fallbackMove?.type || "",
    damageClass: formatMoveApiName(move.damage_class?.name) || fallbackMove?.damageClass || "",
    power: move.power ?? fallbackMove?.power ?? null,
    accuracy: move.accuracy ?? fallbackMove?.accuracy ?? null,
    pp: move.pp ?? fallbackMove?.pp ?? null,
    priority: move.priority ?? fallbackMove?.priority ?? 0,
    target: formatMoveApiName(move.target?.name) || fallbackMove?.target || "",
    generation: formatMoveApiName(move.generation?.name) || fallbackMove?.generation || "",
    shortEffect: cleanMoveText(englishEffect?.short_effect ?? fallbackMove?.shortEffect ?? ""),
    effect: cleanMoveText(englishEffect?.effect ?? fallbackMove?.effect ?? ""),
    flavorText: cleanMoveText(flavorText),
  };
}

function getMoveFallback(apiName) {
  return MOVE_DETAIL_FALLBACKS[apiName] ?? null;
}

function getLocalMove(apiName) {
  return moveDetailsData.moves?.[apiName] ?? null;
}

function createBasicFallbackMove(moveName) {
  const apiName = normalizeMoveApiName(moveName);

  return {
    unavailable: false,
    isBasicFallback: true,
    id: null,
    name: apiName,
    displayName: formatMoveApiName(moveName || apiName),
    type: "",
    damageClass: "",
    power: null,
    accuracy: null,
    pp: null,
    priority: null,
    target: "",
    generation: "",
    shortEffect: "Detalhes completos indisponiveis no momento.",
    effect: "O move foi encontrado no historico, mas a PokeAPI nao respondeu e ainda nao existe um fallback detalhado local para ele.",
    flavorText: "Adicione este move aos fallbacks locais para exibir dados completos mesmo offline.",
    source: "basic-fallback",
  };
}

function cleanMoveText(text) {
  return String(text || "")
    .replace(/\n|\f/g, " ")
    .replace(/\$effect_chance/g, "chance")
    .replace(/\s+/g, " ")
    .trim();
}
