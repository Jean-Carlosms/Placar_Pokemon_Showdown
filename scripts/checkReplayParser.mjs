import { parsePokemonShowdownReplay } from "../src/utils/replayParser.js";

const html = `
<!doctype html>
<html>
  <body>
    <script type="text/plain" class="battle-log-data">
|player|p1|demikimi|102|
|player|p2|tergoat|170|
|gametype|doubles
|tier|[Gen 9] Random Doubles Battle
|switch|p1a: Regieleki|Regieleki, L79|100/100
|switch|p1b: Ninetales|Ninetales, L79, M|100/100
|switch|p2a: Chien-Pao|Chien-Pao, L75|100/100
|switch|p2b: Copperajah|Copperajah, L86, M|100/100
|switch|p2b: Raging Bolt|Raging Bolt, L77|100/100
|turn|1
|win|tergoat
    </script>
  </body>
</html>
`;

const parsed = parsePokemonShowdownReplay(html);

assertIncludes(parsed.teams.jean, "Regieleki", "Jean team should include Regieleki");
assertIncludes(parsed.teams.jean, "Ninetales", "Jean team should include Ninetales");
assertIncludes(parsed.teams.felipe, "Chien-Pao", "Felipe team should include Chien-Pao");
assertIncludes(parsed.teams.felipe, "Copperajah", "Felipe team should include Copperajah");
assertIncludes(parsed.teams.felipe, "Raging Bolt", "Felipe team should include Raging Bolt");
assertEqual(parsed.mappedWinnerId, "felipe", "Winner should map to Felipe");
assertEqual(parsed.battleType, "double", "Battle type should be double");

console.log("Replay parser check passed.");

function assertIncludes(values, expected, message) {
  if (!Array.isArray(values) || !values.includes(expected)) {
    throw new Error(`${message}. Received: ${JSON.stringify(values)}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}`);
  }
}
