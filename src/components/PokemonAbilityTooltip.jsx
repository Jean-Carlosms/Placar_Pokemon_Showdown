import { useEffect, useId, useState } from "react";
import { formatAbilityName, getAbilityDetails } from "../services/abilityApi.js";

function PokemonAbilityTooltip({ abilityName }) {
  const [open, setOpen] = useState(false);
  const [ability, setAbility] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const tooltipId = useId();

  const displayName = ability?.displayName ?? formatAbilityName(abilityName);
  const hasFullEffect = ability?.effect && ability.effect !== ability.description;

  useEffect(() => {
    setAbility(null);
    setIsLoading(false);
  }, [abilityName]);

  useEffect(() => {
    let isMounted = true;

    if (!abilityName || !open || ability) {
      return () => {
        isMounted = false;
      };
    }

    async function loadAbility() {
      setIsLoading(true);
      const details = await getAbilityDetails(abilityName);

      if (isMounted) {
        setAbility(details);
        setIsLoading(false);
      }
    }

    loadAbility();

    return () => {
      isMounted = false;
    };
  }, [ability, abilityName, open]);

  if (!abilityName) {
    return null;
  }

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
      <span className="ability-badge">{displayName}</span>

      {open && (
        <span className="ability-tooltip" id={tooltipId} role="tooltip">
          <strong>{displayName}</strong>
          {isLoading && <span>Carregando habilidade...</span>}
          {!isLoading && ability && (
            <>
              <span>{ability.description}</span>
              {hasFullEffect && <span>{ability.effect}</span>}
              <small>Fonte: {getAbilitySourceLabel(ability.source)}</small>
            </>
          )}
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
