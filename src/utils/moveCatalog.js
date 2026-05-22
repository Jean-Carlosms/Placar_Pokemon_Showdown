import moveDetailsData from "../data/moveDetails.generated.json" with { type: "json" };

export function normalizeMoveKey(moveName) {
  return String(moveName || "")
    .trim()
    .toLowerCase()
    .replace(/[']/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatMoveName(moveName) {
  return String(moveName || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getAllMovesFromLocalDatabase() {
  const moveDatabase = moveDetailsData?.moves;

  if (!moveDatabase || typeof moveDatabase !== "object") {
    return [];
  }

  return Object.entries(moveDatabase)
    .map(([key, move]) => ({
      key,
      displayName: move?.displayName,
    }))
    .filter((move) => move.key && move.displayName)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function getUniqueMovesFromHistory(history) {
  const moveUsage = countMoveUsageFromHistory(history);

  return Object.entries(moveUsage)
    .map(([key, move]) => ({
      key,
      displayName: move.displayName,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function countMoveUsageFromHistory(history) {
  return (Array.isArray(history) ? history : []).reduce((moves, match) => {
    const movesByPokemon = match?.replay?.movesByPokemon;

    if (!movesByPokemon) {
      return moves;
    }

    Object.values(movesByPokemon).forEach((pokemonMoves) => {
      Object.values(pokemonMoves || {}).forEach((moveList) => {
        if (!Array.isArray(moveList)) {
          return;
        }

        moveList.forEach((moveName) => {
          const key = normalizeMoveKey(moveName);

          if (!key) {
            return;
          }

          if (!moves[key]) {
            moves[key] = {
              displayName: formatMoveName(moveName),
              count: 0,
            };
          }

          moves[key].count += 1;
        });
      });
    });

    return moves;
  }, {});
}
