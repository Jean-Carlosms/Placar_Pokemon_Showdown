import {
  formatPokemonType,
  getPokemonTypes,
  normalizePokemonApiName,
} from "../src/services/pokemonApi.js";

assertEqual(formatPokemonType("electric"), "Electric", "electric should format as Electric");
assertEqual(formatPokemonType("dark"), "Dark", "dark should format as Dark");
assertEqual(formatPokemonType("ice"), "Ice", "ice should format as Ice");
assertEqual(normalizePokemonApiName("Chien-Pao"), "chien-pao", "Chien-Pao should normalize");
assertEqual(normalizePokemonApiName("Raging Bolt"), "raging-bolt", "Raging Bolt should normalize");
assertEqual(normalizePokemonApiName("Iron Hands"), "iron-hands", "Iron Hands should normalize");
assertArrayEqual(await getPokemonTypes("Regieleki"), ["Electric"], "Regieleki should use local fallback");
assertArrayEqual(
  await getPokemonTypes("Chien-Pao"),
  ["Dark", "Ice"],
  "Chien-Pao should use local fallback",
);
assertArrayEqual(
  await getPokemonTypes("Swampert"),
  ["Water", "Ground"],
  "Swampert should use local fallback",
);

console.log("Pokemon types check passed.");

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}`);
  }
}

function assertArrayEqual(actual, expected, message) {
  if (!Array.isArray(actual) || actual.join("|") !== expected.join("|")) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}
