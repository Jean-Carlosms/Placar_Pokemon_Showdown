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

## Exportacao de Dados em JSON

O projeto passou a gerar um arquivo JSON com versao, data de exportacao, placar, historico, estatisticas e metadados. Isso permite criar backups manuais sem backend.

## Importacao de Arquivos no Navegador

O navegador pode ler arquivos selecionados pelo usuario com `FileReader`. Depois da leitura, o conteudo e convertido de JSON para objeto e aplicado ao estado do React.

## Validacao de Payload

Antes de importar, o app valida a estrutura minima do backup: `version`, `data`, `data.scoreboard` e `data.history`. Isso evita substituir dados atuais por arquivos invalidos.

## localStorage vs Persistencia Remota

O `localStorage` salva dados apenas no navegador atual. Um backup JSON pode ser versionado no GitHub manualmente, mas isso nao e sincronizacao remota automatica.

## Token do GitHub no Frontend

Uma aplicacao estatica nao deve guardar token do GitHub no codigo frontend, porque a credencial ficaria visivel para quem abrisse o site. Para escrita automatica no GitHub, seria necessario um backend ou servico seguro intermediario.

## Modelagem de Temporadas

O suporte a temporadas foi adicionado mantendo o placar geral e criando placares separados por temporada. Cada item do historico ganhou `seasonId`, permitindo filtrar partidas sem perder a visao geral.

## Migracao de Dados Antigos

Dados antigos do `localStorage` e backups JSON sem temporadas sao normalizados automaticamente para `Temporada Atual`. Isso evita quebrar usuarios que ja tinham placar salvo antes da mudanca.

## Estatisticas Derivadas por Contexto

As mesmas funcoes de estatistica podem ser usadas com o placar geral ou com o placar de uma temporada, desde que recebam o recorte correto de dados.

## Parsing de HTML Local

O app passou a ler arquivos HTML selecionados pelo usuario e extrair o bloco `battle-log-data` dos replays do Pokemon Showdown sem enviar o arquivo para servidor.

## Extracao de Dados de Replay

O parser interpreta linhas do log como `gametype`, `player`, `tier`, `turn` e `win` para descobrir formato, jogadores, vencedor e quantidade de turnos.

## Mapeamento de Aliases

Aliases do Pokemon Showdown, como `demikimi` e `tergoat`, foram separados em `playerAliases.js` para mapear nomes do replay aos jogadores do placar.

## Historico com Metadados

Entradas importadas de replay enriquecem o historico com campos opcionais como `source`, `format`, `replayId`, `turns` e `originalWinner`, mantendo compatibilidade com partidas antigas sem esses metadados.

## Parser Reutilizavel para Multiplos Replays

O parser foi ajustado para nao depender de um replay especifico. Ele interpreta qualquer HTML que contenha o padrao `battle-log-data` usado pelo Pokemon Showdown.

## Extracao de Times por Switch e Drag

As linhas `switch` e `drag` revelam quais Pokemon entraram em campo. A partir delas, o app monta times unicos de ate 6 Pokemon por jogador.

## Historico como Fonte da Verdade

As estatisticas de Pokemon sao derivadas do historico, evitando criar uma contagem paralela que poderia ficar inconsistente com importacoes, backups ou desfazer.

## Estatisticas Derivadas do Historico

O Pokemon destaque de cada jogador e recalculado a partir das partidas importadas com times. Apenas o time do vencedor soma participacao em vitoria.

## Desempate Estavel

Quando varios Pokemon empatam em vitorias, o app usa um desempate deterministico baseado no jogador e no historico, evitando que o destaque mude a cada renderizacao.

## Compatibilidade com Backups Antigos

Historicos antigos sem `replay.teams` continuam validos. Backups novos preservam os times dentro do proprio historico.
