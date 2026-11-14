/*
 * Galio Sundae — the theme switcher's config (the footer's Theme row; the owner's rules: colour
 * palettes, a custom colour and Light / Dark, a click changes the whole site; the same shared package
 * in every Layout, components/theme-switcher/).
 *
 * Galio is light first (Bakio's Noir Layout is dark first): white pages and one colour family, with a
 * night of the same family as the dark mode. Since 1.0.3 ("one colour family", 14 Nov 2026) every ground,
 * band, plate, the rail and the footer come from the chosen palette's hue: components/galio/galio-family.ts
 * computes the family (OKLCH) and style/galio/one.css maps Galio's tokens onto it, with the Cherry
 * family as plain CSS for the first paint. This config writes the palette's action colour (--gl-act*,
 * --gl-accent, --gl-ring) and Vuetify's theme; the family follows the palette it paints.
 *
 * The palettes are the mockup's (galio-design/g/home.js PRESETS, set B): Cherry (the brand, the
 * mockup's hand-set values), Pistachio, Blueberry and Cocoa, built by paletteFromColor() (13 November
 * 2026), the same function the Custom swatch uses. White on each light primary: Cherry #a3213f 7.38,
 * Pistachio 5.49, Blueberry 6.16, Cocoa 7.39; white on each dark primary 5.04 or more. Their contrast on
 * the family's grounds (every palette, light and dark, and the custom colours) is checked by
 * scripts/run-checks.sh (the contrast-<palette>-<mode> and custom runs).
 */
import type { ThemeSwitcherConfig } from "../theme-switcher/theme-switcher";
import { THEME_SETTINGS } from "./galio-theme.settings";
import { t } from "../kalio/i18n/kalio-i18n";

/* One palette; the name is read when drawn, so it follows the visitor's language. */
function pal(id: string, name: () => string, light: Record<string, string>, dark: Record<string, string>) {
  return {
    id,
    get name() {
      return name();
    },
    light,
    dark,
  };
}

export const GALIO_THEME: ThemeSwitcherConfig = {
  /* The merchant's choice: galio-theme.settings.ts, the one file to edit. */
  settings: THEME_SETTINGS,

  /* The owner (9 November 2026): a merchant who imports the Layout into their own shop must not see
     the switcher. With themeSwitcher "showcase" it shows only on these shops (window.shop.id, else
     <meta name="shop-name">). */
  showcaseShops: [
    { id: 15740, name: "bakio" }, // Bakio: Bakini Noir, Galio Sundae
    { id: 15549, name: "digini-hzgablru" }, // Digini: Digito, Besti, Argon, Senso, Medio
    { id: 15645, name: "molino" }, // Molino: Molino, Tario, Walio, Dino, Valero
  ],

  storageKey: "galio-theme",
  darkClass: "gl-dark",
  defaultMode: "light",

  palettes: [
    pal(
      "cherry",
      () => t("galio.palette.cherry", "Cherry"),
      { primary: "#a3213f", deep: "#861a33", soft: "#fce4e7", onPrimary: "#ffffff", text: "#a3213f" },
      { primary: "#b02a48", deep: "#921f3a", soft: "#3d2026", onPrimary: "#ffffff", text: "#f59ab0" },
    ),
    pal(
      "pistachio",
      () => t("galio.palette.pistachio", "Pistachio"),
      { primary: "#487434", deep: "#35601f", soft: "#e6f6df", onPrimary: "#ffffff", text: "#487434" },
      { primary: "#4e7a3a", deep: "#406b2b", soft: "#1c360f", onPrimary: "#ffffff", text: "#8ebe7a" },
    ),
    pal(
      "blueberry",
      () => t("galio.palette.blueberry", "Blueberry"),
      { primary: "#2f5fb3", deep: "#1b4a9c", soft: "#e8f1ff", onPrimary: "#ffffff", text: "#2f5fb3" },
      { primary: "#3c6cc2", deep: "#2d5db1", soft: "#182d51", onPrimary: "#ffffff", text: "#84b1ff" },
    ),
    pal(
      "cocoa",
      () => t("galio.palette.cocoa", "Cocoa"),
      { primary: "#7a4a2c", deep: "#653718", soft: "#ffece1", onPrimary: "#ffffff", text: "#7a4a2c" },
      { primary: "#956344", deep: "#865537", soft: "#482206", onPrimary: "#ffffff", text: "#dca685" },
    ),
  ],

  /* Palette value -> the variables that carry it. The --bk-* names are read by the pages still drawn
     by the base Layout until each is ported (the coordinator's phase 2); they go with those pages. */
  tokens: {
    "--gl-act": "primary",
    "--gl-act-deep": "deep",
    "--gl-act-soft": "soft",
    "--gl-act-on": "onPrimary",
    "--gl-act-text": "text",
    "--gl-accent": "text",
    "--gl-ring": "text",
    "--gl-act-rgb": "primary:rgb",
    "--bk-act": "primary",
    "--bk-act-deep": "deep",
    "--bk-act-soft": "soft",
    "--bk-act-on": "onPrimary",
    "--bk-act-text": "text",
    "--bk-act-rgb": "primary:rgb",
    "--bk-act-on-rgb": "onPrimary:rgb",
  },

  /* The grounds, lines and words of each mode are the mockup's tokens (style/galio/b.css), so nothing
     is written inline for a mode. */
  dark: {},
  light: {},

  vuetify: {
    light: "light",
    dark: "dark",
    paletteColors: { primary: "primary", "on-primary": "onPrimary" },
    /* The night: Selldone's fields, menus, dialogs and sheets are dark too. These are the Cherry family's
       dark values; components/galio/galio-family.ts rewrites them for the chosen palette. */
    darkColors: {
      background: "#140d0e",
      surface: "#1d1314",
      "surface-bright": "#241617",
      "surface-variant": "#40292b",
      "on-background": "#faeced",
      "on-surface": "#faeced",
      "on-surface-variant": "#cab9ba",
      "on-primary": "#ffffff",
      secondary: "#ff8292",
      "on-secondary": "#140d0e",
      error: "#f59ab0",
      info: "#ff8292",
      success: "#8ebe7a",
      warning: "#fbbfc3",
    },
    lightColors: {
      background: "#ffffff",
      surface: "#ffffff",
      "on-background": "#2a1e1f",
      "on-surface": "#2a1e1f",
      secondary: "#2e181a",
      "on-secondary": "#ffffff",
      error: "#c4122f",
    },
  },

  /* The browser's own bar: the page's ground, not the action colour. */
  metaThemeColor: false,
  ui: { ink: "var(--gl-foot-ink)", muted: "var(--gl-foot-muted)", line: "var(--gl-foot-line)", surface: "var(--gl-surface)", font: "var(--gl-f-body)" },
  /* Read when drawn, so they follow the visitor's language (theme.* are the shared Kalio words). */
  labels: {
    get theme() {
      return t("theme.title", "Theme");
    },
    get palettes() {
      return t("theme.palettes", "Colour");
    },
    get mode() {
      return t("theme.mode", "Light or dark");
    },
    get modeTitle() {
      return t("theme.modeTitle", "Mode");
    },
    get light() {
      return t("theme.light", "Light");
    },
    get dark() {
      return t("theme.dark", "Dark");
    },
    get custom() {
      return t("theme.custom", "Custom colour");
    },
    get adjusted() {
      return t("theme.adjusted", "Adjusted for readability");
    },
    get brand() {
      return t("theme.brand", "Brand colour");
    },
  },

  /* "Custom colour" (the owner, 9 November 2026): any colour, made readable by paletteFromColor()
     against Galio's grounds. With the one colour family (14 Nov 2026) the grounds are the picked
     colour's own family, so they are given here as greys of the family's lightness (white, fam-100,
     fam-200; dark: fam-bg, fam-surface, fam-200, fam-300): the same contrast for any hue. */
  custom: {
    headerContrast: 4.5,
    lightSurfaces: ["#ffffff", "#f2f2f2", "#e6e6e6"],
    darkSurfaces: ["#101010", "#1a1a1a", "#232323", "#303030"],
    darkText: "#2a1e1f",
  },
};
