#!/usr/bin/env python3
"""
dossie — resolve a configuração efetiva.

    config.py                     imprime a config efetiva (YAML)
    config.py --get theme.name    imprime um valor só
    config.py --where             mostra de qual arquivo veio cada camada
    config.py --path analysis --slug my-feature
                                  imprime o diretório de saída resolvido

Precedência: argumentos > <repo>/.dossie.yml > ~/.claude/dossie.yml > fábrica.
"""
import argparse, io, json, os, subprocess, sys
from datetime import date

try:
    import yaml
except ImportError:
    sys.exit("dossie: PyYAML é necessário — pip install pyyaml")

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FACTORY = os.path.join(HERE, "config.default.yml")
USER = os.path.expanduser("~/.claude/dossie.yml")


def repo_root(start=None):
    try:
        out = subprocess.run(["git", "rev-parse", "--show-toplevel"],
                             cwd=start or os.getcwd(), capture_output=True, text=True)
        if out.returncode == 0:
            return out.stdout.strip()
    except Exception:
        pass
    return os.getcwd()


def load(path):
    if not path or not os.path.exists(path):
        return {}
    with io.open(path, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def deep_merge(base, over):
    """Mescla recursivamente; `over` vence. Listas são substituídas, não concatenadas."""
    out = dict(base)
    for k, v in (over or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = deep_merge(out[k], v)
        else:
            out[k] = v
    return out


def layers():
    root = repo_root()
    project = os.path.join(root, ".dossie.yml")
    return [("fábrica", FACTORY), ("global", USER), ("projeto", project)]


def resolve(overrides=None):
    cfg = {}
    for _, path in layers():
        cfg = deep_merge(cfg, load(path))
    return deep_merge(cfg, overrides or {})


def get(cfg, dotted, default=None):
    cur = cfg
    for part in dotted.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return default
        cur = cur[part]
    return cur


def issue_key(start=None):
    """Prefixo tipo ABC-123 no início do nome da branch atual, ou None se não houver."""
    try:
        out = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"],
                             cwd=start or os.getcwd(), capture_output=True, text=True)
        if out.returncode != 0:
            return None
    except Exception:
        return None
    branch = out.stdout.strip()
    import re
    m = re.search(r"([A-Z][A-Z0-9]+-\d+)", branch)
    return m.group(1) if m else None


def out_dir(cfg, flow, slug):
    root = repo_root()
    base = get(cfg, "output.root", "docs")
    folder = get(cfg, "output.folders." + flow, flow)
    naming = get(cfg, "output.naming")
    if naming == "date":
        slug = date.today().strftime("%Y-%m-") + slug
    elif naming == "issue":
        key = issue_key()
        if key:
            slug = key + "-" + slug
    # "ask" não muda o formato do slug — ele só pede confirmação antes de
    # escrever, uma etapa de nível de fluxo, não de nomeação de diretório.
    return os.path.join(root, base, folder, slug)


def themes():
    """
    Temas disponíveis: [{name, label, desc}, ...].

    Cada assets/themes/*.css declara no cabeçalho:
        @label: nome curto para o menu
        @desc:  uma linha dizendo quando usar
    Um arquivo novo ali aparece aqui sem mexer em código.
    """
    d = os.path.join(HERE, "assets", "themes")
    out = []
    for f in sorted(os.listdir(d)):
        if not f.endswith(".css"):
            continue
        name = f[:-4]
        label, desc = name, ""
        with io.open(os.path.join(d, f), encoding="utf-8") as fh:
            for line in fh.read().splitlines()[:14]:
                line = line.strip()
                if line.startswith("@label:"):
                    label = line[7:].strip()
                elif line.startswith("@desc:"):
                    desc = line[6:].strip()
        out.append({"name": name, "label": label, "desc": desc})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--get", help="chave pontilhada, ex. theme.name")
    ap.add_argument("--where", action="store_true", help="de onde veio cada camada")
    ap.add_argument("--path", help="fluxo, para resolver o diretório de saída")
    ap.add_argument("--slug", help="nome da pasta da peça (com --path)")
    ap.add_argument("--themes", action="store_true", help="lista os temas disponíveis")
    ap.add_argument("--json", action="store_true", help="saída em JSON")
    a = ap.parse_args()

    if a.themes:
        ts = themes()
        if a.json:
            print(json.dumps(ts, ensure_ascii=False, indent=2))
            return
        cur = get(resolve(), "theme.name")
        for t in ts:
            print("%s %-10s %-28s %s"
                  % ("✓" if t["name"] == cur else " ", t["name"], t["label"], t["desc"]))
        return

    if a.where:
        for name, path in layers():
            mark = "✓" if os.path.exists(path) else "·"
            print("%s %-8s %s" % (mark, name, path))
        return

    cfg = resolve()

    if a.path:
        if not a.slug:
            sys.exit("--path exige --slug")
        print(out_dir(cfg, a.path, a.slug))
        return

    if a.get:
        v = get(cfg, a.get)
        print(json.dumps(v) if a.json else ("" if v is None else v))
        return

    print(json.dumps(cfg, ensure_ascii=False, indent=2) if a.json
          else yaml.safe_dump(cfg, allow_unicode=True, sort_keys=False).rstrip())


if __name__ == "__main__":
    main()
