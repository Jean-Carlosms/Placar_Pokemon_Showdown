import { parsePokemonShowdownReplay, validateTrackedReplay } from "../src/utils/replayParser.js";
import { addWinToScoreboard, createInitialScoreboard, hasReplayId } from "../src/utils/scoreboard.js";

const validReplay = parsePokemonShowdownReplay(createReplayHtml("demikimi", "tergoat", "demikimi"));
const validResult = validateTrackedReplay(validReplay);

assertEqual(validResult.valid, true, "Tracked-player replay should be accepted");

const invalidReplay = parsePokemonShowdownReplay(
  createReplayHtml("demikimi", "randomOpponent", "demikimi"),
);
const invalidResult = validateTrackedReplay(invalidReplay);

assertEqual(invalidReplay.mappedWinnerId, "jean", "Known winner should still be mapped");
assertEqual(invalidResult.valid, false, "Third-party replay should be blocked");
assertIncludes(
  invalidResult.reason,
  "Jean Carlos e Felipe Eckert",
  "Blocked reason should identify the tracked players",
);

const history = [{ replay: { replayId: "gen9ou-123456" } }];

assertEqual(hasReplayId(history, "gen9ou-123456"), true, "Known replay ID should be detected");
assertEqual(hasReplayId(history, "outro-id"), false, "Unknown replay ID should not be detected");
assertEqual(hasReplayId(history, ""), false, "Missing replay ID should remain importable");

const replayMetadata = {
  source: "pokemon-showdown-replay",
  replay: { replayId: "gen9ou-123456" },
};
const firstImport = addWinToScoreboard(createInitialScoreboard(), "jean", "single", replayMetadata);
const duplicateImport = addWinToScoreboard(firstImport, "jean", "single", replayMetadata);

assertEqual(duplicateImport.history.length, 1, "Duplicate replay should not append history");
assertEqual(duplicateImport.scores.jean.single, 1, "Duplicate replay should not increment score");

console.log("Replay validation check passed.");

function createReplayHtml(playerOne, playerTwo, winner) {
  return `
    <script type="text/plain" class="battle-log-data">
|player|p1|${playerOne}|
|player|p2|${playerTwo}|
|gametype|singles
|tier|[Gen 9] Random Battle
|switch|p1a: Pikachu|Pikachu, L80|100/100
|switch|p2a: Eevee|Eevee, L80|100/100
|win|${winner}
    </script>
  `;
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}`);
  }
}

function assertIncludes(value, expected, message) {
  if (!String(value || "").includes(expected)) {
    throw new Error(`${message}. Received: ${JSON.stringify(value)}`);
  }
}
