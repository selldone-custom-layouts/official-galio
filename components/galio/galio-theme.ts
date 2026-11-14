/*
 * Galio Sundae — the theme switcher's config (the footer's Theme row; the owner's rules: colour
 * palettes, a custom colour and Light / Dark, a click changes the whole site; the same shared package
 * in every Layout, components/theme-switcher/).
 *
 * Galio is light first (Bakio's Noir Layout is dark first): white pages on sorbet bands, with a cocoa night as the
 * dark mode. The mode's grounds, lines and words are the mockup's own tokens (style/galio/b.css, :root
 * and html.gl-dark, generated from galio-design/g/b.css); this config writes only the palette's action
 * colour (--gl-act*, --gl-accent, --gl-ring) and Vuetify's theme.
 *
 * The palettes are the mockup's (galio-design/g/home.js PRESETS, set B): Cherry (the brand, the
 * mockup's hand-set values), Pistachio, Blueberry and Cocoa, each built by paletteFromColor() with the
 * mockup's surfaces (lightSurfaces: white and the four sorbet bands; darkSurfaces: the cocoa night),
 * the same function the Custom swatch uses.
 *
 * Contrast (WCAG 2.1, paletteFromColor and the surfaces below, 13 November 2026). White on each light
 * primary: Cherry #a3213f 7.38, Pistachio 5.49, Blueberry 6.16, Cocoa 7.39; Cherry on the strawberry
 * band 6.11 and on the lemon band 6.50. White on each dark primary 5.04 or more; each dark "text"
 * colour on the dark surface #251a13 7.86 or more (Cherry's #f59ab0 8.20).
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
    /* The cocoa night: Selldone's fields, menus, dialogs and sheets are dark too. */
    darkColors: {
      background: "#1a120d",
      surface: "#251a13",
      "surface-bright": "#2f2019",
      "surface-variant": "#3b2b21",
      "on-background": "#fff1e6",
      "on-surface": "#fff1e6",
      "on-surface-variant": "#e8d8cc",
      "on-primary": "#ffffff",
      secondary: "#dca685",
      "on-secondary": "#1a120d",
      error: "#f59ab0",
      info: "#dca685",
      success: "#8ebe7a",
      warning: "#ffd84d",
    },
    lightColors: {
      background: "#ffffff",
      surface: "#ffffff",
      "on-background": "#2b1a12",
      "on-surface": "#2b1a12",
      secondary: "#7a4a2c",
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
     against Galio's own surfaces (the mockup's OPTS for set B). */
  custom: {
    headerContrast: 4.5,
    lightSurfaces: ["#ffffff", "#fbf1c7", "#fce4e7", "#ddf1e6", "#e2ecf8"],
    darkSurfaces: ["#1a120d", "#251a13", "#2f1c1f", "#172821"],
    darkText: "#2b1a12",
  },
};
