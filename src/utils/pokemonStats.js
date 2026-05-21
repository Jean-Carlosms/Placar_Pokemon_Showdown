export function normalizePokemonKey(name) {
  return String(name || "").trim().toLowerCase();
}

export function calculatePokemonWinStatsFromHistory(history) {
  return history.reduce((stats, entry) => {
    const replay = entry.replay;
    const winnerId = entry.player ?? entry.winnerId;
    const winnerTeam = replay?.teams?.[winnerId];

    if (entry.source !== "pokemon-showdown-replay" && !winnerTeam) {
      return stats;
    }

    if (!winnerId || !Array.isArray(winnerTeam)) {
      return stats;
    }

    if (!stats[winnerId]) {
      stats[winnerId] = {};
    }

    winnerTeam.forEach((pokemonName) => {
      const key = normalizePokemonKey(pokemonName);

      if (!key) {
        return;
      }

      stats[winnerId][key] = stats[winnerId][key] ?? {
        displayName: pokemonName,
        wins: 0,
      };
      stats[winnerId][key].wins += 1;
    });

    return stats;
  }, {});
}

export function getTopWinningPokemonForPlayer(playerId, history, players) {
  const stats = calculatePokemonWinStatsFromHistory(history);
  const playerStats = stats[playerId] ?? {};
  const highestWins = Math.max(0, ...Object.values(playerStats).map((pokemon) => pokemon.wins));

  if (highestWins === 0) {
    const player = players.find((candidate) => candidate.id === playerId);
    return {
      displayName: toDisplayName(player?.defaultPokemon ?? ""),
      wins: 0,
      isDefault: true,
    };
  }

  return Object.values(playerStats)
    .filter((pokemon) => pokemon.wins === highestWins)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function toDisplayName(name) {
  return String(name || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

export function getFeaturedPokemonForPlayer(playerId, history, players, stableTieBreaker) {
  const topPokemon = getTopWinningPokemonForPlayer(playerId, history, players);

  if (!Array.isArray(topPokemon)) {
    return topPokemon;
  }

  const selectedIndex = getStableIndex(`${playerId}-${history.length}-${stableTieBreaker}`, topPokemon.length);

  return {
    ...topPokemon[selectedIndex],
    isDefault: false,
  };
}

function getStableIndex(seed, length) {
  const hash = String(seed)
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return length === 0 ? 0 : hash % length;
}
