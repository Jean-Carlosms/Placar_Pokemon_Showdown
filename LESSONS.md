# Lessons Learned

Este projeto serviu como pratica de fundamentos importantes de desenvolvimento frontend com React e Vite.

## React Components

A interface foi dividida em componentes menores, como `Header`, `PlayerCard`, `ScoreControls`, `StatsPanel` e `MatchHistory`. Isso deixa cada parte da tela com uma responsabilidade clara.

## Props

Os componentes recebem dados e funcoes por props. Por exemplo, `PlayerCard` recebe os dados do jogador e sua pontuacao, enquanto `ScoreControls` recebe as funcoes para adicionar vitorias, desfazer e resetar.

## State

O estado principal do placar fica em `App.jsx` usando `useState`. Quando uma vitoria e adicionada, desfeita ou resetada, o estado muda e o React atualiza a tela.

## localStorage com React

O projeto continua usando `localStorage`, agora integrado ao ciclo do React com `useEffect`. Sempre que o estado muda, os dados sao salvos no navegador.

## Componentizacao

A separacao em `components`, `data` e `utils` ajuda a evitar duplicacao, facilita manutencao e deixa a logica principal fora do JSX.

## Vite

O Vite fornece um ambiente rapido para desenvolvimento com React, scripts simples para rodar localmente e build otimizado para publicacao.

## Renderizacao Dinamica

O historico, os cards de jogadores e as estatisticas sao renderizados a partir do estado atual, reduzindo manipulacao manual de DOM.

## Responsividade com CSS

O layout usa CSS Grid, media queries e tamanhos adaptaveis para funcionar bem em telas maiores e menores.
