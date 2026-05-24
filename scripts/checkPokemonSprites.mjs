import {
  getPokemonSpriteFallbacks,
  getPokemonShowdownSpriteCandidates,
  getPokemonTypes,
  normalizePokemonApiName,
} from "../src/services/pokemonApi.js";
import { getPokemonSpriteCandidatesByStyle } from "../src/services/pokemonSpriteSources.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pokemonDetailsData = require("../public/data/pokemonDetails.generated.json");

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

const localSprite = "/sprites/pokemon/pikachu.png";
const staticCandidates = getPokemonSpriteCandidatesByStyle({
  pokemonName: "Pikachu",
  pokemonId: 25,
  localSprite,
  style: "staticPixel",
});
const animatedCandidates = getPokemonSpriteCandidatesByStyle({
  pokemonName: "Pikachu",
  pokemonId: 25,
  localSprite,
  style: "animatedPixel",
});
const officialCandidates = getPokemonSpriteCandidatesByStyle({
  pokemonName: "Pikachu",
  pokemonId: 25,
  localSprite,
  style: "officialArtwork",
});
const smallCandidates = getPokemonSpriteCandidatesByStyle({
  pokemonName: "Pikachu",
  pokemonId: 25,
  localSprite,
  style: "smallIcon",
});
const candidatesWithMissingOptionalSprite = getPokemonSpriteCandidatesByStyle({
  pokemonName: "Pikachu",
  spriteCandidates: [undefined],
  style: "staticPixel",
});
const paldeanTaurosArtworkCandidates = getPokemonSpriteCandidatesByStyle({
  pokemonName: "Tauros-Paldea-Combat",
  pokemonId: 128,
  style: "officialArtwork",
});

assertEqual(staticCandidates[0], localSprite, "Static pixel style should prefer local sprite");
assertTruthy(
  animatedCandidates[0].includes("/ani/") || animatedCandidates[0].includes("/gen5ani/"),
  "Animated pixel style should prefer an animated URL",
);
assertTruthy(
  officialCandidates[0].includes("/other/official-artwork/25.png"),
  "Official artwork style should prefer official artwork when an ID exists",
);
assertTruthy(
  smallCandidates.some((url) => url.endsWith("/sprites/pokemon/25.png")),
  "Small icon style should include the compact PokeAPI sprite when an ID exists",
);
assertTruthy(
  candidatesWithMissingOptionalSprite.includes("/sprites/pokemon/pikachu.png"),
  "Missing optional sprite URL should not prevent local sprite fallback",
);
assertTruthy(
  paldeanTaurosArtworkCandidates[0].endsWith("/other/official-artwork/10250.png"),
  "Paldean Tauros artwork should use its form-specific PokeAPI sprite ID",
);

[staticCandidates, animatedCandidates, officialCandidates, smallCandidates, candidatesWithMissingOptionalSprite, paldeanTaurosArtworkCandidates].forEach((candidates) => {
  assertTruthy(
    candidates.includes("/sprites/pokemon/_placeholder.svg"),
    "Every sprite style should include the local placeholder",
  );
});

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

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}`);
  }
}
