# Dados externos: quando um deck cresce além de literais inline

A maioria das peças (análise, ADR, postmortem) cabe inteira como literais JS
dentro do próprio `deck.jsx` — é o padrão default e o que
`references/authoring.md` assume. Este arquivo é para quando o dataset cresce
demais para isso: um catálogo de muitos itens, algo que o usuário vai querer
editar depois sem reabrir o `deck.jsx`, ou conteúdo que existe em mais de um
idioma e cujo texto se beneficia de ficar isolado da estrutura.

**Funciona porque `build.py` já serve a peça como HTML estático**: um
`fetch()` dentro do deck busca um arquivo ao lado do `index.html`, igual
qualquer página comum buscaria uma API. Isso já é suportado hoje — só não
estava documentado.

## O princípio: separar fato de texto traduzível

Duas categorias de dado num registro:

- **Estrutura/fato** — nunca muda com o idioma: datas, ids, caminho de uma
  imagem, tags/categorias, uma URL. Mora num arquivo só.
- **Texto traduzível** — título, descrição, lista de itens em prosa. Mora num
  arquivo por idioma, nunca misturado com o par `{en, pt}` dentro do mesmo
  registro grande (isso dificulta editar um idioma isolado depois — bom para
  um rótulo de interface curto, ruim para um parágrafo).

## O padrão recomendado

Três arquivos lado a lado, dentro da pasta `data/` da peça:

```
data/
├─ catalog.data.json      estrutura: um array de registros com id
├─ catalog.values_en.json texto em inglês, indexado pelo mesmo id
└─ catalog.values_pt.json texto em português, indexado pelo mesmo id
```

`catalog.data.json`:

```json
{
  "items": [
    { "id": "3f9a1c2e-...", "date": "2026-03", "tags": ["kafka", "lag"] }
  ]
}
```

`catalog.values_en.json` (e o par `_pt`, mesma forma, texto traduzido):

```json
{
  "items": {
    "3f9a1c2e-...": { "title": "Consumer lag spike", "summary": "..." }
  }
}
```

**Id estável, nunca posição no array.** Gere um id de verdade por registro
(`crypto.randomUUID()` no momento de criar o dado, ou qualquer string única e
estável) — nunca use o índice (`0`, `1`, `2`) como chave. Um índice muda de
significado assim que alguém reordena ou remove um item no meio; um id não.

No deck, busque os dois arquivos e junte por id:

```jsx
function useCatalog(lang) {
  const [data, setData] = useState(null);
  useEffect(() => {
    Promise.all([
      fetch("data/catalog.data.json", { cache: "no-store" }).then(r => r.json()),
      fetch("data/catalog.values_" + lang + ".json", { cache: "no-store" }).then(r => r.json()),
    ]).then(([structure, values]) => {
      setData(structure.items.map(it => ({ ...it, ...values.items[it.id] })));
    });
  }, [lang]);
  return data;
}
```

Isso troca o dataset inteiro quando o leitor usa o switch `EN|PT` — não só a
casca da página, o conteúdo todo.

## Datas: guarde o dado, não o texto formatado

Modele um período como `{ "start": "2026-03", "end": null }`, nunca como a
string já pronta `"Mar 2026 - now (8 months)"`. Calcule o texto derivado (mês
por extenso, duração em anos/meses, "atual" vs. uma data fixa) em tempo de
render, a partir do dado estruturado. Três motivos:

- Um texto pré-formatado em dois idiomas duplica a lógica de formatação —
  `_en.json` e `_pt.json` divergem silenciosamente assim que alguém edita um
  e esquece o outro.
- "Até agora" (`end: null`) só é calculável corretamente em tempo de render
  (`new Date()`), nunca armazenável como string sem ela ficar desatualizada.
- Duração (quantos anos/meses) é sempre derivável de `start`/`end` — guardá-la
  como terceiro campo é a mesma categoria de bug que guardar `idade` ao lado
  de `data_de_nascimento`.

## Aviso prático

- Só funciona servido por HTTP — `fetch()` de `file://` é bloqueado pelo
  navegador. Durante autoria, sirva a pasta: `python3 -m http.server 8731` e
  abra `http://localhost:8731/`.
- Use `{ cache: "no-store" }` no `fetch()` enquanto edita os arquivos de dado
  à mão entre reloads — sem isso o navegador pode mostrar uma cópia em cache
  e esconder sua última edição.
- `bin/to-zip.py` já empacota a pasta `data/` inteira junto com `deck.jsx` e
  `index.html` quando ela não está vazia — nenhuma mudança adicional é
  necessária para a peça continuar portátil como `.zip`.

## Quando não vale a pena

Se o dataset é pequeno (algumas dezenas de linhas, cabe legível numa tela),
literais inline em `deck.jsx` continuam o caminho mais simples — este padrão
existe para quando o arquivo fica grande o bastante para doer editar, não
como prática recomendada por padrão em toda peça.
