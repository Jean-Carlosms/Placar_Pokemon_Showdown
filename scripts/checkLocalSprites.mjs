import { existsSync } from "node:fs";
import { resolve } from "node:path";

const spriteDir = resolve("public/sprites/pokemon");
const placeholderPath = resolve(spriteDir, "_placeholder.svg");

assertTruthy(existsSync(spriteDir), "public/sprites/pokemon should exist");
assertTruthy(existsSync(placeholderPath), "Sprite placeholder should exist");

["pikachu.png", "charizard.png", "regieleki.png"].forEach((fileName) => {
  const spritePath = resolve(spriteDir, fileName);

  if (!existsSync(spritePath)) {
    console.warn(`${fileName} ainda nao baixada. Rode npm run data:sprites.`);
  }
});

console.log("Local sprite check passed.");

function assertTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}
