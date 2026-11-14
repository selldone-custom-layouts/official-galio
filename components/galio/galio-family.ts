/*
 * Galio — the "one colour family" (the owner, 14 November 2026: too many unrelated colours, no single
 * theme colour; approved "one colour family that follows the chosen theme"). The spec is the mockups
 * galio-design/home-one-*.html and product-one-*.html, their code galio-design/g/family.js (ported here)
 * and g/one.css (generated into style/galio/one.css by scripts/galio-css.cjs).
 *
 * Every colour on a page comes from ONE hue, the chosen palette's, plus white and the family's
 * near-black. The scale keeps the hue (OKLCH) and caps the chroma:
 *   light  fam-50 L .985 C≤.012 · fam-100 .962/.025 · fam-200 .925/.045 · fam-300 .86/.07 · ink-bg .24/.035
 *   dark   fam-50 L .19 · fam-100 .22 · fam-200 .26 · fam-300 .31 (C≤.035) · ink-bg .15
 * The hue comes from the palette's own colour (the presets' seeds, the visitor's Custom colour, or the
 * merchant's brandColor in galio-theme.settings.ts). The values go on <html> as --gl-fam-* / --gl-on-ink-*
 * for the current mode; style/galio/one.css carries the Cherry values as plain CSS, so the first paint is
 * right before this runs, and maps Galio's tokens (bands, plates, rail, footer, sticker, note…) onto them.
 * The theme switcher keeps writing the action colour (--gl-act*); this follows its palette and mode.
 */
import { watch } from "vue";
import { themeState } from "../theme-switcher/theme-switcher";
import { THEME_SETTINGS } from "./galio-theme.settings";

/* ───────── OKLCH helpers (the same maths as the switcher's theme-color.ts) ───────── */
function normalizeHex(value: string | null | undefined): string | null {
  const m = String(value || "")
    .trim()
    .match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return "#" + h.toLowerCase();
}
const toRgb = (hex: string): number[] => [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16));
const toHex = (rgb: number[]): string => "#" + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");
const lin = (v: number): number => ((v /= 255) <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string): number {
  let x = luminance(a);
  let y = luminance(b);
  if (y > x) [x, y] = [y, x];
  return (x + 0.05) / (y + 0.05);
}
function hexToOklch(hex: string): [number, number, number] {
  const [r, g, b] = toRgb(hex).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.sqrt(A * A + B * B), Math.atan2(B, A)];
}
function oklchToLinear(L: number, C: number, h: number): number[] {
  const A = C * Math.cos(h);
  const B = C * Math.sin(h);
  const l = Math.pow(L + 0.3963377774 * A + 0.2158037573 * B, 3);
  const m = Math.pow(L - 0.1055613458 * A - 0.0638541728 * B, 3);
  const s = Math.pow(L - 0.0894841775 * A - 1.291485548 * B, 3);
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
const inGamut = (rgb: number[]): boolean => rgb.every((v) => v >= -1e-5 && v <= 1 + 1e-5);
const encode = (v: number): number => {
  v = Math.min(1, Math.max(0, v));
  return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
};
/* The colour at lightness L and chroma C on hue h; the chroma shrinks until it fits sRGB. */
function at(L: number, C: number, h: number): string {
  L = Math.min(1, Math.max(0, L));
  let c = C;
  if (!inGamut(oklchToLinear(L, c, h))) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear(L, mid, h))) lo = mid;
      else hi = mid;
    }
    c = lo;
  }
  return toHex(oklchToLinear(L, c, h).map(encode));
}
const rgba = (hex: string, a: number): string => {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export type FamilyValues = Record<string, string>;
const cache: Record<string, { light: FamilyValues; dark: FamilyValues }> = {};

/** The family of one colour, for both modes (the names are the CSS variables without "--gl-"). */
export function family(input: string): { light: FamilyValues; dark: FamilyValues } {
  const hex = normalizeHex(input) || "#a3213f";
  if (cache[hex]) return cache[hex];
  const o = hexToOklch(hex);
  const C0 = o[1] < 0.002 ? 0 : o[1];
  const h = o[2];
  /* keep the hue, cap the chroma (a grey colour gives a grey family) */
  const f = (L: number, cap: number) => at(L, Math.min(C0, cap), h);
  /* walk the lightness until test() passes (step < 0 = darker) */
  const walk = (L: number, cap: number, step: number, test: (x: string) => boolean) => {
    let x = f(L, cap);
    for (let i = 0; i < 300 && !test(x); i++) x = f((L += step), cap);
    return x;
  };
  const Lt: FamilyValues = {
    "fam-50": f(0.985, 0.012),
    "fam-100": f(0.962, 0.025),
    "fam-200": f(0.925, 0.045),
    "fam-300": f(0.86, 0.07),
    "fam-ink-bg": f(0.24, 0.035),
    "fam-bg": "#ffffff",
    "fam-surface": "#ffffff",
  };
  const Dk: FamilyValues = {
    "fam-50": f(0.19, 0.014),
    "fam-100": f(0.22, 0.022),
    "fam-200": f(0.26, 0.03),
    "fam-300": f(0.31, 0.035),
    "fam-ink-bg": f(0.15, 0.03),
    "fam-bg": f(0.17, 0.012),
    "fam-surface": f(0.2, 0.016),
  };
  /* words: near-neutral, the hue taken lightly (C ≤ .02); muted reads 4.5:1 on every family ground it sits on */
  Lt["fam-ink"] = walk(0.25, 0.02, -0.004, (x) => contrast(x, Lt["fam-300"]) >= 7);
  Lt["fam-muted"] = walk(0.48, 0.02, -0.004, (x) => contrast(x, Lt["fam-200"]) >= 4.6);
  Lt["fam-line"] = f(0.905, 0.025);
  Lt["fam-leader"] = f(0.72, 0.04);
  Dk["fam-ink"] = walk(0.955, 0.015, 0.004, (x) => contrast(x, Dk["fam-300"]) >= 7);
  Dk["fam-muted"] = walk(0.8, 0.02, 0.004, (x) => contrast(x, Dk["fam-300"]) >= 4.6);
  Dk["fam-line"] = f(0.3, 0.02);
  Dk["fam-leader"] = f(0.5, 0.03);

  /* the dark bars (rail, top bar, banner band, footer, phone buy bar) look the same in both modes */
  const onInk = f(0.975, 0.015);
  const onMuted = f(0.84, 0.03);
  const hi = Lt["fam-300"];
  /* the brand on those bars (wordmark dot, banner script on phones): full chroma, 7:1 on the bar */
  let La = Math.max(o[0], 0.7);
  let act = at(La, C0, h);
  for (let i = 0; i < 300 && contrast(act, Lt["fam-ink-bg"]) < 7; i++) act = at((La += 0.002), C0, h);
  for (const v of [Lt, Dk]) Object.assign(v, { "on-ink": onInk, "on-ink-muted": onMuted, "on-ink-hi": hi, "on-ink-act": act });
  Lt["on-ink-line"] = f(0.4, 0.035);
  Lt["on-ink-field"] = f(0.3, 0.035);
  Dk["on-ink-line"] = f(0.32, 0.03);
  Dk["on-ink-field"] = f(0.22, 0.03);

  /* the photo slots' painted ground (real photos replace it), in the family's hue */
  const ph = f(0.33, 0.045);
  const art =
    `radial-gradient(110% 90% at 82% 38%, ${rgba(f(0.86, 0.07), 0.7)}, transparent 60%), radial-gradient(60% 50% at 66% 92%, ${rgba(f(0.93, 0.045), 0.5)}, transparent 70%), ` +
    `linear-gradient(100deg, ${f(0.29, 0.04)} 0%, ${ph} 36%, ${f(0.55, 0.07)} 72%, ${f(0.77, 0.06)} 100%)`;
  for (const v of [Lt, Dk]) Object.assign(v, { "fam-ph": ph, "fam-ph-art": art });
  Lt["fam-ph-tag-bg"] = "rgba(255, 255, 255, 0.94)";
  Dk["fam-ph-tag-bg"] = rgba(Dk["fam-bg"], 0.9);
  Lt["fam-scrim"] = rgba(f(0.16, 0.02), 0.46);
  Dk["fam-scrim"] = rgba(f(0.1, 0.02), 0.6);

  /* the drawn map: land, water, roads and parks in the family */
  Object.assign(Lt, { "fam-map-land": Lt["fam-50"], "fam-map-water": Lt["fam-300"], "fam-map-road": "#ffffff", "fam-map-road2": Lt["fam-100"], "fam-map-park": Lt["fam-200"] });
  Object.assign(Dk, { "fam-map-land": f(0.21, 0.016), "fam-map-water": f(0.3, 0.035), "fam-map-road": f(0.29, 0.02), "fam-map-road2": f(0.245, 0.018), "fam-map-park": f(0.25, 0.03) });

  return (cache[hex] = { light: Lt, dark: Dk });
}

/** The colour each tested palette's family is built from (the mockups' PRESETS). */
export const FAMILY_SEEDS: Record<string, string> = { cherry: "#a3213f", pistachio: "#4e7a3a", blueberry: "#2f5fb3", cocoa: "#7a4a2c" };

/** The colour of the palette on the page now: a preset's seed, the Custom pick, or the merchant's brand colour. */
export function familySeed(): string {
  const root = document.documentElement;
  const id = root.dataset.tsPalette || themeState.palette || THEME_SETTINGS.palette || "cherry";
  if (id === "custom") return normalizeHex(themeState.custom) || FAMILY_SEEDS.cherry;
  if (id === "brand") return normalizeHex(THEME_SETTINGS.brandColor) || FAMILY_SEEDS.cherry;
  return FAMILY_SEEDS[id] || normalizeHex(THEME_SETTINGS.brandColor) || FAMILY_SEEDS.cherry;
}

let painted: Record<string, string> = {};
let vuetifyRef: any = null;

/** Write the family of the current palette and mode on <html> (only what changed). */
export function paintFamily(): void {
  const root = document.documentElement;
  const dark = root.classList.contains("gl-dark");
  const all = family(familySeed());
  const v = dark ? all.dark : all.light;
  for (const [k, val] of Object.entries(v)) {
    if (painted[k] === val) continue;
    root.style.setProperty("--gl-" + k, val);
    painted[k] = val;
  }
  /* Selldone's own dialogs, menus and fields (Vuetify) sit on the family too */
  try {
    const themes = vuetifyRef?.theme?.themes?.value;
    if (themes?.dark) {
      const d = all.dark;
      Object.assign(themes.dark.colors, {
        background: d["fam-bg"],
        surface: d["fam-surface"],
        "surface-bright": d["fam-100"],
        "surface-variant": d["fam-300"],
        "on-background": d["fam-ink"],
        "on-surface": d["fam-ink"],
        "on-surface-variant": d["fam-muted"],
        secondary: d["on-ink-act"],
        "on-secondary": d["fam-bg"],
        info: d["on-ink-act"],
        warning: d["on-ink-hi"],
      });
    }
    if (themes?.light) {
      const l = all.light;
      Object.assign(themes.light.colors, { "on-background": l["fam-ink"], "on-surface": l["fam-ink"], secondary: l["fam-ink-bg"], "on-secondary": "#ffffff" });
    }
  } catch {
    /* Vuetify not ready: the page's own colours are already set */
  }
}

/** Call once, right after bootThemeSwitcher(): paints now and follows every palette, mode and Custom change. */
export function bootFamily(vuetifyInstance?: any): void {
  vuetifyRef = vuetifyInstance || null;
  painted = {};
  paintFamily();
  try {
    new MutationObserver(() => paintFamily()).observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-ts-palette", "data-ts-mode"] });
  } catch {
    /* no observer (prerender): the first paint stays */
  }
  watch(
    () => [themeState.palette, themeState.mode, themeState.custom],
    () => paintFamily(),
    { flush: "post" },
  );
}
