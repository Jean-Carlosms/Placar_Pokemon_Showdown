import {
  calculatePokemonMoveStatsFromHistory,
  getGlobalMovesForPokemon,
  getMovesForPokemonInMatch,
} from "../src/utils/pokemonMoveStats.js";

const history = [
  {
    id: "match-1",
    winnerId: "jean",
    replay: {
      movesByPokemon: {
        jean: {
          Regieleki: ["Protect", "Tera Blast"],
        },
        felipe: {
          "Chien-Pao": ["Sucker Punch"],
        },
      },
    },
  },
  {
    id: "match-2",
    winnerId: "felipe",
    replay: {
      movesByPokemon: {
        jean: {
          Regieleki: ["Protect"],
        },
        felipe: {
          "Chien-Pao": ["Sucker Punch", "Protect"],
        },
      },
    },
  },
];

const stats = calculatePokemonMoveStatsFromHistory(history);

assertEqual(stats.jean.regieleki.totalBattles, 2, "Regieleki should appear in two battles");
assertEqual(stats.jean.regieleki.moves.Protect, 2, "Protect should be counted twice for Regieleki");
assertEqual(stats.jean.regieleki.moves["Tera Blast"], 1, "Tera Blast should be counted once");
assertEqual(
  stats.felipe["chien-pao"].moves["Sucker Punch"],
  2,
  "Sucker Punch should be counted twice for Chien-Pao",
);

assertIncludes(
  getMovesForPokemonInMatch(history[0], "jean", "Regieleki"),
  "Protect",
  "Match moves should include Protect",
);

const globalChienPaoMoves = getGlobalMovesForPokemon(history, "felipe", "Chien-Pao");
assertTruthy(
  globalChienPaoMoves.some((move) => move.moveName === "Sucker Punch" && move.uses === 2),
  "Global move stats should include Sucker Punch with two uses",
);

console.log("Pokemon move stats check passed.");

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}`);
  }
}

function assertIncludes(values, expected, message) {
  if (!Array.isArray(values) || !values.includes(expected)) {
    throw new Error(`${message}. Received: ${JSON.stringify(values)}`);
  }
}

function assertTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}
