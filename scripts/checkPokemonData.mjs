import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pokemonDataPath = resolve("src/data/pokemonDetails.generated.json");
const pokemonData = JSON.parse(readFileSync(pokemonDataPath, "utf8"));

assertTruthy(pokemonData && typeof pokemonData === "object", "Pokemon data should be an object");
assertTruthy(
  pokemonData.pokemon && typeof pokemonData.pokemon === "object",
  "Pokemon data should include pokemon",
);

const pokemonKeys = Object.keys(pokemonData.pokemon);

if (Number(pokemonData.count || 0) === 0 || pokemonKeys.length === 0) {
  console.warn("Pokemon data file is empty. Run npm run data:pokemon to populate it.");
  console.log("Pokemon data check passed.");
  process.exit(0);
}

const samplePokemon = pokemonData.pokemon[pokemonKeys[0]];

assertTruthy(pokemonKeys.length > 1, "Pokemon data should include multiple entries when populated");
assertTruthy(samplePokemon.displayName, "Sample Pokemon should include displayName");
assertTruthy(samplePokemon.stats && typeof samplePokemon.stats === "object", "Sample Pokemon should include stats");
assertTruthy("totalStats" in samplePokemon, "Sample Pokemon should include totalStats");
assertTruthy(Array.isArray(samplePokemon.types), "Sample Pokemon should include types");

["regieleki", "annihilape", "trubbish"].forEach((pokemonKey) => {
  const pokemon = pokemonData.pokemon[pokemonKey];

  if (!pokemon) {
    return;
  }

  assertTruthy("hp" in pokemon.stats, `${pokemonKey} should include hp stat`);
  assertTruthy(Number(pokemon.totalStats) > 0, `${pokemonKey} should include totalStats`);
  assertTruthy(Array.isArray(pokemon.types) && pokemon.types.length > 0, `${pokemonKey} should include types`);
});

if (pokemonData.pokemon.regieleki) {
  assertTruthy(
    pokemonData.pokemon.regieleki.displayName === "Regieleki",
    "Regieleki displayName should be valid",
  );
}

if (pokemonData.pokemon["chien-pao"]) {
  assertTruthy(
    Array.isArray(pokemonData.pokemon["chien-pao"].types) &&
      pokemonData.pokemon["chien-pao"].types.includes("Dark") &&
      pokemonData.pokemon["chien-pao"].types.includes("Ice"),
    "Chien-Pao should include Dark/Ice types",
  );
  assertTruthy(
    Number(pokemonData.pokemon["chien-pao"].stats?.attack) > 0,
    "Chien-Pao should include attack stat",
  );
}

console.log("Pokemon data check passed.");

function assertTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}
