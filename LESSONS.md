# Lessons Learned

Este projeto serviu como pratica de fundamentos importantes de desenvolvimento frontend sem framework.

## Manipulacao de DOM

Foi usado JavaScript para buscar elementos da pagina, atualizar textos, preencher imagens e criar itens do historico dinamicamente.

## Eventos em JavaScript

Os botoes usam `addEventListener` para registrar acoes de clique, como adicionar vitorias, desfazer a ultima partida e resetar o placar.

## Uso de localStorage

O `localStorage` permite salvar o estado do placar e do historico diretamente no navegador, mantendo os dados mesmo depois de recarregar a pagina.

## Organizacao de Estado

O placar foi centralizado em um objeto de estado com pontuacoes e historico. Isso facilita calcular totais, salvar dados e redesenhar a interface.

## Renderizacao Dinamica

Sempre que o estado muda, a interface e renderizada novamente para refletir pontuacoes, estatisticas e historico atualizados.

## Persistencia Local

Como o projeto nao usa backend nem banco de dados, a persistencia local garante uma experiencia simples e suficiente para uso no proprio navegador.

## Responsividade com CSS

O layout usa CSS Grid, media queries e tamanhos adaptaveis para funcionar bem em telas maiores e menores.
