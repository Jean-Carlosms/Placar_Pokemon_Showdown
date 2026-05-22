import { useEffect, useMemo, useState } from "react";
import { getPokemonDetails, normalizePokemonApiName } from "../services/pokemonDetailsApi.js";
import {
  countPokemonUsageFromHistory,
  getAllPokemonFromLocalDatabase,
  getUniquePokemonFromHistory,
} from "../utils/pokemonCatalog.js";

const STAT_LABELS = [
  ["hp", "HP"],
  ["attack", "Attack"],
  ["defense", "Defense"],
  ["specialAttack", "Sp. Atk"],
  ["specialDefense", "Sp. Def"],
  ["speed", "Speed"],
];

function PokemonInfoCard({ history }) {
  const allPokemon = useMemo(() => getAllPokemonFromLocalDatabase(), []);
  const usedPokemon = useMemo(() => getUniquePokemonFromHistory(history), [history]);
  const pokemonUsage = useMemo(() => countPokemonUsageFromHistory(history), [history]);
  const [filterMode, setFilterMode] = useState("all");
  const [selectedPokemonKey, setSelectedPokemonKey] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const pokemonList = useMemo(
    () => (filterMode === "all" && allPokemon.length > 0 ? allPokemon : usedPokemon),
    [allPokemon, filterMode, usedPokemon],
  );
  const visiblePokemon = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return normalizedSearchTerm
      ? pokemonList.filter((pokemon) => pokemon.displayName.toLowerCase().includes(normalizedSearchTerm))
      : pokemonList;
  }, [pokemonList, searchTerm]);
  const selectedPokemon = pokemonList.find((pokemon) => pokemon.key === selectedPokemonKey);
  const catalogLabel = filterMode === "all" && allPokemon.length > 0 ? "disponiveis" : "usados nos replays";

  useEffect(() => {
    if (visiblePokemon.length === 0) {
      setSelectedPokemonKey("");
      return;
    }

    const selectedPokemonExists = visiblePokemon.some((pokemon) => pokemon.key === selectedPokemonKey);

    if (!selectedPokemonExists) {
      setSelectedPokemonKey(visiblePokemon[0].key);
    }
  }, [visiblePokemon, selectedPokemonKey]);

  useEffect(() => {
    let isMounted = true;

    if (!selectedPokemon) {
      setPokemonDetails(null);
      return () => {
        isMounted = false;
      };
    }

    async function loadPokemonDetails() {
      setIsLoading(true);
      const details = await getPokemonDetails(selectedPokemon.displayName);

      if (isMounted) {
        setPokemonDetails(details);
        setIsLoading(false);
      }
    }

    loadPokemonDetails();

    return () => {
      isMounted = false;
    };
  }, [selectedPokemon]);

  return (
    <section className="pokemon-info-card" aria-labelledby="pokemon-info-title">
      <div className="section-heading pokemon-info-header">
        <div>
          <h2 id="pokemon-info-title">Consulta de Pokemon</h2>
          <p>Veja os base stats dos Pokemon usados nos replays importados.</p>
        </div>
      </div>

      {pokemonList.length === 0 ? (
        <p className="pokemon-empty-state">
          Nenhum Pokemon disponivel. Gere o banco local com npm run data:showdown ou importe um replay.
        </p>
      ) : (
        <>
          <div className="catalog-filter-row pokemon-info-controls">
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
                className="pokemon-search catalog-search-input"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar Pokemon..."
              />
            </label>

            <label>
              <span>Pokemon usado</span>
              <select
                className="pokemon-select"
                value={selectedPokemonKey}
                onChange={(event) => setSelectedPokemonKey(event.target.value)}
              >
                {visiblePokemon.map((pokemon) => (
                  <option key={pokemon.key} value={pokemon.key}>
                    {pokemon.displayName} ({pokemonUsage[pokemon.key]?.count ?? 0})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="catalog-count-hint">
            {visiblePokemon.length} Pokemon {catalogLabel}
          </p>

          {visiblePokemon.length === 0 && (
            <p className="pokemon-empty-state">Nenhum Pokemon encontrado para a busca atual.</p>
          )}

          {isLoading && <p className="pokemon-empty-state">Carregando detalhes do Pokemon...</p>}

          {!isLoading && pokemonDetails && (
            <PokemonDetails
              pokemonDetails={pokemonDetails}
              usageCount={pokemonUsage[selectedPokemonKey]?.count ?? 0}
            />
          )}
        </>
      )}
    </section>
  );
}

function PokemonDetails({ pokemonDetails, usageCount }) {
  return (
    <article className="pokemon-details">
      <div className="pokemon-details-main">
        <div className="pokemon-details-sprite">
          {pokemonDetails.sprite ? (
            <img
              src={pokemonDetails.sprite}
              alt={`Sprite de ${pokemonDetails.displayName}`}
              width="120"
              height="120"
            />
          ) : (
            <span>{pokemonDetails.displayName}</span>
          )}
        </div>

        <div className="pokemon-details-meta">
          <div>
            <p className="pokemon-info-kicker">
              {pokemonDetails.id ? `Pokedex #${pokemonDetails.id}` : "Pokedex nao informado"}
            </p>
            <h3>{pokemonDetails.displayName}</h3>
            <p>Uso nos historicos: {usageCount} vez</p>
            {pokemonDetails.source !== "local-pokemon-database" && pokemonDetails.source !== "pokeapi" && (
              <p className="pokemon-info-warning">Dados basicos exibidos por fallback local.</p>
            )}
          </div>

          <div className="pokemon-type-badges">
            {(pokemonDetails.types ?? []).map((type) => (
              <span
                className={`pokemon-type-badge type-${normalizePokemonApiName(type)}`}
                key={type}
              >
                {type}
              </span>
            ))}
          </div>

          <dl className="pokemon-meta-grid">
            <PokemonMetaItem label="Altura" value={formatHeight(pokemonDetails.height)} />
            <PokemonMetaItem label="Peso" value={formatWeight(pokemonDetails.weight)} />
            <PokemonMetaItem label="Base EXP" value={formatValue(pokemonDetails.baseExperience)} />
            <PokemonMetaItem label="Total Stats" value={formatValue(pokemonDetails.totalStats)} />
          </dl>

          <div className="pokemon-abilities">
            <span>Abilities</span>
            <p>{pokemonDetails.abilities?.length ? pokemonDetails.abilities.join(", ") : "-"}</p>
          </div>
        </div>
      </div>

      <div className="pokemon-total-stats">
        Total base stats: {formatValue(pokemonDetails.totalStats)}
      </div>

      <div className="pokemon-stat-list">
        {STAT_LABELS.map(([statKey, label]) => (
          <PokemonStatRow
            key={statKey}
            label={label}
            value={pokemonDetails.stats?.[statKey]}
          />
        ))}
      </div>

      <p className="pokemon-info-source">Fonte: {getPokemonSourceLabel(pokemonDetails.source)}</p>
    </article>
  );
}

function PokemonMetaItem({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function PokemonStatRow({ label, value }) {
  const percent = value === null || value === undefined ? 0 : Math.min((Number(value) / 255) * 100, 100);

  return (
    <div className="pokemon-stat-row">
      <span className="pokemon-stat-label">{label}</span>
      <span className="pokemon-stat-bar" aria-hidden="true">
        <span className="pokemon-stat-bar-fill" style={{ width: `${percent}%` }} />
      </span>
      <span className="pokemon-stat-value">{formatValue(value)}</span>
    </div>
  );
}

function formatHeight(height) {
  return height === null || height === undefined ? "-" : `${(height / 10).toFixed(1)} m`;
}

function formatWeight(weight) {
  return weight === null || weight === undefined ? "-" : `${(weight / 10).toFixed(1)} kg`;
}

function formatValue(value) {
  return value === null || value === undefined ? "-" : value;
}

function getPokemonSourceLabel(source) {
  const sourceLabels = {
    "local-pokemon-database": "banco local",
    pokeapi: "PokeAPI",
    "local-fallback": "fallback local",
    "basic-fallback": "dados basicos",
  };

  return sourceLabels[source] ?? "dados basicos";
}

export default PokemonInfoCard;
