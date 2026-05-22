function PokemonMoveTooltip({ pokemonName, moves }) {
  const moveList = Array.isArray(moves) ? moves : [];

  return (
    <div className="pokemon-move-tooltip" role="tooltip" aria-label={`Ataques de ${pokemonName}`}>
      <strong className="pokemon-move-tooltip-title">Ataques usados</strong>
      {moveList.length > 0 ? (
        <ul className="pokemon-move-tooltip-list">
          {moveList.map((moveName) => (
            <li key={moveName}>{moveName}</li>
          ))}
        </ul>
      ) : (
        <p>Nenhum ataque registrado neste replay.</p>
      )}
    </div>
  );
}

export default PokemonMoveTooltip;
