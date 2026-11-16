# dossie:new-theme — criar um tema

Cria `assets/themes/<nome>.css`. O tema aparece no menu do `/dossie:setup`
automaticamente — não há registro a atualizar.

## Passos

### 1. Entender de onde vem a paleta

Pergunte numa única `AskUserQuestion`:

| Eixo | Opções |
|---|---|
| **Origem** | Design system instalado · Cores que vou informar · Partir de um tema existente |
| **Base** | os temas de `config.py --themes`, para copiar a forma |
| **Caráter** | Claro primeiro · Escuro primeiro · Alto contraste |

**Design system instalado** é o caminho preferível quando existe: extrair do
pacote dá valores exatos. Procure o pacote antes de perguntar cor por cor:

```bash
find . -path "*node_modules*" -name "*.css" -path "*styles*" | grep -iE "ds|design|token" | head
grep -rho -- "--[a-z-]*color[a-z-]*:[^;}]*" <arquivo> | sort -u | head -40
```

### 2. Mapear para os tokens do template

O `base.css` consome exatamente estes. Todos precisam existir no bloco claro
**e** nos dois escuros:

| Grupo | Tokens |
|---|---|
| superfície | `--bg` `--surface` `--surface-2` `--code-bg` |
| texto | `--ink` `--ink-2` `--ink-3` |
| linha | `--line` `--line-soft` |
| acento | `--accent` `--accent-bg` |
| severidade | `--crit` `--crit-bg` `--high` `--high-bg` `--med` `--med-bg` `--ok` `--ok-bg` |
| forma | `--radius` `--radius-sm` `--radius-pill` `--border` `--tracking-label` |
| fonte | `--font-sans` `--font-mono` `--font-serif` |

Os pares `*-bg` são fundos de tarja: o par precisa ter contraste suficiente para
o texto por cima ficar legível, nos dois modos.

**Forma é o que dá personalidade ao tema.** `--radius: 4px` faz a peça sair
quadrada, como muitos design systems corporativos; 8px, arredondada. Não é
detalhe — é a diferença entre parecer o produto e parecer um template
genérico.

### 3. Escrever o arquivo

```css
/* =========================================================================
   TEMA: <nome>
   @label: Nome curto para o menu do setup
   @desc:  Uma linha dizendo quando usar este tema.
   <de onde vieram os valores — pacote, versão, arquivo>
   ========================================================================= */

:root {
  /* paleta ESCURA, todos os tokens, mais color-scheme: dark */
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    /* só os tokens de cor que mudam, mais color-scheme: light */
  }
}
:root[data-theme="light"] {
  /* os mesmos valores claros, para o switch vencer nos dois sentidos */
}
```

Os três blocos são obrigatórios. Sem o `:root[data-theme="light"]`, o switch não
força claro em quem está com SO escuro.

**Os temas são dark-first.** O `:root` traz a paleta escura e declara
`color-scheme: dark`; o claro entra por `prefers-color-scheme: light` (guardado
por `:root:not([data-theme="dark"])`) e por `:root[data-theme="light"]`. É o
inverso do padrão usual, e de propósito: o `data-theme` só é aplicado depois do
primeiro paint, então um tema light-first pisca branco antes de escurecer.

No fim do arquivo, o tema pode ajustar detalhes de forma por cima da base —
a régua do cabeçalho de tabela ou a marca em caixa-alta, por exemplo. Mantenha
poucos: o template é fixo de propósito.

### 4. Fontes

Se a fonte não for uma das já declaradas, acrescente a família ao dicionário
`FONTS` de `bin/build.py`, na mesma chave do tema. Só o Google Fonts é
permitido pelo CSP dos artifacts.

Fonte licenciada (Helvetica Now Text, por exemplo) não está lá: declare-a
primeiro na pilha, para quem a tiver instalada, e ponha uma substituta do
Google logo atrás (Inter é uma substituta próxima comum).

### 5. Verificar

```bash
C=~/.claude/skills/dossie/bin/config.py
B=~/.claude/skills/dossie/bin/build.py
python3 $C --themes                       # o tema novo aparece?
python3 $B ~/.claude/skills/dossie/examples/example-analysis.jsx -o /tmp/t.html -t <nome>
```

Abra e confira as duas coisas que quebram com mais frequência: **tarja de
severidade ilegível** no escuro, e **diagrama que some** porque um token de cor
ficou sem definição. Teste o switch nos dois sentidos.

Checagem rápida de token faltando:

```bash
python3 - <<'EOF'
import io, re
css = io.open("assets/themes/<nome>.css", encoding="utf-8").read()
base = io.open("assets/base.css", encoding="utf-8").read()
usados = set(re.findall(r"var\((--[a-z0-9-]+)", base))
declarados = set(re.findall(r"(--[a-z0-9-]+)\s*:", css))
print("faltando:", sorted(usados - declarados) or "nenhum")
EOF
```

Um token faltando não é erro de CSS — a regra simplesmente não aplica, e o
defeito aparece como um bloco sem cor no meio da página.

### 6. Oferecer como padrão

Depois de verificado, pergunte se deve virar o tema padrão. Em caso afirmativo:

```bash
python3 ~/.claude/skills/dossie/bin/save-config.py --scope global --theme <nome>
```
