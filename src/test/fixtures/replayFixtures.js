function createReplayHtml(logLines, replayId = "gen9randombattle-123456") {
  return `
<!doctype html>
<html>
  <body>
    <a href="https://replay.pokemonshowdown.com/${replayId}">Replay</a>
    <time datetime="2026-05-23T12:00:00.000Z"></time>
    <script type="text/plain" class="battle-log-data">
${logLines.trim()}
    </script>
  </body>
</html>
`;
}

export const validJeanVsFelipeReplay = createReplayHtml(`
|player|p1|demikimi|102|
|player|p2|tergoat|170|
|gametype|doubles
|tier|[Gen 9] Random Doubles Battle
|switch|p1a: Regieleki|Regieleki, L50|100/100
|switch|p2a: Chien-Pao|Chien-Pao, L50|100/100
|move|p1a: Regieleki|Thunderbolt|p2a: Chien-Pao
|turn|1
|win|demikimi
`);

export const validFelipeVsJeanReplay = createReplayHtml(
  `
|player|p1|tergoat|170|
|player|p2|demikimi|102|
|gametype|singles
|tier|[Gen 9] Random Battle
|switch|p1a: Trubbish|Trubbish, L50|100/100
|switch|p2a: Annihilape|Annihilape, L50|100/100
|move|p1a: Trubbish|Gunk Shot|p2a: Annihilape
|turn|1
|win|tergoat
`,
  "gen9randombattle-654321",
);

export const jeanVsUnknownReplay = createReplayHtml(
  `
|player|p1|demikimi|102|
|player|p2|randomOpponent|200|
|gametype|singles
|tier|[Gen 9] Random Battle
|switch|p1a: Regieleki|Regieleki, L50|100/100
|switch|p2a: Pikachu|Pikachu, L50|100/100
|turn|1
|win|demikimi
`,
  "gen9randombattle-111111",
);

export const replayWithTeamsAndMoves = createReplayHtml(
  `
|player|p1|demikimi|102|
|player|p2|tergoak|170|
|gametype|doubles
|tier|[Gen 9] Random Doubles Battle
|switch|p1a: Regieleki|Regieleki, L50|100/100
|switch|p1b: Ninetales|Ninetales, L50|100/100
|switch|p2a: Chien-Pao|Chien-Pao, L50|100/100
|switch|p2b: Copperajah|Copperajah, L50|100/100
|move|p1a: Regieleki|Protect|p1a: Regieleki
|move|p2a: Chien-Pao|Thunderbolt|p1a: Regieleki
|turn|1
|win|tergoak
`,
  "gen9randombattle-222222",
);
