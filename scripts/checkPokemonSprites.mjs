import {
  getPokemonSpriteFallbacks,
  getPokemonShowdownSpriteCandidates,
  getPokemonTypes,
  normalizePokemonApiName,
} from "../src/services/pokemonApi.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pokemonDetailsData = require("../src/data/pokemonDetails.generated.json");

const names = [
  "Ambipom",
  "Quagsire",
  "Mabosstiff",
  "Hatterene",
  "Milotic",
  "Blissey",
  "Rillaboom",
  "Magmar",
  "Lycanroc-Dusk",
  "Okidogi",
  "Lunala",
  "Cinderace",
  "Bombirdier",
  "Moltres",
  "Iron Treads",
  "Hippowdon",
  "Victreebel",
  "Scrafty",
  "Gallade",
  "Raichu",
  "Toxtricity-Low-Key",
  "Eiscue",
  "Oricorio-Pa'u",
];

const spriteCandidateNames = [
  "Pikachu",
  "Charizard",
  "Regieleki",
  "Chien-Pao",
  "Oricorio-Pa'u",
  "Toxtricity-Low-Key",
];

for (const name of names) {
  const normalizedName = normalizePokemonApiName(name);
  const spriteCandidates = getPokemonShowdownSpriteCandidates(name);
  const allSpriteFallbacks = getPokemonSpriteFallbacks(name);
  const types = await getPokemonTypes(name);

  assertTruthy(normalizedName, `${name} should normalize to a non-empty key`);
  assertTruthy(spriteCandidates.length > 0, `${name} should have sprite candidates`);
  assertTruthy(allSpriteFallbacks.length > 0, `${name} should have complete sprite fallbacks`);
  assertTruthy(types.length > 0, `${name} should have local type fallback`);
}

for (const name of spriteCandidateNames) {
  const spriteCandidates = getPokemonShowdownSpriteCandidates(name);

  assertTruthy(spriteCandidates.length > 0, `${name} should have sprite candidates`);
}

if (Number(pokemonDetailsData.count || 0) > 0) {
  ["regieleki", "chien-pao", "pikachu"].forEach((pokemonKey) => {
    const pokemon = pokemonDetailsData.pokemon?.[pokemonKey];

    if (!pokemon) {
      return;
    }

    assertTruthy(
      Array.isArray(pokemon.spriteCandidates) && pokemon.spriteCandidates.length > 0,
      `${pokemonKey} should include generated sprite candidates`,
    );
    assertTruthy(
      pokemon.spriteCandidates.some(
        (url) => url.includes("play.pokemonshowdown.com") || url.includes("raw.githubusercontent.com"),
      ),
      `${pokemonKey} should include a supported generated sprite URL`,
    );
  });
}

console.log("Pokemon sprite/type fallback check passed.");

function assertTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}
