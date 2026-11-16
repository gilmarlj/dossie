# dossie:setup — configurar preferências

Pergunta tudo de uma vez e grava num YAML. Os outros fluxos leem dele.

## Onde a configuração vive

| Camada | Arquivo | Vale para |
|---|---|---|
| fábrica | `~/.claude/skills/dossie/config.default.yml` | nunca editar — é o fallback |
| global | `~/.claude/dossie.yml` | todos os seus projetos |
| projeto | `<repo>/.dossie.yml` | só este repositório |
| comando | `--theme`, `--lang`, … | só esta execução |

A mais específica vence.

## Passos

### 1. Descobrir o estado atual

```bash
C=~/.claude/skills/dossie/bin/config.py
python3 $C --where     # quais camadas existem
python3 $C --themes    # temas disponíveis, com rótulo e descrição
python3 $C             # config efetiva
```

`--themes` lê `assets/themes/*.css` e devolve o `@label` e o `@desc` que cada um
declara no cabeçalho. **Monte as opções de tema a partir dessa saída**, nunca de
uma lista escrita à mão — um tema novo no diretório tem de aparecer no menu sem
mexer em nada.

### 2. Perguntar tudo numa chamada só

Uma única `AskUserQuestion` com os quatro eixos. O usuário responde todos no
mesmo prompt, sem ida e volta.

```
AskUserQuestion([
  {
    header: "Tema",
    question: "Qual paleta usar nas peças?",
    options: <uma por linha de `config.py --themes`, label = @label,
              description = @desc, mais "Outro (digite o nome)" quando
              houver tema fora da lista>
  },
  {
    header: "Idioma",
    question: "Em que idioma as peças saem?",
    options: [
      { label: "Inglês",            description: "Padrão. Uma página só, sem switch de idioma." },
      { label: "Inglês + Português", description: "Switch EN|PT na barra. Dobra o texto do deck." },
      { label: "Português",          description: "Uma página só, em português." }
    ]
  },
  {
    header: "Escopo",
    question: "Onde gravar?",
    options: [
      { label: "Só neste repositório", description: "<repo>/.dossie.yml — sobrepõe o global aqui." },
      { label: "Global",               description: "~/.claude/dossie.yml — vale para todos os projetos." }
    ]
  },
  {
    header: "Modo inicial",
    question: "Como a página abre?",
    options: [
      { label: "Seguir o sistema", description: "Respeita o claro/escuro do SO até o leitor usar o switch." },
      { label: "Claro",            description: "Abre sempre em claro." },
      { label: "Escuro",           description: "Abre sempre em escuro." }
    ]
  }
])
```

O eixo **Tema** sempre traz "Outro (digite o nome)" como última opção — o campo
livre da `AskUserQuestion` aceita um tema que o usuário tenha acrescentado e que
ainda não esteja no diretório.

Pergunte só os eixos que a camada atual não resolve. Se o repositório já tem
`.dossie.yml` com tema e idioma, e o usuário pediu para mudar só o tema, uma
pergunta de um eixo basta.

### 3. Gravar

```bash
python3 ~/.claude/skills/dossie/bin/save-config.py \
  --scope project --theme terminal --lang en --bilingual true
```

O script grava só o que difere da fábrica, com um comentário por chave. Flags:
`--scope global|project`, `--theme`, `--mode`, `--lang en|pt`,
`--bilingual true|false`, `--root`, `--naming`.

Mapeie a resposta do eixo Idioma assim:

| Resposta | Flags |
|---|---|
| Inglês | `--lang en --bilingual false` |
| Inglês + Português | `--lang en --bilingual true` |
| Português | `--lang pt --bilingual false` |

### 4. Confirmar

Mostre o caminho gravado e rode `config.py --where` de novo, para o usuário ver
qual camada está valendo agora.

## Acrescentar um tema

Novo arquivo em `assets/themes/<nome>.css`. Ele aparece no menu do setup
automaticamente. O cabeçalho declara como o tema se apresenta:

```css
/* =========================================================================
   TEMA: <nome>
   @label: Nome curto para o menu
   @desc:  Uma linha dizendo quando usar este tema.
   ========================================================================= */
```

Depois, três blocos: `:root` com a paleta clara, e os dois escuros
(`@media (prefers-color-scheme: dark)` com `:root:not([data-theme="light"])`,
e `:root[data-theme="dark"]`). Todo token que `base.css` consome precisa existir
nos três:

```
cores  --bg --surface --surface-2 --ink --ink-2 --ink-3 --line --line-soft
       --code-bg --accent --accent-bg --crit --crit-bg --high --high-bg
       --med --med-bg --ok --ok-bg
forma  --radius --radius-sm --radius-pill --border --tracking-label
fonte  --font-sans --font-mono --font-serif
```

Os tokens de forma são o que faz um tema sair quadrado ou arredondado: `slate`
usa `--radius: 8px`, arredondado; um tema derivado de um design system corporativo
costuma preferir algo mais justo, como `4px`. Se a fonte não estiver no Google
Fonts, acrescente a família em `FONTS` no `bin/build.py` e deixe um fallback
real na pilha.

Um tema pode ainda ajustar detalhes de forma por cima da base, no fim do
arquivo — a régua do cabeçalho de tabela ou a marca em caixa-alta, por
exemplo.
