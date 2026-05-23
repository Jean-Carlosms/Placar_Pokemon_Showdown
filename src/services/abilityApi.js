import abilityDetailsData from "../data/abilityDetails.generated.json" with { type: "json" };

const DEFAULT_ABILITY_DESCRIPTION = "Descricao nao disponivel para esta habilidade.";

export function normalizeAbilityName(name) {
  return String(name || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019'`.]/g, "")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function formatAbilityName(name) {
  return String(name || "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getAbilityDetails(abilityName) {
  const abilities = abilityDetailsData?.abilities ?? {};
  const ability = findAbility(abilities, abilityName);

  if (ability) {
    return {
      displayName: ability.displayName || formatAbilityName(abilityName),
      description: ability.description || ability.shortEffect || ability.effect || DEFAULT_ABILITY_DESCRIPTION,
      shortEffect: ability.shortEffect || "",
      effect: ability.effect || "",
      source: ability.source || abilityDetailsData?.source || "pokemon-showdown-dex",
    };
  }

  return {
    displayName: formatAbilityName(abilityName),
    description: DEFAULT_ABILITY_DESCRIPTION,
    shortEffect: "",
    effect: "",
    source: "basic-fallback",
    unavailable: true,
  };
}

function findAbility(abilities, abilityName) {
  const normalizedName = normalizeAbilityName(abilityName);
  const compactName = normalizedName.replace(/-/g, "");
  const lookupKeys = [
    normalizedName,
    compactName,
    String(abilityName || "").trim().toLowerCase(),
  ].filter(Boolean);

  for (const key of lookupKeys) {
    if (abilities[key]) {
      return abilities[key];
    }
  }

  return Object.values(abilities).find((ability) => {
    const abilityKeys = [
      ability?.id,
      ability?.name,
      ability?.displayName,
    ].map(normalizeAbilityName);

    return abilityKeys.some((key) => key === normalizedName || key.replace(/-/g, "") === compactName);
  });
}
