import { useEffect, useMemo, useState } from "react";
import { getMoveDetails, normalizeMoveApiName } from "../services/moveApi.js";
import { countMoveUsageFromHistory, getUniqueMovesFromHistory } from "../utils/moveCatalog.js";

function MoveInfoCard({ history }) {
  const moves = useMemo(() => getUniqueMovesFromHistory(history), [history]);
  const moveUsage = useMemo(() => countMoveUsageFromHistory(history), [history]);
  const [selectedMoveKey, setSelectedMoveKey] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [moveDetails, setMoveDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (moves.length === 0) {
      setSelectedMoveKey("");
      return;
    }

    const selectedMoveExists = moves.some((move) => move.key === selectedMoveKey);

    if (!selectedMoveExists) {
      setSelectedMoveKey(moves[0].key);
    }
  }, [moves, selectedMoveKey]);

  const selectedMove = moves.find((move) => move.key === selectedMoveKey);
  const filteredMoves = moves.filter((move) =>
    move.displayName.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );
  const visibleMoves =
    filteredMoves.length > 0 ? includeSelectedMove(filteredMoves, selectedMove) : moves;

  useEffect(() => {
    let isMounted = true;

    if (!selectedMove) {
      setMoveDetails(null);
      return () => {
        isMounted = false;
      };
    }

    async function loadMoveDetails() {
      setIsLoading(true);
      const details = await getMoveDetails(selectedMove.displayName);

      if (isMounted) {
        setMoveDetails(details);
        setIsLoading(false);
      }
    }

    loadMoveDetails();

    return () => {
      isMounted = false;
    };
  }, [selectedMove]);

  return (
    <section className="move-info-card" aria-labelledby="move-info-title">
      <div className="section-heading move-info-header">
        <div>
          <h2 id="move-info-title">Consulta de Moves</h2>
          <p>Veja detalhes dos ataques usados nos replays importados.</p>
        </div>
      </div>

      {moves.length === 0 ? (
        <p className="move-empty-state">
          Importe um replay com ataques registrados para consultar os moves.
        </p>
      ) : (
        <>
          <div className="move-info-controls">
            <label>
              <span>Filtrar por nome</span>
              <input
                className="move-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Ex.: Protect"
              />
            </label>

            <label>
              <span>Move usado</span>
              <select
                className="move-select"
                value={selectedMoveKey}
                onChange={(event) => setSelectedMoveKey(event.target.value)}
              >
                {visibleMoves.map((move) => (
                  <option key={move.key} value={move.key}>
                    {move.displayName} ({moveUsage[move.key]?.count ?? 0})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoading && <p className="move-empty-state">Carregando detalhes do move...</p>}

          {!isLoading && moveDetails && (
            <MoveDetails moveDetails={moveDetails} usageCount={moveUsage[selectedMoveKey]?.count ?? 0} />
          )}
        </>
      )}
    </section>
  );
}

function MoveDetails({ moveDetails, usageCount }) {
  return (
    <article className="move-details">
      <div className="move-details-title">
        <div>
          <h3>{moveDetails.displayName}</h3>
          <p>Uso nos historicos: {usageCount} vez{usageCount === 1 ? "" : "es"}</p>
          {moveDetails.isBasicFallback && (
            <p className="move-fallback-note">Dados basicos exibidos por fallback local.</p>
          )}
        </div>
        <div className="move-badge-row">
          {moveDetails.type && (
            <span className={`pokemon-type-badge type-${normalizeMoveApiName(moveDetails.type)}`}>
              {moveDetails.type}
            </span>
          )}
          {moveDetails.damageClass && (
            <span
              className={`damage-class-badge damage-class-${normalizeMoveApiName(
                moveDetails.damageClass,
              )}`}
            >
              {moveDetails.damageClass}
            </span>
          )}
        </div>
      </div>

      <dl className="move-meta-grid">
        <MoveMetaItem label="Power" value={formatMoveValue(moveDetails.power)} />
        <MoveMetaItem label="Accuracy" value={formatAccuracy(moveDetails.accuracy)} />
        <MoveMetaItem label="PP" value={formatMoveValue(moveDetails.pp)} />
        <MoveMetaItem label="Priority" value={formatMoveValue(moveDetails.priority)} />
        <MoveMetaItem label="Target" value={moveDetails.target || "—"} />
        <MoveMetaItem label="Generation" value={moveDetails.generation || "—"} />
      </dl>

      <div className="move-description">
        {moveDetails.shortEffect && (
          <p>
            <strong>Descricao curta:</strong> {moveDetails.shortEffect}
          </p>
        )}
        {moveDetails.effect && (
          <p>
            <strong>Efeito:</strong> {moveDetails.effect}
          </p>
        )}
        {moveDetails.flavorText && (
          <p>
            <strong>Flavor text:</strong> {moveDetails.flavorText}
          </p>
        )}
      </div>

      <p className="move-data-source">Fonte: {getMoveSourceLabel(moveDetails.source)}</p>
    </article>
  );
}

function MoveMetaItem({ label, value }) {
  return (
    <div className="move-meta-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatMoveValue(value) {
  return value === null || value === undefined ? "—" : value;
}

function formatAccuracy(value) {
  return value === null || value === undefined ? "—" : `${value}%`;
}

function includeSelectedMove(moves, selectedMove) {
  if (!selectedMove || moves.some((move) => move.key === selectedMove.key)) {
    return moves;
  }

  return [selectedMove, ...moves];
}

function getMoveSourceLabel(source) {
  const sourceLabels = {
    "local-move-database": "banco local",
    pokeapi: "PokeAPI",
    "local-fallback": "fallback local",
    "basic-fallback": "dados basicos",
  };

  return sourceLabels[source] ?? "dados basicos";
}

export default MoveInfoCard;
