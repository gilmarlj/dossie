#!/usr/bin/env python3
"""
dossie — monta a peça a partir das partes fixas + um arquivo de dados.

    build.py <deck.jsx> [-o saida.html] [-t tema] [--title "Nome"] [--lang en|pt|both]

Partes fixas (nunca reescritas por apresentação):
    assets/themes/<tema>.css   paleta, claro e escuro
    assets/base.css            todo o CSS de componente
    assets/components.jsx      a biblioteca React

Parte variável: o <deck.jsx> que a skill escreve, contendo só os dados e o
componente App que os compõe.
"""
import argparse, io, os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(HERE, "assets")

CDN = """<script src="https://cdn.jsdelivr.net/npm/@joint/core@4.1.3/dist/joint.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.25.6/babel.min.js"></script>"""

FONTS = {
    "slate":     "IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Serif:ital,wght@0,400;1,400",
    "terminal":  "IBM+Plex+Mono:wght@400;500;600;700",
    "neobrutal": "JetBrains+Mono:wght@400;500;700;800&family=Space+Grotesk:wght@500;600;700",
}

def read(p):
    with io.open(p, encoding="utf-8") as f:
        return f.read()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("deck", help="arquivo .jsx com os dados e o App")
    ap.add_argument("-o", "--out", help="html de saída (padrão: <deck>.html)")
    ap.add_argument("-t", "--theme", default=None, help="slate | terminal (padrão: config)")
    ap.add_argument("--title", help="sobrescreve o <title> (padrão: lido do deck)")
    ap.add_argument("--lang", help="idioma inicial: en | pt | both (padrão: config)")
    a = ap.parse_args()

    # Defaults vêm da config efetiva; argumentos vencem. default=None acima é o
    # que permite distinguir "-t slate" explícito de "a flag não foi passada" —
    # com um default de string, os dois colapsariam no mesmo valor.
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    try:
        import config as C
        cfg = C.resolve()
        if a.theme is None:
            a.theme = C.get(cfg, "theme.name", "slate")
        if not a.lang:
            a.lang = C.get(cfg, "language.default", "en")
        bilingual = C.get(cfg, "language.bilingual", False)
        mode = C.get(cfg, "theme.mode", "system")
    except Exception:
        a.lang = a.lang or "en"
        bilingual = False
        mode = "system"
    # Sem bilíngue configurado, a página nasce em inglês e sem botão de idioma.
    if not bilingual:
        a.lang = a.lang if a.lang in ("en", "pt") else "en"

    theme_path = os.path.join(ASSETS, "themes", a.theme + ".css")
    if not os.path.exists(theme_path):
        avail = sorted(f[:-4] for f in os.listdir(os.path.join(ASSETS, "themes")))
        sys.exit("tema '%s' não existe. disponíveis: %s" % (a.theme, ", ".join(avail)))

    deck = read(a.deck)

    # O título sai de // @title: ... na primeira linha do deck, ou de --title.
    m = re.search(r"^//\s*@title:\s*(.+)$", deck, re.M)
    title = a.title or (m.group(1).strip() if m else "Apresentação")

    fonts = FONTS.get(a.theme, FONTS["slate"])
    out = a.out or os.path.splitext(a.deck)[0] + ".html"

    html = """<meta charset="utf-8">
<title>%s</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=%s&display=swap">

<style>
%s
%s
</style>

<div id="app"></div>

%s

<script type="text/babel" data-presets="react">
%s

%s

ReactDOM.createRoot(document.getElementById("app")).render(
  <Deck defaultLang="%s" bilingual={%s} themeMode="%s"><App /></Deck>
);
</script>
""" % (title, fonts, read(theme_path), read(os.path.join(ASSETS, "base.css")),
       CDN, read(os.path.join(ASSETS, "components.jsx")), deck, a.lang,
       "true" if bilingual else "false", mode)

    with io.open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("%s  (%s · tema %s · idioma %s%s · %.1f KB)"
          % (out, title, a.theme, a.lang,
             " bilíngue" if bilingual else "", len(html.encode()) / 1024))

if __name__ == "__main__":
    main()
