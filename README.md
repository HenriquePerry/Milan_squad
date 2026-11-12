# AC Milan Squad 2026/27

Página interativa (em inglês) com as estatísticas do plantel do AC Milan em todas as competições oficiais (Serie A, Liga Europa, Taça de Itália). Projeto de portefólio de Sports Analytics, sem afiliação ao clube nem às fontes.

- `index.html`: o site inteiro num só ficheiro, sem bibliotecas. O bloco `DATA` é gerado; o bloco `CONFIG` só tem fotografias e notas.
- `data.json`: os mesmos dados do bloco `DATA`, para reutilizar noutros projetos.
- `cache/matches.json`: jogos já terminados (onze, marcadores, estatísticas, mapa de toques). Evita voltar a pedir à fonte os jogos antigos. É gerado e tem de ir para o repositório.
- `scripts/collect.mjs`: recolha, percentis e validações (sem dependências; corre em Node 20+).
- `scripts/update.mjs`: corre a recolha e reescreve o `index.html`, o `data.json` e a cache.
- `.github/workflows/update.yml`: corre a atualização todos os dias e faz commit se houver dados novos.

## O que a página mostra

- Plantel, ficha de cada jogador, radar de percentis, comparador e tabela ordenável.
- **Season trends**: posição na Serie A jornada a jornada, forma (pontos por jogo nos últimos 5), golos contra xG e golos sofridos contra xGA acumulados.
- **Matches**: uma página por jogo (onze no campo, marcadores, xG, posse, remates, notas, substituições, melhor em campo) e registo de todos os jogos. Clicar num jogador mostra os números dele só nesse jogo; o botão "Season card" abre a ficha da época. Cada jogo tem link direto: `index.html#match-<id>`.
- **Upcoming fixtures**: próximos 8 jogos com a dificuldade (5 níveis) pela posição atual do adversário na tabela.
- **Unavailable**: lesionados e castigados para o próximo jogo, com o regresso previsto; também marcados no campo e nos suplentes.
- **Touch heatmap** de cada jogador, por competição.
- **Distância percorrida e velocidade máxima**, só nos jogos europeus (ver limitações).

## Versão para o dono (`?debug`)

Abrindo o site com `?debug` no fim do endereço (por exemplo `index.html?debug`) aparecem também: data de recolha, etiquetas de fonte de cada número (FM, FC, UEFA), a secção Validation e a secção Methodology. Sem `?debug`, os visitantes não veem nada disto.

## Publicar

1. Cria um repositório público no GitHub e envia estes ficheiros para o ramo `main` (incluindo a pasta `cache/`).
2. Em **Settings → Pages**, escolhe **Deploy from a branch**, ramo `main`, pasta `/ (root)`.
3. Em **Settings → Actions → General → Workflow permissions**, escolhe **Read and write permissions**.
4. Em **Actions → Atualizar dados**, carrega em **Run workflow** para confirmar que a recolha funciona a partir do GitHub.

O site fica em `https://<utilizador>.github.io/<repositório>/`.

## Atualizar

Automático: o workflow corre todos os dias às 06:17 UTC. Se os dados forem iguais aos anteriores, não escreve nem faz commit.

À mão:

```bash
node scripts/update.mjs          # recolhe, valida e escreve
node scripts/update.mjs --dry    # recolhe e valida, sem escrever
```

Se uma validação principal falhar (por exemplo, os golos dos jogadores não baterem certo com os da equipa), o script sai com erro e não escreve nada: o site mantém os dados anteriores e o GitHub envia-te um email com a falha.

As fontes secundárias nunca bloqueiam a publicação. Se o Fantacalcio ou a UEFA falharem, mantêm-se os valores anteriores; se uma página de jogo falhar, esse jogo é pedido de novo na execução seguinte. Em ambos os casos fica um aviso (`NOTA`) no registo.

## Fontes (tudo automático)

| Dados | Fonte |
|---|---|
| Plantel, estatísticas, classificações, calendário, jogos, onzes, notas, lesões e castigos, mapas de toques | FotMob (dados Opta) |
| Fantamedia, media voto, partite a voto | Fantacalcio.it (tabela pública de estatísticas) |
| Distância percorrida e velocidade máxima | UEFA (só provas europeias) |

O onze-base e a formação são calculados a partir dos jogos: a formação mais usada na Serie A e, para cada posição, quem mais vezes foi titular nela.

## O que continua manual (bloco `CONFIG` no `index.html`)

- `photos` e `coachPhoto`: fotografias. Só precisas de mexer quando chega um jogador novo; sem fotografia o cartão usa a ilustração com o número. Usa só imagens a que tenhas direito. A correspondência com o nome ignora acentos.
- `manualChecks`: notas de verificações feitas à mão, com data. São texto, não dados.

## Mudança de época

Em `scripts/update.mjs`, atualiza `season` e, se preciso, `teamId` e `uefaTeamId`. A cache limpa-se sozinha: só guarda jogos do calendário atual.

## Dados e limitações

- Os ficheiros da FotMob não são uma API oficial: podem mudar de formato ou bloquear pedidos vindos do GitHub. Lê os termos de utilização da FotMob e do Fantacalcio antes de publicar.
- Distância percorrida: a UEFA publica os seus dados de tracking, mas nenhuma fonte aberta os publica para a Serie A (o SofaScore bloqueia pedidos automáticos e a Lega Serie A não os disponibiliza). Por isso só existem para jogos europeus.
- Mapa de toques: mostra onde foram registadas as ações com bola, numa grelha de 24 × 16. Não é tracking das corridas do jogador.
- Posição por jornada: reconstruída a partir de todos os resultados da liga, com desempate por diferença de golos e não pelo confronto direto.
- Dificuldade do calendário: só a posição atual do adversário na tabela (nas taças, a posição na Serie A).
- Percentis do radar: face aos jogadores da mesma posição na Serie A com pelo menos 300 minutos e 5 jogos. Só jogos da Serie A.
- Passes progressivos: nenhuma fonte gratuita os publica em 2026/27; aparecem como n/a.
