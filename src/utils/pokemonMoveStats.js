export function normalizePokemonMoveKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function calculatePokemonMoveStatsFromHistory(history) {
  return (Array.isArray(history) ? history : []).reduce(
    (stats, match) => {
      const movesByPokemon = match?.replay?.movesByPokemon;

      if (!movesByPokemon) {
        return stats;
      }

      Object.entries(movesByPokemon).forEach(([playerId, pokemonMoves]) => {
        if (!stats[playerId]) {
          stats[playerId] = {};
        }

        Object.entries(pokemonMoves || {}).forEach(([pokemonName, moves]) => {
          const pokemonKey = normalizePokemonMoveKey(pokemonName);

          if (!pokemonKey || !Array.isArray(moves)) {
            return;
          }

          if (!stats[playerId][pokemonKey]) {
            stats[playerId][pokemonKey] = {
              displayName: pokemonName,
              totalBattles: 0,
              moves: {},
            };
          }

          stats[playerId][pokemonKey].totalBattles += 1;

          moves.forEach((moveName) => {
            if (!moveName) {
              return;
            }

            stats[playerId][pokemonKey].moves[moveName] =
              (stats[playerId][pokemonKey].moves[moveName] ?? 0) + 1;
          });
        });
      });

      return stats;
    },
    { jean: {}, felipe: {} },
  );
}

export function getMovesForPokemonInMatch(match, playerId, pokemonName) {
  const pokemonMoves = match?.replay?.movesByPokemon?.[playerId];

  return getMovesFromPokemonMap(pokemonMoves, pokemonName);
}

export function getGlobalMovesForPokemon(history, playerId, pokemonName) {
  const stats = calculatePokemonMoveStatsFromHistory(history);
  const pokemonStats = stats[playerId]?.[normalizePokemonMoveKey(pokemonName)];

  if (!pokemonStats) {
    return [];
  }

  return Object.entries(pokemonStats.moves)
    .map(([moveName, uses]) => ({ moveName, uses }))
    .sort((a, b) => b.uses - a.uses || a.moveName.localeCompare(b.moveName));
}

export function getMovesFromPokemonMap(pokemonMoves, pokemonName) {
  if (!pokemonMoves || !pokemonName) {
    return [];
  }

  if (Array.isArray(pokemonMoves[pokemonName])) {
    return pokemonMoves[pokemonName];
  }

  const pokemonKey = normalizePokemonMoveKey(pokemonName);
  const matchedEntry = Object.entries(pokemonMoves).find(
    ([registeredPokemon]) => normalizePokemonMoveKey(registeredPokemon) === pokemonKey,
  );

  return Array.isArray(matchedEntry?.[1]) ? matchedEntry[1] : [];
}
