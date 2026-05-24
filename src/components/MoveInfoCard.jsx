import { useEffect, useMemo, useState } from "react";
import { getMoveDetails, normalizeMoveApiName } from "../services/moveApi.js";
import {
  countMoveUsageFromHistory,
  getAllMovesFromLocalDatabase,
  getUniqueMovesFromHistory,
} from "../utils/moveCatalog.js";
import MoveDamageClassBadge from "./MoveDamageClassBadge.jsx";

function MoveInfoCard({ history }) {
  const [allMoveOptions, setAllMoveOptions] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const usedMoves = useMemo(() => getUniqueMovesFromHistory(history), [history]);
  const moveUsage = useMemo(() => countMoveUsageFromHistory(history), [history]);
  const [filterMode, setFilterMode] = useState("all");
  const [selectedMoveKey, setSelectedMoveKey] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [moveDetails, setMoveDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const moves = useMemo(
    () => (filterMode === "all" && allMoveOptions.length > 0 ? allMoveOptions : usedMoves),
    [allMoveOptions, filterMode, usedMoves],
  );
  const visibleMoves = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return normalizedSearchTerm
      ? moves.filter((move) => move.displayName.toLowerCase().includes(normalizedSearchTerm))
      : moves;
  }, [moves, searchTerm]);
  const selectedMove = moves.find((move) => move.key === selectedMoveKey);
  const catalogLabel = filterMode === "all" && allMoveOptions.length > 0 ? "disponiveis" : "usados nos replays";

  useEffect(() => {
    let isMounted = true;

    async function loadMoveCatalog() {
      setCatalogLoading(true);
      setCatalogError("");

      try {
        const catalog = await getAllMovesFromLocalDatabase();

        if (isMounted) {
          setAllMoveOptions(catalog);
        }
      } catch (error) {
        if (isMounted) {
          setAllMoveOptions([]);
          setCatalogError("Nao foi possivel carregar o catalogo local de moves.");
        }
      } finally {
        if (isMounted) {
          setCatalogLoading(false);
        }
      }
    }

    loadMoveCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (visibleMoves.length === 0) {
      setSelectedMoveKey("");
      return;
    }

    const selectedMoveExists = visibleMoves.some((move) => move.key === selectedMoveKey);

    if (!selectedMoveExists) {
      setSelectedMoveKey(visibleMoves[0].key);
    }
  }, [visibleMoves, selectedMoveKey]);

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

      {catalogLoading ? (
        <p className="move-empty-state">Carregando catalogo de moves...</p>
      ) : moves.length === 0 ? (
        <p className="move-empty-state">
          Nenhum move disponivel. Gere o banco local com npm run data:showdown ou importe um replay.
        </p>
      ) : (
        <>
          <div className="catalog-filter-row move-info-controls">
            <label>
              <span>Filtro do catalogo</span>
              <select
                className="catalog-filter-select"
                value={filterMode}
                onChange={(event) => setFilterMode(event.target.value)}
              >
                <option value="all">Mostrar todos</option>
                <option value="used">Somente usados nos replays</option>
              </select>
            </label>

            <label>
              <span>Filtrar por nome</span>
              <input
                className="move-search catalog-search-input"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar move..."
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

          <p className="catalog-count-hint">
            {visibleMoves.length} moves {catalogLabel}
          </p>

          {visibleMoves.length === 0 && (
            <p className="move-empty-state">Nenhum move encontrado para a busca atual.</p>
          )}

          {isLoading && <p className="move-empty-state">Carregando detalhes do move...</p>}

          {!isLoading && moveDetails && (
            <MoveDetails moveDetails={moveDetails} usageCount={moveUsage[selectedMoveKey]?.count ?? 0} />
          )}
        </>
      )}

      {!catalogLoading && catalogError && <p className="move-empty-state">{catalogError}</p>}
    </section>
  );
}

function MoveDetails({ moveDetails, usageCount }) {
  const description = getMoveDescription(moveDetails);

  return (
    <article className="move-details">
      <div className="move-details-title">
        <div>
          <h3>{moveDetails.displayName}</h3>
          <p>Uso nos historicos: {usageCount} vez</p>
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
          <MoveDamageClassBadge damageClass={moveDetails.damageClass} />
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
        <p>
          <strong>Descricao:</strong> {description}
        </p>
        {!moveDetails.hasCompleteDescription && (
          <p className="move-fallback-note">Descricao completa nao disponivel no banco local.</p>
        )}
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

function getMoveDescription(move) {
  return (
    move.description ||
    move.shortEffect ||
    move.effect ||
    move.flavorText ||
    "Descricao nao disponivel para este move."
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
