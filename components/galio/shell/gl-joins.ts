/*
 * Galio — the rounded joins of shape option B "Awning" (galio-design/BUILD-AWNING.md, rule 5).
 *
 * Beside the rail (1100px and wider) the full-bleed bands keep their straight ends, but where a band
 * meets the rail with white page above or below it, a 28px rounded join (a fillet in the band's own
 * colour, style/galio-shape.scss) eases the corner, so nothing square meets a curve.
 *
 * Which ends need a join depends on what is drawn around the band, and Galio's home sections empty
 * themselves from the shop's live data (no posts, no journal), and a merchant's shop may have other
 * pages. So the joins are not written per section: after each render this reads the page as drawn.
 * The full-bleed blocks of the main view and the footer (a block runs from the rail to the far edge of
 * the window) are taken in order; a block whose ground is not the page's is a band; a band gets
 * data-gl-join="top" when white page (or nothing full-bleed) is above it, "bottom" when white page is
 * below it, and --gl-join-fill = its own colour. The page-title band (the awning, .ptitle) and the
 * very top and bottom of the page get none. Under 1100px nothing is marked (no rail).
 */

const ATTR = "data-gl-join";

function rgba(c: string): number[] | null {
  const m = c && c.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return [v[0], v[1], v[2], v[3] == null ? 1 : v[3]];
}
const same = (a: number[], b: number[]) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 6;

interface Block {
  el: HTMLElement;
  top: number;
  bottom: number;
  band: string | null;
}

/** Mark the bands' joins on the page as drawn now. */
export function markJoins(): void {
  const marked = document.querySelectorAll<HTMLElement>(`[${ATTR}]`);
  const rail = document.querySelector<HTMLElement>(".gl-shell .side");
  const main = document.querySelector<HTMLElement>(".v-main");
  const clear = () => marked.forEach((el) => (el.removeAttribute(ATTR), el.style.removeProperty("--gl-join-fill")));
  if (!rail || !main || window.innerWidth < 1100) return clear();
  const rr = rail.getBoundingClientRect();
  if (!rr.width) return clear();
  const W = document.documentElement.clientWidth;
  const ltr = rr.left < W / 2;
  const near = ltr ? rr.right : rr.left;
  const far = ltr ? W : 0;
  const fullBleed = (r: DOMRect) => r.height >= 1 && (ltr ? r.left <= near + 1 && r.right >= far - 1 : r.right >= near - 1 && r.left <= far + 1);
  const pageBg = rgba(getComputedStyle(main).backgroundColor) || [255, 255, 255, 1];
  const scrollY = window.scrollY;

  /* the outermost full-bleed blocks that hold no full-bleed block themselves, or have a ground of their own */
  const blocks: Block[] = [];
  const visit = (parent: Element) => {
    for (const child of Array.from(parent.children) as HTMLElement[]) {
      const r = child.getBoundingClientRect();
      if (!fullBleed(r)) continue;
      const s = getComputedStyle(child);
      if (s.position === "fixed" || s.display === "none") continue;
      const bg = rgba(s.backgroundColor);
      const own = !!bg && bg[3] > 0.5 && !same(bg, pageBg);
      const inner = Array.from(child.children).some((k) => fullBleed(k.getBoundingClientRect()));
      if (!own && inner) {
        visit(child);
        continue;
      }
      blocks.push({ el: child, top: r.top + scrollY, bottom: r.bottom + scrollY, band: own ? s.backgroundColor : null });
    }
  };
  visit(main);
  const foot = document.querySelector<HTMLElement>(".gl .foot");
  if (foot && fullBleed(foot.getBoundingClientRect())) {
    const r = foot.getBoundingClientRect();
    blocks.push({ el: foot, top: r.top + scrollY, bottom: r.bottom + scrollY, band: getComputedStyle(foot).backgroundColor });
  }
  blocks.sort((a, b) => a.top - b.top);
  const pageTop = main.getBoundingClientRect().top + scrollY;
  const pageBottom = document.documentElement.scrollHeight;

  const want = new Map<HTMLElement, { joins: string[]; fill: string }>();
  blocks.forEach((b, i) => {
    if (!b.band) return;
    const joins: string[] = [];
    const prev = blocks[i - 1];
    const next = blocks[i + 1];
    const bandAbove = prev && prev.band && prev.bottom >= b.top - 1;
    const bandBelow = next && next.band && next.top <= b.bottom + 1;
    const awning = b.el.classList.contains("ptitle");
    if (!bandAbove && !awning && b.top > pageTop + 1) joins.push("top");
    if (!bandBelow && !awning && b.bottom < pageBottom - 1) joins.push("bottom");
    if (joins.length) want.set(b.el, { joins, fill: b.band });
  });
  marked.forEach((el) => {
    if (!want.has(el)) {
      el.removeAttribute(ATTR);
      el.style.removeProperty("--gl-join-fill");
    }
  });
  want.forEach(({ joins, fill }, el) => {
    const v = joins.join(" ");
    if (el.getAttribute(ATTR) !== v) el.setAttribute(ATTR, v);
    if (el.style.getPropertyValue("--gl-join-fill") !== fill) el.style.setProperty("--gl-join-fill", fill);
  });
}

let booted = false;

/** Keep the joins right: after every change in the main view or the footer, a resize, and a theme change. */
export function bootJoins(): void {
  if (booted || typeof window === "undefined") return;
  booted = true;
  let frame = 0;
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(() => ((frame = 0), markJoins()));
  };
  const watch = () => {
    const main = document.querySelector(".v-main");
    if (!main) return setTimeout(watch, 300);
    const mo = new MutationObserver((list) => {
      /* our own marks are attribute changes, never childList: no loop */
      if (list.some((m) => m.type === "childList")) schedule();
    });
    mo.observe(main, { childList: true, subtree: true });
    const frame0 = main.parentElement;
    if (frame0) mo.observe(frame0, { childList: true });
    new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-ts-palette"] });
    window.addEventListener("resize", schedule, { passive: true });
    /* late photos and fonts change heights */
    window.addEventListener("load", schedule);
    document.fonts?.ready?.then(schedule).catch(() => {});
    schedule();
    setTimeout(schedule, 1500);
  };
  watch();
}
