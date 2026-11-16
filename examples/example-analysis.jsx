// @title: Dossie Self-Review

/* =========================================================================
   This is a worked example: dossie analyzing its own code. Every finding
   below points at a real file and line in this repository — run the
   commands in each Panel yourself to reproduce them.
   ========================================================================= */

/* =========================================================================
   DIAGRAM — the /dossie:analysis flow itself: fixed parts + one data file
   go into build.py and come out as one static HTML page.
   ========================================================================= */
function DiagramAnalysisFlow() {
  const t = useT();
  return (
    <svg viewBox="0 0 880 300" role="img"
      aria-label={t(L("How build.py assembles a fixed theme and component library with one deck.jsx of data into a single HTML page",
                      "Como o build.py monta um tema e uma biblioteca de componentes fixos com um deck.jsx de dados num único HTML"))}>
      <Box x={24} y={24} w={190} h={40} tone="neutral" />
      <T x={119} y={43} size={10} fill="var(--ink-3)">{t(L("fixed · never rewritten", "fixo · nunca reescrito"))}</T>
      <T x={119} y={57} size={11} weight={600}>assets/themes/&lt;name&gt;.css</T>

      <Box x={24} y={76} w={190} h={40} tone="neutral" />
      <T x={119} y={95} size={10} fill="var(--ink-3)">{t(L("fixed · never rewritten", "fixo · nunca reescrito"))}</T>
      <T x={119} y={109} size={11} weight={600}>assets/base.css</T>

      <Box x={24} y={128} w={190} h={40} tone="neutral" />
      <T x={119} y={147} size={10} fill="var(--ink-3)">{t(L("fixed · never rewritten", "fixo · nunca reescrito"))}</T>
      <T x={119} y={161} size={11} weight={600}>assets/components.jsx</T>

      <Box x={24} y={180} w={190} h={40} tone="accent" />
      <T x={119} y={199} size={10} fill="var(--ink-3)">{t(L("the one variable part", "a única parte variável"))}</T>
      <T x={119} y={213} size={11} weight={600}>deck.jsx</T>

      <Arrow x1={214} y1={44} x2={286} y2={140} />
      <Arrow x1={214} y1={96} x2={286} y2={150} />
      <Arrow x1={214} y1={148} x2={286} y2={160} />
      <Arrow x1={214} y1={200} x2={286} y2={170} />

      <Box x={286} y={110} w={150} h={100} tone="warn" />
      <T x={361} y={135} size={11} weight={600}>bin/build.py</T>
      <T x={361} y={153} size={9.3} fill="var(--ink-2)">{t(L("string-concatenates", "concatena texto"))}</T>
      <T x={361} y={166} size={9.3} fill="var(--ink-2)">{t(L("all four inputs", "as quatro entradas"))}</T>
      <T x={361} y={185} size={9.3} fill="var(--ink-2)">{t(L("(finding 01 lives here)", "(achado 01 vive aqui)"))}</T>

      <Arrow x1={436} y1={160} x2={508} y2={160} />

      <Box x={508} y={118} w={340} h={84} tone="good" />
      <T x={678} y={143} size={11} weight={600} fill="var(--ok)">index.html</T>
      <T x={678} y={162} size={9.5} fill="var(--ok)">{t(L("one static file, no server, no build step", "um arquivo estático, sem servidor, sem passo de build"))}</T>
      <T x={678} y={179} size={9.5} fill="var(--ok)">{t(L("CDN scripts + inline <style> + <script type=\"text/babel\">", "scripts de CDN + <style> inline + <script type=\"text/babel\">"))}</T>
      <T x={678} y={196} size={9.5} fill="var(--ok)">{t(L("Babel compiles the JSX in the reader's own browser", "o Babel compila o JSX no próprio navegador de quem lê"))}</T>
    </svg>
  );
}

const SECTIONS = [
  { id: "f1", rank: "01", level: "high", sev: L("High", "Alto"),
    short: L("-t overridden by config", "-t sobrescrito pela config") },
  { id: "f2", rank: "02", level: "med", sev: L("Medium", "Médio"),
    short: L("naming: ask/issue silently fall back", "naming: ask/issue caem em silêncio") },
  { id: "f3", rank: "03", level: "low", sev: L("Low", "Baixo"),
    short: L("stale component list in a comment", "lista de componentes desatualizada") }
];

function Overview() {
  const t = useT();
  return (
    <section className="finding" id="mapa">
      <div className="f-head">
        <Chip level="ghost">{t(L("context", "contexto"))}</Chip>
        <h2>{t(L("What this piece is", "O que esta peça é"))}</h2>
      </div>
      <p className="body-p">{t(L(
        <>Before the findings: <span className="inline">dossie</span> itself has no server and no
        runtime — a flow reads a YAML config, writes a <span className="inline">deck.jsx</span> of
        data, and <span className="inline">bin/build.py</span> wraps it with a fixed theme and
        component library into one static HTML file. The three findings below sit in that small
        surface: <span className="inline">bin/build.py</span>'s theme-selection logic, {" "}
        <span className="inline">bin/config.py</span>'s naming modes, and a stale comment in{" "}
        <span className="inline">assets/components.jsx</span>.</>,
        <>Antes dos achados: o próprio <span className="inline">dossie</span> não tem servidor nem
        runtime — um fluxo lê uma config YAML, escreve um <span className="inline">deck.jsx</span>{" "}
        de dados, e <span className="inline">bin/build.py</span> envolve isso com um tema fixo e a
        biblioteca de componentes num único HTML estático. Os três achados abaixo ficam nessa
        superfície pequena: a lógica de seleção de tema do{" "}
        <span className="inline">bin/build.py</span>, os modos de nomeação do{" "}
        <span className="inline">bin/config.py</span>, e um comentário desatualizado em{" "}
        <span className="inline">assets/components.jsx</span>.</>))}</p>

      <Fig id="Fig. 1" caption={L(
        "The /dossie:analysis flow in one picture: three fixed assets plus one data file go into build.py, which string-concatenates them into a single HTML page — this is also exactly where finding 01 lives.",
        "O fluxo /dossie:analysis numa figura: três recursos fixos mais um arquivo de dados entram no build.py, que os concatena em um único HTML — é exatamente aqui que o achado 01 vive.")}>
        <DiagramAnalysisFlow />
      </Fig>
    </section>
  );
}

function F1() {
  const t = useT();
  return (
    <section className="finding" id="f1">
      <div className="f-head">
        <Chip level="high">{t(L("01 · High", "01 · Alto"))}</Chip>
        <Chip level="ghost">{t(L("CLI flag silently ignored", "flag de CLI ignorada em silêncio"))}</Chip>
        <h2>{t(L(
          <>Passing <span className="mono">-t slate</span> on the command line does nothing when
          the config picks a different theme</>,
          <>Passar <span className="mono">-t slate</span> na linha de comando não faz nada quando a
          config escolhe outro tema</>))}</h2>
      </div>
      <p className="verdict">{t(L(
        <><span className="mono">build.py</span> only treats <span className="mono">-t</span> as an
        explicit choice when its value is anything other than <span className="mono">"slate"</span> —
        the one value that happens to be the argparse default. Run{" "}
        <span className="mono">build.py deck.jsx -t slate</span> in a project whose config picks{" "}
        <span className="mono">terminal</span>, and the output silently builds with{" "}
        <span className="mono">terminal</span> instead.</>,
        <>O <span className="mono">build.py</span> só trata <span className="mono">-t</span> como
        escolha explícita quando o valor é diferente de <span className="mono">"slate"</span> — o
        mesmo valor que por acaso é o default do argparse. Rode{" "}
        <span className="mono">build.py deck.jsx -t slate</span> num projeto cuja config escolhe{" "}
        <span className="mono">terminal</span>, e a saída constrói em silêncio com{" "}
        <span className="mono">terminal</span> em vez disso.</>))}</p>

      <div className="sec-label">{t(L("evidence", "evidência"))}</div>
      <Code path="bin/build.py" lang="python" start={41} hl={[41, 48, 49]} lines={[
        "ap.add_argument(\"-t\", \"--theme\", help=\"slate | terminal (padrão: config)\")",
        "a = ap.parse_args()",
        "",
        "...",
        "if not a.theme or a.theme == \"slate\":",
        "    a.theme = C.get(cfg, \"theme.name\", \"slate\")"
      ]} note={L(
        "argparse gives a.theme the string \"slate\" when the flag is absent — there is no way to tell \"user wrote -t slate\" from \"user wrote nothing\" once the value has already collapsed to the same string.",
        "o argparse dá a a.theme a string \"slate\" quando a flag está ausente — não há como distinguir \"o usuário escreveu -t slate\" de \"o usuário não escreveu nada\" depois que o valor já colapsou na mesma string.")} />

      <div className="sec-label">{t(L("how to reproduce", "como reproduzir"))}</div>
      <Panel title={L("Terminal", "Terminal")}>
        <Code path={L("any directory with a .dossie.yml picking a non-default theme",
                      "qualquer diretório com um .dossie.yml escolhendo um tema não-padrão")}
          lang="bash" start={1} lines={[
          "$ cat .dossie.yml",
          "theme:",
          "  name: terminal",
          "",
          "$ python3 bin/build.py deck.jsx -o out.html -t slate",
          "out.html  (… · tema terminal · idioma en · 41.5 KB)",
          "#            ^^^^^^^^^^^^^^ expected \"tema slate\""
        ]} />
      </Panel>

      <Panel title={L("Fix", "Correção")} tone="ok">
        <ul>
          <li>{t(L(
            <>Use argparse's own default-tracking instead of a magic string:
            <code>ap.add_argument("-t", "--theme", default=None)</code>, then
            <code>if a.theme is None: a.theme = C.get(cfg, "theme.name", "slate")</code>.
            <code>None</code> can mean "not passed" without colliding with any real theme name.</>,
            <>Usar o próprio rastreamento de default do argparse em vez de uma string mágica:
            <code>ap.add_argument("-t", "--theme", default=None)</code>, depois
            <code>if a.theme is None: a.theme = C.get(cfg, "theme.name", "slate")</code>.
            <code>None</code> pode significar "não passado" sem colidir com nenhum nome de tema real.</>))}</li>
        </ul>
      </Panel>
    </section>
  );
}

function F2() {
  const t = useT();
  return (
    <section className="finding" id="f2">
      <div className="f-head">
        <Chip level="med">{t(L("02 · Medium", "02 · Médio"))}</Chip>
        <Chip level="ghost">{t(L("documented but unimplemented", "documentado mas não implementado"))}</Chip>
        <h2>{t(L(
          <>Two of the four documented <span className="mono">output.naming</span> modes are never
          applied</>,
          <>Dois dos quatro modos documentados de <span className="mono">output.naming</span>{" "}
          nunca são aplicados</>))}</h2>
      </div>
      <p className="verdict">{t(L(
        <><span className="mono">config.default.yml</span> documents four naming modes —{" "}
        <span className="mono">infer</span>, <span className="mono">ask</span>,{" "}
        <span className="mono">date</span>, <span className="mono">issue</span> — and{" "}
        <span className="mono">save-config.py</span> accepts all four as valid{" "}
        <span className="mono">--naming</span> values. <span className="mono">config.py</span>'s{" "}
        <span className="mono">out_dir()</span> only branches on <span className="mono">date</span>;{" "}
        <span className="mono">ask</span> and <span className="mono">issue</span> fall through
        unhandled and silently behave like <span className="mono">infer</span> — no error, no
        issue-key prefix, nothing that tells the caller the mode did not apply.</>,
        <>O <span className="mono">config.default.yml</span> documenta quatro modos de nomeação —{" "}
        <span className="mono">infer</span>, <span className="mono">ask</span>,{" "}
        <span className="mono">date</span>, <span className="mono">issue</span> — e o{" "}
        <span className="mono">save-config.py</span> aceita os quatro como valor válido de{" "}
        <span className="mono">--naming</span>. O <span className="mono">out_dir()</span> do{" "}
        <span className="mono">config.py</span> só trata o caso <span className="mono">date</span>;{" "}
        <span className="mono">ask</span> e <span className="mono">issue</span> passam direto sem
        tratamento e se comportam em silêncio como <span className="mono">infer</span> — sem erro,
        sem prefixo de issue, nada que avise o chamador de que o modo não se aplicou.</>))}</p>

      <div className="sec-label">{t(L("evidence", "evidência"))}</div>
      <Code path="config.default.yml" lang="yaml" start={62} hl={[64, 65]} lines={[
        "#   infer  — o agente escolhe pelo contexto (ex.: jpa-candidate)",
        "#   ask    — propõe e pede confirmação",
        "#   date   — AAAA-MM-<slug>  (bom para postmortem)",
        "#   issue  — <ISSUE-KEY>-<slug> quando houver issue na branch",
        "naming: infer"
      ]} />
      <Code path="bin/config.py · out_dir" lang="python" start={77} hl={[81, 82]} lines={[
        "def out_dir(cfg, flow, slug):",
        "    root = repo_root()",
        "    base = get(cfg, \"output.root\", \"docs\")",
        "    folder = get(cfg, \"output.folders.\" + flow, flow)",
        "    if get(cfg, \"output.naming\") == \"date\":",
        "        slug = date.today().strftime(\"%Y-%m-\") + slug",
        "    return os.path.join(root, base, folder, slug)"
      ]} note={L(
        "No elif, no else, no branch at all for \"ask\" or \"issue\" — the slug reaching the return statement is untouched in both cases, identical to what \"infer\" would produce.",
        "Sem elif, sem else, sem nenhum ramo para \"ask\" ou \"issue\" — o slug que chega ao return não é tocado em nenhum dos dois casos, idêntico ao que \"infer\" produziria.")} />

      <div className="sec-label">{t(L("how to reproduce", "como reproduzir"))}</div>
      <Panel title={L("Terminal", "Terminal")}>
        <Code lang="bash" start={1} lines={[
          "$ cat .dossie.yml",
          "output:",
          "  naming: issue",
          "",
          "$ python3 bin/config.py --path analysis --slug my-feature",
          "docs/analyses/my-feature",
          "#               ^^^^^^^^^^^ expected something like ABC-123-my-feature"
        ]} />
      </Panel>

      <Panel title={L("Fix", "Correção")} tone="ok">
        <ul>
          <li>{t(L(
            <>Add the missing branches to <code>out_dir()</code>: <code>issue</code> reads the
            current branch name (<code>git rev-parse --abbrev-ref HEAD</code>), extracts a leading
            issue key with a regex, and prefixes the slug; <code>ask</code> has no code-level
            behavior to add — it is a flow-level instruction (confirm the slug with the user before
            writing), so either implement that in the calling flow or drop it from the documented
            set until it is.</>,
            <>Adicionar os ramos que faltam a <code>out_dir()</code>: <code>issue</code> lê o nome
            da branch atual (<code>git rev-parse --abbrev-ref HEAD</code>), extrai uma issue key no
            início com regex, e prefixa o slug; <code>ask</code> não tem comportamento de código a
            acrescentar — é uma instrução de nível de fluxo (confirmar o slug com o usuário antes de
            escrever), então ou implementar isso no fluxo que chama, ou tirar do conjunto documentado
            até que esteja.</>))}</li>
        </ul>
      </Panel>
    </section>
  );
}

function F3() {
  const t = useT();
  return (
    <section className="finding" id="f3">
      <div className="f-head">
        <Chip level="med">{t(L("03 · Low", "03 · Baixo"))}</Chip>
        <Chip level="ghost">{t(L("doc drift in a comment", "comentário desatualizado"))}</Chip>
        <h2>{t(L(
          <>The component library's own header comment names a removed component and misnames
          another</>,
          <>O comentário de cabeçalho da própria biblioteca de componentes nomeia um componente
          removido e erra o nome de outro</>))}</h2>
      </div>
      <p className="verdict">{t(L(
        <>The file-level comment at the top of <span className="mono">components.jsx</span> lists{" "}
        <span className="mono">TopBar</span> and <span className="mono">ThemePick</span> as part of
        the page-structure components. <span className="mono">TopBar</span> was removed (
        <span className="mono">references/components.md</span> documents this explicitly). The
        theme switch component that does exist is named <span className="mono">ThemeToggle</span>,
        not <span className="mono">ThemePick</span> — and <span className="mono">LangToggle</span>,
        which also exists, is not listed at all.</>,
        <>O comentário em nível de arquivo no topo do <span className="mono">components.jsx</span>{" "}
        lista <span className="mono">TopBar</span> e <span className="mono">ThemePick</span> como
        parte dos componentes de estrutura de página. O <span className="mono">TopBar</span> foi
        removido (o <span className="mono">references/components.md</span> documenta isso
        explicitamente). O componente de troca de tema que de fato existe se chama{" "}
        <span className="mono">ThemeToggle</span>, não <span className="mono">ThemePick</span> — e
        o <span className="mono">LangToggle</span>, que também existe, não está listado.</>))}</p>

      <div className="sec-label">{t(L("evidence", "evidência"))}</div>
      <Code path="assets/components.jsx" lang="javascript" start={1} hl={[9]} lines={[
        "/* =========================================================================",
        "   TECH-DECK — BIBLIOTECA DE COMPONENTES (FIXA)",
        "   ...",
        "   Estrutura de página:   TopBar, Hero, Spine, Closing, ThemePick",
        "   ========================================================================= */"
      ]} note={L(
        "A comment is never type-checked or lint-checked, so it drifts silently the moment the code it describes changes — this one was never updated when TopBar was dropped.",
        "um comentário nunca passa por type check nem lint, então ele desvia em silêncio assim que o código que descreve muda — este nunca foi atualizado quando o TopBar foi removido.")} />
      <Code path="references/components.md" lang="markdown" start={5} good={[7]} lines={[
        "## Estrutura de página",
        "",
        "> **Não existe `TopBar`.** A barra fixa no topo foi removida: a navegação",
        "> truncava em qualquer largura real e duplicava a coluna lateral. Marca,",
        "> switches e índice vivem todos na `Spine`."
      ]} note={L(
        "The reference doc already got the correction — only the source comment was left behind.",
        "A doc de referência já recebeu a correção — só o comentário na fonte ficou para trás.")} />

      <Panel title={L("Fix", "Correção")} tone="ok">
        <ul>
          <li>{t(L(
            <>Rewrite the header comment's component list to match
            <code>references/components.md</code>: drop <code>TopBar</code>, rename{" "}
            <code>ThemePick</code> to <code>ThemeToggle</code>, add <code>LangToggle</code>.</>,
            <>Reescrever a lista de componentes do comentário de cabeçalho para bater com
            <code>references/components.md</code>: tirar o <code>TopBar</code>, renomear{" "}
            <code>ThemePick</code> para <code>ThemeToggle</code>, acrescentar <code>LangToggle</code>.</>))}</li>
        </ul>
      </Panel>
    </section>
  );
}

function Good() {
  const t = useT();
  const items = [
    [L("config precedence: factory → global → project → args", "precedência da config: fábrica → global → projeto → argumentos"),
     L("deep_merge() in config.py is a small, pure function with no special cases — each layer is a plain dict merge, which is why adding a new config key never requires touching the merge logic.",
       "deep_merge() em config.py é uma função pequena e pura, sem casos especiais — cada camada é um merge de dict simples, por isso acrescentar uma chave de config nova nunca exige tocar na lógica do merge.")],
    [L("themes are discovered from disk, not from a registry", "temas são descobertos do disco, não de um registro"),
     L("config.py's themes() lists assets/themes/*.css and reads @label/@desc from each header — a new theme file appears in /dossie:setup without editing any Python.",
       "o themes() do config.py lista assets/themes/*.css e lê @label/@desc do cabeçalho de cada um — um arquivo de tema novo aparece no /dossie:setup sem editar nenhum Python.")],
    [L("save-config.py writes only what differs from factory", "save-config.py grava só o que difere da fábrica"),
     L("The written .dossie.yml stays short and reviewable instead of a full copy of every default — a diff shows exactly what a project chose to override.",
       "o .dossie.yml gravado fica curto e revisável, em vez de uma cópia completa de cada default — um diff mostra exatamente o que o projeto escolheu sobrescrever.")]
  ];
  return (
    <section className="finding" id="ok">
      <div className="f-head">
        <Chip level="ok">{t(L("already right", "o que já está certo"))}</Chip>
        <h2>{t(L("Decisions worth keeping", "Decisões que valem manter"))}</h2>
      </div>
      <DataTable wrapFirst
        head={[L("Decision", "Decisão"), L("Why", "Por quê")]}
        rows={items} />
    </section>
  );
}

function App() {
  return (
    <>
      <div className="wrap">
        <Hero
          eyebrow={L("Self-review · dossie", "Autorrevisão · dossie")}
          title={L("Dossie Self-Review", "Autorrevisão do Dossie")}
          lede={L(
            "Three findings in the skill's own tooling, found by reading bin/*.py and assets/components.jsx the same way the skill asks you to read any other codebase: trace the real code path, don't trust the comment or the doc until you've run it.",
            "Três achados na própria ferramentação da skill, encontrados lendo bin/*.py e assets/components.jsx do mesmo jeito que a skill pede para você ler qualquer outro código: rastrear o caminho real do código, não confiar no comentário ou na doc até ter rodado.")}
          meta={[
            { k: "repo", v: "dossie" },
            { k: "files", v: "bin/build.py · bin/config.py · assets/components.jsx" }
          ]}
          board={[
            { n: "1", k: L("high", "alto"), sub: L("silent flag override", "flag sobrescrita em silêncio"), tone: "high" },
            { n: "1", k: L("medium", "médio"), sub: L("documented, unimplemented", "documentado, não implementado"), tone: "med" },
            { n: "1", k: L("low", "baixo"), sub: L("stale comment", "comentário desatualizado") },
            { n: "3", k: L("decisions already right", "decisões já corretas"), sub: L("see end of page", "ver fim da página"), tone: "ok" }
          ]} />
      </div>

      <div className="wrap">
        <div className="cols">
          <Spine sections={SECTIONS} title={L("Findings", "Achados")}
            brand="dossie"
            links={[{ href: "#mapa", label: L("What this piece is", "O que esta peça é") }]}
            extra={[{ href: "#ok", title: L("Already right", "Já correto"),
                      sub: L("3 decisions", "3 decisões") }]} />
          <main className="stack">
            <Overview />
            <F1 /><F2 /><F3 />
            <Good />
          </main>
        </div>
      </div>

      <Closing
        eyebrow={L("suggested order", "ordem sugerida")}
        title={L("Where to start", "Por onde começar")}
        intro={L(
          "Ordered by risk removed per size of change. All three are one-line-to-small fixes — none requires a design decision.",
          "Ordenado pela relação entre risco removido e tamanho da mudança. Os três são correções de uma linha a pequenas — nenhum exige decisão de desenho.")}
        rows={[
          { n: "01", what: L(<><b>Finding 01</b> — swap the "slate" sentinel for argparse's own <code>default=None</code>.</>,
                             <><b>Achado 01</b> — trocar a sentinela "slate" pelo próprio <code>default=None</code> do argparse.</>),
                     effort: L("2 lines", "2 linhas") },
          { n: "02", what: L(<><b>Finding 03</b> — fix the stale component list in the header comment.</>,
                             <><b>Achado 03</b> — corrigir a lista de componentes desatualizada no comentário.</>),
                     effort: L("1 line", "1 linha") },
          { n: "03", what: L(<><b>Finding 02</b> — implement <code>issue</code> naming, or drop it from the documented modes until it is.</>,
                             <><b>Achado 02</b> — implementar a nomeação <code>issue</code>, ou tirá-la dos modos documentados até que esteja.</>),
                     effort: L("small feature or a doc edit", "feature pequena ou edição de doc") }
        ]}
        footer={[
          "dossie · bin/ · assets/components.jsx",
          L("static analysis — no file was modified", "análise estática — nenhum arquivo foi alterado")
        ]} />
    </>
  );
}
