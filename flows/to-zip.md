# dossie:to-zip — compactar uma peça para enviar

Pega uma peça já construída (pasta com `dossie.yml`, `deck.jsx`, `index.html`)
e compacta num `.zip` para mandar por chat, e-mail ou anexo — quando um link
publicado (Artifact, Sites, GitHub Pages) não é a opção certa.

## Passos

### 1. Achar a pasta da peça

Se o usuário não apontou uma pasta, use a última peça construída nesta sessão
(a que acabou de passar por `build.py`), ou pergunte em uma linha qual peça,
listando as pastas de `docs/<tipo>/` que têm `dossie.yml`:

```bash
find docs -maxdepth 2 -name dossie.yml
```

### 2. Compactar

```bash
python3 ~/.claude/skills/dossie/bin/to-zip.py <pasta-da-peça>
```

**Sem destino informado pelo usuário, o zip nasce ao lado da pasta da peça**
(mesmo diretório-pai, `<slug>.zip`) — nunca dentro dela, para não entrar
dentro do próprio zip numa recompactação futura. Se o usuário pedir outro
lugar ("salva na área de trabalho", "bota em /tmp"), passe `-o <caminho>`:

```bash
python3 ~/.claude/skills/dossie/bin/to-zip.py <pasta-da-peça> -o ~/Desktop/kafka-consumer-lag.zip
```

O zip contém só o que a peça precisa para abrir sozinha — `deck.jsx`,
`index.html`, `dossie.yml`, e `data/` quando houver arquivos dentro (uma
`data/` vazia é pulada: não serve para nada compactada). Nada de `__pycache__`,
`.DS_Store` ou metadado de Finder — o script monta o zip entrada por entrada,
não invoca `zip`/`ditto` do sistema.

### 3. Dizer onde está

Uma linha com o caminho absoluto e o tamanho, exatamente como o script
imprime. Não repita o conteúdo do zip — quem pediu já sabe o que tem na pasta.

## Por que não abrir o zip e conferir

`index.html` já foi verificado na construção (`build.py` + preview, se
`verify.preview` estiver ligado). Reabrir de dentro do zip não testa nada que
o passo de verificação da peça não tenha testado — zipar é só empacotamento.
