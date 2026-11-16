---
name: dossie
description: Gera peças de documentação técnica em HTML para apresentar ao time — análise de código, ADR, postmortem — com diagramas interativos (JointJS), código anotado por linha, modo claro/escuro em um botão de 3 estados e saída EN/PT/ambos em outro. O CSS e os componentes React são um template fixo local; a skill escreve apenas os dados. Tema, idioma e destino saem de um YAML configurável. Também compacta uma peça já construída num .zip para enviar. Use quando pedirem "gera uma página com essa análise", "documenta isso para apresentar", "monta um ADR", "escreve o postmortem", "compacta esse dossiê", "zip da peça pra mandar", ou após produzir uma análise que o usuário vai apresentar.
---

# dossie

Peças técnicas que o time lê e você apresenta. Uma análise, um ADR, um
postmortem — cada um numa pasta versionada do `docs/`.

**A regra que governa a skill:** o CSS e os componentes React já existem em
disco e **não se reescrevem**. Cada peça é um `.jsx` só de dados. Isso economiza
a maior parte dos tokens e garante que tudo saia com o mesmo padrão.

## Fluxos

| Comando | O que faz |
|---|---|
| `/dossie:setup` | grava tema, idioma e destino num YAML |
| `/dossie:analysis` | análise de código/arquitetura com achados severados |
| `/dossie:adr` | registro de decisão arquitetural |
| `/dossie:postmortem` | incidente: linha do tempo, causa raiz, ações |
| `/dossie:new-theme` | cria uma paleta nova em `assets/themes/` |
| `/dossie:to-zip` | compacta uma peça já construída num `.zip` para enviar |

Cada um tem seu próprio arquivo em `flows/`. **Leia o do fluxo pedido antes de
começar** — este arquivo só dá o mapa.

Sem configuração gravada, rode `/dossie:setup` primeiro, ou siga os padrões de
fábrica e diga ao usuário que `/dossie:setup` os muda.

## Estrutura

```
~/.claude/skills/dossie/
├─ SKILL.md                este arquivo
├─ config.default.yml      padrões de fábrica — não editar
├─ flows/
│  ├─ setup.md             configurar preferências
│  ├─ analysis.md          análise de código/arquitetura
│  ├─ adr.md               decisão arquitetural
│  ├─ postmortem.md        incidente
│  ├─ new-theme.md        criar uma paleta
│  └─ to-zip.md            compactar uma peça para enviar
├─ bin/
│  ├─ config.py            resolve a config efetiva · lista temas
│  ├─ save-config.py       grava as escolhas do setup
│  ├─ build.py             tema + base + componentes + dados → .html
│  └─ to-zip.py            empacota a pasta da peça num .zip
├─ assets/
│  ├─ base.css      FIXO   todo o CSS de componente
│  ├─ components.jsx FIXO  a biblioteca React
│  └─ themes/              slate · terminal
├─ references/
│  ├─ components.md        API de cada componente
│  ├─ authoring.md         como escrever o deck.jsx
│  └─ diagram-library.md   onde buscar referência pra um diagrama novo
└─ examples/
   └─ example-analysis.jsx exemplo completo (esta própria skill)
```

## Configuração

```bash
C=~/.claude/skills/dossie/bin/config.py
python3 $C                              # config efetiva
python3 $C --where                      # de onde veio cada camada
python3 $C --themes                     # temas disponíveis, com rótulo e descrição
python3 $C --get theme.name             # um valor
python3 $C --path analysis --slug foo   # diretório de saída resolvido
```

`/dossie:setup` pergunta tema, idioma, escopo e modo inicial numa única
`AskUserQuestion` e grava com `bin/save-config.py`. As opções de tema saem de
`--themes`, que lê o diretório — um `.css` novo em `assets/themes/` entra no menu
sem tocar em código.

Precedência: argumentos do comando › `<repo>/.dossie.yml` › `~/.claude/dossie.yml`
› fábrica. Qualquer recurso novo da skill entra como chave no YAML, nunca
hardcoded.

## Construção

```bash
B=~/.claude/skills/dossie/bin/build.py
python3 $B deck.jsx -o index.html                    # tema e idioma da config
python3 $B deck.jsx -t terminal --lang pt            # sobrescrevendo
```

O título sai de `// @title: ...` na primeira linha do deck.

## Empacotamento

```bash
Z=~/.claude/skills/dossie/bin/to-zip.py
python3 $Z docs/analyses/kafka-consumer-lag                       # zip ao lado da pasta
python3 $Z docs/analyses/kafka-consumer-lag -o ~/Desktop/peça.zip  # destino explícito
```

`/dossie:to-zip` empacota uma peça já construída (a pasta com `dossie.yml`,
`deck.jsx`, `index.html`) num `.zip` para enviar por chat ou e-mail, quando um
link publicado não é a opção certa. Sem `-o`, o zip nasce no diretório-pai da
peça, nunca dentro dela.

## Saída

```
docs/
├─ analyses/
│  └─ kafka-consumer-lag/
│     ├─ dossie.yml      metadados desta peça
│     ├─ deck.jsx        os dados
│     ├─ index.html      a página montada
│     └─ data/           json/csv que alimentam gráficos
├─ adr/
│  └─ 007-event-contract-versioning/
└─ postmortems/
   └─ 2026-11-kafka-lag/
```

Com `output.naming: infer`, o nome da pasta é um slug curto em kebab-case que
descreve o assunto, não o formato: `kafka-consumer-lag`, não `analysis-1`.

**Caminho, slug e nome de arquivo são sempre em inglês**, mesmo quando a peça
sai em português (`language.default: pt`). Eles entram em URL, git e shell; o
idioma da config vale para o conteúdo, não para os identificadores.

| ✅ | ❌ |
|---|---|
| `kafka-consumer-lag` | `lag-do-consumidor` |
| `auth-token-refresh` | `renovacao-de-token` |

## Switches

Dois lados, o aceso é o estado atual — como um interruptor.

- **`LIGHT | DARK`** — sempre presente. Troca ao vivo durante a apresentação e
  lembra a escolha. Antes da primeira escolha, segue o sistema. Os diagramas SVG
  usam `var(--token)`; o canvas JointJS relê os tokens e repinta sozinho.
- **`EN | PT`** — só quando `language.bilingual: true`. O deck escreve pares com
  `L("English", "Português")` e os componentes resolvem.

**Inglês é o padrão.** Sem configuração em contrário, a peça sai em inglês e o
switch de idioma não aparece. Escreva em português apenas quando
`language.default: pt`, e bilíngue apenas quando `language.bilingual: true` —
nesse caso todo texto de prosa é um par `L(en, pt)`.

Nunca escreva CSS de tema nem condicional de idioma no deck: os dois são
responsabilidade do template.

## Codificação

O builder injeta `<meta charset="utf-8">` em toda peça. Isso não é detalhe: sem
ele, uma página aberta direto do disco é interpretada como windows-1252 e todo
acento vira mojibake. Os arquivos `.jsx` e `.css` são UTF-8 sem BOM.

## Peça ≠ documentação de produto

O `dossie` é para o que se lê e apresenta uma vez — análise, ADR, postmortem.
Documentação de produto que outros times consomem continuamente (guias,
referência de API, runbooks de operação) pertence à ferramenta de docs do seu
ecossistema, não a este formato de peça única.

Se o seu ecossistema tem um style guide de documentação técnica (titulação de
heading, voz, inclusividade), vale também para as peças em inglês — ver
`references/authoring.md` para o que a skill já assume por padrão (headings de
tarefa no infinitivo, nenhum gerúndio na primeira palavra, linguagem
inclusiva).

## Adaptar a um design system ou ecossistema específico

A skill não embute conhecimento de nenhuma empresa ou produto específico.
Para adaptar a um contexto próprio (um design system interno, uma convenção de
documentação, um estilo de commit):

- **Tema**: use `/dossie:new-theme` para extrair os tokens de cor do seu design
  system instalado — veja `flows/new-theme.md`.
- **Convenções de prosa, commit, repositório**: mantenha um arquivo próprio
  (`references/<seu-ecossistema>-style.md` ou similar) fora deste repositório —
  em `CLAUDE.md`/`AGENTS.md` do seu projeto, ou numa camada local que só você
  carrega — e referencie-o das suas próprias instruções, não daqui. Isso
  mantém a skill genérica e a camada específica fácil de versionar à parte.

## Base open-source

Canvas interativo: **JointJS** (`@joint/core` 4.1.3) — MPL-2.0, ~5,4k estrelas,
via jsDelivr. O padrão de tabelas-com-colunas e links roteados vem do demo
*Entity-Relationship Diagram* de
[`clientIO/joint-demos`](https://github.com/clientIO/joint-demos). React 18.3.1
e Babel standalone vêm do cdnjs. Todos na allowlist do CSP de artifacts.

**Precisa de um tipo de diagrama que `<ErdCanvas>` e os primitivos SVG não
cobrem bem?** `references/diagram-library.md` tem o catálogo de demos do
mesmo repositório confirmados como `@joint/core` livre (nunca `@joint/plus`,
que é produto pago) — e a instrução para acrescentar um novo achado de
diagrama ali mesmo, para a próxima peça não repetir a busca.

## Limites

- **A skill não inventa conteúdo.** Todo achado precisa de arquivo e linha reais.
- **Não reescreva os assets** para uma peça. Se um componente não serve, ou a
  peça se adapta, ou o componente ganha uma prop — e aí vira melhoria do
  template, documentada em `references/components.md`.
- **Idioma:** a página segue a config. Commits, PRs e issues continuam em inglês
  pela regra global, independentemente do idioma da peça.
