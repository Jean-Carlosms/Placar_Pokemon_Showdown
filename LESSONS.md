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

## Split em Logs do Pokemon Showdown

As linhas do log comecam com `|`, entao `line.split("|")` gera uma primeira posicao vazia. O comando real fica em `parts[1]`, e os argumentos comecam em `parts[2]`. Criar um helper como `parseShowdownLine` evita erros sutis no parser.

## Extracao de Comandos Move

As linhas `move` do Pokemon Showdown indicam qual Pokemon usou cada ataque. Ao interpretar `args[0]` como ator e `args[1]` como golpe, o app consegue enriquecer cada partida com os ataques usados no replay.

## Historico como Banco de Dados Local

Como times, ataques e metadados ficam dentro do item do historico, o `localStorage` passa a funcionar como um banco local simples. Exportar e importar JSON preserva esses dados sem precisar de uma estrutura paralela.

## Tooltip Acessivel com Hover e Focus

O tooltip dos ataques aparece tanto no hover quanto no foco de teclado. Isso melhora a experiencia visual sem impedir navegacao por Tab.

## Estatisticas Derivadas sem Estado Paralelo Fragil

O banco agregado de ataques e calculado a partir do historico. Essa abordagem evita inconsistencia quando o usuario desfaz partidas, importa backup antigo ou restaura um JSON novo.

## PokeAPI Alem de Sprites

A PokeAPI tambem pode fornecer metadados como tipos dos Pokemon. Reaproveitar a normalizacao de nomes evita duplicar regras para especies com nomes compostos.

## Cache Simples em Memoria

Um `Map` em memoria reduz chamadas repetidas para os mesmos tipos durante a sessao, melhorando a experiencia sem adicionar persistencia extra.

## Renderizacao Condicional

Os badges de tipo so aparecem quando a API retorna dados. Se a chamada falhar, a interface continua estavel e apenas omite aquela informacao.

## Badges Visuais por Tipo

Classes CSS como `type-electric`, `type-water` e `type-dark` ajudam a transformar metadados em informacao visual facil de escanear.

## Fallback para API Externa

Quando uma API externa falha, o componente deve degradar com elegancia: sem erro visual, sem quebrar o layout e sem interromper o fluxo principal do app.

## Consulta Dinamica de Moves

Detalhes de moves podem ser carregados sob demanda pela PokeAPI, evitando baixar uma lista enorme de ataques que talvez nunca aparecam no historico.

## Catalogo Derivado do Historico

O card de consulta lista somente moves encontrados em `replay.movesByPokemon`. Isso mantem o historico como fonte da verdade e torna a busca relevante para as partidas jogadas.

## Cache de Metadados em Memoria

Assim como nos tipos dos Pokemon, detalhes de moves ficam em cache durante a sessao para evitar chamadas repetidas quando o usuario troca de selecao.

## API Externa Indisponivel

O componente de consulta precisa lidar com loading, estado vazio e erro amigavel. Fallbacks locais ajudam a manter informacoes uteis mesmo quando a rede ou o certificado bloqueiam a PokeAPI.

## Componentes de Consulta

Cards de consulta funcionam melhor quando separam fonte de dados, filtro, selecao e detalhes carregados. Isso deixa o JSX mais previsivel e facilita evoluir para filtros por tipo ou categoria.

## Pre-processamento de Dados Externos

Dados grandes de APIs publicas podem ser baixados antes do uso da aplicacao e salvos como JSON local. Isso reduz chamadas em runtime e melhora estabilidade em redes restritas.

## Geracao de JSON Local

Um script Node pode transformar respostas detalhadas da PokeAPI em um formato menor e direto para a UI. Gravar primeiro em arquivo temporario reduz o risco de deixar um JSON corrompido.

## Dados Gerados no React

Arquivos JSON dentro de `src/data` podem ser importados diretamente por componentes e servicos no Vite. O app passa a ter uma base local disponivel no build.

## Fallback em Camadas

A consulta de moves usa uma ordem de confianca: banco local gerado, fallback manual, API online e fallback basico. Isso evita quebrar a interface quando uma camada falha.

## Runtime vs Build-time

Dados carregados em runtime dependem da rede do usuario. Dados gerados em build-time ou versionados no repositorio ficam disponiveis imediatamente, mas precisam de processo de atualizacao.

## Pre-download de Base de Pokemon

Assim como os moves, os dados de Pokemon podem ser baixados uma vez da PokeAPI e salvos em JSON local. Isso evita depender da rede para mostrar base stats durante o uso comum do app.

## Base Stats

Os base stats de Pokemon ficam mais legiveis quando combinam valores numericos e barras visuais. A barra usa uma escala fixa, mantendo comparacoes consistentes entre HP, Attack, Defense, Special Attack, Special Defense e Speed.

## Visualizacao com Barras

Barras simples em CSS resolvem bem dados numericos pequenos sem adicionar biblioteca de graficos. Elas deixam o card mais escaneavel em desktop e mobile.

## Badges Visuais Acessiveis

Badges com texto, `aria-label` e `title` comunicam a informacao mesmo quando o usuario nao distingue apenas cor ou icone.

## Icones CSS e Unicode

Icones simples em Unicode e CSS reduzem dependencia de assets externos e evitam novos problemas de carregamento de imagens.

## Categorias de Moves

Physical, Special e Status ficam mais faceis de escanear quando recebem tratamento visual proprio, mas o texto continua importante para acessibilidade.

## Fallback de Pokemon em Camadas

A consulta de Pokemon usa banco local, dados conhecidos de sprite/tipos, PokeAPI online e fallback basico. Essa ordem preserva a interface mesmo quando a base gerada esta vazia.

## Formas Especiais de Pokemon

Formas como `Lycanroc-Dusk`, `Toxtricity-Low-Key` e `Oricorio-Pa'u` exigem normalizacao explicita. O nome salvo no replay, o nome da PokeAPI e o nome dos sprites do Pokemon Showdown podem divergir.

## Fallback Local em Rede Corporativa

Em ambientes com certificado self-signed ou bloqueio de rede, fallbacks locais de tipo e candidatos de sprite evitam que o historico fique visualmente quebrado.

## Testes de Normalizacao Visual

Checks para normalizacao, sprites e tipos ajudam a impedir regressao quando um novo replay traz Pokemon ou formas ainda nao usados no projeto.

## Mermaid Diagrams

Diagramas Mermaid no README ajudam a explicar fluxos sem depender de imagens estaticas. O GitHub renderiza esses blocos automaticamente, o que facilita mostrar a importacao de replay e a arquitetura geral do app.

## Details no GitHub Markdown

Blocos `<details>` deixam o README mais leve: informacoes longas como comandos, troubleshooting e estrutura de arquivos ficam recolhidas, mas continuam acessiveis para quem precisa.

## Documentacao Tecnica para Portfolio

Um README bem organizado mostra nao apenas como rodar o projeto, mas tambem quais problemas ele resolve, como os dados fluem e quais decisoes tecnicas foram tomadas. Isso transforma o repositorio em material de portfolio.

## Organizacao de README para Projeto React

Em projetos React, a documentacao fica mais clara quando separa objetivo, tecnologias, funcionalidades, fluxo de dados, arquitetura, comandos locais, build, troubleshooting e roadmap. Essa organizacao facilita manutencao e apresentacao do projeto.

## HTTP 401 em API Publica

Mesmo APIs publicas podem retornar `HTTP 401` quando a rede corporativa usa proxy, filtro ou autenticacao intermediaria. Nesses casos, o problema pode estar no caminho de rede, nao no codigo da aplicacao.

## Alternativa Offline via Pacote NPM

O pacote `pokemon-showdown` inclui dados do Dex que podem ser usados localmente para gerar bancos de Pokemon e moves sem chamadas HTTPS em runtime ou em scripts de download.

## Geracao de Banco Local sem HTTPS

Gerar `moveDetails.generated.json` e `pokemonDetails.generated.json` a partir do Pokemon Showdown Dex reduz dependencia da PokeAPI e evita bloqueios como certificado self-signed ou proxy autenticado.

## Compatibilidade com Replays do Pokemon Showdown

Usar o Pokemon Showdown Dex como fonte alternativa ajuda a alinhar nomes, formas e moves com os mesmos dados que aparecem nos replays importados pelo app.

## Catalogo Completo vs Historico Usado

O banco local gerado funciona como catalogo completo de consulta, enquanto o historico representa apenas o que aconteceu nas partidas importadas. Separar essas duas fontes permite consultar Pikachu ou Thunderbolt mesmo que eles nunca tenham aparecido em replay.

## Banco Local Gerado como Fonte de Consulta

Quando os cards consultam `pokemonDetails.generated.json` e `moveDetails.generated.json`, a interface deixa de depender de chamadas externas para listar opcoes. A rede passa a ser fallback, nao requisito principal.

## Filtros de Catalogo

Um filtro simples entre `Mostrar todos` e `Somente usados nos replays` ajuda a alternar entre exploracao geral e analise das partidas reais sem duplicar componentes.

## Fallback para Historico

Se o banco local estiver vazio, os cards ainda conseguem listar Pokemon e moves derivados do historico. Isso preserva utilidade mesmo antes de gerar os JSONs completos.
