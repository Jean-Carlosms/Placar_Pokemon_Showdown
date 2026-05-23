import { normalizeScoreboard } from "../src/utils/scoreboard.js";

const emptyHistoryBackup = normalizeScoreboard({
  scores: {
    jean: { single: 0, double: 1 },
    felipe: { single: 0, double: 0 },
  },
  history: [],
});

assertEqual(emptyHistoryBackup.scores.jean.double, 0, "Empty history should reset saved Jean score");

const divergentBackup = normalizeScoreboard({
  scores: {
    jean: { single: 0, double: 5 },
    felipe: { single: 0, double: 0 },
  },
  history: [
    {
      id: "match-1",
      player: "felipe",
      winnerId: "felipe",
      battleType: "double",
      timestamp: "2026-05-23T12:00:00.000Z",
    },
  ],
});

assertEqual(divergentBackup.scores.jean.double, 0, "History should replace incompatible Jean score");
assertEqual(divergentBackup.scores.felipe.double, 1, "History should calculate Felipe score");

const legacyBackupWithoutHistory = normalizeScoreboard({
  scores: {
    jean: { single: 2, double: 0 },
    felipe: { single: 0, double: 0 },
  },
});

assertEqual(legacyBackupWithoutHistory.scores.jean.single, 2, "Legacy scores should survive without history");

console.log("Backup validation check passed.");

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}`);
  }
}
