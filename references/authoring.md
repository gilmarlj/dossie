# Como escrever o deck.jsx

O deck é **só dados**. Três regras: nada de `<style>`, nada de redefinir componentes,
nada de cor literal (`#fff`, `rgb(...)`) — sempre `var(--token)`.

## Esqueleto

```jsx
// @title: Nome Da Apresentação

/* ---------- dados do diagrama ---------- */
const ERD_TABLES = [ /* ... */ ];
const ERD_LINKS  = [ /* ... */ ];

/* ---------- índice das seções ---------- */
const SECTIONS = [
  { id: "f1", rank: "01", level: "crit", sev: "Crítico",
    short: "Rótulo curto", title: "A frase inteira do achado" },
];

/* ---------- diagramas desenhados à mão ---------- */
function DiagramAlgo() {
  return (
    <svg viewBox="0 0 880 320" role="img" aria-label="descreva o que o diagrama mostra">
      <Box x={24} y={22} w={200} h={44} tone="bad" />
      <T x={124} y={48} size={11}>rótulo</T>
      <Arrow x1={224} y1={44} x2={266} y2={44} />
    </svg>
  );
}

/* ---------- seções ---------- */
function F1() {
  return (
    <section className="finding" id="f1">
      <div className="f-head">
        <Chip level="crit">01 · Crítico</Chip>
        <Chip level="ghost">quebra em runtime</Chip>
        <h2>O título da seção</h2>
      </div>
      <p className="verdict">Uma ou duas frases: o que acontece e por quê.</p>

      <div className="sec-label">evidência</div>
      <Code path="Arquivo.java · método" start={298} hl={[304]} lines={[ /* ... */ ]} />

      <div className="sec-label">caminho até a falha</div>
      <Fig id="Fig. 1" caption="O que o leitor deve notar aqui."><DiagramAlgo /></Fig>

      <Panel title="Correção" tone="ok">
        <ul><li>O passo concreto, com <code>nomeDoSímbolo</code>.</li></ul>
      </Panel>
    </section>
  );
}

function App() { /* TopBar, Hero, Spine, seções, Closing */ }
```

## Classes utilitárias

Definidas no `base.css`, use direto no JSX:

| classe | para |
|---|---|
| `section.finding` | toda seção de conteúdo (dá o scroll-margin da barra fixa) |
| `.f-head` + `h2` | cabeçalho com chips |
| `.verdict` | a frase-tese, com barra lateral |
| `.body-p` | parágrafo de corpo, largura de leitura limitada |
| `.sec-label` | rótulo pequeno entre blocos ("evidência", "correção") |
| `.inline` | trecho de código dentro de um parágrafo |
| `.mono` | força monoespaçada |

## Como escrever o conteúdo

**A seção abre pela conclusão.** `.verdict` diz o que acontece e por quê, em duas frases.
A evidência vem depois, não antes.

**Todo achado aponta arquivo e linha.** `start` do `<Code>` é o número real no arquivo;
quem abrir o editor tem de achar a mesma linha.

**Explique por que passou.** Num achado de bug, a pergunta que o time sempre faz é
"como isso não foi pego?". Responder vale mais que a descrição do defeito.

**Diagrama mostra mecanismo, não decoração.** Se a figura não explica algo que o texto
não explicaria igual, corte.

**Tipo de diagrama que `<ErdCanvas>`/`<Box>`/`<T>`/`<Arrow>` não cobre bem**
(fluxograma, árvore de decisão, sequência, hierarquia)? Veja
`references/diagram-library.md` antes de inventar um shape do zero.

**Dataset grande demais para literais inline no deck?** Veja
`references/external-data.md` — fetch de JSON ao lado do `index.html`
construído, separando estrutura/fato de texto traduzível por idioma.

## Idioma

**Inglês é o padrão.** Escreva a peça em inglês salvo se
`language.default: pt`. Confira com:

```bash
python3 ~/.claude/skills/dossie/bin/config.py --get language.default
python3 ~/.claude/skills/dossie/bin/config.py --get language.bilingual
```

**A config vale para o conteúdo, não para os nomes.** Caminho, slug e nome de
arquivo são sempre em inglês, mesmo com `language.default: pt` — eles entram em
URL, git e shell.

| ✅ | ❌ |
|---|---|
| `kafka-consumer-lag` | `lag-do-consumidor` |
| `auth-token-refresh` | `renovacao-de-token` |

### Deck monolíngue (`bilingual: false`)

Strings normais. Nada de `L()`.

```jsx
<Chip level="crit">01 · Critical</Chip>
<h2>Sorting by auditingCompanyId points at an attribute that does not exist</h2>
```

### Deck bilíngue (`bilingual: true`)

Todo texto de prosa é um par `L(en, pt)`. Os componentes resolvem sozinhos; nos
seus próprios componentes, chame `const t = useT()` e envolva o par: `{t(L(...))}`.

```jsx
<h2>{t(L("Missing indexes", "Índices ausentes"))}</h2>

<Fig id="Fig. 1" caption={L("What to notice here.", "O que notar aqui.")}>
  <DiagramSortPath />
</Fig>
```

O que **não** traduzir: identificadores, nomes de arquivo, SQL, as linhas dentro
de `<Code lines={...}>` e rótulos de diagrama que são símbolos
(`findAll(spec, pageable)`, `LazyInitializationException`).

### Ao escrever em português

Acentuação completa, sempre — o arquivo é UTF-8 e o builder declara
`<meta charset="utf-8">`. Vocabulário técnico em inglês fica em inglês
(`merge`, `flush`, `batch`), sem aportuguesar.

Erros frequentes, que vale revisar:
- `onde` para o que não é lugar → `quando`, `em que`, `no qual`
- `pra` → `para`
- Concordância em sujeito composto e em oração com sujeito deslocado
- Crase antes de locução adverbial feminina (`à direita`) está certa; antes de
  masculino e de verbo, não

### Escapes

Evite aspas escapadas dentro de uma string de `L()` ou de `<T>`: o Babel do
navegador é menos tolerante que o Node e um `\"` a mais quebra o parse da
página inteira. Reescreva a frase sem as aspas em vez de escapar.

## Headings (peças em inglês)

Vale o mesmo princípio de qualquer style guide de documentação técnica séria
(o do Google developer documentation é uma boa referência): heading de tarefa
no infinitivo puro, heading conceitual como sintagma nominal, nunca gerúndio
na primeira palavra:

| Certo | Errado |
|---|---|
| `Fix` | `Fixing` |
| `Create the index` | `Creating the index` |
| `The persisted aggregate` | `Persisting the aggregate` |
| `Path to the failure` | `Finding the failure` |

Linguagem inclusiva sempre: `allowlist`/`denylist`, `primary`/`secondary`.

## Forma, em vez de valores fixos

> O `base.css` lê cada token de forma com fallback embutido —
> `var(--radius, 7px)` — e nunca os declara num `:root` próprio. Um `:root` no
> base seria emitido **depois** do tema e, com a mesma especificidade, venceria:
> o tema pediria 0px e a página sairia arredondada.


Não escreva `border-radius`, espessura de borda nem `letter-spacing` de rótulo no
deck: isso é do tema. O template expõe `--radius`, `--radius-sm`, `--radius-pill`,
`--border` e `--tracking-label`, e cada tema os define. É o que faz o tema
`slate` sair arredondado e o `terminal`, reto — sem tocar em nenhuma peça.

## Dimensões dos SVG

`viewBox="0 0 880 H"` funciona bem; o CSS dá `min-width: 640px` e rolagem horizontal
na própria figura. Deixe margem para os rótulos das extremidades — o texto de um `<T>`
com `anchor="start"` em `x=24` começa ali e cresce para a direita.

## Verificação

Construa, sirva local e abra uma vez. Olhe: o diagrama cabe? a troca de tema repinta?
o console está limpo? Uma rodada de correções, depois publique.
