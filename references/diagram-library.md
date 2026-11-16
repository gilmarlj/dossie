# Referência de diagramas: quando a base local não cobre

`assets/components.jsx` cobre dois casos fixos: `<ErdCanvas>` (tabelas com
colunas e links roteados, JointJS) e os primitivos SVG `<Box>`/`<T>`/`<Arrow>`
para um diagrama desenhado à mão. Isso resolve a maioria dos achados de
persistência e a maioria dos diagramas de mecanismo ("request entra aqui,
sai torto ali").

**Quando o achado pede outro tipo de diagrama** — fluxograma de decisão,
árvore de estados, diagrama de sequência, hierarquia/organograma, pipeline —
e nenhum componente existente serve bem, procure referência de implementação
em [`clientIO/joint-demos`](https://github.com/clientIO/joint-demos) antes de
inventar um shape do zero. É o repositório de demos oficial do JointJS, com
um exemplo por tipo de diagrama, e o padrão de `<ErdCanvas>` já veio de lá
(o demo *Entity-Relationship Diagram*).

## Regra de licença: só demos de `@joint/core`

O repositório mistura dois produtos da clientIO:

- **`@joint/core`** — a biblioteca livre, MPL-2.0, a mesma que o `dossie` já
  carrega via CDN (`assets.cdn` em `bin/build.py`). **Só esses demos servem
  de referência.**
- **`@joint/plus`** (também aparece como "JointJS+" ou "rappid" em versões
  antigas) — produto comercial, licença paga. Um demo que depende dele **não
  pode** virar referência: copiar a técnica corre o risco de copiar API que
  só existe no pacote pago, e a peça gerada quebraria para quem não tem a
  licença.

**Antes de usar qualquer demo como referência, confira seu
`package.json`** (`<demo>/js/package.json` ou `<demo>/ts/package.json` — a
maioria tem as duas variantes):

```bash
curl -sL "https://api.github.com/repos/clientIO/joint-demos/contents/<demo>/js/package.json" \
  | python3 -c "import json,sys,base64; d=json.load(sys.stdin); print(json.loads(base64.b64decode(d['content']))['dependencies'])"
```

`"@joint/core"` no `dependencies` → pode usar. `"@joint/plus"` → descarte,
procure outro demo ou volte para os primitivos SVG à mão.

Confirmados como `@joint/core` (livre) em 2026-11-16 — ponto de partida, não
lista fechada, reconfirme o `package.json` de qualquer demo novo antes de
copiar técnica dele:

| Demo | Serve para |
|---|---|
| `enitity-relationship-diagram` | o que `<ErdCanvas>` já cobre — shapes de entidade/relacionamento/atributo customizados, caso algum achado precise de um ERD clássico (losango de relacionamento) em vez de tabela-com-colunas |
| `flowchart` | decisão/ramificação — acesso condicional, fluxo de validação com múltiplos caminhos |
| `hierarchical-diagrams` | árvore/hierarquia — estrutura de módulos, herança, organização de pastas |
| `sequence-diagram` | troca de mensagens entre atores ao longo do tempo — chamadas entre serviços, handshake de protocolo |

Vistos como `@joint/plus` (pago) na mesma data — **não usar como
referência**: `database`, `organizational-chart`,
`corporate-organizational-chart`, `uml-class-diagrams`, e qualquer demo cujo
nome sugira BPMN, SCADA, Visio ou "builder" (geralmente produto completo, não
exemplo de técnica).

## Como usar uma referência, na prática

1. Leia o `README.md` do demo (`<demo>/README.md` na API do GitHub) para
   confirmar que é o tipo certo de diagrama.
2. Leia o `main.js`/`main.ts` em `<demo>/js/src/` (ou `ts/src/`) — é onde o
   `dia.Element.define(...)` do shape customizado vive. Adapte a definição de
   shape (markup, atributos) para um componente novo em `assets/components.jsx`
   **só se o padrão for genérico o bastante para reaproveitar entre peças**
   (ver `references/components.md` — "não reescreva os assets para uma peça").
3. Se for uso único desta peça, prefira desenhar à mão com `<Box>`/`<T>`/
   `<Arrow>` inspirado na geometria do demo, sem trazer o shape customizado
   para o template fixo — menos código novo versionado para sempre.
4. **Nunca copie o CSS, os textos de exemplo ou os dados de amostra do demo.**
   Só a técnica de construção do shape (como ele desenha um polígono/losango/
   seta específico) é referência; cor e conteúdo seguem o tema ativo e o
   achado real, como qualquer outro diagrama da skill.

## Self-update: quando um tipo de diagrama aparece de novo

Se um fluxo de análise pediu um tipo de diagrama que não está na tabela acima
e você encontrou (e confirmou a licença de) um demo novo que resolveu, **volte
e acrescente uma linha a essa tabela** — nome do demo, para que achado serve,
confirmação de `@joint/core` — para a próxima peça não repetir a mesma busca.
