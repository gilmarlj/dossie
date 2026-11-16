#!/usr/bin/env python3
"""
dossie — grava as preferências escolhidas no setup.

    save-config.py --scope global|project [--theme X] [--mode Y]
                   [--lang en|pt] [--bilingual true|false] [--root docs]

Grava só o que difere da fábrica, com comentário em cada chave. Um arquivo
enxuto é mais fácil de revisar que uma cópia completa.
"""
import argparse, io, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import config as C

COMMENTS = {
    "theme.name":         "paleta (bin/config.py --themes lista as disponíveis)",
    "theme.mode":         "estado inicial do switch; system segue o SO",
    "language.default":   "idioma das peças",
    "language.bilingual": "true acrescenta o switch EN|PT e exige pares L(en, pt)",
    "output.root":        "raiz da saída, relativa ao repositório",
    "output.naming":      "infer | ask | date | issue",
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scope", choices=["global", "project"], required=True)
    ap.add_argument("--theme")
    ap.add_argument("--mode", choices=["light", "dark", "system"])
    ap.add_argument("--lang", choices=["en", "pt"])
    ap.add_argument("--bilingual", choices=["true", "false"])
    ap.add_argument("--root")
    ap.add_argument("--naming", choices=["infer", "ask", "date", "issue"])
    a = ap.parse_args()

    if a.theme and a.theme not in [t["name"] for t in C.themes()]:
        sys.exit("tema '%s' não existe. disponíveis: %s"
                 % (a.theme, ", ".join(t["name"] for t in C.themes())))

    factory = C.load(C.FACTORY)
    chosen = [
        ("theme.name", a.theme),
        ("theme.mode", a.mode),
        ("language.default", a.lang),
        ("language.bilingual", None if a.bilingual is None else a.bilingual == "true"),
        ("output.root", a.root),
        ("output.naming", a.naming),
    ]

    # Só o que difere da fábrica entra no arquivo.
    tree, kept = {}, []
    for dotted, val in chosen:
        if val is None or val == C.get(factory, dotted):
            continue
        sec, key = dotted.split(".")
        tree.setdefault(sec, {})[key] = val
        kept.append(dotted)

    path = (os.path.expanduser("~/.claude/dossie.yml") if a.scope == "global"
            else os.path.join(C.repo_root(), ".dossie.yml"))

    if not tree:
        print("nada a gravar: as escolhas são iguais à fábrica (%s)" % path)
        return

    header = ("# %s — preferências de dossie\n"
              "# Só as chaves que diferem de config.default.yml.\n"
              "# Veja a config efetiva com: python3 ~/.claude/skills/dossie/bin/config.py\n\n")
    header %= ("Preferências globais" if a.scope == "global"
               else os.path.basename(C.repo_root()))

    lines = [header]
    for sec in ("theme", "language", "output"):
        if sec not in tree:
            continue
        lines.append(sec + ":\n")
        for key, val in tree[sec].items():
            v = ("true" if val is True else "false" if val is False else str(val))
            note = COMMENTS.get(sec + "." + key, "")
            lines.append("  %-12s %-10s%s\n" % (key + ":", v, "# " + note if note else ""))
        lines.append("\n")

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with io.open(path, "w", encoding="utf-8") as f:
        f.write("".join(lines).rstrip() + "\n")

    print("gravado: %s" % path)
    print("chaves:  %s" % ", ".join(kept))


if __name__ == "__main__":
    main()
