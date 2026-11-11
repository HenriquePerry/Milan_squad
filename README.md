# Plantel do AC Milan 2026/27

Página interativa com as estatísticas do plantel do AC Milan em todas as competições oficiais (Serie A, Liga Europa, Taça de Itália). Projeto de portefólio de Sports Analytics, sem afiliação ao clube nem às fontes.

- `index.html`: o site inteiro num só ficheiro, sem bibliotecas. O bloco `DATA` é gerado; o bloco `CONFIG` é manual.
- `data.json`: os mesmos dados do bloco `DATA`, para reutilizar noutros projetos.
- `scripts/collect.mjs`: recolha, percentis e validações (sem dependências; corre em Node 20+ e no browser).
- `scripts/update.mjs`: corre a recolha e reescreve o `index.html` e o `data.json`.
- `.github/workflows/update.yml`: corre a atualização todos os dias e faz commit se houver dados novos.

## Publicar

1. Cria um repositório público no GitHub e envia estes ficheiros para o ramo `main`.
2. Em **Settings → Pages**, escolhe **Deploy from a branch**, ramo `main`, pasta `/ (root)`.
3. Em **Settings → Actions → General → Workflow permissions**, escolhe **Read and write permissions**.
4. Em **Actions → Atualizar dados**, carrega em **Run workflow** para confirmar que a recolha funciona a partir do GitHub.

O site fica em `https://<utilizador>.github.io/<repositório>/`.

## Atualizar

Automático: o workflow corre todos os dias às 06:17 UTC. Se não houver jogos novos, não faz commit.

À mão:

```bash
node scripts/update.mjs          # recolhe, valida e escreve
node scripts/update.mjs --dry    # recolhe e valida, sem escrever
```

Se uma validação falhar (por exemplo, os golos dos jogadores não baterem certo com os da equipa), o script sai com erro e não escreve nada: o site mantém os dados anteriores e o GitHub envia-te um email com a falha.

## O que é manual (bloco `CONFIG` no `index.html`)

- `lineup` e `formation`: onze-base e formação mais usada.
- `fanta`: fantamedia do Fantacalcio.it, que não permite recolha automática. Tem data própria e a página avisa quando está mais antiga do que o resto.
- `photos`: fotografias opcionais dos jogadores (`"Nome": "img/ficheiro.jpg"`). Usa só imagens a que tenhas direito.
- `manualChecks`: verificações feitas à mão, com data.

## Dados e limitações

- Fonte única da atualização automática: FotMob (dados Opta). Os ficheiros usados não são uma API oficial: podem mudar de formato ou bloquear pedidos vindos do GitHub. Lê os termos de utilização da FotMob antes de publicar.
- Percentis do radar: face aos jogadores da mesma posição na Serie A com pelo menos 300 minutos e 5 jogos. Só jogos da Serie A.
- Passes progressivos: nenhuma fonte gratuita os publica em 2026/27; aparecem como n/d.
- Mudança de época: atualiza `season` e, se preciso, `teamId` em `scripts/update.mjs`.
