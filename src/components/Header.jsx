function Header({ currentTheme, onToggleTheme }) {
  const badges = ["React", "PokéAPI", "LocalStorage", "Pokémon Showdown"];
  const nextThemeLabel = currentTheme === "dark" ? "Tema claro" : "Tema escuro";

  return (
    <header className="app-header">
      <div className="hero-copy">
        <span className="eyebrow">Jean Carlos vs Felipe Eckert</span>
        <h1>Placar Pokémon Showdown</h1>
        <p>Controle diário de vitórias em Single Battles e Double Battles</p>
      </div>

      <div className="header-actions">
        <div className="tech-badges" aria-label="Tecnologias usadas">
          {badges.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>

        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Alternar para ${nextThemeLabel.toLowerCase()}`}
        >
          {nextThemeLabel}
        </button>
      </div>
    </header>
  );
}

export default Header;
