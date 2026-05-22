import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const SPRITE_DIR = resolve("public/sprites/pokemon");
const POKEMON_DATA_PATH = resolve("src/data/pokemonDetails.generated.json");
const CONCURRENCY = 8;

const pokemonData = JSON.parse(readFileSync(POKEMON_DATA_PATH, "utf8"));
const pokemonEntries = Object.entries(pokemonData.pokemon ?? {});
let downloaded = 0;
let skipped = 0;
let failed = 0;
let cursor = 0;

mkdirSync(SPRITE_DIR, { recursive: true });

await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < pokemonEntries.length) {
      const currentIndex = cursor;
      cursor += 1;

      const [key, pokemon] = pokemonEntries[currentIndex];
      await downloadPokemonSprite(key, pokemon, currentIndex + 1, pokemonEntries.length);
    }
  }),
);

console.log(`Sprites baixadas: ${downloaded}`);
console.log(`Sprites ja existentes: ${skipped}`);
console.log(`Sprites com falha: ${failed}`);

async function downloadPokemonSprite(key, pokemon, index, total) {
  const outputPath = resolve(SPRITE_DIR, `${key}.png`);

  if (existsSync(outputPath)) {
    skipped += 1;
    return;
  }

  console.log(`Baixando sprite ${index}/${total}: ${key}`);

  const candidates = getExternalSpriteCandidates(pokemon);

  for (const spriteUrl of candidates) {
    try {
      const response = await fetch(spriteUrl);

      if (!response.ok) {
        if (response.status === 401) {
          warnCorporateNetwork(spriteUrl, `HTTP ${response.status}`);
        }

        continue;
      }

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("image")) {
        continue;
      }

      const bytes = Buffer.from(await response.arrayBuffer());
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, bytes);
      downloaded += 1;
      return;
    } catch (error) {
      if (isCorporateNetworkError(error)) {
        warnCorporateNetwork(spriteUrl, error.message);
      }
    }
  }

  failed += 1;
  console.warn(`Nao foi possivel baixar sprite para ${key}.`);
}

function getExternalSpriteCandidates(pokemon) {
  const candidates = Array.isArray(pokemon?.spriteCandidates) ? pokemon.spriteCandidates : [];

  return candidates
    .filter((url) => typeof url === "string" && /^https?:\/\//.test(url))
    .sort((left, right) => getSpritePriority(left) - getSpritePriority(right))
    .filter((url, index, urls) => urls.indexOf(url) === index);
}

function getSpritePriority(url) {
  if (url.includes("play.pokemonshowdown.com/sprites/dex")) {
    return 1;
  }

  if (url.includes("play.pokemonshowdown.com/sprites/gen5/")) {
    return 2;
  }

  if (url.includes("raw.githubusercontent.com") && url.endsWith(".png") && !url.includes("/official-artwork/")) {
    return 3;
  }

  if (url.includes("/official-artwork/")) {
    return 4;
  }

  return 5;
}

function isCorporateNetworkError(error) {
  const message = String(error?.message || "");

  return (
    message.includes("SELF_SIGNED_CERT_IN_CHAIN") ||
    message.includes("self-signed certificate") ||
    message.includes("certificate") ||
    message.includes("401")
  );
}

function warnCorporateNetwork(url, reason) {
  console.warn(
    `Rede bloqueou download de sprite (${reason}) em ${url}. Rode este comando fora da rede corporativa ou configure certificado.`,
  );
}
