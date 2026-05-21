function Header() {
  const badges = ["React", "PokéAPI", "LocalStorage", "Pokémon Showdown"];

  return (
    <header className="app-header">
      <div className="hero-copy">
        <span className="eyebrow">Jean Carlos vs Felipe Eckert</span>
        <h1>Placar Pokémon Showdown</h1>
        <p>Controle diário de vitórias em Single Battles e Double Battles</p>
      </div>

      <div className="tech-badges" aria-label="Tecnologias usadas">
        {badges.map((badge) => (
          <span key={badge}>{badge}</span>
        ))}
      </div>
    </header>
  );
}

export default Header;
