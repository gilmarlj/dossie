# dossie:sprint-review — apresentação de sprint review

Transforma o review de uma sprint (team updates, goal & scope, deliverables,
demo, métricas, blockers & risks) numa peça apresentável — a mesma espinha
usada por um deck de reunião, mas no template fixo do `dossie`.

Diferente de `analysis`/`adr`/`postmortem`, não há achado severado nem causa
raiz: é uma narrativa de progresso, por seção.

## Pré-requisito

Os dados do sprint (o que foi entregue, métricas, bloqueios) já existem —
numa apresentação anterior, num board, ou que o usuário forneça na conversa.
Este fluxo formata; não inventa números nem itens de board.

## Passos

1. **Config efetiva:**
   ```bash
   python3 ~/.claude/skills/dossie/bin/config.py
   ```

2. **Nomear a peça.** Slug por sprint, sempre **em inglês**: `sprint-14-review`,
   não `sprint-14-nome-do-projeto` nem `review-1`.

   ```bash
   DIR=$(python3 ~/.claude/skills/dossie/bin/config.py --path review --slug sprint-14-review)
   mkdir -p "$DIR"/data
   ```

3. **Escrever `$DIR/deck.jsx`.** Só dados. Leia `references/authoring.md` antes
   da primeira vez. Estrutura de um sprint review:

   | Seção | Conteúdo |
   |---|---|
   | `Hero` | o período da sprint, o tema/objetivo em uma frase, `board` com os números-placar (velocity, % completo, itens entregues) |
   | Team updates | destaques em prosa curta (altas, saídas, eventos) + avisos operacionais (férias, migrações, datas de calendário) |
   | Sprint goal & scope | o objetivo da sprint numa frase + `DataTable` committed vs. delivered vs. scope changes (itens adicionados/retirados/carregados) |
   | Deliverables | o que foi entregue, agrupado por `Functional`/`Technical` (ou pelas categorias que o board já usa) |
   | Demo | um card por apresentador: quem mostra o quê — `DataTable` ou painéis simples, nunca screenshot do board |
   | Sprint metrics | `DataTable` ou `<Panel>` com velocity, committed, completed, comparando com a sprint anterior |
   | Blockers & risks | duas listas separadas — o que bloqueou (e se foi resolvido) e o que ameaça a próxima sprint |
   | `Closing` | não é "ordem de ataque" aqui — vira o foco da próxima sprint ou os itens carregados, com `rows` reaproveitado para isso |

   `SECTIONS` usa as mesmas sete entradas do índice (`rank` 01–05 + "já
   correto" não se aplica aqui — troque por um link extra para "Blockers &
   Risks" se fizer sentido destacá-lo).

4. **Construir:**
   ```bash
   python3 ~/.claude/skills/dossie/bin/build.py "$DIR/deck.jsx" -o "$DIR/index.html"
   ```

5. **Gravar `$DIR/dossie.yml`** com os metadados (modelo abaixo).

6. **Verificar uma vez**, se `verify.preview` estiver ligado.

7. **Publicar** conforme `publish.artifact`.

## O que distingue um bom sprint review

- **Commitment vs. delivered é o número que importa, não só "entregamos X
  itens".** Mostre o que foi committed, o que foi adicionado no meio do
  caminho e o que foi carregado para a próxima — as três categorias, não só a
  lista do que saiu.
- **Demo é por pessoa, não por feature.** Quem apresenta o quê é a informação
  que o leitor usa para saber a quem perguntar depois.
- **"Sem bloqueios" é uma afirmação, mostre-a como tal.** Uma seção de
  Blockers & Risks vazia não é ausência de conteúdo — é um dado (`Chip
  level="ok"` com "no major blockers", não uma seção que simplesmente some).
- **Métricas sem comparação com a sprint anterior perdem a metade do
  sentido.** Sempre que o dado anterior existir, coloque-o lado a lado — é
  isso que mostra tendência, não o número isolado.

## Metadados (`dossie.yml` da peça)

```yaml
kind: review
title: Sprint 14 Review
slug: sprint-14-review
created: 2026-11-26
sprint: 14
period: { start: 2026-11-16, end: 2026-11-27 }
repo: mic-icdmsustplanner
theme: inditex
language: { default: en, bilingual: false }
metrics:
  velocity: null
  committed: null
  completed: null
sources:
  - "Sprint Review - SP14.pptx"
```

Sem os números de velocity/committed/completed no material de origem, deixe
o campo `null` em vez de inventar — e mostre `[ pts ]`/`[ n ]` como
placeholder na própria peça, do mesmo jeito que o slide de origem já fazia.
