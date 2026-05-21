import { useState } from "react";

function SeasonControls({ seasons, activeSeasonId, onCreateSeason, onSelectSeason }) {
  const [seasonName, setSeasonName] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!seasonName.trim()) {
      return;
    }

    onCreateSeason(seasonName);
    setSeasonName("");
  }

  return (
    <section className="season-section" aria-labelledby="season-title">
      <div className="section-heading">
        <div>
          <h2 id="season-title">Temporadas</h2>
          <p>Crie uma nova fase do duelo ou selecione a temporada ativa.</p>
        </div>
      </div>

      <div className="season-controls">
        <label>
          <span>Temporada ativa</span>
          <select value={activeSeasonId} onChange={(event) => onSelectSeason(event.target.value)}>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </label>

        <form className="season-form" onSubmit={handleSubmit}>
          <label>
            <span>Nova temporada</span>
            <input
              type="text"
              value={seasonName}
              placeholder="Ex: Temporada Junho"
              onChange={(event) => setSeasonName(event.target.value)}
            />
          </label>
          <button type="submit">Criar temporada</button>
        </form>
      </div>
    </section>
  );
}

export default SeasonControls;
