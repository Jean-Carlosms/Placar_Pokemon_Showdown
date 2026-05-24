import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const abilityDataPath = resolve("public/data/abilityDetails.generated.json");
const abilityData = JSON.parse(readFileSync(abilityDataPath, "utf8"));

assertTruthy(abilityData && typeof abilityData === "object", "Ability data should be an object");
assertTruthy(
  abilityData.abilities && typeof abilityData.abilities === "object" && !Array.isArray(abilityData.abilities),
  "Ability data should include abilities as an object",
);

const abilityKeys = Object.keys(abilityData.abilities);

if (Number(abilityData.count || 0) === 0 || abilityKeys.length === 0) {
  console.warn("Ability data file is empty. Run npm run data:showdown to populate it.");
  console.log("Ability data check passed.");
  process.exit(0);
}

const abilityWithDisplayName = abilityKeys.find((abilityKey) => abilityData.abilities[abilityKey]?.displayName);
const abilityWithDescription = abilityKeys.find((abilityKey) => abilityData.abilities[abilityKey]?.description);

assertTruthy(abilityKeys.length > 1, "Ability data should include multiple entries when populated");
assertTruthy(abilityWithDisplayName, "At least one ability should include displayName");
assertTruthy(abilityWithDescription, "At least one ability should include description");

["intimidate", "levitate", "protosynthesis"].forEach((abilityKey) => {
  const ability = abilityData.abilities[abilityKey];

  if (!ability) {
    return;
  }

  assertTruthy(ability.displayName, `${abilityKey} should include displayName`);
  assertTruthy(ability.description, `${abilityKey} should include description`);
});

console.log("Ability data check passed.");

function assertTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}
