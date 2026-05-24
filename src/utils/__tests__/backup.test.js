import { describe, expect, it } from "vitest";
import { validateBackupPayload } from "../backup.js";
import { normalizeScoreboard } from "../scoreboard.js";

describe("backup", () => {
  it("recalculates current backup scores from history", () => {
    const scoreboard = normalizeScoreboard({
      scores: {
        jean: { single: 5, double: 0 },
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

    expect(scoreboard.scores.jean.single).toBe(0);
    expect(scoreboard.scores.felipe.double).toBe(1);
  });

  it("allows detecting divergent backup scores after reconciliation", () => {
    const savedScores = {
      jean: { single: 5, double: 0 },
      felipe: { single: 0, double: 0 },
    };
    const scoreboard = normalizeScoreboard({
      scores: savedScores,
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

    expect(scoreboard.scores).not.toEqual(savedScores);
    expect(scoreboard.scores.jean.single).toBe(0);
    expect(scoreboard.scores.felipe.double).toBe(1);
  });

  it("preserves legacy scores when there is no history", () => {
    const scoreboard = normalizeScoreboard({
      scores: {
        jean: { single: 2, double: 1 },
        felipe: { single: 0, double: 3 },
      },
    });

    expect(scoreboard.scores.jean.single).toBe(2);
    expect(scoreboard.scores.jean.double).toBe(1);
    expect(scoreboard.scores.felipe.double).toBe(3);
  });

  it("rejects invalid backup payloads without throwing", () => {
    expect(validateBackupPayload(null)).toMatchObject({ isValid: false });
    expect(validateBackupPayload({ version: 1 })).toMatchObject({ isValid: false });
    expect(
      validateBackupPayload({
        version: 1,
        data: {
          scoreboard: {},
          history: {},
        },
      }),
    ).toMatchObject({ isValid: false });
  });
});
