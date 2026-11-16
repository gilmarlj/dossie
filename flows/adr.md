# dossie:adr — registro de decisão arquitetural

Registra uma decisão: o contexto que a forçou, as opções comparadas, o que foi
decidido e o que isso passa a custar.

Mais enxuto que `analysis`: um ADR tem uma decisão, não cinco achados.

## Passos

1. Config efetiva (`bin/config.py`).

2. **Numerar e nomear.** ADR usa numeração sequencial — olhe a pasta e some um:
   ```bash
   DIR=$(python3 ~/.claude/skills/dossie/bin/config.py --path adr --slug 007-event-contract-versioning)
   ```
   O slug é `NNN-subject`, sempre **em inglês** — caminho, slug e nome de
   arquivo entram em URL, git e shell, mesmo quando a peça sai em português
   (`language.default: pt`). `007-event-contract-versioning` ✅ /
   `007-versionamento-de-contrato` ❌.
   Mantenha o número mesmo que a decisão mude depois:
   um ADR substituído não é apagado, ganha `status: superseded` e um link.

3. **Escrever `deck.jsx`** com esta espinha:

   | Seção | Conteúdo |
   |---|---|
   | `Hero` | a decisão em uma frase, mais `meta` com status e data |
   | Contexto | o que forçou a decisão agora, com o custo de não decidir |
   | Opções | uma `DataTable` comparando, e uma seção por opção com o trade-off real |
   | Decisão | o que foi escolhido e **por quê esta e não as outras** |
   | Consequências | o que fica mais fácil e o que fica mais difícil |
   | Revisão | que sinal faria revisitar isto |

4. Construir, gravar metadados, verificar, publicar.

## Status

`proposed` · `accepted` · `superseded` · `deprecated`

Mostre no `Hero` como `meta`, e use um `Chip` com `level="ok"` para aceito,
`"ghost"` para proposto, `"high"` para substituído.

## O que distingue um bom ADR

- **As opções descartadas importam tanto quanto a escolhida.** Quem ler daqui a
  um ano quer saber o que já foi pesado, para não repropor.
- **Consequências incluem o que piora.** Um ADR que só lista vantagens não foi
  uma decisão, foi uma justificativa.
- **O gatilho de revisão é concreto:** "se o volume passar de X", "quando o
  contrato Y estabilizar" — não "revisar periodicamente".

## Metadados

```yaml
kind: adr
number: 7
status: accepted
title: Versionamento do contrato de eventos unified-candidate
slug: 007-event-contract-versioning
decided: 2026-11-12
deciders: [...]
supersedes: null
options_considered: 3
```
