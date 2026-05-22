import { useEffect, useMemo, useState } from "react";
import { getPokemonDetails, normalizePokemonApiName } from "../services/pokemonDetailsApi.js";
import {
  countPokemonUsageFromHistory,
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
  const pokemonList = useMemo(() => getUniquePokemonFromHistory(history), [history]);
  const pokemonUsage = useMemo(() => countPokemonUsageFromHistory(history), [history]);
  const [selectedPokemonKey, setSelectedPokemonKey] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pokemonList.length === 0) {
      setSelectedPokemonKey("");
      return;
    }

    const selectedPokemonExists = pokemonList.some((pokemon) => pokemon.key === selectedPokemonKey);

    if (!selectedPokemonExists) {
      setSelectedPokemonKey(pokemonList[0].key);
    }
  }, [pokemonList, selectedPokemonKey]);

  const selectedPokemon = pokemonList.find((pokemon) => pokemon.key === selectedPokemonKey);
  const filteredPokemon = pokemonList.filter((pokemon) =>
    pokemon.displayName.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );
  const visiblePokemon =
    filteredPokemon.length > 0 ? includeSelectedPokemon(filteredPokemon, selectedPokemon) : pokemonList;

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
          Importe um replay com times registrados para consultar os Pokemon.
        </p>
      ) : (
        <>
          <div className="pokemon-info-controls">
            <label>
              <span>Filtrar por nome</span>
              <input
                className="pokemon-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Ex.: Regieleki"
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
            <p>Uso nos historicos: {usageCount} vez{usageCount === 1 ? "" : "es"}</p>
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

function includeSelectedPokemon(pokemonList, selectedPokemon) {
  if (!selectedPokemon || pokemonList.some((pokemon) => pokemon.key === selectedPokemon.key)) {
    return pokemonList;
  }

  return [selectedPokemon, ...pokemonList];
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
