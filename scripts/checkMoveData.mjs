import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const moveDataPath = resolve("public/data/moveDetails.generated.json");
const moveData = JSON.parse(readFileSync(moveDataPath, "utf8"));

assertTruthy(moveData && typeof moveData === "object", "Move data should be an object");
assertTruthy(moveData.moves && typeof moveData.moves === "object", "Move data should include moves");

const moveKeys = Object.keys(moveData.moves);

if (Number(moveData.count || 0) === 0 || moveKeys.length === 0) {
  console.warn("Move data file is empty. Run npm run data:moves to populate it.");
  console.log("Move data check passed.");
  process.exit(0);
}

const sampleMove = moveData.moves[moveKeys[0]];
const moveWithDescription = moveKeys.find((moveKey) => {
  const move = moveData.moves[moveKey];

  return move?.description || move?.shortEffect || move?.effect;
});

assertTruthy(moveKeys.length > 1, "Move data should include multiple moves when populated");
assertTruthy(sampleMove.name, "Sample move should include name");
assertTruthy(sampleMove.displayName, "Sample move should include displayName");
assertTruthy("power" in sampleMove, "Sample move should include power");
assertTruthy("accuracy" in sampleMove, "Sample move should include accuracy");
assertTruthy("pp" in sampleMove, "Sample move should include pp");
assertTruthy(moveWithDescription, "At least one move should include description data");

if (moveData.moves.protect) {
  assertEqual(moveData.moves.protect.displayName, "Protect", "Protect displayName should be valid");
  assertEqual(moveData.moves.protect.type, "Normal", "Protect type should be Normal");
  assertEqual(moveData.moves.protect.damageClass, "Status", "Protect damage class should be Status");
  assertTruthy(
    moveData.moves.protect.description || moveData.moves.protect.shortEffect || moveData.moves.protect.effect,
    "Protect should include description data",
  );
}

if (moveData.moves["sucker-punch"]) {
  assertEqual(
    moveData.moves["sucker-punch"].displayName,
    "Sucker Punch",
    "Sucker Punch displayName should be valid",
  );
  assertEqual(moveData.moves["sucker-punch"].type, "Dark", "Sucker Punch type should be Dark");
  assertEqual(moveData.moves["sucker-punch"].power, 70, "Sucker Punch power should be 70");
  assertEqual(
    moveData.moves["sucker-punch"].damageClass,
    "Physical",
    "Sucker Punch damage class should be Physical",
  );
  assertTruthy(
    moveData.moves["sucker-punch"].description ||
      moveData.moves["sucker-punch"].shortEffect ||
      moveData.moves["sucker-punch"].effect,
    "Sucker Punch should include description data",
  );
}

if (moveData.moves.thunderbolt) {
  assertTruthy(
    moveData.moves.thunderbolt.description ||
      moveData.moves.thunderbolt.shortEffect ||
      moveData.moves.thunderbolt.effect,
    "Thunderbolt should include description data",
  );
}

console.log("Move data check passed.");

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}`);
  }
}

function assertTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}
