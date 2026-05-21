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

## Modernizacao de UI em React

A interface foi modernizada sem alterar a regra de negocio principal. Os componentes receberam novas estruturas visuais, mas continuam recebendo dados por props e disparando as mesmas acoes.

## CSS Variables

As cores, sombras, raios de borda e medidas principais foram centralizadas em variaveis CSS no `:root`, facilitando ajustes futuros de tema.

## Gerenciamento de Tema em React

O tema claro/escuro foi controlado com `useState` em `App.jsx`, mantendo a preferencia visual separada da logica principal do placar.

## localStorage para Preferencias Visuais

Assim como o placar usa persistencia local, o tema escolhido tambem fica salvo no `localStorage`, garantindo que a interface abra com a preferencia anterior.

## prefers-color-scheme

Quando ainda nao existe tema salvo, a aplicacao consulta `window.matchMedia("(prefers-color-scheme: dark)")` para respeitar a configuracao do sistema operacional.

## Estados Visuais

Foram adicionados estados para lider, empate, disputa, carregamento de sprite e fallback visual. Isso melhora a leitura do placar sem depender apenas de cor.

## Componentizacao Visual

A componentizacao passou a separar melhor os papeis visuais: cards de jogador, controles, estatisticas e historico possuem estruturas proprias e mais faceis de evoluir.
