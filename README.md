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
- PokéAPI
- Sprites publicas do Pokemon Showdown

## Funcionalidades

- Placar total por jogador.
- Pontuacao separada para Single Battles e Double Battles.
- Botoes para adicionar vitorias de Jean Carlos e Felipe Eckert.
- Botao para desfazer a ultima vitoria registrada.
- Reset do placar com confirmacao.
- Historico de partidas em formato de timeline com vencedor, formato e data/hora.
- Estatisticas gerais em cards com totais, percentuais e barras de progresso.
- Persistencia local usando `localStorage`.
- Alternancia entre tema claro e tema escuro com preferencia salva no navegador.
- Layout responsivo em estilo dashboard gamer inspirado em Pokemon Showdown.
- Cards de batalha para Jean Carlos e Felipe Eckert, com destaque visual para lider ou empate.
- Sprites pixel art de Annihilape e Trubbish com fallback visual.

## Interface Modernizada

A interface foi modernizada com uma composicao de dashboard responsivo, cards de jogador com visual de batalha, badges de tecnologia no header, controles agrupados por jogador e microinteracoes em hover/active.

Os cards dos jogadores destacam o Pokemon parceiro, o total de vitorias, pontuacoes em Single e Double Battles e o estado atual do duelo:

- `Lider atual` quando um jogador esta na frente.
- `Empate tecnico` quando os dois jogadores possuem o mesmo total.
- `Na disputa` para o jogador que esta atras.

As estatisticas foram transformadas em cards compactos com barras de progresso para percentual de vitorias. O historico agora aparece como uma timeline visual e responsiva.

As sprites continuam usando `image-rendering: pixelated` e contam com fallback em camadas para evitar blocos vazios quando imagens externas nao carregam.

## Tema Claro e Escuro

O projeto possui alternancia entre tema claro e tema escuro pelo botao no header.

A preferencia visual fica salva no `localStorage`, entao o tema escolhido continua ativo ao recarregar a pagina. Se ainda nao houver tema salvo, a aplicacao detecta a preferencia do sistema com `prefers-color-scheme`.

Os temas sao aplicados no elemento raiz com `data-theme="light"` ou `data-theme="dark"` e usam variaveis CSS para cores, superficies, bordas, sombras e gradientes.

## API de Sprites

O projeto usa o repositorio [PokeAPI/sprites](https://github.com/PokeAPI/sprites) como fonte visual principal para as sprites dos Pokémon exibidos nos cards dos jogadores.

Para os jogadores atuais, as imagens sao carregadas diretamente do GitHub:

```text
https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemonId}.png
```

IDs usados:

- Annihilape: `979`
- Trubbish: `568`

O service tambem preserva suporte ao endpoint da PokéAPI para casos futuros:

A busca por API acontece em `src/services/pokemonApi.js`, usando o endpoint:

```text
https://pokeapi.co/api/v2/pokemon/{pokemonName}
```

O service tenta encontrar uma sprite pixel art nesta ordem:

1. `generation-v` / `black-white` / `animated` / `front_default`
2. `generation-v` / `black-white` / `front_default`
3. `sprites.front_default`
4. fallback manual com sprites do Pokémon Showdown

Em desenvolvimento, o Vite usa um proxy local em `/pokeapi` para evitar erros de CORS no navegador quando o endpoint JSON for necessario. Se a rede bloquear a PokéAPI, a aplicacao continua funcionando com as sprites diretas do GitHub e com fallback visual do Pokémon Showdown para Annihilape e Trubbish. Se o navegador tambem nao conseguir carregar a imagem externa, o card tenta URLs alternativas e, por ultimo, usa um fallback local simples para evitar caixas vazias.

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
    |-- services/
    |   `-- pokemonApi.js
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
