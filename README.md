# Placar Pokemon Showdown

Aplicacao web local feita com React + Vite para controlar o placar das partidas diarias de Pokemon Showdown entre Jean Carlos e Felipe Eckert.

## Print Placeholder

![Print placeholder da aplicacao](docs/screenshot-placeholder.svg)

> Placeholder reservado para um print futuro da tela principal da aplicacao.

## Objetivo

O objetivo do projeto e oferecer um placar simples, visual e persistente para registrar vitorias em Single Battles e Double Battles, acompanhar estatisticas gerais e manter um historico das partidas jogadas.

## Motivacao

Este projeto foi criado para acompanhar de forma divertida e visual o placar diario de partidas de Pokemon Showdown entre Jean Carlos e Felipe Eckert, separando vitorias em Single Battles e Double Battles.

## Tecnologias Usadas

- React
- Vite
- JavaScript
- HTML5
- CSS3
- localStorage
- Sprites publicas do Pokemon Showdown

## Funcionalidades

- Placar total por jogador.
- Pontuacao separada para Single Battles e Double Battles.
- Botoes para adicionar vitorias de Jean Carlos e Felipe Eckert.
- Botao para desfazer a ultima vitoria registrada.
- Reset do placar com confirmacao.
- Historico de partidas com vencedor, formato e data/hora.
- Estatisticas gerais com totais e percentuais de vitorias.
- Persistencia local usando `localStorage`.
- Layout responsivo inspirado em Pokemon classico e Pokemon Showdown.
- Sprites pixel art de Annihilape e Trubbish via URLs publicas do Pokemon Showdown.

## Como Instalar

```bash
npm install
```

## Como Abrir Localmente

```bash
npm run dev
```

Depois, abra a URL exibida no terminal, geralmente:

```text
http://localhost:5173/
```

## Como Gerar Build

```bash
npm run build
```

Os arquivos finais serao gerados na pasta `dist/`.

## Estrutura de Arquivos

```text
.
|-- package.json
|-- vite.config.js
|-- index.html
|-- README.md
|-- TODO.md
|-- LESSONS.md
|-- docs/
|   `-- screenshot-placeholder.svg
`-- src/
    |-- main.jsx
    |-- App.jsx
    |-- styles.css
    |-- data/
    |   `-- players.js
    |-- components/
    |   |-- Header.jsx
    |   |-- PlayerCard.jsx
    |   |-- ScoreControls.jsx
    |   |-- StatsPanel.jsx
    |   `-- MatchHistory.jsx
    `-- utils/
        |-- storage.js
        `-- scoreboard.js
```

## Como Publicar Futuramente com GitHub Pages

1. Gere o build com `npm run build`.
2. Configure o repositorio no GitHub.
3. Acesse `Settings` no repositorio.
4. Entre em `Pages`.
5. Escolha a branch e a origem de publicacao desejada.
6. Publique a pasta gerada pelo Vite, ou configure uma action para publicar `dist/`.

## Proximas Melhorias Possiveis

As ideias de evolucao do projeto estao organizadas em [TODO.md](TODO.md).

## Links

- [Pokemon Showdown](https://pokemonshowdown.com/)
