import { SPRITE_STYLES } from "../data/spriteStyles.js";

function SpriteStyleSelector({ value, onChange }) {
  const selectedStyle = SPRITE_STYLES[value] ?? SPRITE_STYLES.staticPixel;

  return (
    <section className="sprite-style-selector" aria-labelledby="sprite-style-title">
      <div className="sprite-style-selector-row">
        <label htmlFor="sprite-style-select" id="sprite-style-title">
          Estilo das sprites
        </label>
        <select
          className="sprite-style-select"
          id="sprite-style-select"
          value={selectedStyle.id}
          onChange={(event) => onChange(event.target.value)}
        >
          {Object.values(SPRITE_STYLES).map((spriteStyle) => (
            <option key={spriteStyle.id} value={spriteStyle.id}>
              {spriteStyle.label}
            </option>
          ))}
        </select>
      </div>
      <p className="sprite-style-description">{selectedStyle.description}</p>
    </section>
  );
}

export default SpriteStyleSelector;
