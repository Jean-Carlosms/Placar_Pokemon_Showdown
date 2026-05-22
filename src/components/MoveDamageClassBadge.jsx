const DAMAGE_CLASS_CONFIG = {
  physical: {
    icon: "⚔",
    label: "Physical",
  },
  special: {
    icon: "✦",
    label: "Special",
  },
  status: {
    icon: "◌",
    label: "Status",
  },
  unknown: {
    icon: "?",
    label: "Unknown",
  },
};

function MoveDamageClassBadge({ damageClass }) {
  const normalized = normalizeDamageClass(damageClass);
  const config = DAMAGE_CLASS_CONFIG[normalized];

  return (
    <span
      className={`damage-class-chip damage-class-${normalized}`}
      title={`Categoria do move: ${config.label}`}
      aria-label={`Categoria do move: ${config.label}`}
    >
      <span className="damage-class-icon" aria-hidden="true">
        {config.icon}
      </span>
      <span className="damage-class-text">{config.label}</span>
    </span>
  );
}

function normalizeDamageClass(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();

  if (normalizedValue === "physical") {
    return "physical";
  }

  if (normalizedValue === "special") {
    return "special";
  }

  if (normalizedValue === "status" || normalizedValue === "other") {
    return "status";
  }

  return "unknown";
}

export default MoveDamageClassBadge;
