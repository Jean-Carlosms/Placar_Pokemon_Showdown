import { describe, expect, it } from "vitest";
import {
  addWinToScoreboard,
  calculateScoresFromHistory,
  createInitialScoreboard,
  hasReplayId,
} from "../scoreboard.js";

describe("scoreboard", () => {
  it("increments score and history when adding a win", () => {
    const scoreboard = addWinToScoreboard(createInitialScoreboard(), "jean", "double");

    expect(scoreboard.scores.jean.double).toBe(1);
    expect(scoreboard.history).toHaveLength(1);
    expect(scoreboard.history[0]).toMatchObject({
      winnerId: "jean",
      battleType: "double",
    });
  });

  it("does not increment score when replayId is duplicated", () => {
    const initialScoreboard = createInitialScoreboard();
    const replayMetadata = {
      replay: {
        replayId: "gen9ou-123456",
      },
    };
    const scoreboard = addWinToScoreboard(initialScoreboard, "jean", "single", replayMetadata);
    const duplicatedScoreboard = addWinToScoreboard(scoreboard, "felipe", "double", replayMetadata);

    expect(duplicatedScoreboard.scores.jean.single).toBe(1);
    expect(duplicatedScoreboard.scores.felipe.double).toBe(0);
    expect(duplicatedScoreboard.history).toHaveLength(1);
    expect(duplicatedScoreboard).toBe(scoreboard);
  });

  it("detects replay ids in history", () => {
    const history = [
      {
        replay: {
          replayId: "gen9ou-123456",
        },
      },
    ];

    expect(hasReplayId(history, "gen9ou-123456")).toBe(true);
    expect(hasReplayId(history, "outro-id")).toBe(false);
    expect(hasReplayId(history, null)).toBe(false);
  });

  it("calculates scores from history", () => {
    const scores = calculateScoresFromHistory([
      { winnerId: "jean", battleType: "single" },
      { winnerId: "felipe", battleType: "double" },
      { winnerId: "felipe", battleType: "double" },
    ]);

    expect(scores.jean.single).toBe(1);
    expect(scores.jean.double).toBe(0);
    expect(scores.felipe.single).toBe(0);
    expect(scores.felipe.double).toBe(2);
  });

  it("ignores invalid history entries when calculating scores", () => {
    const scores = calculateScoresFromHistory([
      { winnerId: "jean", battleType: "single" },
      { winnerId: "unknown", battleType: "double" },
      { winnerId: "felipe", battleType: "triple" },
    ]);

    expect(scores.jean.single).toBe(1);
    expect(scores.jean.double).toBe(0);
    expect(scores.felipe.single).toBe(0);
    expect(scores.felipe.double).toBe(0);
  });
});
