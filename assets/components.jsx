/* =========================================================================
   TECH-DECK — BIBLIOTECA DE COMPONENTES (FIXA)
   Nunca reescrever por apresentação. A skill só preenche os dados que
   estes componentes recebem por props.

   Primitivos de desenho: Box, T, Arrow (SVG com tokens de tema)
   Blocos de conteúdo:    Chip, Code, Fig, Panel (collapsible opcional), DataTable
   Canvas interativo:     ErdCanvas (JointJS)
   Estrutura de página:   Hero, Spine, Closing, ThemeToggle, LangToggle, PrintButton
   ========================================================================= */

const { useState, useRef, useEffect, useCallback } = React;

/* ---------- fontes usadas dentro do SVG (lidas do tema) ---------- */
const F_MONO = getComputedStyle(document.documentElement)
  .getPropertyValue("--font-mono").trim() || "ui-monospace, monospace";
const F_SANS = getComputedStyle(document.documentElement)
  .getPropertyValue("--font-sans").trim() || "system-ui, sans-serif";

/* ---------- lê os tokens de cor do tema ativo ---------- */
function readTokens() {
  const cs = getComputedStyle(document.documentElement);
  const g = n => cs.getPropertyValue(n).trim() || "#888";
  return {
    bg: g("--bg"), surface: g("--surface"), surface2: g("--surface-2"),
    line: g("--line"), lineSoft: g("--line-soft"),
    ink: g("--ink"), ink2: g("--ink-2"), ink3: g("--ink-3"),
    accent: g("--accent"), accentBg: g("--accent-bg"),
    crit: g("--crit"), critBg: g("--crit-bg"),
    warn: g("--high"), warnBg: g("--high-bg"),
    med: g("--med"), medBg: g("--med-bg"),
    ok: g("--ok"), okBg: g("--ok-bg")
  };
}

/* Avisa quando o leitor troca de tema — claro/escuro do SO ou botão da página.
   Todo componente que pinta com valores lidos (SVG, JointJS) depende disto. */
function useThemeTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const bump = () => setTick(t => t + 1);
    mq.addEventListener("change", bump);
    const obs = new MutationObserver(bump);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { mq.removeEventListener("change", bump); obs.disconnect(); };
  }, []);
  return tick;
}

/* =========================================================================
   IDIOMA — en | pt | both
   O deck escreve textos bilíngues com L("English", "Português"). Quando o
   deck é monolíngue (nunca chama L), o botão de idioma não aparece.
   ========================================================================= */

const LangCtx = React.createContext({ lang: "en", setLang: null, themeMode: "system" });

/** Par bilíngue. Resolvido por tx() conforme o idioma ativo. */
function L(en, pt) { return { __l: true, en, pt }; }

/** Resolve um valor que pode ser string, JSX ou par L(). */
function tx(v, lang) {
  if (v && v.__l) return lang === "pt" ? v.pt : v.en;
  return v;
}

/** Hook: devolve a função que resolve pares no idioma ativo. */
function useT() {
  const { lang } = React.useContext(LangCtx);
  return React.useCallback(v => tx(v, lang), [lang]);
}

/** Hook: o idioma ativo e o setter, para quem precisa dos dois. */
function useLang() {
  return React.useContext(LangCtx);
}

/* =========================================================================
   CONTROLES — um botão cada, ciclando entre estados
   ========================================================================= */

/* =========================================================================
   CONTROLES — switches de dois lados: o lado aceso é o estado atual
   ========================================================================= */

/**
 * Switch de dois estados. Clicar alterna; o lado aceso é o que vale agora.
 * `a` e `b` são [valor, rótulo].
 */
/* Todo controle interativo de tela (Switch, PrintButton) leva .no-print: um
   switch claro/escuro ou idioma, ou o botão que dispara a impressão, não faz
   sentido na própria página impressa (ver base.css, seção "impressão"). */
function Switch({ a, b, value, onChange, label }) {
  const isB = value === b[0];
  return (
    <button className="sw no-print" role="switch" aria-checked={isB} aria-label={label}
      onClick={() => onChange(isB ? a[0] : b[0])}>
      <span className={"sw-side" + (isB ? "" : " on")}>{a[1]}</span>
      <span className={"sw-side" + (isB ? " on" : "")}>{b[1]}</span>
    </button>
  );
}

/** Tema: claro | escuro. Segue o sistema até o leitor escolher. */
function ThemeToggle({ lang = "en", initial = "system" }) {
  const read = () => {
    try { return localStorage.getItem("deck-theme") || initial; } catch { return initial; }
  };
  const [mode, setMode] = useState(read);

  // "system" não é um lado do switch: é o estado antes da primeira escolha.
  // O switch mostra o que o leitor está vendo de fato.
  const effective = mode !== "system" ? mode
    : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
    try { localStorage.setItem("deck-theme", mode); } catch { /* sem storage, segue */ }
  }, [mode]);

  const pt = lang === "pt";
  return (
    <Switch
      a={["light", pt ? "claro" : "light"]}
      b={["dark", pt ? "escuro" : "dark"]}
      value={effective} onChange={setMode}
      label={pt ? "Tema" : "Theme"} />
  );
}

/** Idioma: EN | PT. Só aparece quando o deck é bilíngue. */
function LangToggle({ lang, setLang }) {
  return (
    <Switch a={["en", "EN"]} b={["pt", "PT"]}
      value={lang} onChange={setLang}
      label={lang === "pt" ? "Idioma" : "Language"} />
  );
}

/**
 * Botão que abre todo <Panel collapsible> da página antes de chamar
 * window.print() — sem isso, um painel fechado imprime vazio (um <details>
 * fechado não renderiza o conteúdo nem no papel). Os dois
 * requestAnimationFrame encadeados dão tempo do navegador refazer o layout
 * depois de abrir os <details> e antes do print() medir caixas — testado via
 * Page.printToPDF do protocolo de depuração do Chrome.
 */
function PrintButton({ lang = "en" }) {
  const print = () => {
    document.querySelectorAll("details.collapsible").forEach(d => { d.open = true; });
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  };
  return (
    <button className="print-btn no-print" onClick={print}
      aria-label={lang === "pt" ? "Imprimir / salvar em PDF" : "Print / save as PDF"}>
      PDF
    </button>
  );
}

/* =========================================================================
   BLOCOS DE CONTEÚDO
   ========================================================================= */

function Chip({ level, children }) {
  return <span className={"chip " + level}>{children}</span>;
}

/**
 * Marca de cronologia para dentro de `.f-head` (`<Mark>{s.compact}</Mark>`,
 * mesmo `compact` passado a `<Spine sections>`). Some em qualquer largura
 * exceto telefone (<480px) — é o par complementar à timeline do `<Spine>`:
 * lá a cronologia vive só no índice (telas largas) ou só aqui, dentro do
 * card (telefone), nunca nos dois ao mesmo tempo. Sem isso, a tela estreita
 * mostraria a mesma data duas vezes — uma no índice compacto, outra no
 * corpo do card logo abaixo.
 */
function Mark({ children }) {
  return <span className="f-mark">{children}</span>;
}

/** Bloco de código com numeração real do arquivo e linhas destacadas. */
function Code({ path, lang = "", start = 1, lines, hl = [], good = [], note }) {
  const t = useT();
  return (
    <div className="code">
      <div className="code-head">
        <span className="path">{t(path)}</span>
        {lang && <span>{lang}</span>}
      </div>
      <div className="code-body">
        <table>
          <tbody>
            {lines.map((src, i) => {
              const n = start + i;
              const cls = hl.includes(n) ? "hl" : good.includes(n) ? "good" : "";
              return (
                <tr key={n} className={cls}>
                  <td className="ln">{n}</td>
                  <td className="src">{src === "" ? " " : src}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {note && <div className="code-note">{t(note)}</div>}
    </div>
  );
}

function Fig({ id, caption, children }) {
  const t = useT();
  return (
    <figure className="fig">
      <div className="fig-scroll">{children}</div>
      <figcaption className="fig-cap"><b>{id}</b>{t(caption)}</figcaption>
    </figure>
  );
}

/**
 * `collapsible` renderiza <details>/<summary> nativo em vez de <div> — abre e
 * fecha sem JS, e some com um marcador +/− (CSS puro, ver base.css). Toda
 * peça impressa via PrintButton força esses painéis abertos antes de
 * window.print() (ver seção "Impressão" de references/components.md) — um
 * painel collapsible nunca deve esconder conteúdo essencial à leitura em
 * papel, só o que é opcional/expansível na tela.
 */
function Panel({ title, tone = "", collapsible = false, children }) {
  const t = useT();
  if (collapsible) {
    return (
      <details className={"panel collapsible " + tone}>
        <summary><h4>{t(title)}</h4></summary>
        {children}
      </details>
    );
  }
  return <div className={"panel " + tone}><h4>{t(title)}</h4>{children}</div>;
}

function DataTable({ head, rows, wrapFirst = false }) {
  const t = useT();
  return (
    <div className="tbl-wrap">
      <table className="data">
        <thead><tr>{head.map((h, i) => <th key={i}>{t(h)}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={j === 0 ? "mono" : ""}
                  style={j === 0 && wrapFirst ? { whiteSpace: "normal" } : undefined}>{t(c)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================================
   PRIMITIVOS SVG
   ========================================================================= */

/** Caixa do diagrama. tone: neutral | bad | good | warn | accent | ghost */
function Box({ x, y, w, h, tone = "neutral", r = 5, dashed = false }) {
  const map = {
    neutral: ["var(--surface)", "var(--line)"],
    bad:     ["var(--crit-bg)", "var(--crit)"],
    good:    ["var(--ok-bg)",   "var(--ok)"],
    warn:    ["var(--high-bg)", "var(--high)"],
    accent:  ["var(--accent-bg)", "var(--accent)"],
    ghost:   ["transparent",    "var(--line)"]
  };
  const [fill, stroke] = map[tone] || map.neutral;
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke}
    strokeWidth="1.2" strokeDasharray={dashed ? "4 3" : undefined} />;
}

/** Texto do diagrama. */
function T({ x, y, children, size = 11.5, mono = true, fill = "var(--ink)",
  weight = 400, anchor = "middle" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontFamily={mono ? F_MONO : F_SANS}
      fontSize={size} fontWeight={weight} fill={fill}>{children}</text>
  );
}

/** Seta reta com ponta. */
function Arrow({ x1, y1, x2, y2, color = "var(--ink-3)", dashed = false }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = x2 - Math.cos(a) * 7, hy = y2 - Math.sin(a) * 7;
  const s = 4;
  const p = [
    [x2, y2],
    [hx - Math.sin(a) * s, hy + Math.cos(a) * s],
    [hx + Math.sin(a) * s, hy - Math.cos(a) * s]
  ].map(q => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" ");
  return (
    <g>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth="1.3"
        strokeDasharray={dashed ? "4 3" : undefined} />
      <polygon points={p} fill={color} />
    </g>
  );
}

/* =========================================================================
   ERD CANVAS — JointJS (@joint/core 4.1.3, MPL-2.0, ~5,4k estrelas)
   Padrão do demo "Data Modeling / Database" de jointjs.com/demos.
   Recebe tudo por props: trocar `tables`/`links` desenha outro diagrama
   sem tocar neste componente.
   ========================================================================= */
function ErdCanvas({ tables, links, figId = "Fig. 0", emptyHint, sections = [] }) {
  const t = useT();
  const { lang } = useLang();
  const stageRef = useRef(null);
  const paperRef = useRef(null);
  const [picked, setPicked] = useState(null);
  const tick = useThemeTick();

  useEffect(() => {
    const joint = window.joint;
    const el = stageRef.current;
    if (!joint || !el) return;
    const t = readTokens();

    // Host descartável: paper.remove() apaga o próprio elemento, então ele não
    // pode ser um nó que o React controla — senão a remontagem (troca de tema)
    // encontraria o container já destruído e o canvas ficaria vazio.
    const host = document.createElement("div");
    host.className = "erd-paper";
    el.appendChild(host);

    const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
    const paper = new joint.dia.Paper({
      el: host, model: graph, cellViewNamespace: joint.shapes,
      width: "100%", height: "100%", gridSize: 1,
      background: { color: t.surface },
      interactive: { elementMove: true, linkMove: false, labelMove: false },
      defaultRouter: { name: "manhattan", args: { padding: 18 } },
      defaultConnector: { name: "rounded", args: { radius: 6 } }
    });
    paperRef.current = paper;

    // Shape próprio em vez de standard.HeaderedRectangle: markup explícito dá
    // controle total do posicionamento, sem herdar os refX/refY dos defaults.
    const ErdTable = joint.dia.Element.define("erd.Table", {}, {
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "rect", selector: "head" },
        { tagName: "text", selector: "hname" },
        { tagName: "text", selector: "cols" }
      ]
    });
    const HEAD = 26, LH = 13.2, PADX = 11;

    tables.forEach(tb => {
      const h = HEAD + tb.cols.length * LH + 12;
      const bg = tb.tone === "accent" ? t.accentBg : tb.tone === "warn" ? t.warnBg
        : tb.tone === "bad" ? t.critBg : tb.tone === "good" ? t.okBg : t.surface;
      const bd = tb.tone === "accent" ? t.accent : tb.tone === "warn" ? t.warn
        : tb.tone === "bad" ? t.crit : tb.tone === "good" ? t.ok : t.line;
      const headInk = (!tb.tone || tb.tone === "plain") ? t.ink : t.surface;

      const node = new ErdTable({
        id: tb.id,
        position: { x: tb.x, y: tb.y },
        size: { width: tb.w, height: h },
        attrs: {
          root: { title: tb.name },
          body: { x: 0, y: 0, width: tb.w, height: h, rx: 5, ry: 5,
            fill: bg, stroke: bd, strokeWidth: 1.2 },
          head: { x: 0, y: 0, width: tb.w, height: HEAD, rx: 5, ry: 5,
            fill: bd, stroke: bd, strokeWidth: 1.2 },
          hname: { x: PADX, y: HEAD / 2, text: tb.name, fill: headInk,
            fontFamily: F_MONO, fontSize: 11.2, fontWeight: 600,
            textAnchor: "start", textVerticalAnchor: "middle" },
          cols: { x: PADX, y: HEAD + 10, text: tb.cols.join("\n"), fill: t.ink2,
            fontFamily: F_MONO, fontSize: 9.3, lineHeight: LH,
            textAnchor: "start", textVerticalAnchor: "top" }
        }
      });
      node.prop("erd", tb);
      graph.addCell(node);
    });

    links.forEach(lk => {
      const color = lk.warn ? t.warn : t.ink3;
      graph.addCell(new joint.shapes.standard.Link({
        source: { id: lk.from }, target: { id: lk.to },
        attrs: {
          line: {
            stroke: color, strokeWidth: 1.4,
            strokeDasharray: lk.dashed ? "5 4" : null,
            targetMarker: { type: "path", d: "M 9 -4 0 0 9 4 z", fill: color, stroke: "none" }
          }
        },
        labels: [{
          position: { distance: 0.5 },
          attrs: {
            labelBody: { ref: "labelText", fill: t.surface, stroke: t.line, strokeWidth: 1,
              rx: 3, ry: 3, x: "calc(x - 5)", y: "calc(y - 3)",
              width: "calc(w + 10)", height: "calc(h + 6)" },
            labelText: { text: lk.note ? lk.label + " · " + lk.note : lk.label,
              fill: lk.warn ? t.warn : t.ink3, fontFamily: F_MONO, fontSize: 8.6,
              textAnchor: "middle", textVerticalAnchor: "middle" }
          },
          markup: [
            { tagName: "rect", selector: "labelBody" },
            { tagName: "text", selector: "labelText" }
          ]
        }]
      }));
    });

    paper.on("element:pointerclick", view => setPicked(view.model.prop("erd")));
    paper.on("blank:pointerclick", () => setPicked(null));

    // Pan arrastando o fundo.
    let panning = null;
    paper.on("blank:pointerdown", evt => {
      panning = { x: evt.clientX, y: evt.clientY, t: paper.translate() };
      el.classList.add("drag");
    });
    const move = e => {
      if (!panning) return;
      paper.translate(panning.t.tx + (e.clientX - panning.x), panning.t.ty + (e.clientY - panning.y));
    };
    const up = () => { panning = null; el.classList.remove("drag"); };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);

    const fit = () => paper.transformToFitContent({ padding: 26, maxScale: 1, minScale: 0.3 });
    fit();
    const ro = new ResizeObserver(() => { paper.setDimensions("100%", "100%"); fit(); });
    ro.observe(el);

    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      ro.disconnect();
      paper.remove();
      if (host.parentNode) host.parentNode.removeChild(host);
    };
  }, [tick, tables, links]);

  const zoom = useCallback(k => {
    const p = paperRef.current;
    if (!p) return;
    const s = Math.min(1.8, Math.max(0.3, p.scale().sx * k));
    p.scale(s, s);
  }, []);
  const fit = useCallback(() => {
    const p = paperRef.current;
    if (p) p.transformToFitContent({ padding: 26, maxScale: 1, minScale: 0.3 });
  }, []);

  return (
    <figure className="erd">
      <div className="erd-bar">
        <span className="hint">{t(L(
          "click a box for details · drag to move · drag the background to pan",
          "clique numa caixa para o detalhe · arraste para mover · arraste o fundo para navegar"))}</span>
        <button className="erd-btn" onClick={() => zoom(1.25)}
          aria-label={lang === "pt" ? "Aproximar" : "Zoom in"}>+</button>
        <button className="erd-btn" onClick={() => zoom(0.8)}
          aria-label={lang === "pt" ? "Afastar" : "Zoom out"}>−</button>
        <button className="erd-btn" onClick={fit}>{lang === "pt" ? "ajustar" : "fit"}</button>
      </div>
      <div className="erd-stage" ref={stageRef} />
      <div className="erd-legend">
        <span><i style={{ background: "var(--accent-bg)", borderColor: "var(--accent)" }} />
          {t(L("primary focus", "destaque principal"))}</span>
        <span><i style={{ background: "var(--high-bg)", borderColor: "var(--high)" }} />
          {t(L("needs attention", "ponto de atenção"))}</span>
        <span><i style={{ background: "var(--surface)", borderColor: "var(--line)" }} />
          {t(L("no open finding", "sem achado aberto"))}</span>
        <span>{t(L("dashed · relation not mapped", "linha tracejada · relação não mapeada"))}</span>
      </div>
      <figcaption className="erd-detail">
        {picked ? (
          <div>
            <div className="dt-name">{picked.name}</div>
            <p className="dt-role">{t(picked.role)}</p>
            <ul>
              {(picked.notes || []).map((n, i) => (
                <li key={i}>
                  {(n.__l ? (lang === "pt" ? n.pt : n.en) : n).map((part, j) => j % 2
                    ? <code key={j}>{part}</code>
                    : <span key={j}>{part}</span>)}
                </li>
              ))}
            </ul>
            {(picked.refs || []).length > 0 && (
              <div className="erd-links">
                {picked.refs.map(r => {
                  const f = sections.find(x => x.id === r);
                  return f
                    ? <a key={r} href={"#" + r}><Chip level={f.level}>{f.rank} {t(f.short)} →</Chip></a>
                    : null;
                })}
              </div>
            )}
          </div>
        ) : (
          <p className="erd-empty">{figId} — {t(emptyHint)}</p>
        )}
      </figcaption>
    </figure>
  );
}

/* =========================================================================
   ESTRUTURA DE PÁGINA
   ========================================================================= */

/**
 * Envolve a página inteira: mantém o estado de idioma e o publica no contexto.
 * O deck escreve <Deck>{(lang, setLang) => <App .../>}</Deck> ou simplesmente
 * usa <Deck> e lê o idioma com useT() nos componentes internos.
 */
function Deck({ defaultLang = "en", bilingual = false, themeMode = "system", children }) {
  const read = () => {
    if (!bilingual) return defaultLang;
    try { return localStorage.getItem("deck-lang") || defaultLang; } catch { return defaultLang; }
  };
  const [lang, setLang] = useState(read);
  useEffect(() => {
    if (bilingual) {
      try { localStorage.setItem("deck-lang", lang); } catch { /* sem storage, segue */ }
    }
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang, bilingual]);
  const value = React.useMemo(
    () => ({ lang, setLang: bilingual ? setLang : null, themeMode }),
    [lang, bilingual, themeMode]);
  return (
    <LangCtx.Provider value={value}>
      {typeof children === "function" ? children(lang, setLang) : children}
    </LangCtx.Provider>
  );
}

function Hero({ eyebrow, title, lede, meta = [], board = [] }) {
  const t = useT();
  return (
    <header className="hero">
      <div className="eyebrow">{t(eyebrow)}</div>
      <h1>{t(title)}</h1>
      <p className="lede">{t(lede)}</p>
      {meta.length > 0 && (
        <div className="meta-row">
          {meta.map((m, i) => (
            <span className="meta" key={i}>{t(m.k)} <b>{m.v}</b></span>
          ))}
        </div>
      )}
      {board.length > 0 && (
        <div className="board">
          {board.map((c, i) => (
            <div className="board-cell" key={i}>
              <span className="n" style={c.tone ? { color: "var(--" + c.tone + ")" } : undefined}>{c.n}</span>
              <span className="k">{t(c.k)}</span>
              <span className="sub">{t(c.sub)}</span>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

/**
 * Coluna lateral: marca, switches, índice. É a navegação inteira da peça —
 * não há barra no topo, que truncava os links em qualquer largura real.
 * `links` são atalhos fora do índice numerado (o mapa, "já correto").
 * `printable` acrescenta o PrintButton na mesma linha dos switches.
 *
 * Cada entrada de `sections`/`extra` aceita um `compact` opcional (string
 * curta, ex. só o ano de um período) — abaixo de 480px o índice vira uma
 * timeline vertical (um marcador por item, ligado por uma linha) e mostra
 * `compact` no lugar do rótulo por extenso. Sem `compact` em nenhuma
 * entrada, o índice não ativa o modo timeline e se comporta como sempre.
 */
function Spine({ sections, title, extra = [], brand, links = [], printable = false }) {
  const t = useT();
  const { lang, setLang, themeMode } = useLang();
  const hasCompact = sections.some(s => s.compact) || extra.some(e => e.compact);
  return (
    <aside className="spine">
      <div className="spine-head">
        {brand && <span className="brandmark"><span className="dot" />{brand}</span>}
        <div className="controls">
          {printable && <PrintButton lang={lang} />}
          {setLang && <LangToggle lang={lang} setLang={setLang} />}
          <ThemeToggle lang={lang} initial={themeMode} />
        </div>
      </div>
      {links.length > 0 && (
        <div className="spine-nav">
          {links.map(l => (
            <a className="spine-link" href={l.href} key={l.href}>{t(l.label)}</a>
          ))}
        </div>
      )}
      <div className="spine-title">{t(title)}</div>
      <div className={"spine-nav" + (hasCompact ? " timeline" : "")}>
        {sections.map(s => (
          <a className="spine-item" href={"#" + s.id} key={s.id}>
            <span className="spine-rank">{s.rank}</span>
            <span className="spine-txt"><b>{t(s.short)}</b>{t(s.sev)}</span>
            {s.compact && <span className="spine-compact">{t(s.compact)}</span>}
          </a>
        ))}
        {extra.map(e => (
          <a className="spine-item" href={e.href} key={e.href}>
            <span className="spine-rank">—</span>
            <span className="spine-txt"><b>{t(e.title)}</b>{t(e.sub)}</span>
            {e.compact && <span className="spine-compact">{t(e.compact)}</span>}
          </a>
        ))}
      </div>
    </aside>
  );
}

function Closing({ eyebrow, title, intro, rows, footer = [] }) {
  const t = useT();
  return (
    <section className="closing wrap">
      <div className="eyebrow">{t(eyebrow)}</div>
      <h2>{t(title)}</h2>
      <p className="body-p">{t(intro)}</p>
      <div className="order">
        {rows.map(r => (
          <div className="order-row" key={r.n}>
            <span className="step">{r.n}</span>
            <span className="what">{t(r.what)}</span>
            <span className="effort">{t(r.effort)}</span>
          </div>
        ))}
      </div>
      <footer>{footer.map((f, i) => <span key={i}>{t(f)}</span>)}</footer>
    </section>
  );
}
