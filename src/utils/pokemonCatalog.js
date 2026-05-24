import { loadPokemonDatabase } from "../services/localDataApi.js";

export function normalizePokemonKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[']/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getAllPokemonFromLocalDatabase() {
  const pokemonDetailsData = await loadPokemonDatabase();
  const pokemonDatabase = pokemonDetailsData?.pokemon;

  if (!pokemonDatabase || typeof pokemonDatabase !== "object") {
    return [];
  }

  return Object.entries(pokemonDatabase)
    .map(([key, pokemon]) => ({
      key,
      displayName: pokemon?.displayName,
    }))
    .filter((pokemon) => pokemon.key && pokemon.displayName)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function getUniquePokemonFromHistory(history) {
  const pokemonUsage = countPokemonUsageFromHistory(history);

  return Object.entries(pokemonUsage)
    .map(([key, pokemon]) => ({
      key,
      displayName: pokemon.displayName,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function countPokemonUsageFromHistory(history) {
  return (Array.isArray(history) ? history : []).reduce((pokemonUsage, match) => {
    const teams = match?.replay?.teams;

    if (!teams) {
      return pokemonUsage;
    }

    Object.values(teams).forEach((team) => {
      if (!Array.isArray(team)) {
        return;
      }

      team.forEach((pokemonName) => {
        const key = normalizePokemonKey(pokemonName);

        if (!key) {
          return;
        }

        if (!pokemonUsage[key]) {
          pokemonUsage[key] = {
            displayName: pokemonName,
            count: 0,
          };
        }

        pokemonUsage[key].count += 1;
      });
    });

    return pokemonUsage;
  }, {});
}
