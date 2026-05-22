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
const pokemonWithSpriteCandidates = pokemonKeys.find((pokemonKey) =>
  Array.isArray(pokemonData.pokemon[pokemonKey]?.spriteCandidates),
);

assertTruthy(pokemonKeys.length > 1, "Pokemon data should include multiple entries when populated");
assertTruthy(samplePokemon.displayName, "Sample Pokemon should include displayName");
assertTruthy(samplePokemon.stats && typeof samplePokemon.stats === "object", "Sample Pokemon should include stats");
assertTruthy("totalStats" in samplePokemon, "Sample Pokemon should include totalStats");
assertTruthy(Array.isArray(samplePokemon.types), "Sample Pokemon should include types");
assertTruthy(samplePokemon.localSprite, "Sample Pokemon should include localSprite");
assertTruthy(pokemonWithSpriteCandidates, "At least one Pokemon should include spriteCandidates");

["regieleki", "annihilape", "trubbish"].forEach((pokemonKey) => {
  const pokemon = pokemonData.pokemon[pokemonKey];

  if (!pokemon) {
    return;
  }

  assertTruthy("hp" in pokemon.stats, `${pokemonKey} should include hp stat`);
  assertTruthy(Number(pokemon.totalStats) > 0, `${pokemonKey} should include totalStats`);
  assertTruthy(Array.isArray(pokemon.types) && pokemon.types.length > 0, `${pokemonKey} should include types`);
  assertTruthy(
    Array.isArray(pokemon.spriteCandidates) && pokemon.spriteCandidates.length > 0,
    `${pokemonKey} should include spriteCandidates`,
  );
  assertTruthy(
    pokemon.spriteCandidates[0] === `/sprites/pokemon/${pokemonKey}.png`,
    `${pokemonKey} should include local sprite as first candidate`,
  );
  assertTruthy(
    pokemon.spriteCandidates.some(isSupportedSpriteUrl),
    `${pokemonKey} should include a supported sprite URL`,
  );
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
  assertTruthy(
    Array.isArray(pokemonData.pokemon["chien-pao"].spriteCandidates) &&
      pokemonData.pokemon["chien-pao"].spriteCandidates.length > 0,
    "Chien-Pao should include spriteCandidates",
  );
  assertTruthy(
    pokemonData.pokemon["chien-pao"].spriteCandidates[0] === "/sprites/pokemon/chien-pao.png",
    "Chien-Pao should include local sprite as first candidate",
  );
  assertTruthy(
    pokemonData.pokemon["chien-pao"].spriteCandidates.some(isSupportedSpriteUrl),
    "Chien-Pao should include a supported sprite URL",
  );
}

if (pokemonData.pokemon.pikachu) {
  assertTruthy(
    Array.isArray(pokemonData.pokemon.pikachu.spriteCandidates) &&
      pokemonData.pokemon.pikachu.spriteCandidates.length > 0,
    "Pikachu should include spriteCandidates",
  );
  assertTruthy(
    pokemonData.pokemon.pikachu.spriteCandidates[0] === "/sprites/pokemon/pikachu.png",
    "Pikachu should include local sprite as first candidate",
  );
  assertTruthy(
    pokemonData.pokemon.pikachu.spriteCandidates.some(isSupportedSpriteUrl),
    "Pikachu should include a supported sprite URL",
  );
}

console.log("Pokemon data check passed.");

function assertTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

function isSupportedSpriteUrl(url) {
  return (
    typeof url === "string" &&
    (url.includes("play.pokemonshowdown.com") || url.includes("raw.githubusercontent.com"))
  );
}
