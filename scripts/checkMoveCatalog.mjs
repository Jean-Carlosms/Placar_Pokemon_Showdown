import {
  countMoveUsageFromHistory,
  getAllMovesFromLocalDatabase,
  getUniqueMovesFromHistory,
  normalizeMoveKey,
} from "../src/utils/moveCatalog.js";

assertEqual(normalizeMoveKey("Sucker Punch"), "sucker-punch", "Sucker Punch should normalize");
assertEqual(normalizeMoveKey("Tera Blast"), "tera-blast", "Tera Blast should normalize");
assertEqual(normalizeMoveKey("Will-O-Wisp"), "will-o-wisp", "Will-O-Wisp should normalize");

const history = [
  {
    id: "match-1",
    replay: {
      movesByPokemon: {
        jean: {
          Regieleki: ["Protect", "Tera Blast"],
        },
        felipe: {
          "Chien-Pao": ["Sucker Punch", "Protect"],
        },
      },
    },
  },
  {
    id: "match-2",
    replay: {
      movesByPokemon: {
        jean: {
          Ninetales: ["Heat Wave", "Protect"],
        },
      },
    },
  },
];

const uniqueMoves = getUniqueMovesFromHistory(history);
const moveUsage = countMoveUsageFromHistory(history);
const allMoves = getAllMovesFromLocalDatabase();

assertTruthy(
  uniqueMoves.some((move) => move.key === "protect" && move.displayName === "Protect"),
  "Unique moves should include Protect",
);
assertTruthy(
  uniqueMoves.some((move) => move.key === "sucker-punch" && move.displayName === "Sucker Punch"),
  "Unique moves should include Sucker Punch",
);
assertEqual(moveUsage.protect.count, 3, "Protect should be counted three times");
assertEqual(moveUsage["tera-blast"].count, 1, "Tera Blast should be counted once");
assertEqual(moveUsage["heat-wave"].count, 1, "Heat Wave should be counted once");

if (allMoves.length > 0) {
  assertTruthy(
    allMoves.some((move) => move.key === "protect" && move.displayName === "Protect"),
    "Local move database should include Protect when populated",
  );
  assertTruthy(
    allMoves.some((move) => move.key === "sucker-punch" && move.displayName === "Sucker Punch"),
    "Local move database should include Sucker Punch when populated",
  );
}

console.log("Move catalog check passed.");

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
