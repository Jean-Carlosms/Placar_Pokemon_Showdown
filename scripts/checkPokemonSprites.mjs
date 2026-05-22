import {
  getPokemonSpriteFallbacks,
  getPokemonShowdownSpriteCandidates,
  getPokemonTypes,
  normalizePokemonApiName,
} from "../src/services/pokemonApi.js";

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

console.log("Pokemon sprite/type fallback check passed.");

function assertTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}
