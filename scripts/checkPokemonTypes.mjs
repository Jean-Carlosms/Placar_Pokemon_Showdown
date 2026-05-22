import { formatPokemonType, normalizePokemonApiName } from "../src/services/pokemonApi.js";

assertEqual(formatPokemonType("electric"), "Electric", "electric should format as Electric");
assertEqual(formatPokemonType("dark"), "Dark", "dark should format as Dark");
assertEqual(formatPokemonType("ice"), "Ice", "ice should format as Ice");
assertEqual(normalizePokemonApiName("Chien-Pao"), "chien-pao", "Chien-Pao should normalize");
assertEqual(normalizePokemonApiName("Raging Bolt"), "raging-bolt", "Raging Bolt should normalize");
assertEqual(normalizePokemonApiName("Iron Hands"), "iron-hands", "Iron Hands should normalize");

console.log("Pokemon types check passed.");

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}`);
  }
}
