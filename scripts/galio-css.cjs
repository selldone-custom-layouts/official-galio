// galio-css.cjs: ports the B "Sundae" mockup's stylesheets (galio-design/g/core.css, b.css and the inner
// pages' shell.css, shop.css, product.css, buy.css, read.css) into
// the Layout as style/galio/*.css, unchanged in look:
//
//   node scripts/galio-css.cjs [<path to galio-design/g>]
//
// - Every rule is scoped to Galio's own markup: the first compound of each selector gets
//   :is(.gl, .gl *) (or :where() for a bare element rule), so a rule matches only an element that is
//   (inside) an element with class "gl" (every Galio component wraps its markup in one); Selldone's
//   and Vuetify's parts outside .gl are never touched, and a later-loaded reset of the same weight
//   (Vuetify's [type=button], Selldone's .ghost) cannot win over a named Galio rule.
// - Custom properties take the --gl- prefix. The token blocks (:root and the dark block) are kept as
//   they are (renamed), so the mockup's tokens stay the single source; the theme switcher writes the
//   palette's action colours inline on <html>, which outranks them.
// - html[data-mode="dark"] -> html.gl-dark (the theme switcher's dark class); html[data-mode] (one.css,
//   "either mode") -> html:root.
// - one.css (14 Nov 2026) is the "one colour family" layer: the Cherry family as plain CSS (light and
//   dark, right on the first paint), the B tokens mapped onto it, every plate, band and sticker from the
//   family. components/galio/galio-family.ts writes the chosen palette's family over it at run time.
// - body -> the .gl root itself, without the page background (the Layout paints the page and the
//   rail's strip itself, style/galio.scss); body::before (the safe-area paint) and the bare html rule
//   are left out (Selldone owns <html>).
// - The mockup's footer theme band (.ts, .ts-*) -> .gts, .gts-* (the kit's ThemeSwitcherRow owns
//   .ts-*); the photo placeholder's caption (.ph-tag, .ph-cam) is left out (never shown in the
//   Layout); the mockup-only note bar is left out; keyframes -> gl-*.
// Re-run after the mockup changes; style/galio/ is generated, never edited.
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const sp = require("postcss-selector-parser");

const SRC = process.argv[2] || path.resolve(__dirname, "../../galio-design/g");
const OUT = path.resolve(__dirname, "../style/galio");
const FILES = ["core", "b", "shell", "shop", "product", "buy", "read", "one"];
const KEYFRAMES = new Map();
const DROP = /^(\.ph-tag|\.ph-cam|\.note-bar)\b/;

const renameVars = (v) => v.replace(/var\(\s*--(?!gl-)([\w-]+)/g, "var(--gl-$1");

/* one px radius -> the Awning scale (pills, 0 and anything that is not a plain px length stay) */
const toScale = (v) =>
  v.replace(/(^|[\s/])(\d*\.?\d+)px\b/g, (m, pre, n) => {
    const x = parseFloat(n);
    if (x === 0 || x >= 200) return m;
    return pre + (x >= 20 ? "28px" : "14px");
  });

function scopeSelector(sel) {
  sel = sel
    .replace(/html\[data-mode=["']?dark["']?\]/g, "html.gl-dark")
    .replace(/html:not\(\[data-mode=["']?dark["']?\]\)/g, "html:not(.gl-dark)")
    // one.css: html[data-mode] means "either mode". html:root weighs as much as html.gl-dark, so its
    // token block (generated after b.css) wins in both modes, as in the mockup.
    .replace(/html\[data-mode\](?!=)/g, "html:root")
    .replace(/\.ts(?=[\s.:,[>+~)]|$)/g, ".gts")
    .replace(/\.ts-/g, ".gts-");
  if (/^\s*(:root|html|html\.gl-dark|html:root)\s*$/.test(sel)) return sel;
  return sp((root) => {
    root.each((selector) => {
      const nodes = selector.nodes;
      const first = selector.first;
      let i = 0;
      if (first && first.type === "tag" && first.value === "html") {
        while (i < nodes.length && nodes[i].type !== "combinator") i++;
        i++;
        if (i >= nodes.length) return;
      }
      if (nodes[i] && nodes[i].type === "tag" && nodes[i].value === "body") {
        const scope = sp.pseudo({ value: ":where" });
        scope.append(sp.selector({ nodes: [sp.className({ value: "gl" })] }));
        nodes[i].replaceWith(scope);
        return;
      }
      let j = i;
      let insertAt = -1;
      while (j < nodes.length && nodes[j].type !== "combinator") {
        if (nodes[j].type === "pseudo" && nodes[j].value.startsWith("::")) {
          insertAt = j;
          break;
        }
        j++;
      }
      if (insertAt < 0) insertAt = j;
      const compound = nodes.slice(i, insertAt);
      const named = compound.some((n) => n.type === "class" || n.type === "attribute" || n.type === "id");
      const where = sp.pseudo({ value: named ? ":is" : ":where" });
      where.append(sp.selector({ nodes: [sp.className({ value: "gl" })] }));
      where.append(sp.selector({ nodes: [sp.className({ value: "gl" }), sp.combinator({ value: " " }), sp.universal()] }));
      if (insertAt < nodes.length) selector.insertBefore(nodes[insertAt], where);
      else selector.append(where);
    });
  }).processSync(sel);
}

const out = [];
for (const name of FILES) {
  const file = path.join(SRC, `${name}.css`);
  if (!fs.existsSync(file)) continue;
  const root = postcss.parse(fs.readFileSync(file, "utf8"), { from: file });
  root.walkAtRules("keyframes", (at) => {
    const n = `gl-${at.params.trim()}`;
    KEYFRAMES.set(at.params.trim(), n);
    at.params = n;
  });
  root.walkRules((rule) => {
    if (rule.parent && rule.parent.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
    let sels = (rule.selectors || []).map((s) => s.trim());
    // Never in the Layout: the safe-area paint, Selldone's <html>, the placeholder captions, the note bar.
    sels = sels.filter((s) => s !== "body::before" && s !== "html" && !DROP.test(s));
    if (!sels.length) {
      rule.remove();
      return;
    }
    if (sels.some((s) => s === "body")) {
      rule.walkDecls(/^background/, (d) => d.remove());
    }
    rule.selectors = sels.map(scopeSelector);
  });
  root.walkDecls((d) => {
    if (d.prop.startsWith("--") && !d.prop.startsWith("--gl-")) d.prop = "--gl-" + d.prop.slice(2);
    d.value = renameVars(d.value);
    // Shape option B "Awning" (1.0.4): every radius on the scale (circle 50%, pill 999px, panel 28px,
    // inner 14px). A fixed px radius goes to the nearest step (20px and up -> 28, under 20 -> 14);
    // 0, percentages, pills and var() tokens stay (the tokens are set in style/galio-shape.scss).
    // A radius that is half the rule's own height or min-height is a pill (the chips' 19px on 38px): 999px.
    if (/^border(-(top|bottom)-(left|right))?-radius$/.test(d.prop) && /^\d*\.?\d+px$/.test(d.value.trim()) && d.parent) {
      const r = parseFloat(d.value);
      let half = false;
      d.parent.each((o) => {
        if (o.type === "decl" && /^(min-)?height$/.test(o.prop) && /^\d*\.?\d+px$/.test(o.value.trim()) && Math.abs(parseFloat(o.value) - 2 * r) <= 1) half = true;
      });
      if (half) d.value = "999px";
    }
    if (/^border(-(top|bottom)-(left|right))?-radius$/.test(d.prop) || /^--gl-r-/.test(d.prop)) d.value = toScale(d.value);
    if (/^animation(-name)?$/.test(d.prop)) for (const [a, b] of KEYFRAMES) d.value = d.value.replace(new RegExp(`\\b${a}\\b`, "g"), b);
  });
  // A media query left empty by the drops goes too.
  root.walkAtRules("media", (at) => {
    if (!at.nodes || !at.nodes.length) at.remove();
  });
  const css = root.toString();
  fs.mkdirSync(OUT, { recursive: true });
  const head = `/* GENERATED by scripts/galio-css.cjs from galio-design/g/${name}.css (the B "Sundae" mockup). Do not edit: change the mockup or style/galio.scss, then re-run. */\n`;
  fs.writeFileSync(path.join(OUT, `${name}.css`), head + css);
  out.push(`${name}.css ${css.length}`);
}
console.log(out.join("\n"));
