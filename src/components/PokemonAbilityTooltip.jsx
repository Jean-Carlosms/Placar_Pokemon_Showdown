import { useId, useState } from "react";
import { getAbilityDetails } from "../services/abilityApi.js";

function PokemonAbilityTooltip({ abilityName }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  if (!abilityName) {
    return null;
  }

  const ability = getAbilityDetails(abilityName);
  const hasFullEffect = ability.effect && ability.effect !== ability.description;

  return (
    <span
      className="ability-tooltip-wrapper"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      aria-describedby={open ? tooltipId : undefined}
    >
      <span className="ability-badge">{ability.displayName}</span>

      {open && (
        <span className="ability-tooltip" id={tooltipId} role="tooltip">
          <strong>{ability.displayName}</strong>
          <span>{ability.description}</span>
          {hasFullEffect && <span>{ability.effect}</span>}
          <small>Fonte: {getAbilitySourceLabel(ability.source)}</small>
        </span>
      )}
    </span>
  );
}

function getAbilitySourceLabel(source) {
  const sourceLabels = {
    "pokemon-showdown-dex": "Pokemon Showdown Dex",
    "basic-fallback": "fallback basico",
  };

  return sourceLabels[source] ?? source;
}

export default PokemonAbilityTooltip;
