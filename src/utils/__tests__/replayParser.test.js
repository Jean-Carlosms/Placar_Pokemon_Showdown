import { describe, expect, it } from "vitest";
import {
  parsePokemonShowdownReplay,
  validateTrackedReplay,
} from "../replayParser.js";
import {
  jeanVsUnknownReplay,
  replayWithTeamsAndMoves,
  validFelipeVsJeanReplay,
  validJeanVsFelipeReplay,
} from "../../test/fixtures/replayFixtures.js";

describe("replayParser", () => {
  it("parses a valid Jean vs Felipe replay", () => {
    const replay = parsePokemonShowdownReplay(validJeanVsFelipeReplay);
    const validation = validateTrackedReplay(replay);

    expect(replay.showdownPlayers).toEqual({ p1: "demikimi", p2: "tergoat" });
    expect(replay.mappedPlayers).toEqual({ p1: "jean", p2: "felipe" });
    expect(replay.mappedWinnerId).toBe("jean");
    expect(replay.battleType).toBe("double");
    expect(validation).toEqual({ valid: true, reason: null });
  });

  it("blocks a replay against a third party", () => {
    const replay = parsePokemonShowdownReplay(jeanVsUnknownReplay);
    const validation = validateTrackedReplay(replay);

    expect(replay.mappedWinnerId).toBe("jean");
    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain("Jean Carlos");
    expect(validation.reason).toContain("Felipe");
  });

  it("maps Felipe as winner when Felipe wins", () => {
    const replay = parsePokemonShowdownReplay(validFelipeVsJeanReplay);
    const validation = validateTrackedReplay(replay);

    expect(replay.mappedPlayers).toEqual({ p1: "felipe", p2: "jean" });
    expect(replay.mappedWinnerId).toBe("felipe");
    expect(validation.valid).toBe(true);
  });

  it("extracts teams and moves from switch and move lines", () => {
    const replay = parsePokemonShowdownReplay(replayWithTeamsAndMoves);

    expect(replay.teams.jean).toEqual(["Regieleki", "Ninetales"]);
    expect(replay.teams.felipe).toEqual(["Chien-Pao", "Copperajah"]);
    expect(replay.movesByPokemon.jean.Regieleki).toContain("Protect");
    expect(replay.movesByPokemon.felipe["Chien-Pao"]).toContain("Thunderbolt");
  });
});
