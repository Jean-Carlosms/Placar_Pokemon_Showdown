import {
  countPokemonUsageFromHistory,
  getAllPokemonFromLocalDatabase,
  getUniquePokemonFromHistory,
  normalizePokemonKey,
} from "../src/utils/pokemonCatalog.js";

assertEqual(normalizePokemonKey("Chien-Pao"), "chien-pao", "Chien-Pao should normalize");
assertEqual(normalizePokemonKey("Raging Bolt"), "raging-bolt", "Raging Bolt should normalize");
assertEqual(normalizePokemonKey("Oricorio-Pa'u"), "oricorio-pau", "Oricorio-Pa'u should normalize");

const history = [
  {
    id: "match-1",
    replay: {
      teams: {
        jean: ["Regieleki", "Ninetales"],
        felipe: ["Chien-Pao", "Raging Bolt"],
      },
    },
  },
  {
    id: "match-2",
    replay: {
      teams: {
        jean: ["Regieleki", "Armarouge"],
        felipe: ["Chien-Pao", "Swampert"],
      },
    },
  },
];

const uniquePokemon = getUniquePokemonFromHistory(history);
const pokemonUsage = countPokemonUsageFromHistory(history);
const allPokemon = getAllPokemonFromLocalDatabase();

assertTruthy(
  uniquePokemon.some((pokemon) => pokemon.key === "regieleki" && pokemon.displayName === "Regieleki"),
  "Unique Pokemon should include Regieleki",
);
assertTruthy(
  uniquePokemon.some((pokemon) => pokemon.key === "chien-pao" && pokemon.displayName === "Chien-Pao"),
  "Unique Pokemon should include Chien-Pao",
);
assertEqual(pokemonUsage.regieleki.count, 2, "Regieleki should be counted twice");
assertEqual(pokemonUsage["chien-pao"].count, 2, "Chien-Pao should be counted twice");
assertEqual(pokemonUsage.swampert.count, 1, "Swampert should be counted once");

if (allPokemon.length > 0) {
  assertTruthy(
    allPokemon.some((pokemon) => pokemon.key === "regieleki" && pokemon.displayName === "Regieleki"),
    "Local Pokemon database should include Regieleki when populated",
  );
  assertTruthy(
    allPokemon.some((pokemon) => pokemon.key === "chien-pao" && pokemon.displayName === "Chien-Pao"),
    "Local Pokemon database should include Chien-Pao when populated",
  );
}

console.log("Pokemon catalog check passed.");

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}`);
  }
}

function assertTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}
