# API dos componentes

Todos já estão em escopo no deck. Não importe, não redefina.

## Estrutura de página

> **Não existe `TopBar`.** A barra fixa no topo foi removida: a navegação
> truncava em qualquer largura real e duplicava a coluna lateral. Marca,
> switches e índice vivem todos na `Spine`.

### `<Deck defaultLang bilingual>`
Envolve a página. O builder já emite esta chamada com os valores da config —
o deck não precisa escrevê-la.

### `L(en, pt)` e `useT()`
Par bilíngue e o hook que o resolve. Toda prop de texto dos componentes aceita
string ou par. Nos seus próprios componentes:
`const t = useT()` e depois `{t(L("English", "Português"))}`.

### `<Hero eyebrow title lede meta board />`
Abertura. `meta` é `[{k, v}]` e vira pílulas. `board` é `[{n, k, sub, tone}]` e vira o
placar de números; `tone` é `crit | high | med | ok` ou omitido para a cor padrão.

### `<Spine sections title extra brand links printable />`
A navegação inteira da peça, em coluna fixa à esquerda: marca, switches
(`EN|PT` só quando bilíngue, `LIGHT|DARK` sempre), atalhos e índice.

| prop | o que é |
|---|---|
| `brand` | rótulo curto no topo, ex. `"dossie"` |
| `links` | `[{href, label}]` — atalhos fora do índice numerado (o mapa) |
| `sections` | o array `SECTIONS` |
| `title` | rótulo acima do índice, ex. `L("Findings", "Achados")` |
| `extra` | `[{href, title, sub}]` — itens avulsos no fim do índice |
| `printable` | acrescenta o `PrintButton` na mesma linha dos switches |

Rola com a página até grudar no topo; abaixo de 920px vira cabeçalho em grade.

**Duas visualizações, nunca as duas ao mesmo tempo.** Acima de 480px este é o
índice inteiro, como sempre foi. Abaixo de 480px (telefone) o rótulo por
extenso de cada item não cabe sem quebrar palavra por palavra — em vez de
comprimi-lo, **o índice inteiro some da sidebar** (só marca/switches
continuam ali) e cada seção de conteúdo ganha sua própria trilha de
cronologia via `<Mark>` (ver abaixo), ao lado do card. A impressão sempre usa
o índice por extenso, mesmo que a página tenha sido aberta em telefone antes
de imprimir.

### `<Mark>texto</Mark>`
Trilha lateral de uma seção — um ponto + a linha que conecta ao próximo card,
com um rótulo curto (ex. só o ano de um período). Só aparece em telefone
(<480px): é aí que `<Spine>` esconde o índice inteiro, e `<Mark>` é o lugar
onde essa mesma cronologia reaparece — uma vez só, nunca nos dois ao mesmo
tempo. Ponha como **primeiro filho** de `<section className="finding">`,
fora do `.f-head`: a regra `.finding:has(.f-mark)` detecta sozinha e vira um
grid de duas colunas (trilha | conteúdo), sem precisar de nenhuma prop ou
classe extra na seção.

```jsx
<section className="finding" id="f1">
  <Mark>2023</Mark>
  <div className="f-head">
    <Chip level="ghost">{exp.company}</Chip>
    <h2>{exp.role}</h2>
  </div>
  {/* ...resto da seção... */}
</section>
```

### `<Closing eyebrow title intro rows footer />`
Fechamento. `rows` é `[{n, what, effort}]`, onde `what` aceita JSX.

## Conteúdo

### `<Chip level>texto</Chip>`
`level`: `crit | high | med | ok | ghost`.

### `<Code path lang start lines hl good note />`
Bloco de código com numeração **real** do arquivo.

| prop | o que é |
|---|---|
| `path` | caminho mostrado no cabeçalho |
| `lang` | rótulo à direita, opcional |
| `start` | número da primeira linha no arquivo real |
| `lines` | array de strings, uma por linha |
| `hl` | números de linha a destacar em vermelho (o defeito) |
| `good` | números de linha a destacar em verde (o correto) |
| `note` | rodapé explicando o que ver ali |

Os números em `hl`/`good` são **absolutos**, não índices do array — é o número que
aparece na coluna da esquerda.

### `<Fig id caption>{svg}</Fig>`
Moldura para um SVG desenhado à mão. `id` vira o rótulo em maiúsculas (`"Fig. 2"`).

### `<Panel title tone collapsible>{...}</Panel>`
Caixa com barra lateral. `tone="ok"` pinta a barra de verde (use para correções).
`collapsible` renderiza `<details>`/`<summary>` nativo em vez de `<div>` — abre
e fecha sem JS, com um marcador `+`/`−` (CSS puro). Veja "Impressão" abaixo
para a regra sobre o que acontece com esse painel no papel.

### `<DataTable head rows wrapFirst />`
`head` é array de strings; `rows` é array de arrays (células aceitam JSX). A primeira
coluna sai monoespaçada e sem quebra — passe `wrapFirst` quando ela for texto longo.

## Primitivos SVG

Usados dentro de `<Fig>`. Todos pintam com `var(--token)`, então seguem o tema sozinhos.

### `<Box x y w h tone r dashed />`
`tone`: `neutral | bad | good | warn | accent | ghost`.

### `<T x y size mono fill weight anchor>texto</T>`
Texto. `mono` (padrão `true`) escolhe entre a fonte monoespaçada e a sans. `anchor`:
`start | middle | end`.

### `<Arrow x1 y1 x2 y2 color dashed />`
Seta reta com ponta calculada.

## Canvas interativo

### `<ErdCanvas tables links sections emptyHint figId />`

Diagrama de caixas-com-campos e links roteados (JointJS). Arrastar, pan, zoom, e clique
que abre um detalhe com atalhos para as seções.

```js
tables = [{
  id,     // casa com o `from`/`to` dos links
  name,   // cabeçalho da caixa
  x, y, w,// posição e largura
  tone,   // accent | warn | bad | good | omitido (neutro)
  cols,   // array de strings, uma linha cada
  role,   // frase que aparece no detalhe
  notes,  // [[texto, código, texto, código, ...]] — índices ímpares viram <code>
  refs    // ids de SECTIONS que esta caixa afeta
}]

links = [{ from, to, label, note, dashed, warn }]
```

O formato de `notes` alterna texto e código: `["Achado 01: o sort por ", "auditingCompanyId", " não existe."]`
rende a palavra do meio como `<code>`.

Deixe pelo menos 90px verticais entre caixas que se ligam, senão o roteador manhattan
cruza por cima delas. Labels longos invadem as caixas vizinhas — prefira duas ou três
palavras.

## Impressão

### `<PrintButton lang />`
Botão "PDF". Ao clicar, abre todo `<Panel collapsible>` da página e chama
`window.print()` logo em seguida — um painel fechado imprimiria vazio, já que
um `<details>` fechado não renderiza o conteúdo nem no papel. Normalmente não
se usa isolado: passe `printable` ao `<Spine>` (acima), que já o posiciona na
linha dos switches.

**O que sempre some no papel (`.no-print`):** `ThemeToggle`, `LangToggle` e o
próprio `PrintButton` — nenhum dos três faz sentido numa página estática.
Use a classe `.no-print` em qualquer elemento seu que só sirva à tela.

**O que sempre sai aberto:** todo `<Panel collapsible>` — o botão força isso
antes de imprimir, então não escreva conteúdo opcional-de-verdade dentro de um
painel colapsável achando que ele pode ficar fechado no PDF; ele não fica.

**O que o tema controla:** a paleta impressa (clara ou escura) fica a
critério de cada `assets/themes/*.css` — `base.css` nunca declara cor, só
neutraliza layout (`.cols` vira uma coluna, `.spine` perde o `sticky`/scroll,
sombras somem). Se seu tema usa sombra dura ou qualquer decoração que
desperdiça tinta, zere-a dentro do próprio `@media print` do tema.
