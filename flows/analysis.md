# dossie:analysis — análise de código ou arquitetura

Transforma uma análise já feita numa peça apresentável: achados severados,
diagramas, evidência em linha e ordem de ataque.

**Pré-requisito:** a análise existe. Este fluxo formata; não investiga.
Se ainda não há achados com arquivo e linha, faça a análise primeiro.

## Passos

1. **Config efetiva:**
   ```bash
   python3 ~/.claude/skills/dossie/bin/config.py
   ```

2. **Nomear a peça.** Com `output.naming: infer`, escolha um slug curto em
   kebab-case **em inglês** que descreva o assunto, não o formato:
   `dossie-self-review`, `kafka-consumer-lag`, `auth-token-refresh`. Nunca
   `analysis-1` ou `report`.

   O slug é sempre inglês mesmo quando a peça sai em português
   (`language.default: pt`) — caminho, slug e nome de arquivo entram em URL,
   git e shell. `dossie-self-review` ✅ / `autorrevisao-do-dossie` ❌;
   `kafka-consumer-lag` ✅ / `lag-do-consumidor` ❌.

   ```bash
   DIR=$(python3 ~/.claude/skills/dossie/bin/config.py --path analysis --slug dossie-self-review)
   mkdir -p "$DIR"/data
   ```

3. **Escrever `$DIR/deck.jsx`.** Só dados. Leia `references/authoring.md` antes
   da primeira vez. Estrutura de uma análise:

   - `SECTIONS` — um item por achado: `id`, `rank`, `level`, `sev`, `short`
   - `Hero` — placar com os números que resumem a análise
   - uma seção por achado: veredito → evidência → diagrama → correção
   - uma seção "já correto", quando houver decisões a não mexer
   - `Closing` — ordem de ataque por risco-removido/tamanho-do-diff

   O rodapé sai de `content.footer` da config: leia os marcadores `{repo}`,
   `{branch}` e `{date}`, resolva-os e escreva o resultado no
   `<Closing footer={[...]} />`. O builder não os resolve — ele só monta o HTML.

4. **Construir:**
   ```bash
   python3 ~/.claude/skills/dossie/bin/build.py "$DIR/deck.jsx" -o "$DIR/index.html"
   ```
   Tema e idioma vêm da config; `-t` e `--lang` sobrescrevem.

5. **Gravar `$DIR/dossie.yml`** com os metadados da peça (modelo abaixo).

6. **Verificar uma vez**, se `verify.preview` estiver ligado: servidor local,
   abrir, conferir console, diagramas e a troca de tema e idioma. Uma rodada de
   correções, sem segunda olhada.

7. **Publicar** conforme `publish.artifact`.

## Severidade

| Nível | Quando |
|---|---|
| `crit` | quebra requisição real em produção, ou corrompe dado |
| `high` | desperdício que escala com volume, ou decisão irreversível no mapeamento |
| `med` | custo mensurável sem quebra: índice faltando, consulta subótima |
| `ok` | o que já está certo e não deve ser mexido |

Ordene o `Closing` por risco removido sobre tamanho da mudança — não por
severidade pura. Um achado crítico de uma linha vem antes de um alto que pede
redesenho.

## O que distingue uma boa análise

- **Cada achado aponta arquivo e linha reais.** O `start` do `<Code>` é o número
  no arquivo; quem abrir o editor acha a mesma linha.
- **Explique por que passou.** "Como isso não foi pego pelos testes?" é a
  primeira pergunta do time, e responder vale mais que descrever o defeito.
- **Registre o que já está certo.** Uma refatoração apressada desfaz justamente
  as decisões boas que ninguém documentou.

## Metadados (`dossie.yml` da peça)

```yaml
kind: analysis
title: Dossie Self-Review
slug: dossie-self-review
created: 2026-11-16
repo: dossie
branch: main
theme: slate
language: { default: en, bilingual: true }
findings:
  - { id: f1, level: high, short: "-t overridden by config" }
  - { id: f2, level: med,  short: "naming: ask/issue silently fall back" }
  - { id: f3, level: low,  short: "stale component list in a comment" }
sources:
  - bin/build.py
  - bin/config.py
  - assets/components.jsx
```

Esse arquivo é o que permite, depois, listar e cruzar peças sem reabrir o HTML.

## Exemplo completo

`examples/example-analysis.jsx` — o próprio `dossie` analisando seu código.
