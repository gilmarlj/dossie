#!/usr/bin/env python3
"""
dossie — compacta uma peça já construída num .zip para enviar ao usuário.

    to-zip.py <pasta-da-peça> [-o saida.zip]

Sem -o, o zip nasce ao lado da pasta da peça (mesmo diretório-pai), nomeado
<slug>.zip. A pasta precisa conter um dossie.yml (é o que confirma que ali é
uma peça do dossie, não uma pasta qualquer).
"""
import argparse, os, sys, zipfile


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder", help="pasta da peça (contém dossie.yml, deck.jsx, index.html)")
    ap.add_argument("-o", "--out", help="zip de saída (padrão: <pasta-pai>/<slug>.zip)")
    a = ap.parse_args()

    folder = os.path.abspath(a.folder)
    if not os.path.isdir(folder):
        sys.exit("dossie: '%s' não é uma pasta" % a.folder)
    if not os.path.exists(os.path.join(folder, "dossie.yml")):
        sys.exit("dossie: '%s' não tem dossie.yml — não parece ser a pasta de uma peça" % a.folder)

    slug = os.path.basename(folder.rstrip("/"))
    out = os.path.abspath(a.out) if a.out else os.path.join(os.path.dirname(folder), slug + ".zip")

    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _dirs, files in os.walk(folder):
            for name in files:
                path = os.path.join(root, name)
                arcname = os.path.join(slug, os.path.relpath(path, folder))
                zf.write(path, arcname)

    size_kb = os.path.getsize(out) / 1024
    print("%s  (%.1f KB)" % (out, size_kb))


if __name__ == "__main__":
    main()
