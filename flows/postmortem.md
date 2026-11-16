# dossie:postmortem — análise de incidente

Reconstrói um incidente: linha do tempo, impacto medido, causa raiz e as ações
que impedem a repetição.

Reaproveita os diagramas de `analysis`, mas com eixo temporal.

## Passos

1. Config efetiva (`bin/config.py`).

2. **Nomear por data.** Postmortem usa `output.naming: date` — a data é parte da
   identidade:
   ```bash
   DIR=$(python3 ~/.claude/skills/dossie/bin/config.py --path postmortem --slug kafka-consumer-lag)
   # → docs/postmortems/2026-11-kafka-lag/
   ```

   O slug é sempre **em inglês**, mesmo quando a peça sai em português
   (`language.default: pt`) — caminho, slug e nome de arquivo entram em URL,
   git e shell. `kafka-consumer-lag` ✅ / `lag-do-consumidor` ❌.

3. **Escrever `deck.jsx`** com esta espinha:

   | Seção | Conteúdo |
   |---|---|
   | `Hero` | o que quebrou, por quanto tempo, para quantos — números no placar |
   | Linha do tempo | SVG com eixo temporal: detecção, mitigação, resolução |
   | Impacto | requisições afetadas, dados perdidos, SLA consumido |
   | Causa raiz | por que aconteceu, com evidência em linha |
   | Por que não foi pego | monitoramento, teste ou alerta que faltou |
   | Ações | cada uma com responsável e prazo, separando mitigação de prevenção |

4. Construir, gravar metadados, verificar, publicar.

## A linha do tempo

Use `<Fig>` com os primitivos SVG. Um eixo horizontal com marcos e três spans
coloridos acima: **impacto** (`tone="bad"`), **mitigação** (`tone="warn"`),
**resolução** (`tone="good"`). O componente `DiagramLazy` do exemplo JPA é o
modelo mais próximo — eixo embaixo, blocos em cima.

Marque sempre quatro instantes: **começou**, **detectamos**, **mitigamos**,
**resolvemos**. A distância entre o primeiro e o segundo é a lacuna de detecção,
e costuma ser o achado mais importante da peça.

## Tom

Sem culpados. O texto descreve sistema e processo, nunca pessoas: "o alerta não
cobria este caminho", não "ninguém percebeu". Isso não é delicadeza — um
postmortem que procura culpado produz informação pior, porque as pessoas passam
a omitir.

## Metadados

```yaml
kind: postmortem
title: Kafka consumer lag no unified-candidate
slug: 2026-11-kafka-lag
incident_date: 2026-11-08
detected_at:  "2026-11-08T14:32Z"
resolved_at:  "2026-11-08T17:05Z"
duration_min: 153
detection_gap_min: 47
severity: sev2
impact: "~12k eventos atrasados; nenhum perdido"
actions:
  - { what: "alerta de lag por consumer group", owner: "...", due: 2026-11-20, kind: prevention }
```
